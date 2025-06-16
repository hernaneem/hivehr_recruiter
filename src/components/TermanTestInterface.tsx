import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { TermanMerrillProvider } from '../contexts/TermanMerrillContext';
import TermanMerrillTest from './TermanMerrillTest';

interface TermanTest {
  id: number;
  candidate_id: string;
  job_id: string;
  test_token: string;
  status: 'pending' | 'in-progress' | 'completed';
  expires_at: string;
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

const TermanTestInterfaceInner: React.FC<{ test: TermanTest }> = ({ test }) => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();

  const handleTestComplete = async (result: any) => {
    try {
      // Actualizar el estado del test a completado
      const { error: updateError } = await supabase
        .from('terman_tests')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', test.id);

      if (updateError) {
        console.error('Error updating test status:', updateError);
      }

      // Navegar a la página de completado
      navigate(`/terman-test/${token}/completed`);
    } catch (error) {
      console.error('Error completing test:', error);
    }
  };

  const handleCancel = () => {
    // Navegar de vuelta a la página principal del test
    navigate(`/terman-test/${token}`);
  };

  return (
    <TermanMerrillTest
      candidateId={test.candidate_id}
      onComplete={handleTestComplete}
      onCancel={handleCancel}
    />
  );
};

const TermanTestInterface = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
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
          setError('El test no existe, ha expirado o ya fue completado');
        } else {
          // Verificar si el test ha expirado
          if (new Date(testData.expires_at) < new Date()) {
            setError('Este test ha expirado');
          } else if (testData.status === 'completed') {
            // Si ya está completado, redirigir a la página de completado
            navigate(`/terman-test/${token}/completed`);
            return;
          } else if (testData.status === 'pending') {
            // Si aún está pendiente, redirigir a la página principal
            navigate(`/terman-test/${token}`);
            return;
          } else {
            setTest(testData);
          }
        }
      } catch (err) {
        setError('Error cargando el test');
      } finally {
        setLoading(false);
      }
    };

    loadTest();
  }, [token, navigate]);

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
          <h1 className="text-2xl font-bold text-white mb-4">Error</h1>
          <p className="text-red-300 mb-6">{error}</p>
          <button
            onClick={() => navigate(`/terman-test/${token}`)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-lg transition-all"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <TermanMerrillProvider>
      <TermanTestInterfaceInner test={test} />
    </TermanMerrillProvider>
  );
};

export default TermanTestInterface; 