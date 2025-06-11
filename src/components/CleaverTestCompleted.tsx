import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Brain, Clock, Award } from 'lucide-react';

const CleaverTestCompleted = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 max-w-lg w-full text-center">
        {/* Success Icon */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">¡Test Completado!</h1>
          <p className="text-green-300 text-lg">Gracias por completar la evaluación Cleaver</p>
        </div>

        {/* Completion Details */}
        <div className="bg-white/5 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-center space-x-8 mb-4">
            <div className="text-center">
              <Brain className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <div className="text-sm text-white/70">Grupos</div>
              <div className="text-lg font-bold text-white">24/24</div>
            </div>
            
            <div className="text-center">
              <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <div className="text-sm text-white/70">Tiempo</div>
              <div className="text-lg font-bold text-white">Completado</div>
            </div>

            <div className="text-center">
              <Award className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-sm text-white/70">Estado</div>
              <div className="text-lg font-bold text-white">Procesado</div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-6 mb-6">
          <h3 className="text-blue-300 font-medium mb-3 flex items-center justify-center space-x-2">
            <span>📋</span>
            <span>Próximos Pasos</span>
          </h3>
          <ul className="text-blue-200 text-sm space-y-2 text-left">
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>Tus respuestas han sido procesadas automáticamente</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>Los resultados han sido enviados al equipo de reclutamiento</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>Recibirás noticias sobre el proceso en los próximos días</span>
            </li>
          </ul>
        </div>

        {/* What Happens Next */}
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-6 mb-6">
          <h3 className="text-green-300 font-medium mb-3">✨ Análisis DISC Completado</h3>
          <p className="text-green-200 text-sm">
            Tu perfil de personalidad laboral ha sido analizado según la metodología DISC, 
            que evalúa tus tendencias de comportamiento en el entorno profesional.
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={() => window.close()}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-lg transition-all"
        >
          🎉 Cerrar Ventana
        </button>

        {/* Footer */}
        <div className="mt-6">
          <p className="text-white/50 text-xs">
            Test Cleaver DISC - Evaluación completada exitosamente
          </p>
        </div>
      </div>
    </div>
  );
};

export default CleaverTestCompleted; 