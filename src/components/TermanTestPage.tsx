import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Brain, Clock, User, CheckCircle } from 'lucide-react';
// import { useTermanMerrill } from '../contexts/TermanMerrillContext';
import { supabase } from '../lib/supabase';

interface TermanTest {
  id: number;
  candidate_id: string;
  job_id: string;
  test_token: string;
  status: 'pending' | 'in-progress' | 'completed';
  expires_at: string;
  created_at: string;
  candidate?: {
    id: string;
    name: string;
    email: string;
  };
  job?: {
    id: string;
    title: string;
    company: string;
  };
}

const TermanTestPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<TermanTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const loadTest = async () => {
      if (!token) {
        setError('Token de test no válido');
        setLoading(false);
        return;
      }

      try {
        // Buscar el test por token
        const { data: testData, error: testError } = await supabase
          .from('terman_tests')
          .select(`
            *,
            candidate:candidates(id, name, email),
            job:jobs(id, title, company)
          `)
          .eq('test_token', token)
          .single();

        if (testError || !testData) {
          setError('El test no existe, ha expirado o ya fue completado');
        } else {
          // Verificar si el test ha expirado
          if (new Date(testData.expires_at) < new Date()) {
            setError('Este test ha expirado');
          } else {
            setTest(testData);
            setHasStarted(testData.status === 'in-progress' || testData.status === 'completed');
          }
        }
      } catch (err) {
        setError('Error cargando el test');
      } finally {
        setLoading(false);
      }
    };

    loadTest();
  }, [token]);

  const handleStartTest = async () => {
    if (!test) return;

    try {
      // Actualizar el estado del test a 'in-progress'
      const { error: updateError } = await supabase
        .from('terman_tests')
        .update({ 
          status: 'in-progress',
          started_at: new Date().toISOString()
        })
        .eq('id', test.id);

      if (updateError) throw updateError;

      setHasStarted(true);
      // Navegar a la interfaz completa del test
      navigate(`/terman-test/${token}/start`);
    } catch (err) {
      alert('Error iniciando el test');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Cargando test...</p>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-8 max-w-md text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-4">Test No Disponible</h1>
          <p className="text-red-300 mb-6">{error}</p>
          <p className="text-white/70 text-sm">
            Si crees que esto es un error, contacta con el reclutador que te envió este enlace.
          </p>
        </div>
      </div>
    );
  }

  if (test.status === 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-8 max-w-md text-center">
          <CheckCircle className="text-green-400 w-16 h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Test Completado</h1>
          <p className="text-green-300 mb-6">
            ¡Gracias! Ya has completado este test de inteligencia.
          </p>
          <p className="text-white/70 text-sm">
            Los resultados han sido enviados al equipo de reclutamiento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Test Terman-Merrill</h1>
          <p className="text-white/70">Evaluación de inteligencia y capacidad cognitiva</p>
        </div>

        {/* Información del candidato */}
        <div className="bg-white/5 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3 mb-3">
            <User className="w-5 h-5 text-blue-400" />
            <span className="text-white font-medium">Información del Test</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/70">Candidato:</span>
              <span className="text-white">{test.candidate?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Puesto:</span>
              <span className="text-white">{test.job?.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Empresa:</span>
              <span className="text-white">{test.job?.company || 'No especificada'}</span>
            </div>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mb-6">
          <h3 className="text-blue-300 font-medium mb-3">📋 Instrucciones Importantes</h3>
          <ul className="text-blue-200 text-sm space-y-2">
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>El test consta de 10 series con diferentes tipos de ejercicios</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>Cada serie tiene un tiempo límite de 4 minutos</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>Lee cuidadosamente las instrucciones de cada serie</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>Duración total aproximada: 40 minutos</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>Responde con la mayor precisión posible</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>No te preocupes si no terminas todas las preguntas de una serie</span>
            </li>
          </ul>
        </div>

        {/* Tiempo */}
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-yellow-400" />
            <div>
              <div className="text-yellow-300 font-medium">Tiempo disponible</div>
              <div className="text-yellow-200 text-sm">
                Este enlace expira el: {new Date(test.expires_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Botón de acción */}
        <div className="text-center">
          {!hasStarted ? (
            <button
              onClick={handleStartTest}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 text-lg"
            >
              🧠 Comenzar Test de Inteligencia
            </button>
          ) : (
            <div className="space-y-4">
              <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4">
                <p className="text-orange-300">
                  {test.status === 'in-progress' 
                    ? '⏳ Test en progreso...' 
                    : '✅ Test iniciado correctamente'
                  }
                </p>
              </div>
              <button
                onClick={() => navigate(`/terman-test/${token}/start`)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-8 rounded-lg transition-all"
              >
                ▶️ Continuar Test
              </button>
            </div>
          )}
        </div>

        {/* Nota importante */}
        <div className="mt-6 text-center">
          <p className="text-white/50 text-xs">
            Asegúrate de tener una conexión estable a internet durante todo el test.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermanTestPage; 