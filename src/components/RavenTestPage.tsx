import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useRaven } from '../contexts/RavenContext';

interface RavenTestRow {
  id: string;
  candidate_id: string;
  status: 'not-started' | 'in-progress' | 'completed';
  test_token: string;
  expires_at?: string;
}

const RavenTestPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { loadTestByToken } = useRaven();
  const [row, setRow] = useState<RavenTestRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRow = async () => {
      if (!token) return;
      const { data, error: rowErr } = await supabase
        .from('raven_tests')
        .select('*')
        .eq('test_token', token)
        .single();
      if (rowErr || !data) {
        setError('Enlace inválido o expirado');
        setLoading(false);
        return;
      }
      setRow(data);
      setLoading(false);

      // Si completed, redirigir inmediato
      if (data.status === 'completed') {
        navigate(`/raven-test/${token}/completed`, { replace: true });
      }
    };
    fetchRow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <Loader2 className="animate-spin w-8 h-8 mr-2" /> Cargando...
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-red-400">
        {error}
      </div>
    );
  }
  if (!row) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 space-y-6">
      {row.status === 'not-started' && (
        <>
          <h1 className="text-2xl font-bold text-center max-w-md">Bienvenido a la prueba Raven</h1>
          <p className="max-w-md text-center opacity-80">Responderás 60 problemas visuales y tendrás 45 minutos. Selecciona la opción correcta que complete cada patrón. Procura estar en un lugar sin distracciones.</p>
          <button
            onClick={() => navigate(`/raven-test/${token}/start`)}
            className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700"
          >
            Comenzar prueba
          </button>
        </>
      )}
      {row.status === 'in-progress' && (
        <>
          <h1 className="text-2xl font-bold text-center max-w-md">Prueba Raven en progreso</h1>
          <p className="max-w-md text-center opacity-80">Tienes respuestas guardadas. Haz clic en continuar para reanudar donde te quedaste.</p>
          <button
            onClick={async () => {
              await loadTestByToken(token!);
              navigate(`/raven-test/${token}/start`);
            }}
            className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700"
          >
            Continuar prueba
          </button>
        </>
      )}
    </div>
  );
};

export default RavenTestPage;
