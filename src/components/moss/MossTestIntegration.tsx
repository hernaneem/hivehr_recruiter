import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  FileText, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Play,
  Eye,
  Download
} from 'lucide-react';
import { MossTest } from './MossTest';
import { useMoss } from '../../contexts/MossContext';
import type { MossResult } from './mossTestData';
import type { CandidateWithMossInfo, MossTest as MossTestType } from '../../contexts/MossContext';

interface MossTestIntegrationProps {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  jobId?: string;
  jobTitle?: string;
}

export const MossTestIntegration: React.FC<MossTestIntegrationProps> = ({
  candidateId,
  candidateName,
  candidateEmail,
  jobId,
  jobTitle
}) => {
  const {
    candidates,
    createTest,
    hasCompletedTest,
    getIncompleteTest,
    deleteIncompleteTest,
    exportTestResults,
    completeTest
  } = useMoss();

  const [showTest, setShowTest] = useState(false);
  const [currentTestId, setCurrentTestId] = useState<string | null>(null);
  const [testHistory, setTestHistory] = useState<MossTestType[]>([]);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Encontrar el candidato actual
  const candidate = candidates.find(c => c.id === candidateId);

  useEffect(() => {
    loadTestInfo();
  }, [candidateId]);

  const loadTestInfo = async () => {
    setIsLoading(true);
    try {
      const [completed] = await Promise.all([
        hasCompletedTest(candidateId)
      ]);
      
      setHasCompleted(completed);
    } catch (error) {
      console.error('Error loading test info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewTest = async () => {
    if (!jobId) {
      alert('Error: No se puede crear el test sin información del trabajo');
      return;
    }

    try {
      // Verificar si hay un test incompleto
      const incompleteTest = await getIncompleteTest(candidateId);
      
      if (incompleteTest) {
        // Preguntar si desea continuar o empezar de nuevo
        const continueTest = window.confirm(
          'Hay un test incompleto. ¿Desea continuarlo o empezar uno nuevo?'
        );
        
        if (!continueTest) {
          await deleteIncompleteTest(incompleteTest.id);
        } else {
          setCurrentTestId(incompleteTest.id);
          setShowTest(true);
          return;
        }
      }

      // Crear nuevo test
      const newTest = await createTest(candidateId, jobId);
      if (newTest) {
        setCurrentTestId(newTest.id);
        setShowTest(true);
      } else {
        alert('Error al crear el test. Por favor intente nuevamente.');
      }
    } catch (error) {
      console.error('Error starting test:', error);
      alert('Error al iniciar el test.');
    }
  };

  const handleTestComplete = async (
    results: MossResult[], 
    answers: Record<number, string>, 
    startTime: Date, 
    endTime: Date
  ) => {
    if (!currentTestId) return;

    try {
      await completeTest(currentTestId, answers, results, startTime, endTime);
      await loadTestInfo();
      setShowTest(false);
      setCurrentTestId(null);
      
      // Mostrar notificación de éxito
      alert('Test completado exitosamente');
    } catch (error) {
      console.error('Error completing test:', error);
      alert('Error al guardar los resultados del test.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 83) return 'text-green-400';
    if (percentage >= 64) return 'text-blue-400';
    if (percentage >= 42) return 'text-yellow-400';
    return 'text-red-400';
  };

  const exportResults = async () => {
    if (!candidate?.test_id) {
      alert('No hay test disponible para exportar');
      return;
    }

    try {
      await exportTestResults(candidate.test_id);
    } catch (error) {
      alert('Error al exportar los resultados');
    }
  };

  if (showTest && currentTestId) {
    return (
      <MossTest
        candidateId={candidateId}
        candidateName={candidateName}
        onComplete={handleTestComplete}
        onCancel={() => {
          setShowTest(false);
          setCurrentTestId(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Brain className="h-10 w-10 text-purple-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Test MOSS</h2>
              <p className="text-white/60">Evaluación de Habilidades Interpersonales</p>
            </div>
          </div>
          
          {!hasCompleted && (
            <button
              onClick={startNewTest}
              disabled={isLoading}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <Play className="h-5 w-5" />
              <span>Iniciar Test</span>
            </button>
          )}
        </div>

        {/* Info del candidato */}
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-white/60">Candidato:</span>
              <p className="text-white font-medium">{candidateName}</p>
            </div>
            <div>
              <span className="text-white/60">Email:</span>
              <p className="text-white font-medium">{candidateEmail}</p>
            </div>
            {jobTitle && (
              <div>
                <span className="text-white/60">Puesto:</span>
                <p className="text-white font-medium">{jobTitle}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Estado del test */}
      {hasCompleted ? (
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-400" />
          <span className="text-green-200">
            El candidato ha completado el Test MOSS
          </span>
        </div>
      ) : (
        <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-amber-400" />
          <span className="text-amber-200">
            El candidato aún no ha realizado el Test MOSS
          </span>
        </div>
      )}

      {/* Resultados si están disponibles */}
      {candidate?.moss_results && (
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
          <div className="p-6 border-b border-white/20 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Resultados del Test</span>
            </h3>
            <button
              onClick={exportResults}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="Exportar resultados"
            >
              <Download className="h-5 w-5 text-white" />
            </button>
          </div>

          <div className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <span className="text-white font-medium">
                {formatDate(candidate.moss_results.completed_at)}
              </span>
              <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">
                Completado
              </span>
              {candidate.moss_results.time_spent_minutes && (
                <span className="text-white/60 text-sm flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{candidate.moss_results.time_spent_minutes} min</span>
                </span>
              )}
            </div>

            {/* Puntuación general */}
            <div className="flex items-center space-x-4 mb-6">
              <span className="text-white/60">Puntuación General:</span>
              <span className={`text-2xl font-bold ${getScoreColor(candidate.moss_results.total_percentage)}`}>
                {candidate.moss_results.total_percentage}%
              </span>
            </div>

            {/* Resultados por área */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <p className="text-white/60 text-xs mb-1">Supervisión</p>
                <p className="text-white font-medium text-sm">{candidate.moss_results.hs_level || 'N/A'}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <p className="text-white/60 text-xs mb-1">Decisiones RH</p>
                <p className="text-white font-medium text-sm">{candidate.moss_results.cdrh_level || 'N/A'}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <p className="text-white/60 text-xs mb-1">Evaluación</p>
                <p className="text-white font-medium text-sm">{candidate.moss_results.cepi_level || 'N/A'}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <p className="text-white/60 text-xs mb-1">Relaciones</p>
                <p className="text-white font-medium text-sm">{candidate.moss_results.heri_level || 'N/A'}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <p className="text-white/60 text-xs mb-1">Sentido Común</p>
                <p className="text-white font-medium text-sm">{candidate.moss_results.sctri_level || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Información sobre el test */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h4 className="text-white font-semibold mb-3">Acerca del Test MOSS</h4>
        <div className="space-y-2 text-white/70 text-sm">
          <p>
            El Test MOSS evalúa 5 áreas clave de habilidades interpersonales y de supervisión:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Habilidad en Supervisión</li>
            <li>Capacidad de Decisiones en las Relaciones Humanas</li>
            <li>Capacidad de Evaluación de Problemas Interpersonales</li>
            <li>Habilidad para Establecer Relaciones Interpersonales</li>
            <li>Sentido Común y Tacto en las Relaciones Interpersonales</li>
          </ul>
          <p className="mt-3">
            <strong>Duración:</strong> Aproximadamente 15-20 minutos<br />
            <strong>Preguntas:</strong> 30 situaciones con 4 opciones cada una
          </p>
        </div>
      </div>
    </div>
  );
}; 