import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { TERMAN_QUESTIONS } from '../data/termanQuestions';

// Interfaces para las preguntas y respuestas
interface TermanQuestion {
  id: number;
  serie: string;
  question: string;
  options?: string[];
  instruction?: string;
  example?: string;
  correctAnswer?: string | string[];
  timeLimit?: number;
}

interface TermanAnswer {
  questionId: number;
  serie: string;
  answer: string | string[];
  isCorrect?: boolean;
}

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
  candidateId: string;
  recruiterId: string;
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

interface TermanContextType {
  // Estado del test
  currentSerie: string;
  currentQuestionIndex: number;
  timeRemaining: number;
  isTestActive: boolean;
  answers: TermanAnswer[];
  
  // Datos del candidato
  candidateInfo: {
    id: string;
    name: string;
    age?: number;
    education?: string;
    job_id?: string;
  } | null;
  
  // Funciones
  startTest: (candidateId: string) => void;
  submitAnswer: (answer: string | string[]) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  skipQuestion: () => void;
  finishSerie: () => void;
  finishTest: () => Promise<TermanResult>;
  
  // Resultados
  testResult: TermanResult | null;
  loading: boolean;
  error: string | null;
}

const TermanMerrillContext = createContext<TermanContextType | undefined>(undefined);

export const useTermanMerrill = () => {
  const context = useContext(TermanMerrillContext);
  if (context === undefined) {
    throw new Error('useTermanMerrill must be used within a TermanMerrillProvider');
  }
  return context;
};

