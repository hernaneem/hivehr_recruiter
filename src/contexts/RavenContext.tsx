import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
// util para generar token único sin depender de uuid package
const generateUUID = () =>
  (globalThis.crypto && 'randomUUID' in globalThis.crypto)
    ? globalThis.crypto.randomUUID()
    : Math.random().toString(36).substring(2) + Date.now().toString(36);


/**
 * Raven (Matrices Progresivas) test context
 * Se inspira en TermanMerrillContext pero adaptado a 60 ítems, 45 minutos.
 */

export interface RavenItem {
  item_number: number;
  correct_option: number;
  options_count: number;
  asset_url: string; // URL firmada o pública para la lámina
}

export interface RavenAnswer {
  item_number: number;
  answer: number | null; // 1-8
  isCorrect?: boolean;
}

export interface RavenScore {
  rawScore: number;
  percentile?: number;
  diagnosticRank?: string;
}

export interface RavenContextType {
  items: RavenItem[];
  currentIndex: number;
  timeRemaining: number; // seconds
  answers: RavenAnswer[];
  loading: boolean;
  error: string | null;
  testToken: string | null;
  startTest: (candidateId: string, jobId?: string) => Promise<void>;
  submitAnswer: (answer: number) => Promise<void>;
  nextItem: () => void;
  previousItem: () => void;
  finishTest: () => Promise<RavenScore>;
  loadTestByToken: (token: string) => Promise<void>;
}

const RavenContext = createContext<RavenContextType | undefined>(undefined);

export const useRaven = () => {
  const ctx = useContext(RavenContext);
  if (!ctx) throw new Error('useRaven must be used within RavenProvider');
  return ctx;
};

