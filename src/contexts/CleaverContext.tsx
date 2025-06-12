import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export interface CleaverCandidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  job_title?: string;
  job_id?: string;
  cv_status: 'approved' | 'reviewing' | 'rejected';
  cv_review_date?: string;
  years_experience?: number;
  created_at: string;
}

export interface CleaverTest {
  id: string;
  candidate_id: string;
  job_id: string;
  recruiter_id: string;
  test_token: string;
  status: 'not-started' | 'pending' | 'in-progress' | 'completed' | 'expired';
  created_at: string;
  invitation_sent_at?: string;
  started_at?: string;
  completed_at?: string;
  expires_at: string;
  time_spent_minutes?: number;
  invitation_email_sent: boolean;
  // Datos del candidato (JOIN)
  candidate?: CleaverCandidate;
  // Datos del trabajo (JOIN)
  job?: {
    id: string;
    title: string;
    company?: string;
  };
}

export interface CleaverResponse {
  id: string;
  test_id: string;
  group_number: number;
  most_selected: number;
  least_selected: number;
  created_at: string;
}

export interface CleaverScore {
  id: string;
  test_id: string;
  d_most: number;
  d_least: number;
  d_total: number;
  i_most: number;
  i_least: number;
  i_total: number;
  s_most: number;
  s_least: number;
  s_total: number;
  c_most: number;
  c_least: number;
  c_total: number;
  d_percentile?: number;
  i_percentile?: number;
  s_percentile?: number;
  c_percentile?: number;
  calculated_at: string;
}

export interface CleaverInterpretation {
  id: string;
  test_id: string;
  dominant_profile?: string;
  profile_description?: string;
  strengths?: string[];
  development_areas?: string[];
  work_style_description?: string;
  leadership_style?: string;
  communication_preferences?: string;
  stress_behaviors?: string;
  job_fit_score?: number;
  recommendations?: string[];
  interviewer_notes?: string;
  generated_at: string;
  reviewed_by?: string;
  review_notes?: string;
}

export interface CleaverStats {
  totalCandidates: number;
  cvsApproved: number;
  testsCompleted: number;
  testsPending: number;
  testsInProgress: number;
}

export interface CandidateWithTestInfo extends CleaverCandidate {
  cleaver_status: 'not-started' | 'pending' | 'in-progress' | 'completed' | 'expired';
  invitation_sent: boolean;
  test_id?: string;
  test_token?: string;
  cleaver_results?: {
    completed_at: string;
    scores: CleaverScore;
    interpretation?: CleaverInterpretation;
  };
}

interface CleaverContextType {
  // State
  candidates: CandidateWithTestInfo[];
  tests: CleaverTest[];
  stats: CleaverStats;
  loading: boolean;
  error: string;
  
  // Actions
  loadCandidates: () => Promise<void>;
  loadTests: () => Promise<void>;
  createTest: (candidateId: string, jobId: string) => Promise<CleaverTest>;
  getTestByToken: (token: string) => Promise<CleaverTest | null>;
  startTest: (testId: string) => Promise<void>;
  completeTest: (testId: string, responses: Omit<CleaverResponse, 'id' | 'test_id' | 'created_at'>[]) => Promise<void>;
  getTestResults: (testId: string) => Promise<{
    test: CleaverTest;
    scores: CleaverScore;
    interpretation?: CleaverInterpretation;
  } | null>;
  exportTestResults: (testId: string) => Promise<void>;
  refreshStats: () => Promise<void>;
}

const CleaverContext = createContext<CleaverContextType | undefined>(undefined);

export const useCleaver = () => {
  const context = useContext(CleaverContext);
  if (context === undefined) {
    throw new Error('useCleaver must be used within a CleaverProvider');
  }
  return context;
};

interface CleaverProviderProps {
  children: ReactNode;
}