export const TermanMerrillProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  // Estado principal
  const [currentSerie, setCurrentSerie] = useState<string>('I');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isTestActive, setIsTestActive] = useState<boolean>(false);
  const [answers, setAnswers] = useState<TermanAnswer[]>([]);
  const [candidateInfo, setCandidateInfo] = useState<any>(null);
  const [testResult, setTestResult] = useState<TermanResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTestActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            finishSerie();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTestActive, timeRemaining]);

  const startTest = async (candidateId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar información del candidato
      const { data: candidate, error: candidateError } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', candidateId)
        .single();

      if (candidateError) throw candidateError;

      setCandidateInfo({
        id: candidate.id,
        name: candidate.name,
        age: candidate.age,
        education: candidate.education,
        job_id: candidate.job_id
      });

      // Inicializar test
      setCurrentSerie('I');
      setCurrentQuestionIndex(0);
      setTimeRemaining(4 * 60); // 4 minutos por serie
      setIsTestActive(true);
      setAnswers([]);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error iniciando test');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = (answer: string | string[]) => {
    // Encontrar la pregunta actual para validar la respuesta
    const currentQuestion = TERMAN_QUESTIONS.find(q => 
      q.serie === currentSerie && q.number === currentQuestionIndex + 1
    );
    
    // Validar si la respuesta es correcta
    let isCorrect = false;
    if (currentQuestion) {
      if (Array.isArray(currentQuestion.correctAnswer)) {
        // Para respuestas múltiples
        const correctAnswers = currentQuestion.correctAnswer;
        const givenAnswers = Array.isArray(answer) ? answer : [answer];
        isCorrect = correctAnswers.length === givenAnswers.length && 
                   correctAnswers.every(ca => givenAnswers.includes(ca));
      } else {
        // Para respuestas simples
        const correctAnswer = currentQuestion.correctAnswer;
        const givenAnswer = Array.isArray(answer) ? answer.join(',') : answer;
        isCorrect = correctAnswer === givenAnswer;
      }
    }

    const newAnswer: TermanAnswer = {
      questionId: currentQuestionIndex + 1,
      serie: currentSerie,
      answer,
      isCorrect
    };
    
    // Actualizar o agregar respuesta
    setAnswers(prev => {
      const existing = prev.findIndex(a => a.questionId === newAnswer.questionId && a.serie === newAnswer.serie);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = newAnswer;
        return updated;
      }
      return [...prev, newAnswer];
    });
  };

  const nextQuestion = () => {
    setCurrentQuestionIndex(prev => prev + 1);
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const skipQuestion = () => {
    nextQuestion();
  };

  const finishSerie = () => {
    // Avanzar a la siguiente serie o finalizar test
    const series = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    const currentIndex = series.indexOf(currentSerie);
    
    if (currentIndex < series.length - 1) {
      setCurrentSerie(series[currentIndex + 1]);
      setCurrentQuestionIndex(0);
      setTimeRemaining(4 * 60); // Reset timer para nueva serie
    } else {
      // Finalizar test completo
      setIsTestActive(false);
    }
  };

  const calculateSerieScore = (serie: string, serieAnswers: TermanAnswer[]): SerieScore => {
    const totalQuestions = 10; // Asumiendo 10 preguntas por serie
    const correctAnswers = serieAnswers.filter(a => a.isCorrect).length;
    const incorrectAnswers = serieAnswers.length - correctAnswers;
    
    const rawScore = correctAnswers;
    const percentageEfficiency = (correctAnswers / totalQuestions) * 100;
    
    let range = '';
    if (percentageEfficiency >= 90) range = 'MUY ALTO';
    else if (percentageEfficiency >= 75) range = 'ALTO';
    else if (percentageEfficiency >= 60) range = 'PROMEDIO ALTO';
    else if (percentageEfficiency >= 40) range = 'PROMEDIO';
    else if (percentageEfficiency >= 25) range = 'PROMEDIO BAJO';
    else if (percentageEfficiency >= 10) range = 'BAJO';
    else range = 'MUY BAJO';

    return {
      serie,
      correct: correctAnswers,
      incorrect: incorrectAnswers,
      total: totalQuestions,
      rawScore,
      percentageEfficiency,
      range
    };
  };

  const calculateIQ = (totalScore: number, ageInMonths?: number): { mentalAge: number; iq: number; classification: string } => {
    // Fórmula simplificada - en implementación real usar tablas de Terman-Merrill
    const baseMentalAge = 180; // 15 años en meses
    const mentalAge = baseMentalAge + (totalScore - 50) * 2;
    const chronologicalAge = ageInMonths || 180;
    
    const iq = Math.round((mentalAge / chronologicalAge) * 100);
    
    let classification = '';
    if (iq >= 130) classification = 'SUPERIOR';
    else if (iq >= 120) classification = 'PROMEDIO SUPERIOR';
    else if (iq >= 110) classification = 'PROMEDIO ALTO';
    else if (iq >= 90) classification = 'PROMEDIO';
    else if (iq >= 80) classification = 'PROMEDIO BAJO';
    else if (iq >= 70) classification = 'INFERIOR';
    else classification = 'DEFICIENCIA MENTAL';

    return { mentalAge, iq, classification };
  };

  const generateInterpretation = (seriesScores: SerieScore[]): { strengths: string[]; weaknesses: string[]; generalAssessment: string } => {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    
    seriesScores.forEach(score => {
      if (score.percentageEfficiency >= 75) {
        if (score.serie === 'I') strengths.push('Excelente conocimiento general');
        if (score.serie === 'II') strengths.push('Buen juicio y razonamiento');
        if (score.serie === 'III') strengths.push('Vocabulario amplio');
        // ... agregar más interpretaciones
      } else if (score.percentageEfficiency < 50) {
        if (score.serie === 'I') weaknesses.push('Necesita ampliar conocimientos generales');
        if (score.serie === 'II') weaknesses.push('Mejorar capacidad de juicio');
        if (score.serie === 'III') weaknesses.push('Enriquecer vocabulario');
        // ... agregar más interpretaciones
      }
    });

    const avgScore = seriesScores.reduce((sum, score) => sum + score.percentageEfficiency, 0) / seriesScores.length;
    let generalAssessment = '';
    
    if (avgScore >= 80) {
      generalAssessment = 'El candidato muestra un desempeño sobresaliente en la mayoría de las áreas evaluadas.';
    } else if (avgScore >= 60) {
      generalAssessment = 'El candidato presenta un rendimiento promedio con algunas fortalezas destacables.';
    } else {
      generalAssessment = 'El candidato requiere desarrollo en varias áreas cognitivas evaluadas.';
    }

    return { strengths, weaknesses, generalAssessment };
  };

  const finishTest = async (): Promise<TermanResult> => {
    try {
      setLoading(true);
      
      // Calcular scores por serie
      const series = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
      const seriesScores = series.map(serie => {
        const serieAnswers = answers.filter(a => a.serie === serie);
        return calculateSerieScore(serie, serieAnswers);
      });

      // Calcular score total
      const totalScore = seriesScores.reduce((sum, score) => sum + score.rawScore, 0);
      
      // Calcular CI y edad mental
      const { mentalAge, iq, classification } = calculateIQ(totalScore, candidateInfo?.age);
      
      // Generar interpretación
      const interpretation = generateInterpretation(seriesScores);

      const result: TermanResult = {
        candidateId: candidateInfo!.id,
        recruiterId: user!.id,
        totalScore,
        mentalAge,
        iq,
        iqClassification: classification,
        seriesScores,
        completedAt: new Date(),
        interpretation
      };

      // Preparar datos para insertar en base de datos (ajustar nombres de columnas)
      const dbResult = {
        candidate_id: candidateInfo!.id,
        recruiter_id: user!.id,
        job_id: candidateInfo!.job_id || null,
        total_score: totalScore,
        mental_age: mentalAge,
        iq: iq,
        iq_classification: classification,
        series_scores: seriesScores,
        interpretation: interpretation,
        completed_at: new Date().toISOString()
      };

      // Guardar en base de datos
      const { data, error: saveError } = await supabase
        .from('terman_results')
        .insert([dbResult])
        .select()
        .single();

      if (saveError) throw saveError;

      // Guardar respuestas individuales
      if (answers.length > 0) {
        const answersToSave = answers.map(answer => {
          const question = TERMAN_QUESTIONS.find(q => 
            q.serie === answer.serie && q.number === answer.questionId
          );
          
          return {
            terman_result_id: data.id,
            serie: answer.serie,
            question_number: answer.questionId,
            question_id: `${answer.serie}-${answer.questionId}`,
            given_answer: Array.isArray(answer.answer) ? answer.answer.join(',') : answer.answer,
            correct_answer: Array.isArray(question?.correctAnswer) 
              ? question.correctAnswer.join(',') 
              : question?.correctAnswer || '',
            is_correct: answer.isCorrect || false
          };
        });

        const { error: answersError } = await supabase
          .from('terman_answers')
          .insert(answersToSave);

        if (answersError) {
          console.error('Error saving answers:', answersError);
          // No interrumpir el flujo si falla el guardado de respuestas individuales
        }
      }

      setTestResult({ ...result, id: data.id });
      setIsTestActive(false);
      
      return { ...result, id: data.id };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error guardando resultados');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value: TermanContextType = {
    currentSerie,
    currentQuestionIndex,
    timeRemaining,
    isTestActive,
    answers,
    candidateInfo,
    startTest,
    submitAnswer,
    nextQuestion,
    previousQuestion,
    skipQuestion,
    finishSerie,
    finishTest,
    testResult,
    loading,
    error
  };

  return (
    <TermanMerrillContext.Provider value={value}>
      {children}
    </TermanMerrillContext.Provider>
  );
}; 