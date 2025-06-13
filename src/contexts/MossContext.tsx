import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export interface MossCandidate {
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

export interface MossTest {
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
  
  // Puntuaciones por área
  hs_score?: number;
  hs_percentage?: number;
  hs_level?: string;
  
  cdrh_score?: number;
  cdrh_percentage?: number;
  cdrh_level?: string;
  
  cepi_score?: number;
  cepi_percentage?: number;
  cepi_level?: string;
  
  heri_score?: number;
  heri_percentage?: number;
  heri_level?: string;
  
  sctri_score?: number;
  sctri_percentage?: number;
  sctri_level?: string;
  
  total_score?: number;
  total_percentage?: number;
  
  // Datos del candidato (JOIN)
  candidate?: MossCandidate;
  // Datos del trabajo (JOIN)
  job?: {
    id: string;
    title: string;
    company?: string;
  };
}

export interface MossAnswer {
  id: string;
  test_id: string;
  question_id: number;
  selected_answer: string;
  is_correct: boolean;
  created_at: string;
}

export interface MossResult {
  area: string;
  score: number;
  percentage: number;
  level: string;
}

export interface MossStats {
  totalCandidates: number;
  cvsApproved: number;
  testsCompleted: number;
  testsPending: number;
  testsInProgress: number;
  avgCompletionTime?: number;
  avgScore?: number;
}

export interface CandidateWithMossInfo extends MossCandidate {
  moss_status: 'not-started' | 'pending' | 'in-progress' | 'completed' | 'expired';
  invitation_sent: boolean;
  test_id?: string;
  test_token?: string;
  moss_results?: {
    completed_at: string;
    total_percentage: number;
    hs_level?: string;
    cdrh_level?: string;
    cepi_level?: string;
    heri_level?: string;
    sctri_level?: string;
    time_spent_minutes?: number;
  };
}

interface MossContextType {
  // State
  candidates: CandidateWithMossInfo[];
  tests: MossTest[];
  stats: MossStats;
  loading: boolean;
  error: string;
  
  // Actions
  loadCandidates: () => Promise<void>;
  loadTests: () => Promise<void>;
  createTest: (candidateId: string, jobId: string) => Promise<MossTest>;
  getTestByToken: (token: string) => Promise<MossTest | null>;
  startTest: (testId: string) => Promise<void>;
  completeTest: (testId: string, answers: Record<number, string>, results: MossResult[], startTime: Date, endTime: Date) => Promise<void>;
  getTestResults: (testId: string) => Promise<MossTest | null>;
  exportTestResults: (testId: string) => Promise<void>;
  refreshStats: () => Promise<void>;
  hasCompletedTest: (candidateId: string) => Promise<boolean>;
  getIncompleteTest: (candidateId: string) => Promise<MossTest | null>;
  deleteIncompleteTest: (testId: string) => Promise<boolean>;
}

const MossContext = createContext<MossContextType | undefined>(undefined);

export const useMoss = () => {
  const context = useContext(MossContext);
  if (context === undefined) {
    throw new Error('useMoss must be used within a MossProvider');
  }
  return context;
};

interface MossProviderProps {
  children: ReactNode;
}

export const MossProvider: React.FC<MossProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<CandidateWithMossInfo[]>([]);
  const [tests, setTests] = useState<MossTest[]>([]);
  const [stats, setStats] = useState<MossStats>({
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

      console.log('🔍 MossContext - Cargando candidatos para recruiter:', user.id);

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
        .in('candidate_analyses.recommendation', ['yes', 'maybe']); // Candidatos aprobados y viables

      if (candidatesError) throw candidatesError;

      console.log('🔍 MossContext - Candidatos obtenidos de BD:', candidatesData?.length || 0);
      console.log('🔍 MossContext - Datos completos:', candidatesData);

      // Obtener información de tests MOSS para estos candidatos
      const candidateIds = candidatesData?.map(c => c.id) || [];
      
      let mossTestsData: any[] = [];
      if (candidateIds.length > 0) {
        const { data: testsData, error: testsError } = await supabase
          .from('moss_tests')
          .select('*')
          .in('candidate_id', candidateIds)
          .eq('recruiter_id', user.id);

        if (testsError) throw testsError;
        mossTestsData = testsData || [];
      }

             // Combinar datos de candidatos con información de tests MOSS
       const candidatesWithMossInfo: CandidateWithMossInfo[] = candidatesData?.map(candidate => {
         const mossTest = mossTestsData.find(test => test.candidate_id === candidate.id);
         const analysisInfo = candidate.candidate_analyses?.[0];
         const jobInfo = analysisInfo?.jobs?.[0]; // jobs es un array, tomar el primer elemento

         return {
           id: candidate.id,
           name: candidate.name,
           email: candidate.email,
           phone: candidate.phone,
           years_experience: candidate.years_experience,
           created_at: candidate.created_at,
           position: jobInfo?.title || 'No especificado',
           job_title: jobInfo?.title,
           job_id: analysisInfo?.job_id, // Usar job_id del análisis
           cv_status: analysisInfo?.recommendation === 'yes' ? 'approved' as const : 'reviewing' as const,
           cv_review_date: candidate.candidate_analyses?.[0]?.processed_at,
          
          // Información del test MOSS
          moss_status: mossTest?.status || 'not-started',
          invitation_sent: !!mossTest?.invitation_sent_at,
          test_id: mossTest?.id,
          test_token: mossTest?.test_token,
          
          // Resultados si están disponibles
          moss_results: mossTest?.status === 'completed' ? {
            completed_at: mossTest.completed_at,
            total_percentage: mossTest.total_percentage,
            hs_level: mossTest.hs_level,
            cdrh_level: mossTest.cdrh_level,
            cepi_level: mossTest.cepi_level,
            heri_level: mossTest.heri_level,
            sctri_level: mossTest.sctri_level,
            time_spent_minutes: mossTest.time_spent_minutes
          } : undefined
        };
      }) || [];

      console.log('🔍 MossContext - Candidatos procesados:', candidatesWithMossInfo.length);
      console.log('🔍 MossContext - Candidatos finales:', candidatesWithMossInfo);

      setCandidates(candidatesWithMossInfo);
      await refreshStats();

    } catch (error) {
      console.error('Error loading candidates:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const loadTests = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('moss_tests')
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
        .eq('recruiter_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const testsWithDetails: MossTest[] = data?.map(test => ({
        ...test,
        candidate: test.candidates,
        job: test.jobs,
        invitation_email_sent: !!test.invitation_sent_at
      })) || [];

      setTests(testsWithDetails);
    } catch (error) {
      console.error('Error loading tests:', error);
      setError(error instanceof Error ? error.message : 'Error cargando tests');
    }
  };

  const createTest = async (candidateId: string, jobId: string): Promise<MossTest> => {
    if (!user?.id) {
      throw new Error('Usuario no autenticado');
    }

    try {
      // Generar token único URL-safe (sin caracteres especiales)
      const timestamp = Date.now().toString(36);
      const randomPart = Math.random().toString(36).substring(2, 15);
      const candidatePart = candidateId.substring(0, 8);
      const token = `moss_${candidatePart}_${timestamp}_${randomPart}`;
      
      console.log('createTest - Token generado:', token);

      const { data: testData, error: testError } = await supabase
        .from('moss_tests')
        .insert({
          candidate_id: candidateId,
          job_id: jobId,
          recruiter_id: user.id,
          test_token: token,
          status: 'pending',
          invitation_sent_at: new Date().toISOString(),
          invitation_email_sent: false
        })
        .select()
        .single();

      if (testError) throw testError;

      console.log('createTest - Test creado en BD:', testData);

      // Registrar en audit log
      await supabase
        .from('moss_audit_logs')
        .insert({
          test_id: testData.id,
          action: 'test_created',
          details: { candidate_id: candidateId, job_id: jobId }
        });

      // Recargar candidatos para actualizar la UI
      await loadCandidates();

      const createdTest: MossTest = {
        ...testData,
        candidate: undefined, // Se cargará después
        job: undefined, // Se cargará después
        invitation_email_sent: !!testData.invitation_sent_at
      };

      // Actualizar el estado local
      setTests(prev => [createdTest, ...prev]);

      return createdTest;
    } catch (error) {
      console.error('Error creating MOSS test:', error);
      throw error;
    }
  };

  const getTestByToken = async (token: string): Promise<MossTest | null> => {
    try {
      console.log('getTestByToken - Token recibido:', token);
      
      const { data, error } = await supabase
        .from('moss_tests')
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

      console.log('getTestByToken - Query result:', { data, error });

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('getTestByToken - Test no encontrado en BD');
          return null; // No encontrado
        }
        throw error;
      }

      console.log('getTestByToken - Test encontrado exitosamente');
      return {
        ...data,
        candidate: data.candidates,
        job: data.jobs,
        invitation_email_sent: !!data.invitation_sent_at
      };
    } catch (error) {
      console.error('Error getting test by token:', error);
      return null;
    }
  };

  const startTest = async (testId: string): Promise<void> => {
    try {
      console.log('MossContext.startTest called with testId:', testId);
      
      const { error } = await supabase
        .from('moss_tests')
        .update({
          status: 'in-progress',
          started_at: new Date().toISOString()
        })
        .eq('id', testId);

      if (error) {
        console.error('Supabase error in startTest:', error);
        throw error;
      }

      console.log('Test status updated successfully');

      // Registrar en audit log
      await supabase
        .from('moss_audit_logs')
        .insert({
          test_id: testId,
          action: 'test_started',
          details: { timestamp: new Date().toISOString() }
        });

      console.log('Audit log created');

      await loadTests();
      console.log('Tests reloaded');
    } catch (error) {
      console.error('Error starting test:', error);
      throw error;
    }
  };

  const completeTest = async (
    testId: string,
    answers: Record<number, string>,
    results: MossResult[],
    startTime: Date,
    endTime: Date
  ): Promise<void> => {
    try {
      // Preparar las respuestas para la función de base de datos
      const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
        questionId: parseInt(questionId),
        answer: answer,
        isCorrect: false // Se calculará en la función de base de datos
      }));

      // Llamar a la función de base de datos para guardar los resultados
      const { error } = await supabase.rpc('save_moss_test_results', {
        p_test_id: testId,
        p_start_time: startTime.toISOString(),
        p_end_time: endTime.toISOString(),
        p_answers: answersArray,
        p_results: results
      });

      if (error) throw error;

      await loadTests();
      await loadCandidates();
    } catch (error) {
      console.error('Error completing test:', error);
      throw error;
    }
  };

  const getTestResults = async (testId: string): Promise<MossTest | null> => {
    try {
      const { data, error } = await supabase
        .from('moss_tests')
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
        .eq('id', testId)
        .single();

      if (error) throw error;

      return {
        ...data,
        candidate: data.candidates,
        job: data.jobs,
        invitation_email_sent: !!data.invitation_sent_at
      };
    } catch (error) {
      console.error('Error getting test results:', error);
      return null;
    }
  };

  const exportTestResults = async (testId: string): Promise<void> => {
    try {
      const test = await getTestResults(testId);
      if (!test || !test.candidate) {
        throw new Error('Test o candidato no encontrado');
      }

      // Crear contenido del reporte
      const report = `
REPORTE TEST MOSS
================

Candidato: ${test.candidate.name}
Email: ${test.candidate.email}
Puesto: ${test.job?.title || 'No especificado'}
Fecha: ${test.completed_at ? new Date(test.completed_at).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : 'N/A'}
Duración: ${test.time_spent_minutes || 0} minutos

RESULTADOS POR ÁREA
==================
• Habilidad en Supervisión: ${test.hs_level || 'N/A'} (${test.hs_percentage || 0}%)
• Capacidad de Decisiones en RR.HH.: ${test.cdrh_level || 'N/A'} (${test.cdrh_percentage || 0}%)
• Evaluación de Problemas Interpersonales: ${test.cepi_level || 'N/A'} (${test.cepi_percentage || 0}%)
• Habilidad para Establecer Relaciones: ${test.heri_level || 'N/A'} (${test.heri_percentage || 0}%)
• Sentido Común y Tacto: ${test.sctri_level || 'N/A'} (${test.sctri_percentage || 0}%)

PUNTUACIÓN GENERAL
==================
Porcentaje Total: ${test.total_percentage || 0}%
Recomendación: ${test.total_percentage && test.total_percentage >= 83 ? 'Altamente Recomendado' : 
                 test.total_percentage && test.total_percentage >= 64 ? 'Recomendado' :
                 test.total_percentage && test.total_percentage >= 42 ? 'Aceptable' : 'No Recomendado'}
`;

      // Crear y descargar archivo
      const blob = new Blob([report], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MOSS_${test.candidate.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting test results:', error);
      throw error;
    }
  };

  const refreshStats = async () => {
    if (!user?.id) return;

    try {
      // Obtener estadísticas usando la función de base de datos
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_moss_stats', { p_recruiter_id: user.id });

      if (statsError) throw statsError;

      const newStats: MossStats = {
        totalCandidates: candidates.length,
        cvsApproved: candidates.filter(c => c.cv_status === 'approved').length,
        testsCompleted: statsData?.completed_tests || 0,
        testsPending: statsData?.pending_tests || 0,
        testsInProgress: statsData?.in_progress_tests || 0,
        avgCompletionTime: statsData?.avg_completion_time || undefined,
        avgScore: statsData?.avg_score || undefined
      };

      setStats(newStats);
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
  };

  const hasCompletedTest = async (candidateId: string): Promise<boolean> => {
    try {
      const { count, error } = await supabase
        .from('moss_tests')
        .select('id', { count: 'exact', head: true })
        .eq('candidate_id', candidateId)
        .eq('status', 'completed');

      if (error) throw error;

      return (count || 0) > 0;
    } catch (error) {
      console.error('Error checking completed test:', error);
      return false;
    }
  };

  const getIncompleteTest = async (candidateId: string): Promise<MossTest | null> => {
    try {
      const { data, error } = await supabase
        .from('moss_tests')
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
        .eq('candidate_id', candidateId)
        .in('status', ['pending', 'in-progress'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (!data) return null;

      return {
        ...data,
        candidate: data.candidates,
        job: data.jobs,
        invitation_email_sent: !!data.invitation_sent_at
      };
    } catch (error) {
      console.error('Error getting incomplete test:', error);
      return null;
    }
  };

  const deleteIncompleteTest = async (testId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('moss_tests')
        .delete()
        .eq('id', testId)
        .in('status', ['pending', 'in-progress']);

      if (error) throw error;

      await loadTests();
      await loadCandidates();
      return true;
    } catch (error) {
      console.error('Error deleting incomplete test:', error);
      return false;
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    if (user?.id) {
      loadCandidates();
      loadTests();
    }
  }, [user?.id]);

  const value: MossContextType = {
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
    refreshStats,
    hasCompletedTest,
    getIncompleteTest,
    deleteIncompleteTest
  };

  return (
    <MossContext.Provider value={value}>
      {children}
    </MossContext.Provider>
  );
}; 