export const CleaverProvider: React.FC<CleaverProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<CandidateWithTestInfo[]>([]);
  const [tests, setTests] = useState<CleaverTest[]>([]);
  const [stats, setStats] = useState<CleaverStats>({
    totalCandidates: 0,
    cvsApproved: 0,
    testsCompleted: 0,
    testsPending: 0,
    testsInProgress: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCandidates = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError('');

      // Obtener candidatos con análisis aprobados para este reclutador
      const { data: candidatesData, error: candidatesError } = await supabase
        .from('candidates')
        .select(`
          id,
          name,
          email,
          phone,
          years_experience,
          created_at,
          candidate_analyses!inner (
            id,
            job_id,
            recommendation,
            processed_at,
            jobs!inner (
              id,
              title,
              company,
              recruiter_id
            )
          )
        `)
        .eq('candidate_analyses.jobs.recruiter_id', user.id)
        .eq('candidate_analyses.recommendation', 'yes'); // Solo candidatos aprobados

      if (candidatesError) throw candidatesError;

      // Obtener tests existentes para estos candidatos
      const candidateIds = candidatesData?.map(c => c.id) || [];
      const { data: testsData, error: testsError } = await supabase
        .from('cleaver_tests')
        .select('*')
        .in('candidate_id', candidateIds)
        .eq('recruiter_id', user.id);

      if (testsError) throw testsError;

      // Combinar datos de candidatos con información de tests
      const candidatesWithTests: CandidateWithTestInfo[] = candidatesData?.map(candidate => {
        const analysis = candidate.candidate_analyses?.[0];
        const test = testsData?.find(t => t.candidate_id === candidate.id);

        return {
          id: candidate.id,
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone,
          position: analysis?.jobs?.[0]?.title || 'Sin especificar',
          job_title: analysis?.jobs?.[0]?.title,
          job_id: analysis?.job_id,
          cv_status: 'approved' as const,
          cv_review_date: analysis?.processed_at,
          years_experience: candidate.years_experience,
          created_at: candidate.created_at,
          cleaver_status: test?.status || 'not-started',
          invitation_sent: !!test?.invitation_sent_at,
          test_id: test?.id,
          test_token: test?.test_token,
          cleaver_results: test?.status === 'completed' ? {
            completed_at: test.completed_at!,
            scores: {} as CleaverScore, // Se cargaría por separado si es necesario
          } : undefined
        };
      }) || [];

      setCandidates(candidatesWithTests);
      await refreshStats();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error cargando candidatos:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTests = async () => {
    if (!user?.id) return;

    try {
      const { data: testsData, error: testsError } = await supabase
        .from('cleaver_tests')
        .select(`
          *,
          candidates (
            id,
            name,
            email,
            phone
          ),
          jobs (
            id,
            title,
            company
          )
        `)
        .eq('recruiter_id', user.id)
        .order('created_at', { ascending: false });

      if (testsError) throw testsError;

      setTests(testsData || []);
    } catch (err) {
      console.error('Error cargando tests:', err);
    }
  };

  const createTest = async (candidateId: string, jobId: string): Promise<CleaverTest> => {
    if (!user?.id) throw new Error('Usuario no autenticado');

    try {
      // Generar token único
      const token = btoa(`cleaver_${candidateId}_${Date.now()}_${Math.random()}`);

      const { data: testData, error: testError } = await supabase
        .from('cleaver_tests')
        .insert({
          candidate_id: candidateId,
          job_id: jobId,
          recruiter_id: user.id,
          test_token: token,
          status: 'pending',
          invitation_sent_at: new Date().toISOString(),
          invitation_email_sent: false // Por ahora false, hasta que configuremos el email
        })
        .select()
        .single();

      if (testError) throw testError;

      // Registrar en audit log
      await supabase
        .from('cleaver_audit_logs')
        .insert({
          test_id: testData.id,
          user_id: user.id,
          action: 'test_created',
          details: { candidate_id: candidateId, job_id: jobId }
        });

      // Recargar candidatos para actualizar la UI
      await loadCandidates();

      return testData;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error creando test');
    }
  };

  const getTestByToken = async (token: string): Promise<CleaverTest | null> => {
    try {
      const { data: testData, error: testError } = await supabase
        .from('cleaver_tests')
        .select(`
          *,
          candidates (
            id,
            name,
            email
          ),
          jobs (
            id,
            title,
            company
          )
        `)
        .eq('test_token', token)
        .single();

      if (testError || !testData) return null;

      // Verificar que no haya expirado
      if (new Date() > new Date(testData.expires_at)) {
        await supabase
          .from('cleaver_tests')
          .update({ status: 'expired' })
          .eq('id', testData.id);
        return null;
      }

      return testData;
    } catch (err) {
      console.error('Error obteniendo test por token:', err);
      return null;
    }
  };

  const startTest = async (testId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('cleaver_tests')
        .update({
          status: 'in-progress',
          started_at: new Date().toISOString()
        })
        .eq('id', testId);

      if (error) throw error;

      // Registrar en audit log
      await supabase
        .from('cleaver_audit_logs')
        .insert({
          test_id: testId,
          action: 'test_started',
          details: {}
        });

    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error iniciando test');
    }
  };

  const completeTest = async (
    testId: string, 
    responses: Omit<CleaverResponse, 'id' | 'test_id' | 'created_at'>[]
  ): Promise<void> => {
    try {
      // Eliminar respuestas previas para evitar conflictos
      const { error: deleteResponsesError } = await supabase
        .from('cleaver_responses')
        .delete()
        .eq('test_id', testId);

      if (deleteResponsesError) {
        console.log('No hay respuestas previas a eliminar:', deleteResponsesError);
      }

      // Insertar nuevas respuestas
      const responsesToInsert = responses.map(response => ({
        test_id: testId,
        group_number: response.group_number,
        most_selected: response.most_selected,
        least_selected: response.least_selected
      }));

      const { error: responsesError } = await supabase
        .from('cleaver_responses')
        .insert(responsesToInsert);

      if (responsesError) throw responsesError;

      // Eliminar scores previos si existen (ya que no hay UNIQUE constraint en test_id)
      const { error: deleteScoresError } = await supabase
        .from('cleaver_scores')
        .delete()
        .eq('test_id', testId);

      if (deleteScoresError) {
        console.log('No hay scores previos a eliminar:', deleteScoresError);
      }

      // Calcular scores DISC
      const scores = calculateDISCScores(responses);
      
      // Insertar nuevos scores
      const { error: scoresError } = await supabase
        .from('cleaver_scores')
        .insert({
          test_id: testId,
          ...scores
        });

      if (scoresError) throw scoresError;

      // Actualizar estado del test
      const { error: updateError } = await supabase
        .from('cleaver_tests')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', testId);

      if (updateError) throw updateError;

      // Registrar en audit log
      await supabase
        .from('cleaver_audit_logs')
        .insert({
          test_id: testId,
          action: 'test_completed',
          details: { responses_count: responses.length }
        });

    } catch (err) {
      console.error('Error en completeTest:', err);
      throw new Error(err instanceof Error ? err.message : 'Error completando test');
    }
  };

  const getTestResults = async (testId: string) => {
    try {
      const { data: testData, error: testError } = await supabase
        .from('cleaver_tests')
        .select(`
          *,
          candidates (
            id,
            name,
            email
          ),
          jobs (
            id,
            title,
            company
          ),
          cleaver_scores (*),
          cleaver_interpretations (*)
        `)
        .eq('id', testId)
        .single();

      if (testError || !testData) return null;

      return {
        test: testData,
        scores: testData.cleaver_scores?.[0],
        interpretation: testData.cleaver_interpretations?.[0]
      };
    } catch (err) {
      console.error('Error obteniendo resultados:', err);
      return null;
    }
  };

  const exportTestResults = async (testId: string): Promise<void> => {
    try {
      const results = await getTestResults(testId);
      if (!results) throw new Error('No se encontraron resultados');

      const exportData = {
        test_info: {
          id: results.test.id,
          candidate: results.test.candidate,
          job: results.test.job,
          completed_at: results.test.completed_at,
          time_spent_minutes: results.test.time_spent_minutes
        },
        scores: results.scores,
        interpretation: results.interpretation,
        exported_at: new Date().toISOString()
      };

      // Crear y descargar archivo
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cleaver_results_${results.test.candidate?.name?.replace(/\s+/g, '_')}_${testId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Registrar en audit log
      await supabase
        .from('cleaver_audit_logs')
        .insert({
          test_id: testId,
          user_id: user?.id,
          action: 'results_exported',
          details: { export_format: 'json' }
        });

    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error exportando resultados');
    }
  };

  const refreshStats = async () => {
    try {
      const totalCandidates = candidates.length;
      const cvsApproved = candidates.filter(c => c.cv_status === 'approved').length;
      const testsCompleted = candidates.filter(c => c.cleaver_status === 'completed').length;
      const testsPending = candidates.filter(c => c.cleaver_status === 'pending').length;
      const testsInProgress = candidates.filter(c => c.cleaver_status === 'in-progress').length;

      setStats({
        totalCandidates,
        cvsApproved,
        testsCompleted,
        testsPending,
        testsInProgress
      });
    } catch (err) {
      console.error('Error actualizando estadísticas:', err);
    }
  };

  // Función auxiliar para calcular scores DISC
  const calculateDISCScores = (responses: Omit<CleaverResponse, 'id' | 'test_id' | 'created_at'>[]) => {
    // Mapeo de grupos a factores DISC (según el manual Cleaver)
    const discMapping: { [key: number]: string[] } = {
      1: ["I", "S", "C", "D"],
      2: ["D", "I", "S", "C"],
      3: ["S", "C", "D", "I"],
      4: ["C", "D", "I", "S"],
      5: ["D", "S", "I", "C"],
      6: ["I", "C", "S", "D"],
      7: ["S", "D", "C", "I"],
      8: ["C", "I", "D", "S"],
      9: ["I", "D", "S", "C"],
      10: ["S", "I", "C", "D"],
      11: ["C", "S", "D", "I"],
      12: ["D", "C", "I", "S"],
      13: ["S", "C", "I", "D"],
      14: ["D", "I", "C", "S"],
      15: ["I", "S", "D", "C"],
      16: ["C", "D", "S", "I"],
      17: ["D", "S", "C", "I"],
      18: ["I", "C", "D", "S"],
      19: ["S", "I", "C", "D"],
      20: ["C", "D", "I", "S"],
      21: ["I", "D", "S", "C"],
      22: ["S", "C", "I", "D"],
      23: ["C", "I", "S", "D"],
      24: ["D", "S", "I", "C"]
    };

    const scores = {
      d_most: 0, d_least: 0, d_total: 0,
      i_most: 0, i_least: 0, i_total: 0,
      s_most: 0, s_least: 0, s_total: 0,
      c_most: 0, c_least: 0, c_total: 0,
      d_percentile: 50,
      i_percentile: 50,
      s_percentile: 50,
      c_percentile: 50
    };

    // Calcular puntuaciones
    responses.forEach(response => {
      const factors = discMapping[response.group_number];
      if (factors) {
        const mostFactor = factors[response.most_selected - 1];
        const leastFactor = factors[response.least_selected - 1];

        // Incrementar puntuaciones "Más"
        if (mostFactor === 'D') scores.d_most++;
        else if (mostFactor === 'I') scores.i_most++;
        else if (mostFactor === 'S') scores.s_most++;
        else if (mostFactor === 'C') scores.c_most++;

        // Incrementar puntuaciones "Menos"
        if (leastFactor === 'D') scores.d_least++;
        else if (leastFactor === 'I') scores.i_least++;
        else if (leastFactor === 'S') scores.s_least++;
        else if (leastFactor === 'C') scores.c_least++;
      }
    });

    // Calcular totales
    scores.d_total = scores.d_most - scores.d_least;
    scores.i_total = scores.i_most - scores.i_least;
    scores.s_total = scores.s_most - scores.s_least;
    scores.c_total = scores.c_most - scores.c_least;

    // Calcular percentiles (tabla de conversión del manual Cleaver)
    const calculatePercentile = (score: number): number => {
      if (score <= -21) return 1;
      if (score <= -12) return 5;
      if (score <= -9) return 10;
      if (score <= -6) return 20;
      if (score <= -4) return 30;
      if (score <= -2) return 40;
      if (score === 0) return 50;
      if (score <= 2) return 60;
      if (score <= 4) return 70;
      if (score <= 6) return 80;
      if (score <= 8) return 90;
      if (score <= 10) return 95;
      return 99;
    };

    scores.d_percentile = calculatePercentile(scores.d_total);
    scores.i_percentile = calculatePercentile(scores.i_total);
    scores.s_percentile = calculatePercentile(scores.s_total);
    scores.c_percentile = calculatePercentile(scores.c_total);

    return scores;
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    if (user) {
      loadCandidates();
      loadTests();
    }
  }, [user]);

  const value: CleaverContextType = {
    candidates,
    tests,
    stats,
    loading,
    error,
    loadCandidates,
    loadTests,
    createTest,
    getTestByToken,
    startTest,
    completeTest,
    getTestResults,
    exportTestResults,
    refreshStats
  };

  return (
    <CleaverContext.Provider value={value}>
      {children}
    </CleaverContext.Provider>
  );
}; 