export const RavenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [items, setItems] = useState<RavenItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(45 * 60); // 45 mins
  const [answers, setAnswers] = useState<RavenAnswer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testToken, setTestToken] = useState<string | null>(null);
  const [testId, setTestId] = useState<string | null>(null);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  // countdown timer
  useEffect(() => {
    if (timerInterval) clearInterval(timerInterval);
    if (testId) {
      const id = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(id);
            finishTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setTimerInterval(id);
      return () => clearInterval(id);
    }
  }, [testId]);

  // util: get signed URL for asset
  const bucket = 'spm';
  const getAssetUrl = async (path: string): Promise<string> => {
    const cleanPath = path.startsWith(`${bucket}/`) ? path.slice(bucket.length + 1) : path;
    // Si el bucket es público, basta concatenar.
    // De lo contrario, generar URL firmada 1h
    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(cleanPath);
    if (publicData?.publicUrl) return publicData.publicUrl;

    const { data: signedData, error } = await supabase.storage.from(bucket).createSignedUrl(cleanPath, 3600);
    if (error || !signedData?.signedUrl) {
      console.error('getAssetUrl error', error);
      return '';
    }
    return signedData.signedUrl;
    
  };

  const startTest = async (candidateId: string, jobId?: string) => {
    try {
      setLoading(true);
      setError(null);

      // 1. Crear test_token y fila en raven_tests
      const token = generateUUID();
      const { data: testRow, error: insertErr } = await supabase
        .from('raven_tests')
        .insert({
          candidate_id: candidateId,
          job_id: jobId ?? null,
          recruiter_id: user!.id,
          test_token: token,
          status: 'in-progress',
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertErr) throw insertErr;

      setTestToken(token);
      setTestId(testRow.id);

      // 2. Obtener los 60 ítems ordenados
      const { data: itemRows, error: itemsErr } = await supabase
        .from('raven_items')
        .select('*')
        .order('item_number');
      if (itemsErr) throw itemsErr;

      // 3. Mapear a RavenItem con URL
      const mapped: RavenItem[] = await Promise.all(
        itemRows.map(async (row) => ({
          item_number: row.item_number,
          correct_option: row.correct_option,
          options_count: row.options_count,
          asset_url: await getAssetUrl(row.asset_path),
        }))
      );
      setItems(mapped);
      setCurrentIndex(0);
      setTimeRemaining(45 * 60);
      setAnswers([]);
    } catch (err: any) {
      setError(err.message ?? 'Error iniciando Raven');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (answer: number) => {
    if (!testId) return;
    const item = items[currentIndex];
    if (!item) return;

    try {
      // upsert response
      await supabase.from('raven_responses').upsert(
        {
          test_id: testId,
          item_number: item.item_number,
          answer,
        },
        { onConflict: 'test_id,item_number' }
      );

      // update local state
      setAnswers((prev) => {
        const idx = prev.findIndex((a) => a.item_number === item.item_number);
        const newAns: RavenAnswer = {
          item_number: item.item_number,
          answer,
          isCorrect: answer === item.correct_option,
        };
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = newAns;
          return updated;
        }
        return [...prev, newAns];
      });
    } catch (err: any) {
      console.error('submitAnswer error', err);
    }
  };

  const nextItem = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, items.length - 1));
  };

  const previousItem = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const loadTestByToken = async (token: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // obtener test
      const { data: testRow, error: rowErr } = await supabase
        .from('raven_tests')
        .select('*')
        .eq('test_token', token)
        .single();
      if (rowErr) throw rowErr;
      setTestId(testRow.id);
      setTestToken(token);

      // obtener items
      const { data: itemRows, error: itemsErr } = await supabase
        .from('raven_items')
        .select('*')
        .order('item_number');
      if (itemsErr) throw itemsErr;

      const mapped: RavenItem[] = await Promise.all(
        itemRows.map(async (row) => ({
          item_number: row.item_number,
          correct_option: row.correct_option,
          options_count: row.options_count,
          asset_url: await getAssetUrl(row.asset_path),
        }))
      );
      setItems(mapped);

      // obtener respuestas existentes
      const { data: respRows } = await supabase
        .from('raven_responses')
        .select('*')
        .eq('test_id', testRow.id);
      const mappedAns: RavenAnswer[] = respRows?.map((r) => ({
        item_number: r.item_number,
        answer: r.answer,
        isCorrect: r.answer === mapped.find((it) => it.item_number === r.item_number)?.correct_option,
      })) ?? [];
      setAnswers(mappedAns);

      // set currentIndex to first unanswered
      const firstUnanswered = mapped.findIndex((it) => !mappedAns.find((a) => a.item_number === it.item_number));
      setCurrentIndex(firstUnanswered >= 0 ? firstUnanswered : mapped.length - 1);
      setTimeRemaining(45 * 60);
    } catch (err: any) {
      setError(err.message ?? 'Error cargando test');
    } finally {
      setLoading(false);
    }
  };

  const finishTest = async (): Promise<RavenScore> => {
    if (!testId) throw new Error('No test in progress');

    try {
      setLoading(true);

      // 1. Obtener todas las respuestas del usuario (local state más BD por si acaso)
      let rawScore = answers.filter((a) => a.isCorrect).length;

      // 2. Calcular percentil y rango buscando en raven_norms (asumimos edad desconocida)
      let percentile: number | undefined;
      let rank: string | undefined;

      const { data: normRow } = await supabase
        .from('raven_norms')
        .select('*')
        .eq('raw_score', rawScore)
        .gte('min_age_months', 240) // adulto
        .lte('max_age_months', 528)
        .limit(1)
        .single();
      if (normRow) {
        percentile = normRow.percentile;
        rank = normRow.diagnostic_rank;
      }

      // 3. Guardar en raven_scores
      await supabase.from('raven_scores').upsert({
        test_id: testId,
        raw_score: rawScore,
        percentile: percentile ?? null,
        diagnostic_rank: rank ?? null,
      });

      // 4. Marcar raven_tests completed
      await supabase.from('raven_tests').update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        time_spent_seconds: 45 * 60 - timeRemaining,
      }).eq('id', testId);

      // clear timer
      if (timerInterval) clearInterval(timerInterval);

      return { rawScore, percentile, diagnosticRank: rank };
    } catch (err: any) {
      setError(err.message ?? 'Error finalizando Raven');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value: RavenContextType = {
    items,
    currentIndex,
    timeRemaining,
    answers,
    loading,
    error,
    testToken,
    startTest,
    submitAnswer,
    nextItem,
    previousItem,
    finishTest,
    loadTestByToken,
  };

  return <RavenContext.Provider value={value}>{children}</RavenContext.Provider>;
};
