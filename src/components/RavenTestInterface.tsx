import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { RavenProvider, useRaven } from '../contexts/RavenContext';
import RavenTest from './RavenTest';


const RavenTestInterfaceInner: React.FC<{ candidateId: string; jobId?: string }> = ({ candidateId, jobId }) => {
  return <RavenTest candidateId={candidateId} jobId={jobId} />;
};

const RavenTestInterface: React.FC = () => {
  const { token } = useParams<{ token: string }>();

  const { loadTestByToken, error } = useRaven();
  const [loading, setLoading] = useState(true);
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | undefined>();

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      await loadTestByToken(token);
      // despues de cargar, obtener candidateId y jobId de BD para pasar a RavenTest
      const { data, error: rowErr } = await supabase
        .from('raven_tests')
        .select('candidate_id, job_id')
        .eq('test_token', token)
        .single();
      if (data) {
        setCandidateId(data.candidate_id);
        setJobId(data.job_id ?? undefined);
      }
      setLoading(false);
    };
    load();
  }, [token]);

  if (loading || !candidateId) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Cargando...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-red-400">{error}</div>;

  return <RavenTestInterfaceInner candidateId={candidateId} jobId={jobId} />;
};

export default RavenTestInterface;
