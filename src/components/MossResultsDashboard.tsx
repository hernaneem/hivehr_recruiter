import React, { useState } from 'react';
import { 
  Target, 
  User, 
  Calendar, 
  Clock, 
  Download, 
  TrendingUp, 
  Eye,
  BarChart3,
  PieChart,
  Star,
  Award,
  Users,
  Brain,
  Heart,
  Shield,
  CheckCircle
} from 'lucide-react';

interface MossScores {
  HS: { score: number; percentage: number; level: string };    // Habilidades Sociales
  CDRH: { score: number; percentage: number; level: string };  // Capacidad de Dirección y Relaciones Humanas
  CEPI: { score: number; percentage: number; level: string };  // Capacidad de Evaluación de Problemas Interpersonales
  HERI: { score: number; percentage: number; level: string };  // Habilidad para Establecer Relaciones Interpersonales
  SCTRI: { score: number; percentage: number; level: string }; // Sentido Común y Tacto en las Relaciones Interpersonales
}

interface MossResult {
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
  scores: MossScores;
  total_percentage: number;
  recommendation: string;
}

interface MossResultsDashboardProps {
  result: MossResult;
  onClose: () => void;
}

const MossResultsDashboard: React.FC<MossResultsDashboardProps> = ({ result, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'interpretation'>('overview');

  // Configuración de colores para cada área MOSS
  const mossColors = {
    HS: { primary: '#10b981', secondary: '#6ee7b7', light: '#d1fae5', icon: Users },    // Verde - Habilidades Sociales
    CDRH: { primary: '#3b82f6', secondary: '#93c5fd', light: '#dbeafe', icon: Brain },  // Azul - Capacidad de Dirección
    CEPI: { primary: '#f59e0b', secondary: '#fbbf24', light: '#fef3c7', icon: Eye },    // Amarillo - Evaluación de Problemas
    HERI: { primary: '#ef4444', secondary: '#fca5a5', light: '#fee2e2', icon: Heart }, // Rojo - Relaciones Interpersonales
    SCTRI: { primary: '#8b5cf6', secondary: '#c4b5fd', light: '#ede9fe', icon: Shield } // Morado - Sentido Común
  };

  const mossDescriptions = {
    HS: {
      name: 'Habilidades Sociales',
      subtitle: 'Capacidad para interactuar efectivamente en grupos',
      traits: ['Sociable', 'Comunicativo', 'Empático', 'Colaborativo']
    },
    CDRH: {
      name: 'Capacidad de Dirección y RR.HH.',
      subtitle: 'Habilidad para liderar y gestionar personas',
      traits: ['Liderazgo', 'Toma de decisiones', 'Gestión de equipos', 'Autoridad']
    },
    CEPI: {
      name: 'Evaluación de Problemas Interpersonales',
      subtitle: 'Capacidad para analizar y resolver conflictos',
      traits: ['Análisis', 'Resolución de conflictos', 'Mediación', 'Objetividad']
    },
    HERI: {
      name: 'Habilidad para Establecer Relaciones',
      subtitle: 'Facilidad para crear y mantener vínculos profesionales',
      traits: ['Networking', 'Confianza', 'Carisma', 'Diplomacia']
    },
    SCTRI: {
      name: 'Sentido Común y Tacto',
      subtitle: 'Prudencia y delicadeza en relaciones interpersonales',
      traits: ['Prudencia', 'Tacto', 'Discreción', 'Sensibilidad']
    }
  };

  const getScoreLevel = (percentage: number) => {
    if (percentage >= 83) return { level: 'Excelente', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (percentage >= 64) return { level: 'Bueno', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (percentage >= 42) return { level: 'Aceptable', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { level: 'Bajo', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const getRecommendationColor = (recommendation: string) => {
    if (recommendation.includes('Altamente')) return 'text-green-600 bg-green-100';
    if (recommendation.includes('Recomendado')) return 'text-blue-600 bg-blue-100';
    if (recommendation.includes('Aceptable')) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
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
      totalPercentage: result.total_percentage,
      recommendation: result.recommendation,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.candidate.name.replace(' ', '_')}_moss_results.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const RadialChart = ({ area, score, percentage }: { area: string, score: number, percentage: number }) => {
    const colors = mossColors[area as keyof typeof mossColors];
    const circumference = 2 * Math.PI * 40; // radius = 40
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
    
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
          <span className="text-lg font-bold text-gray-800">{percentage}</span>
          <span className="text-xs text-gray-600">%</span>
        </div>
      </div>
    );
  };

  const BarChart = ({ area, score, percentage }: { area: string, score: number, percentage: number }) => {
    const colors = mossColors[area as keyof typeof mossColors];
    
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
          <div className="text-xs text-gray-600">{area}</div>
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
                <Target className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Resultados Test MOSS</h1>
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

              {/* Puntuación general */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Award className="w-5 h-5 text-green-600" />
                  <span>Puntuación General</span>
                </h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-gray-900">{result.total_percentage}%</div>
                    <div className="text-gray-600">Puntuación Total</div>
                  </div>
                  <div className={`px-4 py-2 rounded-full font-medium ${getRecommendationColor(result.recommendation)}`}>
                    {result.recommendation}
                  </div>
                </div>
              </div>

              {/* Gráficos radiales - Áreas MOSS */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <span>Resultados por Área</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  {Object.entries(result.scores).map(([area, data]) => {
                    const IconComponent = mossColors[area as keyof typeof mossColors].icon;
                    const scoreInfo = getScoreLevel(data.percentage);
                    
                    return (
                      <div key={area} className="text-center">
                        <RadialChart area={area} score={data.score} percentage={data.percentage} />
                        <div className="mt-3">
                          <div className="flex items-center justify-center space-x-1 mb-1">
                            <IconComponent className="w-4 h-4" style={{ color: mossColors[area as keyof typeof mossColors].primary }} />
                            <div className="font-semibold text-gray-900 text-sm">{mossDescriptions[area as keyof typeof mossDescriptions].name}</div>
                          </div>
                          <div className={`text-xs font-medium px-2 py-1 rounded ${scoreInfo.bgColor} ${scoreInfo.color}`}>
                            {data.level}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Gráfico de barras */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Puntuaciones por Área</h3>
                <div className="grid grid-cols-5 gap-4 h-40">
                  {Object.entries(result.scores).map(([area, data]) => (
                    <BarChart key={area} area={area} score={data.score} percentage={data.percentage} />
                  ))}
                </div>
              </div>

              {/* Tabla detallada */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resultados Detallados</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Área</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">Puntuación</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">Porcentaje</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">Nivel</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Descripción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(result.scores).map(([area, data]) => {
                        const description = mossDescriptions[area as keyof typeof mossDescriptions];
                        const colors = mossColors[area as keyof typeof mossColors];
                        const scoreInfo = getScoreLevel(data.percentage);
                        const IconComponent = colors.icon;
                        
                        return (
                          <tr key={area} className="border-b border-gray-100">
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-3">
                                <IconComponent className="w-5 h-5" style={{ color: colors.primary }} />
                                <div>
                                  <div className="font-medium">{description.name}</div>
                                  <div className="text-sm text-gray-600">{area}</div>
                                </div>
                              </div>
                            </td>
                            <td className="text-center py-3 px-4 font-mono text-lg">{data.score}</td>
                            <td className="text-center py-3 px-4">
                              <span className="font-bold text-lg">{data.percentage}%</span>
                            </td>
                            <td className="text-center py-3 px-4">
                              <span className={`px-2 py-1 rounded font-medium ${scoreInfo.bgColor} ${scoreInfo.color}`}>
                                {data.level}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm text-gray-600">{description.subtitle}</div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'interpretation' && (
            <div className="space-y-6">
              {/* Interpretación general */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  <span>Evaluación General MOSS</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Puntuación Total</h4>
                    <div className="text-3xl font-bold text-gray-900 mb-2">{result.total_percentage}%</div>
                    <div className={`inline-block px-3 py-1 rounded-full font-medium ${getRecommendationColor(result.recommendation)}`}>
                      {result.recommendation}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Perfil Interpersonal</h4>
                    <p className="text-gray-700">
                      {result.total_percentage >= 83 
                        ? 'Excelentes habilidades interpersonales y de supervisión. Candidato altamente recomendado para roles de liderazgo.'
                        : result.total_percentage >= 64
                        ? 'Buenas habilidades interpersonales. Recomendado para roles que requieren interacción social y trabajo en equipo.'
                        : result.total_percentage >= 42
                        ? 'Habilidades interpersonales aceptables. Puede desarrollarse con entrenamiento adecuado.'
                        : 'Habilidades interpersonales por debajo del promedio. Requiere desarrollo significativo.'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Fortalezas y áreas de desarrollo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Star className="w-5 h-5 text-green-600" />
                    <span>Fortalezas</span>
                  </h3>
                  <ul className="space-y-2">
                    {Object.entries(result.scores)
                      .filter(([, data]) => data.percentage >= 70)
                      .map(([area, data]) => {
                        const description = mossDescriptions[area as keyof typeof mossDescriptions];
                        return (
                          <li key={area} className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-1" />
                            <div>
                              <span className="font-medium">{description.name}</span>
                              <span className="text-sm text-gray-600 ml-2">({data.percentage}%)</span>
                            </div>
                          </li>
                        );
                      })}
                    {Object.entries(result.scores).filter(([, data]) => data.percentage >= 70).length === 0 && (
                      <p className="text-gray-500 text-sm">Todas las áreas tienen oportunidades de mejora</p>
                    )}
                  </ul>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-yellow-600" />
                    <span>Áreas de Desarrollo</span>
                  </h3>
                  <ul className="space-y-2">
                    {Object.entries(result.scores)
                      .filter(([, data]) => data.percentage < 70)
                      .sort(([, a], [, b]) => a.percentage - b.percentage)
                      .map(([area, data]) => {
                        const description = mossDescriptions[area as keyof typeof mossDescriptions];
                        return (
                          <li key={area} className="flex items-start space-x-2">
                            <span className="text-yellow-600 mt-1">→</span>
                            <div>
                              <span className="font-medium">{description.name}</span>
                              <span className="text-sm text-gray-600 ml-2">({data.percentage}%)</span>
                              <div className="text-xs text-gray-500 mt-1">{description.subtitle}</div>
                            </div>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              </div>

              {/* Recomendaciones específicas */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span>Recomendaciones de Desarrollo</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(result.scores)
                    .filter(([, data]) => data.percentage < 70)
                    .map(([area, data]) => {
                      const description = mossDescriptions[area as keyof typeof mossDescriptions];
                      const recommendations = {
                        HS: 'Participar en actividades grupales, talleres de comunicación y eventos de networking.',
                        CDRH: 'Tomar cursos de liderazgo, gestión de equipos y toma de decisiones.',
                        CEPI: 'Desarrollar habilidades de análisis, mediación y resolución de conflictos.',
                        HERI: 'Practicar técnicas de rapport, networking profesional y construcción de relaciones.',
                        SCTRI: 'Entrenar en inteligencia emocional, comunicación asertiva y sensibilidad interpersonal.'
                      };
                      
                      return (
                        <div key={area} className="bg-white rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">{description.name}</h4>
                          <p className="text-sm text-gray-600">{recommendations[area as keyof typeof recommendations]}</p>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MossResultsDashboard; 