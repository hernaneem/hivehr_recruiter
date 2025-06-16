import React, { useState, useEffect } from 'react';
import {
  Brain,
  Timer,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  FileText,
  Award
} from 'lucide-react';
import { useTermanMerrill } from '../contexts/TermanMerrillContext';
import { TERMAN_QUESTIONS, SERIES_INSTRUCTIONS, SERIES_EXAMPLES } from '../data/termanQuestions';

interface TermanMerrillTestProps {
  candidateId: string;
  onComplete: (result: any) => void;
  onCancel: () => void;
}

const TermanMerrillTest: React.FC<TermanMerrillTestProps> = ({ 
  candidateId, 
  onComplete, 
  onCancel 
}) => {
  const {
    currentSerie,
    currentQuestionIndex,
    timeRemaining,
    isTestActive,
    startTest,
    submitAnswer,
    nextQuestion,
    previousQuestion,
    skipQuestion,
    finishSerie,
    finishTest,
    loading,
    error
  } = useTermanMerrill();

  const [isStarted, setIsStarted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | string[] | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);

  // Obtener preguntas de la serie actual
  const currentSerieQuestions = TERMAN_QUESTIONS.filter(q => q.serie === currentSerie);
  const currentQuestion = currentSerieQuestions[currentQuestionIndex];

  // Formatear tiempo
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Efecto para mostrar instrucciones al cambiar de serie
  useEffect(() => {
    if (isTestActive) {
      setShowInstructions(true);
      setSelectedAnswer(null);
    }
  }, [currentSerie, isTestActive]);

  // Efecto para auto-avanzar cuando se agota el tiempo
  useEffect(() => {
    if (timeRemaining === 0 && isTestActive) {
      handleFinishSerie();
    }
  }, [timeRemaining, isTestActive]);

  const handleStartTest = async () => {
    try {
      await startTest(candidateId);
      setIsStarted(true);
    } catch (err) {
      console.error('Error starting test:', err);
    }
  };

  const handleAnswerSelect = (value: string) => {
    if (currentQuestion?.type === 'multiple') {
      const currentAnswers = Array.isArray(selectedAnswer) ? selectedAnswer : [];
      if (currentAnswers.includes(value)) {
        setSelectedAnswer(currentAnswers.filter(a => a !== value));
      } else if (currentAnswers.length < 2) {
        setSelectedAnswer([...currentAnswers, value]);
      }
    } else {
      setSelectedAnswer(value);
    }
  };

  const handleSubmit = () => {
    if (selectedAnswer) {
      submitAnswer(selectedAnswer);
      setSelectedAnswer(null);
      nextQuestion();
    }
  };

  const handleSkip = () => {
    skipQuestion();
    setSelectedAnswer(null);
  };

  const handleFinishSerie = () => {
    finishSerie();
    setSelectedAnswer(null);
  };

  const handleFinishTest = async () => {
    try {
      const result = await finishTest();
      onComplete(result);
    } catch (err) {
      console.error('Error finishing test:', err);
    }
  };

  // Renderizar instrucciones de serie
  const renderInstructions = () => (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
      <div className="flex items-center space-x-3 mb-6">
        <FileText className="h-8 w-8 text-purple-400" />
        <h2 className="text-2xl font-semibold text-white">
          Serie {currentSerie} - Instrucciones
        </h2>
      </div>
      
      <p className="text-white/80 mb-6">
        {SERIES_INSTRUCTIONS[currentSerie as keyof typeof SERIES_INSTRUCTIONS]}
      </p>
      
      {/* Mostrar ejemplos si existen */}
      {SERIES_EXAMPLES[currentSerie as keyof typeof SERIES_EXAMPLES] && (
        <div className="bg-white/5 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Ejemplo:</h3>
          <RenderExample serie={currentSerie} />
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <div className="text-white/60">
          Tiempo límite: {formatTime(timeRemaining)}
        </div>
        
        <button
          onClick={() => setShowInstructions(false)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg transition-all flex items-center space-x-2"
        >
          <span>Comenzar Serie</span>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );

  // Renderizar pregunta
  const renderQuestion = () => {
    if (!currentQuestion) return null;

    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
        {/* Header con tiempo */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <Brain className="h-6 w-6 text-purple-400" />
            <span className="text-white/80">
              Serie {currentSerie} - Pregunta {currentQuestionIndex + 1} de {currentSerieQuestions.length}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-white">
            <Timer className="h-5 w-5" />
            <span className={timeRemaining < 30 ? 'text-red-400' : ''}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>
        
        {/* Pregunta */}
        <div className="mb-8">
          <h3 className="text-xl font-medium text-white mb-6">
            {currentQuestion.number}. {currentQuestion.question}
          </h3>
          
          {/* Opciones según tipo de pregunta */}
          {currentQuestion.type === 'single' && currentQuestion.options && (
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <label key={index} className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="answer"
                    value={String.fromCharCode(65 + index)}
                    checked={selectedAnswer === String.fromCharCode(65 + index)}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    className="w-5 h-5 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-white/80 group-hover:text-white transition-colors">
                    {String.fromCharCode(97 + index)}) {option}
                  </span>
                </label>
              ))}
            </div>
          )}
          
          {currentQuestion.type === 'multiple' && currentQuestion.options && (
            <div className="space-y-3">
              <p className="text-yellow-400 text-sm mb-4">Seleccione DOS opciones</p>
              {currentQuestion.options.map((option, index) => (
                <label key={index} className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    value={String.fromCharCode(65 + index)}
                    checked={(selectedAnswer as string[])?.includes(String.fromCharCode(65 + index))}
                    onChange={(e) => handleAnswerSelect(e.target.value)}
                    disabled={(selectedAnswer as string[])?.length >= 2 && 
                      !(selectedAnswer as string[])?.includes(String.fromCharCode(65 + index))}
                    className="w-5 h-5 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-white/80 group-hover:text-white transition-colors">
                    {String.fromCharCode(97 + index)}) {option}
                  </span>
                </label>
              ))}
            </div>
          )}
          
          {currentQuestion.type === 'equal-opposite' && (
            <div className="flex space-x-6">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="answer"
                  value="I"
                  checked={selectedAnswer === 'I'}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  className="w-5 h-5 text-purple-500 focus:ring-purple-500"
                />
                <span className="text-white/80">I - Igual</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="answer"
                  value="O"
                  checked={selectedAnswer === 'O'}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  className="w-5 h-5 text-purple-500 focus:ring-purple-500"
                />
                <span className="text-white/80">O - Opuesto</span>
              </label>
            </div>
          )}
          
          {currentQuestion.type === 'open' && (
            <input
              type="text"
              value={selectedAnswer as string || ''}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              placeholder="Escriba su respuesta"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          )}
        </div>
        
        {/* Botones de navegación */}
        <div className="flex justify-between items-center">
          <button
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Anterior</span>
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={handleSkip}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
            >
              Omitir
            </button>
            
            {currentQuestionIndex === currentSerieQuestions.length - 1 ? (
              <button
                onClick={handleFinishSerie}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-lg transition-all flex items-center space-x-2"
              >
                <span>Finalizar Serie</span>
                <CheckCircle className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!selectedAnswer || (Array.isArray(selectedAnswer) && selectedAnswer.length === 0)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-lg transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

  // Si no ha iniciado, mostrar pantalla de inicio
  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="h-10 w-10 text-white" />
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-4">
                Test de Inteligencia Terman-Merrill
              </h1>
              
              <p className="text-white/80 mb-6">
                Este test evalúa diferentes aspectos de la inteligencia a través de 10 series de preguntas.
                El tiempo total aproximado es de 40 minutos.
              </p>
              
              <div className="bg-white/5 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Instrucciones Generales:</h3>
                <ul className="text-left text-white/80 space-y-2">
                  <li>• Cada serie tiene un tiempo límite específico</li>
                  <li>• Lea cuidadosamente las instrucciones de cada serie</li>
                  <li>• Responda con la mayor precisión posible</li>
                  <li>• Si no sabe una respuesta, puede omitirla</li>
                  <li>• No podrá regresar a series anteriores</li>
                </ul>
              </div>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={onCancel}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                >
                  Cancelar
                </button>
                
                <button
                  onClick={handleStartTest}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-lg transition-all flex items-center space-x-2 disabled:opacity-50"
                >
                  <span>{loading ? 'Iniciando...' : 'Comenzar Test'}</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error si existe
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
        <div className="bg-red-500/20 backdrop-blur-md rounded-xl p-8 border border-red-500/30 max-w-md">
          <div className="flex items-center space-x-3 text-red-300">
            <AlertCircle className="h-8 w-8" />
            <div>
              <h3 className="text-xl font-semibold">Error</h3>
              <p className="text-red-200">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Test activo
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/80">Progreso del Test</span>
            <span className="text-white/80">Serie {currentSerie} de X</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'].indexOf(currentSerie) + 1) * 10}%` }}
            />
          </div>
        </div>
        
        {/* Contenido principal */}
        {showInstructions ? renderInstructions() : renderQuestion()}
        
        {/* Botón para finalizar test */}
        {currentSerie === 'X' && currentQuestionIndex === currentSerieQuestions.length - 1 && (
          <div className="mt-8 text-center">
            <button
              onClick={handleFinishTest}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-lg transition-all flex items-center space-x-3 mx-auto text-lg font-semibold"
            >
              <Award className="h-6 w-6" />
              <span>Finalizar Test Completo</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente auxiliar para renderizar ejemplos
const RenderExample: React.FC<{ serie: string }> = ({ serie }) => {
  const example = SERIES_EXAMPLES[serie as keyof typeof SERIES_EXAMPLES];
  
  if (!example) return null;

  if (serie === 'I' || serie === 'II') {
    return (
      <div>
        <p className="text-white mb-3">{(example as any).question}</p>
        <div className="space-y-2">
          {(example as any).options.map((opt: string, idx: number) => (
            <div key={idx} className="text-white/70">
              {String.fromCharCode(97 + idx)}) {opt}
            </div>
          ))}
        </div>
        <p className="text-green-400 mt-3">
          Respuesta correcta: ({(example as any).answer})
        </p>
      </div>
    );
  }
  
  if (serie === 'III') {
    return (
      <div className="space-y-3">
        <div>
          <p className="text-white">{(example as any).question1}</p>
          <p className="text-green-400">Respuesta: {(example as any).answer1}</p>
        </div>
        <div>
          <p className="text-white">{(example as any).question2}</p>
          <p className="text-green-400">Respuesta: {(example as any).answer2}</p>
        </div>
      </div>
    );
  }
  
  // Agregar más casos según sea necesario
  
  return null;
};

export default TermanMerrillTest; 