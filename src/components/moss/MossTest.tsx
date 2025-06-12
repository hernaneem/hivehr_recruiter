import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Users,
  Target,
  Award,
  BarChart3,
  Clock
} from 'lucide-react';
import { 
  MOSS_QUESTIONS, 
  MOSS_AREAS, 
  MOSS_ANSWER_KEY, 
  MOSS_LEVELS
} from './mossTestData';
import type { MossResult } from './mossTestData';

interface MossTestProps {
  candidateId: string;
  candidateName: string;
  onComplete: (results: MossResult[], answers: Record<number, string>, startTime: Date, endTime: Date) => void;
  onCancel: () => void;
}

export const MossTest: React.FC<MossTestProps> = ({ 
  candidateId, 
  candidateName, 
  onComplete, 
  onCancel 
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showInstructions, setShowInstructions] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<MossResult[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);

  // Calcular progreso
  const progress = (Object.keys(answers).length / MOSS_QUESTIONS.length) * 100;

  // Manejar selección de respuesta
  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  // Navegar entre preguntas
  const goToNext = () => {
    if (currentQuestion < MOSS_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Calcular resultados
  const calculateResults = () => {
    const areaResults: MossResult[] = [];

    MOSS_AREAS.forEach(area => {
      let correctAnswers = 0;
      
      area.questionIds.forEach(questionId => {
        if (answers[questionId] === MOSS_ANSWER_KEY[questionId]) {
          correctAnswers++;
        }
      });

      const score = correctAnswers;
      const maxScore = area.questionIds.length;
      const percentage = Math.round((score / maxScore) * 100);
      
      // Determinar nivel
      const level = MOSS_LEVELS.find(l => percentage >= l.min && percentage <= l.max)?.level || 'No determinado';

      areaResults.push({
        area: area.name,
        score: score,
        percentage: percentage,
        level: level
      });
    });

    setResults(areaResults);
    setEndTime(new Date());
    return areaResults;
  };

  // Finalizar test
  const finishTest = () => {
    const testResults = calculateResults();
    const endTestTime = new Date();
    setShowResults(true);
    
    // Llamar al callback con todos los datos necesarios
    if (startTime) {
      onComplete(testResults, answers, startTime, endTestTime);
    }
  };

  // Iniciar test
  const startTest = () => {
    setShowInstructions(false);
    setStartTime(new Date());
  };

  // Calcular tiempo transcurrido
  const getElapsedTime = () => {
    if (!startTime || !endTime) return '0:00';
    const diff = endTime.getTime() - startTime.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (showInstructions) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-8">
          <div className="flex items-center space-x-4 mb-6">
            <Brain className="h-12 w-12 text-purple-400" />
            <div>
              <h2 className="text-3xl font-bold text-white">Test MOSS</h2>
              <p className="text-white/60">Test de Habilidades Interpersonales y Supervisión</p>
            </div>
          </div>

          <div className="space-y-6 text-white/80">
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Instrucciones</h3>
              <p className="mb-4">
                Para cada uno de los problemas siguientes, se sugieren cuatro respuestas. 
                Seleccione la opción que usted considere más acertada. No marque más de una.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Áreas Evaluadas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOSS_AREAS.map((area, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-start space-x-3">
                      <Target className="h-5 w-5 text-purple-400 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-white">{area.name}</h4>
                        <p className="text-sm text-white/60 mt-1">{area.description}</p>
                        <p className="text-xs text-purple-400 mt-2">
                          {area.questionIds.length} preguntas
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-4">
              <p className="text-amber-200 text-sm">
                <strong>Importante:</strong> Responda según lo que usted haría en cada situación.
                El test tiene una duración aproximada de 15-20 minutos.
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center mt-8">
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={startTest}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors flex items-center space-x-2"
            >
              <span>Comenzar Test</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Award className="h-12 w-12 text-purple-400" />
              <div>
                <h2 className="text-3xl font-bold text-white">Resultados del Test MOSS</h2>
                <p className="text-white/60">{candidateName}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-sm">Tiempo empleado</p>
              <p className="text-white font-semibold flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>{getElapsedTime()}</span>
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Resumen general */}
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">Resumen General</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {results.map((result, index) => (
                  <div key={index} className="text-center">
                    <p className="text-white/60 text-sm">{MOSS_AREAS[index].code}</p>
                    <p className="text-2xl font-bold text-white">{result.percentage}%</p>
                    <p className="text-xs text-purple-400">{result.level}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Resultados detallados */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Análisis Detallado</h3>
              {results.map((result, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{result.area}</h4>
                      <p className="text-sm text-white/60 mt-1">{MOSS_AREAS[index].description}</p>
                      <div className="mt-3 flex items-center space-x-4">
                        <span className="text-sm text-white/60">
                          Puntaje: {result.score}/{MOSS_AREAS[index].questionIds.length}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          result.percentage >= 83 ? 'bg-green-500/20 text-green-300' :
                          result.percentage >= 64 ? 'bg-blue-500/20 text-blue-300' :
                          result.percentage >= 42 ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {result.level}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="relative h-24 w-24">
                        <svg className="transform -rotate-90 w-24 h-24">
                          <circle
                            cx="48"
                            cy="48"
                            r="36"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            className="text-white/10"
                          />
                          <circle
                            cx="48"
                            cy="48"
                            r="36"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 36}`}
                            strokeDashoffset={`${2 * Math.PI * 36 * (1 - result.percentage / 100)}`}
                            className="text-purple-400 transition-all duration-1000"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold text-white">{result.percentage}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Interpretación de niveles */}
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h4 className="font-semibold text-white mb-3">Interpretación de Niveles</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                {MOSS_LEVELS.map((level, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      level.min >= 83 ? 'bg-green-400' :
                      level.min >= 64 ? 'bg-blue-400' :
                      level.min >= 42 ? 'bg-yellow-400' :
                      'bg-red-400'
                    }`} />
                    <span className="text-white/60">{level.level}: {level.min}-{level.max}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <button
              onClick={() => {
                setShowResults(false);
                onCancel();
              }}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
            >
              Finalizar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = MOSS_QUESTIONS[currentQuestion];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Barra de progreso */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white/60 text-sm">Progreso del test</span>
          <span className="text-white/60 text-sm">
            {Object.keys(answers).length} de {MOSS_QUESTIONS.length} preguntas respondidas
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div 
            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Pregunta actual */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">
            Pregunta {currentQuestion + 1} de {MOSS_QUESTIONS.length}
          </h3>
          <span className="text-purple-400 text-sm">
            {candidateName}
          </span>
        </div>

        <div className="mb-8">
          <p className="text-lg text-white leading-relaxed">{question.text}</p>
        </div>

        <div className="space-y-3">
          {Object.entries(question.options).map(([key, value]) => (
            <label
              key={key}
              className={`block p-4 rounded-lg border cursor-pointer transition-all ${
                answers[question.id] === key
                  ? 'bg-purple-500/20 border-purple-500 text-white'
                  : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10'
              }`}
            >
              <div className="flex items-start space-x-3">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={key}
                  checked={answers[question.id] === key}
                  onChange={() => handleAnswer(question.id, key)}
                  className="mt-1 text-purple-600 focus:ring-purple-500"
                />
                <span className="flex-1">
                  <strong className="text-purple-400">{key.toUpperCase()})</strong> {value}
                </span>
              </div>
            </label>
          ))}
        </div>

        <div className="flex justify-between items-center mt-8">
          <button
            onClick={goToPrevious}
            disabled={currentQuestion === 0}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
              currentQuestion === 0
                ? 'bg-white/5 text-white/30 cursor-not-allowed'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Anterior</span>
          </button>

          <div className="flex space-x-2">
            {/* Indicadores de navegación rápida */}
            {[...Array(5)].map((_, i) => {
              const questionIndex = Math.floor((currentQuestion / MOSS_QUESTIONS.length) * 5);
              return (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i <= questionIndex ? 'bg-purple-400' : 'bg-white/20'
                  }`}
                />
              );
            })}
          </div>

          {currentQuestion === MOSS_QUESTIONS.length - 1 ? (
            <button
              onClick={finishTest}
              disabled={Object.keys(answers).length < MOSS_QUESTIONS.length}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                Object.keys(answers).length < MOSS_QUESTIONS.length
                  ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              Finalizar Test
            </button>
          ) : (
            <button
              onClick={goToNext}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
            >
              <span>Siguiente</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}; 