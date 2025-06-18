import React, { useState } from 'react';
import { 
  Brain, 
  User, 
  Calendar, 
  Clock, 
  Download, 
  TrendingUp, 
  Target, 

  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  Star,
  Award
} from 'lucide-react';

interface DISCScores {
  D: { M: number; L: number; T: number };
  I: { M: number; L: number; T: number };
  S: { M: number; L: number; T: number };
  C: { M: number; L: number; T: number };
}

interface CleaverResult {
  id: string;
  candidate: {
    name: string;
    email: string;
  };
  job: {
    title: string;
    company?: string;
  };
  status: string;
  completed_at: string;
  time_spent_minutes?: number;
  scores: DISCScores;
  percentiles: {
    D: number;
    I: number; 
    S: number;
    C: number;
  };
  interpretation?: {
    dominant_profile: string;
    strengths: string[];
    development_areas: string[];
    recommendations: string[];
  };
}

interface CleaverResultsDashboardProps {
  result: CleaverResult;
  onClose: () => void;
}

const CleaverResultsDashboard: React.FC<CleaverResultsDashboardProps> = ({ result, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'interpretation'>('overview');

  // Configuración de colores para cada factor DISC
  const discColors = {
    // HiveHR bee-inspired palette
    /// Amber / honey tones for warm branding
    D: { primary: '#f59e0b', secondary: '#fbbf24', light: '#fef3c7' }, // Amber
    I: { primary: '#d97706', secondary: '#fdba74', light: '#ffedd5' }, // Dark amber / copper
    S: { primary: '#92400e', secondary: '#b45309', light: '#fef2e0' }, // Brownish amber
    C: { primary: '#78350f', secondary: '#a16207', light: '#fef2e0' }  // Dark brown/amber
  };

  const discDescriptions = {
    D: {
      name: 'Dominancia',
      subtitle: 'Orientación a resultados y toma de decisiones',
      traits: ['Directivo', 'Decidido', 'Competitivo', 'Orientado a resultados']
    },
    I: {
      name: 'Influencia',
      subtitle: 'Orientación social y comunicación',
      traits: ['Comunicativo', 'Entusiasta', 'Persuasivo', 'Sociable']
    },
    S: {
      name: 'Estabilidad',
      subtitle: 'Orientación a la cooperación y consistencia',
      traits: ['Paciente', 'Leal', 'Colaborativo', 'Estable']
    },
    C: {
      name: 'Cumplimiento',
      subtitle: 'Orientación a la precisión y calidad',
      traits: ['Analítico', 'Preciso', 'Sistemático', 'Cauteloso']
    }
  };

  const getPercentileLevel = (percentile: number) => {
    if (percentile >= 90) return { level: 'Muy Alto', color: 'text-red-500' };
    if (percentile >= 70) return { level: 'Alto', color: 'text-orange-500' };
    if (percentile >= 30) return { level: 'Medio', color: 'text-yellow-500' };
    if (percentile >= 10) return { level: 'Bajo', color: 'text-blue-500' };
    return { level: 'Muy Bajo', color: 'text-gray-500' };
  };

  const getDominantProfiles = () => {
    const sortedFactors = Object.entries(result.percentiles)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2);
    
    return sortedFactors.map(([factor, percentile]) => ({
      factor: factor as keyof typeof discColors,
      percentile,
      ...getPercentileLevel(percentile)
    }));
  };

  const exportResults = () => {
    const exportData = {
      candidate: result.candidate,
      job: result.job,
      testInfo: {
        completedAt: result.completed_at,
        timeSpent: result.time_spent_minutes,
        status: result.status
      },
      scores: result.scores,
      percentiles: result.percentiles,
      interpretation: result.interpretation,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.candidate.name.replace(' ', '_')}_cleaver_results.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const RadialChart = ({ factor, score, percentile }: { factor: string, score: number, percentile: number }) => {
    const colors = discColors[factor as keyof typeof discColors];
    const circumference = 2 * Math.PI * 40; // radius = 40
    const strokeDasharray = `${(percentile / 100) * circumference} ${circumference}`;
    
    return (
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke={colors.light}
            strokeWidth="8"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke={colors.primary}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-gray-800">{percentile}</span>
          <span className="text-xs text-gray-600">%ile</span>
        </div>
      </div>
    );
  };

  const BarChart = ({ factor, score }: { factor: string, score: number }) => {
    const colors = discColors[factor as keyof typeof discColors];
    const maxValue = 12; // Valor máximo típico en test Cleaver
    const percentage = Math.max(0, Math.min(100, ((score + maxValue) / (maxValue * 2)) * 100));
    
    return (
      <div className="h-32 flex flex-col justify-end">
        <div className="flex-1 flex items-end">
          <div 
            className="w-full rounded-t-lg transition-all duration-1000 ease-out"
            style={{ 
              height: `${percentage}%`,
              backgroundColor: colors.primary,
              minHeight: '8px'
            }}
          />
        </div>
        <div className="text-center mt-2">
          <div className="font-bold text-gray-800">{score}</div>
          <div className="text-xs text-gray-600">{factor}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Brain className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Resultados Test Cleaver DISC</h1>
                <p className="text-purple-100">{result.candidate.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={exportResults}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                title="Exportar resultados"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Resumen', icon: BarChart3 },
              { id: 'details', label: 'Detalles', icon: PieChart },
              { id: 'interpretation', label: 'Interpretación', icon: Target }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-6 h-6 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">{result.candidate.name}</div>
                      <div className="text-sm text-gray-600">{result.job.title}</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-6 h-6 text-green-600" />
                    <div>
                      <div className="font-medium text-gray-900">Completado</div>
                      <div className="text-sm text-gray-600">
                        {new Date(result.completed_at).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-6 h-6 text-purple-600" />
                    <div>
                      <div className="font-medium text-gray-900">Duración</div>
                      <div className="text-sm text-gray-600">
                        {result.time_spent_minutes || 0} minutos
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gráficos radiales - Percentiles */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <span>Percentiles DISC</span>
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {Object.entries(result.percentiles).map(([factor, percentile]) => (
                    <div key={factor} className="text-center">
                      <RadialChart factor={factor} score={result.scores[factor as keyof DISCScores].T} percentile={percentile} />
                      <div className="mt-3">
                        <div className="font-semibold text-gray-900">{discDescriptions[factor as keyof typeof discDescriptions].name}</div>
                        <div className={`text-sm font-medium ${getPercentileLevel(percentile).color}`}>
                          {getPercentileLevel(percentile).level}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Perfil dominante */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  <span>Perfil Dominante</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getDominantProfiles().map(({ factor, percentile, level, color }, index) => (
                    <div key={factor} className="flex items-center space-x-4">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: discColors[factor].primary }}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {index === 0 ? '1°' : '2°'} {discDescriptions[factor].name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {discDescriptions[factor].subtitle}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${color}`}>{level}</div>
                        <div className="text-sm text-gray-600">{percentile}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Gráfico de barras - Scores */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Puntuaciones Totales (T)</h3>
                <div className="grid grid-cols-4 gap-4 h-40">
                  {Object.entries(result.scores).map(([factor, scores]) => (
                    <BarChart key={factor} factor={factor} score={scores.T} />
                  ))}
                </div>
              </div>

              {/* Tabla detallada de scores */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Puntuaciones Detalladas</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Factor</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">Más (M)</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">Menos (L)</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">Total (T)</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">Percentil</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">Nivel</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(result.scores).map(([factor, scores]) => {
                        const percentile = result.percentiles[factor as keyof typeof result.percentiles];
                        const level = getPercentileLevel(percentile);
                        const colors = discColors[factor as keyof typeof discColors];
                        
                        return (
                          <tr key={factor} className="border-b border-gray-100">
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-3">
                                <div 
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: colors.primary }}
                                />
                                <div>
                                  <div className="font-medium">{discDescriptions[factor as keyof typeof discDescriptions].name}</div>
                                  <div className="text-sm text-gray-600">{factor}</div>
                                </div>
                              </div>
                            </td>
                            <td className="text-center py-3 px-4 font-mono">{scores.M}</td>
                            <td className="text-center py-3 px-4 font-mono">{scores.L}</td>
                            <td className="text-center py-3 px-4">
                              <span className={`font-bold px-2 py-1 rounded ${scores.T >= 0 ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                                {scores.T >= 0 ? '+' : ''}{scores.T}
                              </span>
                            </td>
                            <td className="text-center py-3 px-4 font-mono">{percentile}</td>
                            <td className="text-center py-3 px-4">
                              <span className={`font-medium ${level.color}`}>{level.level}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Interpretación de patrones */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Patrones de Comportamiento</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                      <ArrowUp className="w-4 h-4 text-green-600" />
                      <span>Factores Altos (Percentil ≥ 70)</span>
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(result.percentiles)
                        .filter(([, percentile]) => percentile >= 70)
                        .map(([factor, percentile]) => (
                          <div key={factor} className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: discColors[factor as keyof typeof discColors].primary }}
                            />
                            <span className="font-medium">{discDescriptions[factor as keyof typeof discDescriptions].name}</span>
                            <span className="text-sm text-gray-600">({percentile}%)</span>
                          </div>
                        ))}
                      {Object.entries(result.percentiles).filter(([, percentile]) => percentile >= 70).length === 0 && (
                        <p className="text-gray-500 text-sm">No hay factores en nivel alto</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                      <ArrowDown className="w-4 h-4 text-blue-600" />
                      <span>Factores Bajos (Percentil ≤ 30)</span>
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(result.percentiles)
                        .filter(([, percentile]) => percentile <= 30)
                        .map(([factor, percentile]) => (
                          <div key={factor} className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: discColors[factor as keyof typeof discColors].primary }}
                            />
                            <span className="font-medium">{discDescriptions[factor as keyof typeof discDescriptions].name}</span>
                            <span className="text-sm text-gray-600">({percentile}%)</span>
                          </div>
                        ))}
                      {Object.entries(result.percentiles).filter(([, percentile]) => percentile <= 30).length === 0 && (
                        <p className="text-gray-500 text-sm">No hay factores en nivel bajo</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'interpretation' && (
            <div className="space-y-6">
              {result.interpretation ? (
                <>
                  {/* Perfil dominante */}
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <Award className="w-5 h-5 text-purple-600" />
                      <span>Perfil Dominante</span>
                    </h3>
                    <p className="text-gray-700 text-lg">{result.interpretation.dominant_profile}</p>
                  </div>

                  {/* Fortalezas */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <Star className="w-5 h-5 text-green-600" />
                      <span>Fortalezas</span>
                    </h3>
                    <ul className="space-y-2">
                      {result.interpretation.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-green-600 mt-1">✓</span>
                          <span className="text-gray-700">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Áreas de desarrollo */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-yellow-600" />
                      <span>Áreas de Desarrollo</span>
                    </h3>
                    <ul className="space-y-2">
                      {result.interpretation.development_areas.map((area, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-yellow-600 mt-1">→</span>
                          <span className="text-gray-700">{area}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recomendaciones */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      <span>Recomendaciones</span>
                    </h3>
                    <ul className="space-y-2">
                      {result.interpretation.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-blue-600 mt-1">💡</span>
                          <span className="text-gray-700">{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Interpretación en Proceso</h3>
                  <p className="text-gray-600">
                    La interpretación detallada de los resultados será generada automáticamente.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CleaverResultsDashboard; 