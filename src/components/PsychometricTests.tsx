import React, { useState, useEffect } from 'react';
import {
  Send,
  Download,
  Eye,
  Copy,
  AlertCircle,
  Briefcase,
  Search
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import TermanMerrillResults from './TermanMerrillResults';

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
  /* Terman-Merrill */
  terman_status: 'not-started' | 'pending' | 'in-progress' | 'completed' | 'expired';
  invitation_sent: boolean;
  test_id?: string;
  test_token?: string;
  /* Raven Progressive Matrices */
  raven_status: 'not-started' | 'pending' | 'in-progress' | 'completed' | 'expired';
  raven_invitation_sent: boolean;
  raven_test_id?: string;
  raven_test_token?: string;
}

// Lightweight shape for results fetched from terman_results table
interface TermanResult {
  id: number;
  candidateId: string;
  totalScore: number;
  mentalAge: number;
  iq: number;
  iqClassification: string;
  seriesScores: any;
  completedAt: string;
  interpretation: {
    strengths: string[];
    weaknesses: string[];
    generalAssessment: string;
  };
}

const PsychometricTests: React.FC = () => {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showResultsDashboard, setShowResultsDashboard] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user?.id) {
      loadCandidates();
    }
  }, [user?.id]);

  const loadCandidates = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Cargar candidatos con análisis aprobados (igual que CleaverContext y MossContext)
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

      // Obtener tests existentes
      const candidateIds = candidatesData?.map(c => c.id) || [];

      // Tests Terman-Merrill
      const { data: termanTestsData, error: termanError } = await supabase
        .from('terman_tests')
        .select('*')
        .in('candidate_id', candidateIds)
        .eq('recruiter_id', user.id);
      if (termanError) throw termanError;

      // Tests Raven
      const { data: ravenTestsData, error: ravenError } = await supabase
        .from('raven_tests')
        .select('*')
        .in('candidate_id', candidateIds)
        .eq('recruiter_id', user.id);
      if (ravenError) throw ravenError;

      // Combinar datos
      const candidatesWithTests = candidatesData?.map(candidate => {
        const analysis = candidate.candidate_analyses?.[0];
        const termanTest = termanTestsData?.find(t => t.candidate_id === candidate.id);
        const ravenTest = ravenTestsData?.find(t => t.candidate_id === candidate.id);

        return {
          id: candidate.id,
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone,
          position: analysis?.jobs?.[0]?.title || 'Sin especificar',
          job_title: analysis?.jobs?.[0]?.title,
          job_id: analysis?.job_id,
          cv_status: analysis?.recommendation === 'yes' ? 'approved' as const : 'reviewing' as const,
          cv_review_date: analysis?.processed_at,
          years_experience: candidate.years_experience,
          created_at: candidate.created_at,
          /* Terman-Merrill */
          terman_status: termanTest?.status || 'not-started',
          invitation_sent: !!termanTest?.invitation_sent_at,
          test_id: termanTest?.id,
          test_token: termanTest?.test_token,
          /* Raven */
          raven_status: ravenTest?.status || 'not-started',
          raven_invitation_sent: !!ravenTest?.invitation_sent_at,
          raven_test_id: ravenTest?.id,
          raven_test_token: ravenTest?.test_token
        };
      }) || [];

      setCandidates(candidatesWithTests);
    } catch (error) {
      console.error('Error loading candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTermanTest = async (candidateId: string, jobId: string) => {
    if (!user?.id) throw new Error('Usuario no autenticado');

    try {
      // Generar token único
      const token = btoa(`terman_${candidateId}_${Date.now()}_${Math.random()}`);

      const { data: testData, error: testError } = await supabase
        .from('terman_tests')
        .insert({
          candidate_id: candidateId,
          job_id: jobId,
          recruiter_id: user.id,
          test_token: token,
          status: 'not-started',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días
          invitation_email_sent: false
        })
        .select()
        .single();

      if (testError) throw testError;

      // Recargar candidatos
      await loadCandidates();

      return testData;
    } catch (error) {
      throw error;
    }
  };

  const sendTermanInvitation = async (candidateId: string) => {
    try {
      const candidate = candidates.find(c => c.id === candidateId);
      if (!candidate?.job_id) {
        alert('Error: No se puede enviar invitación, falta información del trabajo');
        return;
      }

      // Crear el test
      const createdTest = await createTermanTest(candidateId, candidate.job_id);
      
      // Actualizar candidato con información del test
      const candidateWithTest = {
        ...candidate,
        terman_status: 'pending' as const,
        invitation_sent: true,
        test_id: createdTest.id,
        test_token: createdTest.test_token
      };
      
      setSelectedCandidate(candidateWithTest);
      setShowLinkModal(true);
      
    } catch (error) {
      alert(`Error enviando invitación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const generateTermanLink = (candidateId: string) => {
    // Primero buscar en selectedCandidate si coincide el ID
    if (selectedCandidate?.id === candidateId && selectedCandidate?.test_token) {
      return `${window.location.origin}/terman-test/${selectedCandidate.test_token}`;
    }
    
    // Luego buscar en la lista de candidatos
    const candidate = candidates.find(c => c.id === candidateId);
    if (candidate?.test_token) {
      return `${window.location.origin}/terman-test/${candidate.test_token}`;
    }
    
    return '';
  };

  const generateRavenLink = (candidateId: string) => {
    if (selectedCandidate?.id === candidateId && selectedCandidate?.raven_test_token) {
      return `${window.location.origin}/raven-test/${selectedCandidate.raven_test_token}`;
    }
    const candidate = candidates.find(c => c.id === candidateId);
    if (candidate?.raven_test_token) {
      return `${window.location.origin}/raven-test/${candidate.raven_test_token}`;
    }
    return '';
  };

  const createRavenTest = async (candidateId: string, jobId: string) => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    try {
      const token = btoa(`raven_${candidateId}_${Date.now()}_${Math.random()}`);
      const { data: testData, error: testError } = await supabase
        .from('raven_tests')
        .insert({
          candidate_id: candidateId,
          job_id: jobId,
          recruiter_id: user.id,
          test_token: token,
          status: 'not-started',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días
          invitation_email_sent: false,
        })
        .select()
        .single();
      if (testError) throw testError;
      await loadCandidates();
      return testData;
    } catch (error) {
      throw error;
    }
  };

  const sendRavenInvitation = async (candidateId: string) => {
    try {
      const candidate = candidates.find(c => c.id === candidateId);
      if (!candidate?.job_id) {
        alert('Error: No se puede enviar invitación, falta información del trabajo');
        return;
      }
      const createdTest = await createRavenTest(candidateId, candidate.job_id);
      const updatedCandidate = {
        ...candidate,
        raven_status: 'not-started' as const,
        raven_invitation_sent: true,
        raven_test_id: createdTest.id,
        raven_test_token: createdTest.test_token,
      } as Candidate;
      // actualizar lista local
      setCandidates(prev => prev.map(c => c.id === candidateId ? updatedCandidate : c));
      alert('✅ Test Raven creado. Usa "Enlace Raven" para compartir.');
    } catch (error) {
      alert(`Error enviando invitación Raven: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const viewTermanResults = async (candidate: Candidate) => {
    try {
      // Consultar la tabla terman_results buscando el resultado más reciente del candidato para la vacante
      const { data, error } = await supabase
        .from('terman_results')
        .select('*')
        .eq('candidate_id', candidate.id)
        .order('completed_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      if (!data || data.length === 0) {
        alert('No se encontraron resultados para este candidato');
        return;
      }

      const dbResult = data[0];

      const adaptedResults = {
        id: dbResult.id,
        candidateId: dbResult.candidate_id,
        totalScore: dbResult.total_score,
        mentalAge: dbResult.mental_age,
        iq: dbResult.iq,
        iqClassification: dbResult.iq_classification,
        seriesScores: dbResult.series_scores ?? [],
        completedAt: dbResult.completed_at,
        interpretation: dbResult.interpretation ?? {
          strengths: [],
          weaknesses: [],
          generalAssessment: ''
        }
      } as TermanResult;

      setTestResults(adaptedResults);
      setShowResultsDashboard(true);
    } catch (error) {
      alert(`Error cargando resultados: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

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
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const filteredCandidates = () => {
    return candidates.filter(candidate => {
      // Filtro por búsqueda
      if (searchTerm && !candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !candidate.email.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filtros por estado
      if (filter === 'all') return true;
      if (filter === 'cv-approved') return candidate.cv_status === 'approved' || candidate.cv_status === 'reviewing';
      if (filter === 'test-pending') return candidate.terman_status === 'pending';
      if (filter === 'test-completed') return candidate.terman_status === 'completed';
      
      return true;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Filtros y búsqueda */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Búsqueda */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-white/50" />
            </div>
          </div>

          {/* Filtros */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === 'all' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('cv-approved')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === 'cv-approved' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
              }`}
            >
              CV Viable
            </button>
            <button
              onClick={() => setFilter('test-pending')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === 'test-pending' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
              }`}
            >
              Test Pendiente
            </button>
            <button
              onClick={() => setFilter('test-completed')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === 'test-completed' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
              }`}
            >
              Test Completado
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de candidatos */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Candidato
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Puesto
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Estado CV
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Test Terman
                </th>

                <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredCandidates().map((candidate) => (
                <tr key={candidate.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">{candidate.name}</div>
                      <div className="text-sm text-white/60">{candidate.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{candidate.position}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(candidate.cv_status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(candidate.terman_status)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      {(candidate.cv_status === 'approved' || candidate.cv_status === 'reviewing') && !candidate.test_token && (
                        <button
                          onClick={() => sendTermanInvitation(candidate.id)}
                          className="text-blue-400 hover:text-blue-300 flex items-center space-x-1 transition-colors"
                        >
                          <Send className="h-4 w-4" />
                          <span>Crear Test</span>
                        </button>
                      )}

                      {(candidate.cv_status === 'approved' || candidate.cv_status === 'reviewing') && candidate.test_token && candidate.terman_status !== 'completed' && (
                        <button
                          onClick={() => {
                            setSelectedCandidate(candidate);
                            setShowLinkModal(true);
                          }}
                          className="text-purple-400 hover:text-purple-300 flex items-center space-x-1 transition-colors"
                        >
                          <Copy className="h-4 w-4" />
                          <span>Copiar Enlace</span>
                        </button>
                      )}
                      
                      {candidate.terman_status === 'completed' && (
                        <>
                          <button
                            onClick={() => viewTermanResults(candidate)}
                            className="text-green-400 hover:text-green-300 flex items-center space-x-1 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                            <span>Ver Resultados</span>
                          </button>
                          
                          <button
                            onClick={() => {/* TODO: Implementar exportar */}}
                            className="text-white/70 hover:text-white flex items-center space-x-1 transition-colors"
                          >
                            <Download className="h-4 w-4" />
                            <span>Exportar</span>
                          </button>
                        </>
                      )}
                      
                      {candidate.test_token && candidate.terman_status === 'pending' && (
                        <span className="text-yellow-400 flex items-center space-x-1">
                          <AlertCircle className="h-4 w-4" />
                          <span>Esperando respuesta</span>
                        </span>
                      )}
                      

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Mensaje cuando no hay candidatos */}
          {filteredCandidates().length === 0 && (
            <div className="text-center py-12 px-6">
              <div className="text-white/50 mb-4">
                <Briefcase className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No hay candidatos disponibles</h3>
                <p className="text-sm">
                  No tienes candidatos viables para aplicar el Test Terman-Merrill.
                </p>
                <p className="text-sm mt-2">
                  Los candidatos aparecerán aquí una vez que tengas CVs aprobados o viables en la sección de Análisis.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de enlace generado */}
      {selectedCandidate && showLinkModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-bold text-white mb-4">
              🧮 Enlace de Test Terman-Merrill
            </h3>
            <p className="text-white/70 text-sm mb-4">
              Comparte este enlace con <strong className="text-white">{selectedCandidate?.name}</strong> para que realice el test de inteligencia Terman-Merrill:
            </p>
          
          {/* Información del candidato */}
          <div className="bg-black/20 p-3 rounded-lg mb-4 border border-white/10">
            <div className="text-sm text-white/80 mb-2">
              <strong>Candidato:</strong> {selectedCandidate.name}
            </div>
            <div className="text-sm text-white/80 mb-2">
              <strong>Email:</strong> {selectedCandidate.email}
            </div>
            <div className="text-sm text-white/80">
              <strong>Puesto:</strong> {selectedCandidate.position}
            </div>
          </div>

          {/* Enlace */}
          <div className="bg-black/30 p-4 rounded-lg mb-4 border border-white/10">
            <div className="text-xs text-white/60 mb-2">Enlace del test:</div>
            <div className="flex items-center space-x-2">
              <code className="text-sm text-green-300 break-all font-mono flex-1 p-2 bg-black/30 rounded border">
                {selectedCandidate ? generateTermanLink(selectedCandidate.id) : 'Generando enlace...'}
              </code>
              <button
                onClick={() => {
                  if (selectedCandidate) {
                    const link = generateTermanLink(selectedCandidate.id);
                    if (link) {
                      navigator.clipboard.writeText(link);
                      alert('📋 Enlace copiado!');
                    }
                  }
                }}
                className="px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded text-xs transition-colors"
              >
                📋
              </button>
            </div>
          </div>

          {/* Instrucciones */}
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 mb-4">
            <div className="text-xs text-blue-300 mb-1">📋 Instrucciones para el candidato:</div>
            <ul className="text-xs text-blue-200 space-y-1">
              <li>• El test tiene una duración aproximada de 40 minutos</li>
              <li>• Consta de 10 series con diferentes tipos de preguntas</li>
              <li>• Cada serie tiene un tiempo límite específico</li>
              <li>• Debe completarse en una sola sesión</li>
              <li>• El enlace expira en 7 días</li>
              <li>• Responde con la mayor precisión posible</li>
            </ul>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                if (selectedCandidate) {
                  const link = generateTermanLink(selectedCandidate.id);
                  if (link) {
                    navigator.clipboard.writeText(link);
                    alert('✅ Enlace copiado al portapapeles');
                  } else {
                    alert('❌ No hay enlace disponible');
                  }
                }
              }}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all font-medium"
            >
              📋 Copiar Enlace
            </button>
            <button
              onClick={() => {
                setSelectedCandidate(null);
                setShowLinkModal(false);
              }}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all border border-white/20"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Dashboard de resultados */}
    {showResultsDashboard && testResults && (
      <TermanMerrillResults
        result={testResults}
        onClose={() => {
          setShowResultsDashboard(false);
          setTestResults(null);
        }}
      />
    )}
    </div>
  );
};

export default PsychometricTests; 