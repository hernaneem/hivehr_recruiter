import React, { useState, useEffect } from 'react';
import {
  Brain,
  FileText,
  Users,
  CheckCircle,
  Clock,
  ArrowRight,
  Download,
  Eye,
  Filter,
  Search,
  BarChart3,
  Sparkles,
  Activity
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import TermanMerrillTest from './TermanMerrillTest';
import TermanMerrillResults from './TermanMerrillResults';
import { TermanMerrillProvider } from '../contexts/TermanMerrillContext';

interface TestType {
  id: string;
  name: string;
  description: string;
  duration: string;
  icon: React.ComponentType<{ className?: string }>;
  available: boolean;
  color: string;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  job_id: string;
  job_title?: string;
  created_at: string;
}

interface TestResult {
  id: number;
  candidate_id: string;
  test_type: string;
  completed_at: string;
  score?: number;
  iq?: number;
  candidate?: Candidate;
}

const PsychometricTests: React.FC = () => {
  const { user } = useAuth();
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByJob, setFilterByJob] = useState<string | null>(null);

  // Definir tipos de test disponibles
  const testTypes: TestType[] = [
    {
      id: 'terman-merrill',
      name: 'Test Terman-Merrill',
      description: 'Evaluación completa de inteligencia con 10 series de preguntas',
      duration: '40 minutos',
      icon: Brain,
      available: true,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'cleaver',
      name: 'Test Cleaver',
      description: 'Análisis de comportamiento y estilo de trabajo',
      duration: '20 minutos',
      icon: Activity,
      available: true,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'moss',
      name: 'Test Moss',
      description: 'Evaluación de adaptabilidad y características personales',
      duration: '15 minutos',
      icon: Sparkles,
      available: true,
      color: 'from-green-500 to-emerald-500'
    }
  ];

  // Cargar candidatos y resultados
  useEffect(() => {
    if (user) {
      loadCandidates();
      loadTestResults();
    }
  }, [user]);

  const loadCandidates = async () => {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select(`
          *,
          jobs (
            id,
            title
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCandidates(data?.map(c => ({
        ...c,
        job_title: c.jobs?.title
      })) || []);
    } catch (error) {
      console.error('Error loading candidates:', error);
    }
  };

  const loadTestResults = async () => {
    try {
      setLoading(true);
      
      // Cargar resultados de Terman-Merrill
      const { data: termanData, error: termanError } = await supabase
        .from('terman_results')
        .select('*')
        .eq('recruiter_id', user?.id)
        .order('completed_at', { ascending: false });

      if (termanError) throw termanError;

      // Cargar información de candidatos por separado
      const candidateIds = termanData?.map(t => t.candidate_id) || [];
      const { data: candidatesData, error: candidatesError } = await supabase
        .from('candidates')
        .select(`
          id,
          name,
          email,
          job_id,
          created_at,
          jobs (
            id,
            title
          )
        `)
        .in('id', candidateIds);

      if (candidatesError) throw candidatesError;

      const results: TestResult[] = [
        ...(termanData?.map(t => {
          const candidate = candidatesData?.find(c => c.id === t.candidate_id);
          return {
            id: t.id,
            candidate_id: t.candidate_id,
            test_type: 'terman-merrill',
            completed_at: t.completed_at,
            iq: t.iq,
            score: t.total_score,
                          candidate: candidate ? {
                id: candidate.id,
                name: candidate.name,
                email: candidate.email,
                job_id: candidate.job_id,
                created_at: candidate.created_at,
                job_title: (candidate.jobs as any)?.[0]?.title || undefined
              } : undefined
          };
        }) || [])
      ];

      setTestResults(results);
    } catch (error) {
      console.error('Error loading test results:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar candidatos
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJob = !filterByJob || candidate.job_id === filterByJob;
    
    return matchesSearch && matchesJob;
  });

  // Manejar inicio de test
  const handleStartTest = (testId: string, candidate: Candidate) => {
    setSelectedTest(testId);
    setSelectedCandidate(candidate);
  };

  // Manejar finalización de test
  const handleTestComplete = async (result: any) => {
    setSelectedTest(null);
    setSelectedCandidate(null);
    await loadTestResults();
    
    // Mostrar resultados
    setSelectedResult(result);
    setShowResults(true);
  };

  // Ver resultados existentes
  const handleViewResults = async (result: TestResult) => {
    if (result.test_type === 'terman-merrill') {
      try {
        const { data, error } = await supabase
          .from('terman_results')
          .select('*')
          .eq('id', result.id)
          .single();

        if (error) throw error;

        // Convertir formato de base de datos a formato del componente
        const formattedResult = {
          ...data,
          candidateId: data.candidate_id,
          recruiterId: data.recruiter_id,
          totalScore: data.total_score,
          mentalAge: data.mental_age,
          iqClassification: data.iq_classification,
          seriesScores: data.series_scores,
          completedAt: new Date(data.completed_at),
          candidate: result.candidate
        };

        setSelectedResult(formattedResult);
        setShowResults(true);
      } catch (error) {
        console.error('Error loading result details:', error);
      }
    }
  };

  // Renderizar test activo
  if (selectedTest && selectedCandidate) {
    if (selectedTest === 'terman-merrill') {
      return (
        <TermanMerrillProvider>
          <TermanMerrillTest
            candidateId={selectedCandidate.id}
            onComplete={handleTestComplete}
            onCancel={() => {
              setSelectedTest(null);
              setSelectedCandidate(null);
            }}
          />
        </TermanMerrillProvider>
      );
    }
    
    // Aquí se agregarían otros tests (Cleaver, Moss, etc.)
    return <div>Test no implementado</div>;
  }

  // Renderizar resultados
  if (showResults && selectedResult) {
    return (
      <TermanMerrillResults
        result={selectedResult}
        candidateName={selectedResult.candidate?.name || 'Candidato'}
        onClose={() => {
          setShowResults(false);
          setSelectedResult(null);
        }}
      />
    );
  }

  // Renderizar página principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Tests Psicométricos</h1>
              <p className="text-white/70">
                Evalúa las capacidades y características de tus candidatos
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Tests disponibles */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Tests Disponibles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testTypes.map((test) => (
              <div
                key={test.id}
                className={`bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 
                  ${test.available ? 'hover:bg-white/20 cursor-pointer' : 'opacity-50'} transition-all`}
              >
                <div className={`bg-gradient-to-r ${test.color} p-3 rounded-lg w-fit mb-4`}>
                  <test.icon className="h-6 w-6 text-white" />
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2">{test.name}</h3>
                <p className="text-white/70 text-sm mb-3">{test.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-white/60">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{test.duration}</span>
                  </div>
                  
                  {test.available ? (
                    <span className="text-green-400 text-sm flex items-center space-x-1">
                      <CheckCircle className="h-4 w-4" />
                      <span>Disponible</span>
                    </span>
                  ) : (
                    <span className="text-yellow-400 text-sm">Próximamente</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
                <input
                  type="text"
                  placeholder="Buscar candidato..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            
            <button className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all">
              <Filter className="h-5 w-5" />
              <span>Filtros</span>
            </button>
          </div>
        </div>

        {/* Lista de candidatos */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
          <div className="p-6 border-b border-white/20">
            <h2 className="text-xl font-semibold text-white">Candidatos Disponibles</h2>
          </div>
          
          <div className="divide-y divide-white/10">
            {filteredCandidates.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="h-12 w-12 text-white/40 mx-auto mb-4" />
                <p className="text-white/60">No se encontraron candidatos</p>
              </div>
            ) : (
              filteredCandidates.map((candidate) => {
                const candidateResults = testResults.filter(r => r.candidate_id === candidate.id);
                
                return (
                  <div key={candidate.id} className="p-6 hover:bg-white/5 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-white">{candidate.name}</h3>
                        <p className="text-white/60 text-sm">{candidate.email}</p>
                        {candidate.job_title && (
                          <p className="text-white/50 text-sm mt-1">
                            Puesto: {candidate.job_title}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {/* Tests completados */}
                        {candidateResults.length > 0 && (
                          <div className="flex space-x-2">
                            {candidateResults.map((result) => (
                              <button
                                key={result.id}
                                onClick={() => handleViewResults(result)}
                                className="flex items-center space-x-2 px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-all"
                              >
                                <Eye className="h-4 w-4" />
                                <span className="text-sm">
                                  {result.test_type === 'terman-merrill' && `CI: ${result.iq}`}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {/* Botón para iniciar test */}
                        <div className="relative group">
                          <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all">
                            <span>Aplicar Test</span>
                            <ArrowRight className="h-4 w-4" />
                          </button>
                          
                          {/* Dropdown de tests */}
                          <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            {testTypes.filter(t => t.available).map((test) => (
                              <button
                                key={test.id}
                                onClick={() => handleStartTest(test.id, candidate)}
                                className="w-full text-left px-4 py-3 text-white hover:bg-white/10 transition-all first:rounded-t-lg last:rounded-b-lg"
                              >
                                <div className="flex items-center space-x-3">
                                  <test.icon className="h-5 w-5" />
                                  <span>{test.name}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Estadísticas */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {testResults.length}
                </p>
                <p className="text-white/60">Tests completados</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {new Set(testResults.map(r => r.candidate_id)).size}
                </p>
                <p className="text-white/60">Candidatos evaluados</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center space-x-3">
              <Brain className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {testResults.filter(r => r.test_type === 'terman-merrill').length > 0
                    ? Math.round(
                        testResults
                          .filter(r => r.test_type === 'terman-merrill' && r.iq)
                          .reduce((acc, r) => acc + (r.iq || 0), 0) /
                        testResults.filter(r => r.test_type === 'terman-merrill' && r.iq).length
                      )
                    : '-'}
                </p>
                <p className="text-white/60">CI Promedio</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PsychometricTests; 