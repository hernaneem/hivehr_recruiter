import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Target, CheckCircle, Clock, User, Award } from 'lucide-react';
import { useMoss } from '../contexts/MossContext';
import type { MossTest } from '../contexts/MossContext';

const MossTestCompleted = () => {
  const { token } = useParams<{ token: string }>();
  const { getTestByToken } = useMoss();
  const [test, setTest] = useState<MossTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
          setError('El test no existe o ha expirado');
        } else {
          setTest(testData);
        }
      } catch (err) {
        setError('Error cargando información del test');
      } finally {
        setLoading(false);
      }
    };

    loadTest();
  }, [token, getTestByToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Cargando información...</p>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-8 max-w-md text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-4">Error</h1>
          <p className="text-red-300 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 max-w-2xl w-full">
        {/* Header de éxito */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">¡Test Completado!</h1>
          <p className="text-white/70 text-lg">
            Has completado exitosamente el Test MOSS de Habilidades Interpersonales
          </p>
        </div>

        {/* Información del test */}
        <div className="bg-white/5 rounded-lg p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Target className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Información del Test</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-white/70 text-sm">Candidato</div>
                  <div className="text-white font-medium">{test.candidate?.name}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Award className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-white/70 text-sm">Puesto</div>
                  <div className="text-white font-medium">{test.job?.title}</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-yellow-400" />
                <div>
                  <div className="text-white/70 text-sm">Tiempo empleado</div>
                  <div className="text-white font-medium">
                    {test.time_spent_minutes ? `${test.time_spent_minutes} minutos` : 'No disponible'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-white/70 text-sm">Completado el</div>
                  <div className="text-white font-medium">
                    {test.completed_at 
                      ? new Date(test.completed_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Ahora'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resumen de resultados (si están disponibles) */}
        {test.total_percentage && (
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Award className="w-5 h-5 text-purple-400" />
              <span>Resumen de Resultados</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">
                    {test.total_percentage}%
                  </div>
                  <div className="text-white/70 text-sm">Puntuación General</div>
                </div>
              </div>
              
              <div className="space-y-2">
                {test.hs_level && (
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-sm">Habilidades Sociales:</span>
                    <span className="text-white font-medium">{test.hs_level}</span>
                  </div>
                )}
                {test.cdrh_level && (
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-sm">Capacidad de Dirección:</span>
                    <span className="text-white font-medium">{test.cdrh_level}</span>
                  </div>
                )}
                {test.cepi_level && (
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-sm">Evaluación de Problemas:</span>
                    <span className="text-white font-medium">{test.cepi_level}</span>
                  </div>
                )}
                {test.heri_level && (
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-sm">Relaciones Interpersonales:</span>
                    <span className="text-white font-medium">{test.heri_level}</span>
                  </div>
                )}
                {test.sctri_level && (
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-sm">Sentido Común:</span>
                    <span className="text-white font-medium">{test.sctri_level}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mensaje de agradecimiento */}
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-300 mb-3">¡Gracias por tu participación!</h3>
          <div className="text-blue-200 space-y-2">
            <p>• Tus respuestas han sido registradas exitosamente</p>
            <p>• Los resultados han sido enviados al equipo de reclutamiento</p>
            <p>• Te contactaremos pronto con los siguientes pasos del proceso</p>
            <p>• Si tienes alguna pregunta, no dudes en contactar al reclutador</p>
          </div>
        </div>

        {/* Información de contacto */}
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <p className="text-white/70 text-sm mb-2">
            Si tienes alguna pregunta sobre el proceso de selección:
          </p>
          <p className="text-white/70 text-sm">
            Contacta al equipo de reclutamiento que te envió este test
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-white/50 text-xs">
            Test MOSS - Evaluación de Habilidades Interpersonales y Supervisión
          </p>
        </div>
      </div>
    </div>
  );
};

export default MossTestCompleted; 