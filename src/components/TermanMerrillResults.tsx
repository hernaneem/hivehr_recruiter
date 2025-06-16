import React from 'react';
import {
  Brain,
  Award,
  TrendingUp,
  TrendingDown,
  FileText,
  Download,
  ChevronRight,
  Target,
  BarChart3
} from 'lucide-react';

interface SerieScore {
  serie: string;
  correct: number;
  incorrect: number;
  total: number;
  rawScore: number;
  percentageEfficiency: number;
  range: string;
}

interface TermanResult {
  id?: number;
  candidateId: number;
  totalScore: number;
  mentalAge: number;
  iq: number;
  iqClassification: string;
  seriesScores: SerieScore[];
  completedAt: Date;
  interpretation: {
    strengths: string[];
    weaknesses: string[];
    generalAssessment: string;
  };
}

interface TermanMerrillResultsProps {
  result: TermanResult;
  candidateName?: string;
  onClose?: () => void;
  onDownloadReport?: () => void;
}

const TermanMerrillResults: React.FC<TermanMerrillResultsProps> = ({
  result,
  candidateName = 'Candidato',
  onClose,
  onDownloadReport
}) => {
  // Obtener color según rango
  const getRangeColor = (range: string): string => {
    switch (range) {
      case 'MUY ALTO':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'ALTO':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'PROMEDIO ALTO':
        return 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30';
      case 'PROMEDIO':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'PROMEDIO BAJO':
        return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'BAJO':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'MUY BAJO':
        return 'text-red-600 bg-red-600/20 border-red-600/30';
      default:
        return 'text-white/60 bg-white/10 border-white/20';
    }
  };

  // Obtener color según clasificación CI
  const getIQColor = (classification: string): string => {
    if (classification.includes('SUPERIOR')) return 'text-green-400';
    if (classification.includes('PROMEDIO')) return 'text-yellow-400';
    if (classification.includes('INFERIOR')) return 'text-orange-400';
    if (classification.includes('DEFICIENCIA')) return 'text-red-400';
    return 'text-white';
  };

  // Nombres de las series
  const seriesNames: { [key: string]: string } = {
    I: 'Información',
    II: 'Juicio',
    III: 'Vocabulario',
    IV: 'Síntesis',
    V: 'Concentración',
    VI: 'Análisis',
    VII: 'Abstracción',
    VIII: 'Planeación',
    IX: 'Organización',
    X: 'Atención'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Resultados Test Terman-Merrill
              </h1>
              <p className="text-white/70">
                {candidateName} - {new Date(result.completedAt).toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex space-x-3">
              {onDownloadReport && (
                <button
                  onClick={onDownloadReport}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                >
                  <Download className="h-5 w-5" />
                  <span>Descargar Reporte</span>
                </button>
              )}
              
              {onClose && (
                <button
                  onClick={onClose}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all"
                >
                  <span>Cerrar</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Resumen Principal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* CI */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className={`text-4xl font-bold ${getIQColor(result.iqClassification)}`}>
                {result.iq}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Coeficiente Intelectual</h3>
            <p className={`text-sm ${getIQColor(result.iqClassification)}`}>
              {result.iqClassification}
            </p>
          </div>

          {/* Edad Mental */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <span className="text-4xl font-bold text-white">
                {Math.floor(result.mentalAge / 12)}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Edad Mental</h3>
            <p className="text-sm text-white/70">
              {Math.floor(result.mentalAge / 12)} años {result.mentalAge % 12} meses
            </p>
          </div>

          {/* Puntuación Total */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-lg">
                <Award className="h-6 w-6 text-white" />
              </div>
              <span className="text-4xl font-bold text-white">
                {result.totalScore}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Puntuación Total</h3>
            <p className="text-sm text-white/70">Puntos obtenidos</p>
          </div>
        </div>

        {/* Resultados por Serie */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-6">
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center space-x-3">
            <BarChart3 className="h-6 w-6" />
            <span>Desempeño por Serie</span>
          </h2>
          
          <div className="space-y-4">
            {result.seriesScores.map((score) => (
              <div key={score.serie} className="bg-white/5 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-lg font-medium text-white">
                    Serie {score.serie}: {seriesNames[score.serie]}
                  </h4>
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${getRangeColor(score.range)}`}>
                    {score.range}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-white/60">Correctas:</span>
                    <span className="text-white ml-2 font-medium">{score.correct}/{score.total}</span>
                  </div>
                  <div>
                    <span className="text-white/60">Puntuación:</span>
                    <span className="text-white ml-2 font-medium">{score.rawScore}</span>
                  </div>
                  <div>
                    <span className="text-white/60">Eficiencia:</span>
                    <span className="text-white ml-2 font-medium">{score.percentageEfficiency.toFixed(0)}%</span>
                  </div>
                </div>
                
                {/* Barra de progreso */}
                <div className="mt-3 w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${score.percentageEfficiency}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interpretación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fortalezas */}
          {result.interpretation.strengths.length > 0 && (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <TrendingUp className="h-6 w-6 text-green-400" />
                <span>Fortalezas</span>
              </h3>
              <ul className="space-y-3">
                {result.interpretation.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-white/80">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Áreas de Mejora */}
          {result.interpretation.weaknesses.length > 0 && (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <TrendingDown className="h-6 w-6 text-yellow-400" />
                <span>Áreas de Mejora</span>
              </h3>
              <ul className="space-y-3">
                {result.interpretation.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-white/80">{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Evaluación General */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mt-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
            <FileText className="h-6 w-6" />
            <span>Evaluación General</span>
          </h3>
          <p className="text-white/80 leading-relaxed">
            {result.interpretation.generalAssessment}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermanMerrillResults; 