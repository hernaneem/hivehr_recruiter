import React from 'react';
import { X, Award, TrendingUp } from 'lucide-react';

interface RavenScoreResult {
  candidateName: string;
  completedAt: string;
  rawScore: number;
  percentile?: number | null;
  diagnosticRank?: string | null;
}

interface RavenResultsDashboardProps {
  result: RavenScoreResult;
  onClose: () => void;
}

const RavenResultsDashboard: React.FC<RavenResultsDashboardProps> = ({ result, onClose }) => {
  const scorePercent = (result.rawScore / 60) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-xl bg-gradient-to-br from-gray-900 via-yellow-900 to-gray-900 rounded-xl border border-white/20 shadow-xl relative overflow-hidden">
        {/* Close */}
        <button
          className="absolute top-4 right-4 text-white/60 hover:text-white transition"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Resultados Prueba Raven</h2>
            <p className="text-white/70 text-sm">
              {result.candidateName} — {new Date(result.completedAt).toLocaleDateString()}
            </p>
          </div>

          {/* Raw score */}
          <div className="bg-white/10 border border-white/20 rounded-lg p-6 text-center">
            <h3 className="text-white/80 mb-4 flex items-center justify-center space-x-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <span className="font-medium">Puntuación Total</span>
            </h3>
            <div className="text-6xl font-extrabold text-amber-400 mb-2">
              {result.rawScore}
            </div>
            <p className="text-white/60">De 60 ítems ( {scorePercent.toFixed(0)}% )</p>
          </div>

          {/* Diagnostic Rank */}
          {result.diagnosticRank && (
            <div className="bg-white/10 border border-white/20 rounded-lg p-6 text-center">
              <h3 className="text-white/80 mb-3 flex items-center justify-center space-x-2">
                <Award className="w-5 h-5 text-amber-300" />
                <span className="font-medium">Diagnóstico</span>
              </h3>
              <p className="text-3xl font-semibold text-amber-300">{result.diagnosticRank}</p>
            </div>
          )}

          {/* Percentile */}
          {typeof result.percentile === 'number' && (
            <div className="bg-white/10 border border-white/20 rounded-lg p-6 text-center">
              <h3 className="text-white/80 mb-3 flex items-center justify-center space-x-2">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                <span className="font-medium">Percentil</span>
              </h3>
              <p className="text-3xl font-semibold text-amber-400">{result.percentile}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RavenResultsDashboard;
