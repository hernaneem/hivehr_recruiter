import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, Brain, Award, BarChart3, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface TermanTest {
  id: number;
  candidate_id: string;
  job_id: string;
  test_token: string;
  status: 'pending' | 'in-progress' | 'completed';
  completed_at: string;
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

const TermanTestCompleted = () => {
  const { token } = useParams<{ token: string }>();
  const [test, setTest] = useState<TermanTest | null>(null);
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
          setError('El test no existe o es inválido');
        } else if (testData.status !== 'completed') {
          setError('Este test aún no ha sido completado');
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
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Cargando...</p>
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
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            ¡Test Completado Exitosamente! 🎉
          </h1>
          <p className="text-xl text-white/80 mb-2">
            Gracias por completar el Test Terman-Merrill
          </p>
          <p className="text-white/60">
            Tu evaluación de inteligencia ha sido procesada correctamente
          </p>
        </div>

        {/* Información del test */}
        <div className="bg-white/5 rounded-lg p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Brain className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Información del Test</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <span className="text-white/70 text-sm">Candidato:</span>
                <p className="text-white font-medium">{test.candidate?.name}</p>
              </div>
              <div>
                <span className="text-white/70 text-sm">Email:</span>
                <p className="text-white font-medium">{test.candidate?.email}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-white/70 text-sm">Puesto:</span>
                <p className="text-white font-medium">{test.job?.title}</p>
              </div>
              <div>
                <span className="text-white/70 text-sm">Empresa:</span>
                <p className="text-white font-medium">{test.job?.company || 'No especificada'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas del test */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 text-center">
            <BarChart3 className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-blue-300 font-medium">Tipo de Test</div>
            <div className="text-white text-sm">Terman-Merrill</div>
          </div>
          
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
            <Award className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-green-300 font-medium">Estado</div>
            <div className="text-white text-sm">Completado</div>
          </div>
          
          <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4 text-center">
            <Clock className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-purple-300 font-medium">Completado</div>
            <div className="text-white text-sm">
              {new Date(test.completed_at).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>

        {/* Qué sigue */}
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-6 mb-6">
          <h3 className="text-white font-semibold mb-3">🚀 ¿Qué sigue ahora?</h3>
          <div className="space-y-3 text-white/80">
            <div className="flex items-start space-x-3">
              <span className="text-purple-400 mt-1">✓</span>
              <span>Tus resultados han sido enviados automáticamente al equipo de reclutamiento</span>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-purple-400 mt-1">✓</span>
              <span>El reclutador analizará tu perfil cognitivo y aptitudes</span>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-purple-400 mt-1">✓</span>
              <span>Te contactarán pronto con los siguientes pasos del proceso</span>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-purple-400 mt-1">✓</span>
              <span>No necesitas realizar ninguna acción adicional</span>
            </div>
          </div>
        </div>

        {/* Mensaje de agradecimiento */}
        <div className="text-center">
          <div className="bg-white/5 rounded-lg p-6">
            <h3 className="text-white font-semibold mb-3">¡Gracias por tu tiempo!</h3>
            <p className="text-white/70 text-sm">
              El Test Terman-Merrill es una herramienta importante para evaluar las capacidades cognitivas 
              y nos ayuda a encontrar la mejor oportunidad laboral para tu perfil.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-white/50 text-xs">
            Si tienes alguna pregunta sobre el proceso, no dudes en contactar con el equipo de reclutamiento.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermanTestCompleted; 