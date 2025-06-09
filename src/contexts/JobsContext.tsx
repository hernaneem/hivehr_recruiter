import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export interface JobSkill {
  skill_name: string;
  skill_category: string;
  importance_level: number;
  is_mandatory: boolean;
  min_years: number;
}

export interface Job {
  id: number;
  title: string;
  description?: string;
  requirements?: string;
  company?: string;
  location?: string;
  salary_range?: string;
  experience_level?: string;
  job_type: string;
  status: string;
  created_at: string;
  recruiter_id: number;
  job_required_skills?: JobSkill[];
  candidates_count?: number;
}

export interface StatsData {
  activeJobs: number;
  totalJobs: number;
  analyzedCVs: number;
  averageMatch: number;
}

export interface RecentJob {
  id: number;
  title: string;
  candidates: number;
  status: string;
  match: string;
}

interface JobsContextType {
  // State
  jobs: Job[];
  stats: StatsData;
  recentJobs: RecentJob[];
  loading: boolean;
  error: string;
  
  // Actions
  loadJobs: () => Promise<void>;
  createJob: (jobData: Omit<Job, 'id' | 'created_at' | 'recruiter_id'>, skills: Omit<JobSkill, 'job_id'>[]) => Promise<void>;
  updateJob: (id: number, jobData: Omit<Job, 'id' | 'created_at' | 'recruiter_id'>, skills: Omit<JobSkill, 'job_id'>[]) => Promise<void>;
  deleteJob: (id: number) => Promise<void>;
  toggleJobStatus: (id: number) => Promise<void>;
  refreshStats: () => Promise<void>;
}

const JobsContext = createContext<JobsContextType | undefined>(undefined);

export const useJobs = () => {
  const context = useContext(JobsContext);
  if (context === undefined) {
    throw new Error('useJobs must be used within a JobsProvider');
  }
  return context;
};

interface JobsProviderProps {
  children: ReactNode;
}

