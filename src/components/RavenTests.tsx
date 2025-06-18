import React, { useEffect, useState } from 'react';
import {
  Send,
  Copy,
  AlertCircle,
  Briefcase,
  Search,
  Eye,
  Download,
  X
} from 'lucide-react';
import RavenResultsDashboard from './RavenResultsDashboard';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position: string;
  job_title?: string;
  job_id: string;
  cv_status: 'approved' | 'reviewing' | 'rejected';
  cv_review_date?: string;
  years_experience?: number;
  created_at: string;
  /* Raven Progressive Matrices */
  raven_status: 'not-started' | 'pending' | 'in-progress' | 'completed' | 'expired';
  raven_invitation_sent: boolean;
  raven_test_id?: string;
  raven_test_token?: string;
}

const RavenTests: React.FC = () => {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'cv-approved' | 'test-pending' | 'test-completed'>('all');
  const [resultsModal, setResultsModal] = useState<null | any>(null);

  useEffect(() => {
    if (user?.id) {
      loadCandidates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  /* -------------------------------- UTIL -------------------------------- */
  const getStatusBadge = (status: string) => {
    const badges = {
      'pending': { color: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30', text: 'Pendiente' },
      'completed': { color: 'bg-green-500/20 text-green-300 border border-green-500/30', text: 'Completado' },
      'in-progress': { color: 'bg-blue-500/20 text-blue-300 border border-blue-500/30', text: 'En progreso' },
      'not-started': { color: 'bg-gray-500/20 text-gray-300 border border-gray-500/30', text: 'No iniciado' },
      'approved': { color: 'bg-green-500/20 text-green-300 border border-green-500/30', text: 'Aprobado' },
      'reviewing': { color: 'bg-blue-500/20 text-blue-300 border border-blue-500/30', text: 'En revisión' },
      'rejected': { color: 'bg-red-500/20 text-red-300 border border-red-500/30', text: 'Rechazado' }
    } as const;

    const badge = badges[status as keyof typeof badges] || badges['not-started'];
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${badge.color}`}>{badge.text}</span>
    );
  };

  /* ----------------------------- DATA LOADING ---------------------------- */
  const loadCandidates = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      // Candidates with viable analysis
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
        .in('candidate_analyses.recommendation', ['yes', 'maybe']);

      if (candidatesError) throw candidatesError;

      const candidateIds = candidatesData?.map(c => c.id) || [];

      const { data: ravenTestsData, error: ravenError } = await supabase
        .from('raven_tests')
        .select('*')
        .in('candidate_id', candidateIds)
        .eq('recruiter_id', user.id);
      if (ravenError) throw ravenError;

      const candidatesWithTests: Candidate[] = (candidatesData || []).map(candidate => {
        const analysis = candidate.candidate_analyses?.[0];
        const ravenTest = ravenTestsData?.find(t => t.candidate_id === candidate.id);
        return {
          id: candidate.id,
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone,
          position: analysis?.jobs?.[0]?.title || 'Sin especificar',
          job_title: analysis?.jobs?.[0]?.title,
          job_id: analysis?.job_id,
          cv_status: analysis?.recommendation === 'yes' ? 'approved' : 'reviewing',
          cv_review_date: analysis?.processed_at,
          years_experience: candidate.years_experience,
          created_at: candidate.created_at,
          raven_status: ravenTest?.status || 'not-started',
          raven_invitation_sent: !!ravenTest?.invitation_sent_at,
          raven_test_id: ravenTest?.id,
          raven_test_token: ravenTest?.test_token
        };
      });
      setCandidates(candidatesWithTests);
    } catch (error) {
      console.error('Error loading Raven candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------- INVITATION & LINKS ------------------------- */
  const createRavenTest = async (candidateId: string, jobId: string) => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    const token = btoa(`raven_${candidateId}_${Date.now()}_${Math.random()}`);
    const { data, error } = await supabase
      .from('raven_tests')
      .insert({
        candidate_id: candidateId,
        job_id: jobId,
        recruiter_id: user.id,
        test_token: token,
        status: 'not-started',
        expires_at: new Date(Date.now() + 7*24*60*60*1000).toISOString()
      })
      .select()
      .single();
    if (error) {
      console.error('Raven insert error →',
        { message: error.message, details: error.details, hint: error.hint, code: error.code });
      throw error;
    }
    await loadCandidates();
    return data;
  };

  const sendRavenInvitation = async (candidateId: string) => {
    try {
      const candidate = candidates.find(c => c.id === candidateId);
      if (!candidate?.job_id) {
        alert('Error: Falta información del trabajo');
        return;
      }
      const createdTest = await createRavenTest(candidateId, candidate.job_id);
      setCandidates(prev => prev.map(c => c.id === candidateId ? {
        ...c,
        raven_status: 'not-started',
        raven_invitation_sent: true,
        raven_test_id: createdTest.id,
        raven_test_token: createdTest.test_token
      } : c));
      alert('✅ Test Raven creado. Enlace copiado al portapapeles');
      const link = `${window.location.origin}/raven-test/${createdTest.test_token}`;
      navigator.clipboard.writeText(link);
    } catch (error) {
      alert(`Error enviando invitación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const generateRavenLink = (candidateId: string) => {
    const candidate = candidates.find(c => c.id === candidateId);
    return candidate?.raven_test_token ? `${window.location.origin}/raven-test/${candidate.raven_test_token}` : '';
  };

  /* -------------------------- FILTERED CANDIDATES ------------------------ */
  const filteredCandidates = () => {
    return candidates.filter(candidate => {
      if (searchTerm && !candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) && !candidate.email.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (filter === 'cv-approved') return candidate.cv_status === 'approved' || candidate.cv_status === 'reviewing';
      if (filter === 'test-pending') return candidate.raven_status === 'not-started';
      if (filter === 'test-completed') return candidate.raven_status === 'completed';
      return true;
    });
  };

  /* -------------------------------- RENDER -------------------------------- */
  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
          <div className="flex items-center flex-1 bg-white/5 px-3 py-2 rounded-lg">
            <Search className="h-4 w-4 text-white/50 mr-2" />
            <input
              type="text"
              placeholder="Buscar candidato..."
              className="bg-transparent focus:outline-none text-white placeholder-white/50 flex-1 text-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-all ${filter === 'all' ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'}`}
            >Todos</button>
            <button
              onClick={() => setFilter('cv-approved')}
              className={`px-4 py-2 rounded-lg transition-all ${filter === 'cv-approved' ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'}`}
            >CV Viable</button>
            <button
              onClick={() => setFilter('test-pending')}
              className={`px-4 py-2 rounded-lg transition-all ${filter === 'test-pending' ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'}`}
            >Test Pendiente</button>
            <button
              onClick={() => setFilter('test-completed')}
              className={`px-4 py-2 rounded-lg transition-all ${filter === 'test-completed' ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'}`}
            >Test Completado</button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Candidato</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Puesto</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Estado CV</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Test Raven</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-white/70">Cargando candidatos...</td>
                </tr>
              ) : filteredCandidates().length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-white/50">
                    <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    No hay candidatos disponibles
                  </td>
                </tr>
              ) : (
                filteredCandidates().map(candidate => (
                  <tr key={candidate.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">{candidate.name}</div>
                        <div className="text-sm text-white/60">{candidate.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm text-white">{candidate.position}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(candidate.cv_status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(candidate.raven_status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        {(candidate.cv_status === 'approved' || candidate.cv_status === 'reviewing') && !candidate.raven_test_token && (
                          <button onClick={() => sendRavenInvitation(candidate.id)} className="text-blue-400 hover:text-blue-300 flex items-center space-x-1 transition-colors">
                            <Send className="h-4 w-4" /><span>Crear Test</span>
                          </button>
                        )}
                        {(candidate.cv_status === 'approved' || candidate.cv_status === 'reviewing') && candidate.raven_test_token && candidate.raven_status !== 'completed' && (
                          <button onClick={() => {
                            const link = generateRavenLink(candidate.id);
                            if (link) {
                              navigator.clipboard.writeText(link);
                              alert('📋 Enlace copiado!');
                            }
                          }} className="text-purple-400 hover:text-purple-300 flex items-center space-x-1 transition-colors">
                            <Copy className="h-4 w-4" /><span>Copiar Enlace</span>
                          </button>
                        )}
                        {candidate.raven_status === 'completed' && (
                          <>
                            <button onClick={async () => {
                              const { data } = await supabase
                                .from('raven_scores')
                                .select('*')
                                .eq('test_id', candidate.raven_test_id)
                                .single();
                              if (data) {
                                setResultsModal({
                                  candidateName: candidate.name,
                                  completedAt: data.created_at ?? candidate.created_at,
                                  rawScore: data.raw_score,
                                  percentile: data.percentile,
                                  diagnosticRank: data.diagnostic_rank
                                });
                              }
                            }} className="text-green-400 hover:text-green-300 flex items-center space-x-1 transition-colors"><Eye className="h-4 w-4" /><span>Ver Resultados</span></button>
                          </>
                        )}
                        {candidate.raven_test_token && candidate.raven_status === 'not-started' && (
                          <span className="text-yellow-400 flex items-center space-x-1"><AlertCircle className="h-4 w-4" /><span>Esperando respuesta</span></span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div> {/* cierre overflow-x-auto */}
      </div> {/* cierre bg card */}
      {resultsModal && (
        <RavenResultsDashboard
          result={resultsModal}
          onClose={() => setResultsModal(null)}
        />
      )}
    </div>
  );
};

export default RavenTests;
