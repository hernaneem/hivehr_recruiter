import React from 'react';
import { CheckCircle } from 'lucide-react';

const RavenTestCompleted: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 space-y-6">
    <CheckCircle className="w-16 h-16 text-green-400" />
    <h1 className="text-2xl font-bold text-center">¡Gracias por realizar la prueba!</h1>
    <p className="opacity-80 text-center max-w-md">Tus respuestas han sido enviadas correctamente. Puedes cerrar esta ventana.</p>
  </div>
);

export default RavenTestCompleted;