export const JobsProvider: React.FC<JobsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<StatsData>({
    activeJobs: 0,
    totalJobs: 0,
    analyzedCVs: 0,
    averageMatch: 0
  });
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getRecruiterId = async (): Promise<number> => {
    if (!user?.email) {
      throw new Error('Usuario no autenticado');
    }

    const { data: recruiterData, error: recruiterError } = await supabase
      .from('recruiters')
      .select('id')
      .eq('email', user.email)
      .single();

    if (recruiterError) {
      throw new Error('Error al obtener datos del reclutador');
    }

    return recruiterData.id;
  };

  const loadJobs = async () => {
    if (!user?.email) return;

    try {
      setLoading(true);
      setError('');
      
      const recruiterId = await getRecruiterId();

      // Cargar trabajos con skills y conteo de candidatos
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select(`
          *,
          job_required_skills!fk_job_required_skills_job_id (
            skill_name,
            skill_category,
            importance_level,
            is_mandatory,
            min_years
          )
        `)
        .eq('recruiter_id', recruiterId)
        .order('created_at', { ascending: false });

      if (jobsError) throw jobsError;

      // Obtener conteo de candidatos para cada trabajo
      const jobsWithCandidates = await Promise.all(
        (jobsData || []).map(async (job) => {
          const { data: candidatesData, error: candidatesError } = await supabase
            .from('candidate_analyses')
            .select('id')
            .eq('job_id', job.id);

          if (candidatesError) {
            console.error(`Error contando candidatos para trabajo ${job.id}:`, candidatesError);
            return { ...job, candidates_count: 0 };
          }

          return { 
            ...job, 
            candidates_count: candidatesData?.length || 0 
          };
        })
      );

      setJobs(jobsWithCandidates);
      
      // Actualizar estadísticas automáticamente
      await refreshStats();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error cargando trabajos:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = async () => {
    if (!user?.email) return;

    try {
      const recruiterId = await getRecruiterId();

      // Cargar estadísticas
      const { data: activeJobsData, error: activeError } = await supabase
        .from('jobs')
        .select('id')
        .eq('recruiter_id', recruiterId)
        .eq('status', 'active');

      if (activeError) throw activeError;

      const { data: totalJobsData, error: totalError } = await supabase
        .from('jobs')
        .select('id')
        .eq('recruiter_id', recruiterId);

      if (totalError) throw totalError;



      // Cargar trabajos recientes para el dashboard con conteo de candidatos
      const { data: recentJobsData, error: recentError } = await supabase
        .from('jobs')
        .select('id, title, status, created_at')
        .eq('recruiter_id', recruiterId)
        .order('created_at', { ascending: false })
        .limit(3);

      if (recentError) throw recentError;

      // Obtener conteo de candidatos y estadísticas para trabajos recientes
      const formattedRecentJobs: RecentJob[] = await Promise.all(
        recentJobsData.map(async (job) => {
          const { data: candidatesData, error: candidatesError } = await supabase
            .from('candidate_analyses')
            .select('overall_score')
            .eq('job_id', job.id);

          let candidatesCount = 0;
          let averageMatch = 0;

          if (!candidatesError && candidatesData) {
            candidatesCount = candidatesData.length;
            if (candidatesCount > 0) {
              const totalScore = candidatesData.reduce((sum, analysis) => sum + (analysis.overall_score || 0), 0);
              averageMatch = Math.round(totalScore / candidatesCount);
            }
          }

          return {
            id: job.id,
            title: job.title,
            candidates: candidatesCount,
            status: job.status,
            match: candidatesCount > 0 ? `${averageMatch}%` : '--'
          };
        })
      );

      setRecentJobs(formattedRecentJobs);

      // Calcular estadísticas globales reales
      const { data: allCandidatesData, error: allCandidatesError } = await supabase
        .from('candidate_analyses')
        .select('overall_score, job_id')
        .in('job_id', totalJobsData.map(job => job.id));

      let totalCandidates = 0;
      let globalAverageMatch = 0;

      if (!allCandidatesError && allCandidatesData) {
        totalCandidates = allCandidatesData.length;
        if (totalCandidates > 0) {
          const totalScore = allCandidatesData.reduce((sum, analysis) => sum + (analysis.overall_score || 0), 0);
          globalAverageMatch = Math.round(totalScore / totalCandidates);
        }
      }

      // Actualizar stats con datos reales
      setStats({
        activeJobs: activeJobsData.length,
        totalJobs: totalJobsData.length,
        analyzedCVs: totalCandidates,
        averageMatch: globalAverageMatch
      });

    } catch (err) {
      console.error('Error actualizando estadísticas:', err);
    }
  };

  const createJob = async (
    jobData: Omit<Job, 'id' | 'created_at' | 'recruiter_id'>, 
    skills: Omit<JobSkill, 'job_id'>[]
  ) => {
    try {
      setError('');
      
      const recruiterId = await getRecruiterId();

      // Validaciones básicas
      if (!jobData.title.trim()) {
        throw new Error('El título del trabajo es obligatorio');
      }

      // Crear el trabajo
      const { data: jobResult, error: jobError } = await supabase
        .from('jobs')
        .insert({
          ...jobData,
          recruiter_id: recruiterId
        })
        .select()
        .single();

      if (jobError) throw jobError;

      // Agregar skills si existen
      if (skills.length > 0) {
        const skillsToInsert = skills.map(skill => ({
          job_id: jobResult.id,
          skill_name: skill.skill_name,
          skill_category: skill.skill_category,
          importance_level: skill.importance_level,
          min_years: skill.min_years,
          is_mandatory: skill.is_mandatory
        }));

        const { error: skillsError } = await supabase
          .from('job_required_skills')
          .insert(skillsToInsert);

        if (skillsError) throw skillsError;
      }

      // Recargar datos para sincronizar todo
      await loadJobs();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateJob = async (
    id: number,
    jobData: Omit<Job, 'id' | 'created_at' | 'recruiter_id'>,
    skills: Omit<JobSkill, 'job_id'>[]
  ) => {
    try {
      setError('');

      // Validaciones básicas
      if (!jobData.title.trim()) {
        throw new Error('El título del trabajo es obligatorio');
      }

      // Actualizar el trabajo
      const { error: jobError } = await supabase
        .from('jobs')
        .update(jobData)
        .eq('id', id);

      if (jobError) throw jobError;

      // Eliminar skills existentes
      const { error: deleteSkillsError } = await supabase
        .from('job_required_skills')
        .delete()
        .eq('job_id', id);

      if (deleteSkillsError) throw deleteSkillsError;

      // Agregar nuevas skills
      if (skills.length > 0) {
        const skillsToInsert = skills.map(skill => ({
          job_id: id,
          skill_name: skill.skill_name,
          skill_category: skill.skill_category,
          importance_level: skill.importance_level,
          min_years: skill.min_years,
          is_mandatory: skill.is_mandatory
        }));

        const { error: skillsError } = await supabase
          .from('job_required_skills')
          .insert(skillsToInsert);

        if (skillsError) throw skillsError;
      }

      // Recargar datos para sincronizar todo
      await loadJobs();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteJob = async (id: number) => {
    try {
      setError('');

      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Recargar datos para sincronizar todo
      await loadJobs();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const toggleJobStatus = async (id: number) => {
    try {
      setError('');

      // Encontrar el trabajo actual
      const currentJob = jobs.find(job => job.id === id);
      if (!currentJob) {
        throw new Error('Trabajo no encontrado');
      }

      const newStatus = currentJob.status === 'active' ? 'draft' : 'active';

      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      // Recargar datos para sincronizar todo
      await loadJobs();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    if (user?.email) {
      loadJobs();
    }
  }, [user?.email]);

  const value: JobsContextType = {
    jobs,
    stats,
    recentJobs,
    loading,
    error,
    loadJobs,
    createJob,
    updateJob,
    deleteJob,
    toggleJobStatus,
    refreshStats
  };

  return (
    <JobsContext.Provider value={value}>
      {children}
    </JobsContext.Provider>
  );
}; 