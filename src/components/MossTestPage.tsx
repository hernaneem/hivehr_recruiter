import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Target, Clock, User, CheckCircle } from 'lucide-react';
import { useMoss } from '../contexts/MossContext';
import type { MossTest } from '../contexts/MossContext';

const MossTestPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  console.log('MossTestPage montado con token:', token);
  
  try {
    var { getTestByToken, startTest } = useMoss();
    console.log('useMoss hook obtenido correctamente');
  } catch (err) {
    console.error('Error obteniendo useMoss:', err);
    throw err;
  }
  const [test, setTest] = useState<MossTest | null>(null);
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
        const testData = await getTestByToken(token);
        if (!testData) {
          setError('El test no existe, ha expirado o ya fue completado');
        } else {
          setTest(testData);
          setHasStarted(testData.status === 'in-progress' || testData.status === 'completed');
        }
      } catch (err) {
        setError('Error cargando el test');
      } finally {
        setLoading(false);
      }
    };

    loadTest();
  }, [token, getTestByToken]);

  const handleStartTest = async () => {
    console.log('=== HANDLE START TEST EJECUTADO ===');
    if (!test) return;

    try {
      console.log('Iniciando test...', { testId: test.id, token });
      await startTest(test.id);
      console.log('Test iniciado exitosamente');
      setHasStarted(true);
      // Navegar a la interfaz completa del test
      console.log('Navegando a:', `/moss-test/${token}/start`);
      navigate(`/moss-test/${token}/start`);
    } catch (err) {
      console.error('Error iniciando el test:', err);
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
            ¡Gracias! Ya has completado este test de habilidades interpersonales.
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
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Test MOSS</h1>
          <p className="text-white/70">Evaluación de Habilidades Interpersonales y Supervisión</p>
        </div>

        {/* Información del candidato */}
        <div className="bg-white/5 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3 mb-3">
            <User className="w-5 h-5 text-purple-400" />
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
              <span>El test consta de 30 preguntas sobre situaciones interpersonales</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>Cada pregunta tiene 4 opciones de respuesta</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>Duración aproximada: 20-25 minutos</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>Evalúa 5 áreas: Habilidades Sociales, Capacidad de Dirección, Capacidad de Evaluación, Habilidades de Relación Interpersonal y Sentido Común</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>Responde de forma espontánea y honesta</span>
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
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 text-lg"
            >
              🎯 Comenzar Test MOSS
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
                onClick={() => navigate(`/moss-test/${token}/start`)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-8 rounded-lg transition-all"
              >
                📝 Continuar Test
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-white/50 text-xs">
            Test MOSS - Evaluación de Habilidades Interpersonales
          </p>
        </div>
      </div>
    </div>
  );
};

export default MossTestPage; 