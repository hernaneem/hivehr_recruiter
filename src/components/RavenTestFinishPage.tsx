import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useRaven } from '../contexts/RavenContext';

/**
 * Página mostrada después de responder la última pregunta.
 * Permite al candidato enviar definitivamente sus respuestas.
 */
const RavenTestFinishPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { finishTest } = useRaven();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await finishTest();
      navigate(`/raven-test/${token}/completed`, { replace: true });
    } catch (e: any) {
      setError(e.message ?? 'Error enviando respuestas');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="bg-white/5 border border-white/10 rounded-xl p-8 max-w-md text-center text-white space-y-6">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
        <h1 className="text-2xl font-bold">¡Felicidades! Has concluido tu prueba</h1>
        <p>Haz clic en el botón para enviar tus respuestas.</p>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
        >
          {submitting ? 'Enviando...' : 'Enviar respuestas'}
        </button>
      </div>
    </div>
  );
};

export default RavenTestFinishPage;
