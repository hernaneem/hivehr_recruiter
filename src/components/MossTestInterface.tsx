import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Target, ArrowLeft, ArrowRight, Clock, CheckCircle } from 'lucide-react';
import { useMoss } from '../contexts/MossContext';
import { MOSS_QUESTIONS } from './moss/mossTestData';
import type { MossTest } from '../contexts/MossContext';

const MossTestInterface = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { getTestByToken, completeTest } = useMoss();
  
  const [test, setTest] = useState<MossTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [startTime] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadTest = async () => {
      console.log('MossTestInterface: Token recibido:', token);
      
      if (!token) {
        setError('Token de test no válido');
        setLoading(false);
        return;
      }

      try {
        console.log('MossTestInterface: Buscando test con token:', token);
        const testData = await getTestByToken(token);
        console.log('MossTestInterface: Test encontrado:', testData);
        
        if (!testData) {
          setError('El test no existe, ha expirado o ya fue completado');
        } else if (testData.status === 'completed') {
          navigate(`/moss-test/${token}/completed`);
          return;
        } else {
          setTest(testData);
        }
      } catch (err) {
        console.error('MossTestInterface: Error cargando test:', err);
        setError('Error cargando el test');
      } finally {
        setLoading(false);
      }
    };

    loadTest();
  }, [token, getTestByToken, navigate]);

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const goToNextQuestion = () => {
    if (currentQuestion < MOSS_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResults = () => {
    const scores = {
      HS: 0,   // Habilidades Sociales
      CDRH: 0, // Capacidad de Dirección y Relaciones Humanas
      CEPI: 0, // Capacidad de Evaluación de Problemas Interpersonales
      HERI: 0, // Habilidad para Establecer Relaciones Interpersonales
      SCTRI: 0 // Sentido Común en las Relaciones Interpersonales
    };

    // Calcular puntuaciones basadas en las respuestas
    Object.entries(answers).forEach(([questionIndex, answerIndex]) => {
      const qIndex = parseInt(questionIndex);
      // Para MOSS, simplemente sumamos los puntos por área
      // Cada 6 preguntas corresponden a un área diferente
      const areaIndex = Math.floor(qIndex / 6);
      const areas = ['HS', 'CDRH', 'CEPI', 'HERI', 'SCTRI'];
      const area = areas[areaIndex] as keyof typeof scores;
      
      if (area) {
        scores[area] += answerIndex;
      }
    });

    return scores;
  };

  const handleSubmitTest = async () => {
    if (!test) return;

    // Verificar que todas las preguntas estén respondidas
    const unansweredQuestions = MOSS_QUESTIONS
      .map((_: any, index: number) => index)
      .filter((index: number) => !(index in answers));

    if (unansweredQuestions.length > 0) {
      alert(`Por favor responde todas las preguntas. Faltan ${unansweredQuestions.length} preguntas.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const endTime = new Date();
      const startTimeDate = new Date(startTime);
      
      // Convertir answers a formato string
      const stringAnswers: Record<number, string> = {};
      Object.entries(answers).forEach(([key, value]) => {
        // Sumar 1 al índice porque la BD espera question_id entre 1 y 30, no 0-29
        const questionId = parseInt(key) + 1;
        // Convertir índice numérico (0,1,2,3) a letra (a,b,c,d)
        const answerLetter = ['a', 'b', 'c', 'd'][value];
        stringAnswers[questionId] = answerLetter;
      });

      // Convertir scores a formato MossResult
      const scores = calculateResults();
      const results: any[] = Object.entries(scores).map(([area, score]) => ({
        area,
        score,
        percentage: Math.round((score / 12) * 100), // Asumiendo máximo 12 puntos por área
        level: score > 8 ? 'Alto' : score > 4 ? 'Medio' : 'Bajo'
      }));

      await completeTest(test.id, stringAnswers, results, startTimeDate, endTime);
      navigate(`/moss-test/${token}/completed`);
    } catch (err) {
      alert('Error enviando el test. Por favor intenta de nuevo.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Cargando test...</p>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-8 max-w-md text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-4">Error</h1>
          <p className="text-red-300 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  const currentQuestionData = MOSS_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / MOSS_QUESTIONS.length) * 100;
  const answeredQuestions = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Test MOSS</h1>
                <p className="text-white/70">Evaluación de Habilidades Interpersonales</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-medium">
                Pregunta {currentQuestion + 1} de {MOSS_QUESTIONS.length}
              </div>
              <div className="text-white/70 text-sm">
                {answeredQuestions} respondidas
              </div>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Pregunta actual */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 mb-6">
          <div className="mb-6">
            <div className="text-purple-300 text-sm font-medium mb-2">
              Pregunta {currentQuestion + 1}
            </div>
            <h2 className="text-xl font-semibold text-white mb-4">
              {currentQuestionData.text}
            </h2>
          </div>

          {/* Opciones de respuesta */}
          <div className="space-y-3">
            {Object.values(currentQuestionData.options).map((option: string, index: number) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(currentQuestion, index)}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  answers[currentQuestion] === index
                    ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-purple-400 text-white'
                    : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:border-white/30'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    answers[currentQuestion] === index
                      ? 'border-purple-400 bg-purple-400'
                      : 'border-white/40'
                  }`}>
                    {answers[currentQuestion] === index && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className="flex-1">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navegación */}
        <div className="flex justify-between items-center">
          <button
            onClick={goToPreviousQuestion}
            disabled={currentQuestion === 0}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
              currentQuestion === 0
                ? 'bg-white/5 text-white/40 cursor-not-allowed'
                : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <div className="flex items-center space-x-4">
            {/* Indicador de preguntas respondidas */}
            <div className="text-white/70 text-sm">
              {answeredQuestions} de {MOSS_QUESTIONS.length} respondidas
            </div>

            {currentQuestion === MOSS_QUESTIONS.length - 1 ? (
              <button
                onClick={handleSubmitTest}
                disabled={isSubmitting || answeredQuestions < MOSS_QUESTIONS.length}
                className={`flex items-center space-x-2 px-8 py-3 rounded-lg font-semibold transition-all ${
                  isSubmitting || answeredQuestions < MOSS_QUESTIONS.length
                    ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Finalizar Test</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={goToNextQuestion}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                <span>Siguiente</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-6 bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-blue-300 text-sm">
            <Clock className="w-4 h-4" />
            <span>
              Tiempo transcurrido: {Math.round((Date.now() - startTime) / 60000)} minutos
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MossTestInterface; 