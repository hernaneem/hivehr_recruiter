export interface TermanQuestion {
  id: string;
  serie: string;
  number: number;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  instruction?: string;
  example?: string;
  type: 'single' | 'multiple' | 'equal-opposite' | 'open';
}

// Configuración de tiempo por serie (en minutos)
export const SERIES_TIME_LIMITS = {
  'I': 4,
  'II': 4,
  'III': 4,
  'IV': 4,
  'V': 4,
  'VI': 4,
  'VII': 4,
  'VIII': 4,
  'IX': 4,
  'X': 4
};

// Instrucciones para cada serie
export const SERIES_INSTRUCTIONS = {
  'I': 'En esta serie debe responder preguntas de conocimiento general. Seleccione la respuesta que considere correcta.',
  'II': 'En esta serie debe usar su criterio y juicio para resolver problemas. Analice cada situación cuidadosamente.',
  'III': 'En esta serie debe demostrar su conocimiento de vocabulario. Seleccione el significado correcto de cada palabra.',
  'IV': 'En esta serie debe completar analogías. Encuentre la relación entre las palabras y complete el patrón.',
  'V': 'En esta serie debe mantener la concentración y seguir instrucciones específicas con precisión.',
  'VI': 'En esta serie debe analizar y clasificar elementos según criterios específicos.',
  'VII': 'En esta serie debe trabajar con conceptos abstractos y encontrar patrones lógicos.',
  'VIII': 'En esta serie debe demostrar su capacidad de planeación y organización secuencial.',
  'IX': 'En esta serie debe organizar información de manera lógica y sistemática.',
  'X': 'En esta serie debe mantener la atención sostenida y procesar información detallada.'
};

// Ejemplos para cada serie (opcional)
export const SERIES_EXAMPLES = {
  'I': {
    question: 'La capital de Francia es:',
    options: ['Londres', 'Madrid', 'París', 'Roma'],
    answer: 'C'
  },
  'II': {
    question: 'Si un objeto cuesta $100 y tiene un descuento del 20%, ¿cuál es el precio final?',
    options: ['$80', '$90', '$70', '$85'],
    answer: 'A'
  },
  'III': {
    question1: 'JOVIAL significa:',
    answer1: 'Alegre, festivo',
    question2: 'ECUÁNIME significa:',
    answer2: 'Sereno, imparcial'
  }
};

// Preguntas del test Terman-Merrill (muestra - se deben agregar todas las preguntas reales)
export const TERMAN_QUESTIONS: TermanQuestion[] = [
  // Serie I - Información General
  {
    id: 'I-1',
    serie: 'I',
    number: 1,
    question: '¿Cuántos meses tienen 28 días?',
    options: ['1', '2', '11', 'Todos'],
    correctAnswer: 'D',
    type: 'single'
  },
  {
    id: 'I-2',
    serie: 'I',
    number: 2,
    question: '¿En qué continente se encuentra Brasil?',
    options: ['África', 'Asia', 'América del Sur', 'Europa'],
    correctAnswer: 'C',
    type: 'single'
  },
  {
    id: 'I-3',
    serie: 'I',
    number: 3,
    question: '¿Cuál es el metal más abundante en la corteza terrestre?',
    options: ['Hierro', 'Aluminio', 'Cobre', 'Oro'],
    correctAnswer: 'B',
    type: 'single'
  },
  {
    id: 'I-4',
    serie: 'I',
    number: 4,
    question: '¿Quién escribió "Don Quijote de la Mancha"?',
    options: ['Lope de Vega', 'Miguel de Cervantes', 'Calderón de la Barca', 'Garcilaso de la Vega'],
    correctAnswer: 'B',
    type: 'single'
  },
  {
    id: 'I-5',
    serie: 'I',
    number: 5,
    question: '¿Cuál es la fórmula química del agua?',
    options: ['H2O', 'CO2', 'NaCl', 'CH4'],
    correctAnswer: 'A',
    type: 'single'
  },

  // Serie II - Juicio
  {
    id: 'II-1',
    serie: 'II',
    number: 1,
    question: 'Si llueve, las calles se mojan. Las calles están secas. Por lo tanto:',
    options: ['Está lloviendo', 'No está lloviendo', 'Va a llover', 'No se puede determinar'],
    correctAnswer: 'B',
    type: 'single'
  },
  {
    id: 'II-2',
    serie: 'II',
    number: 2,
    question: 'Un reloj se atrasa 2 minutos cada hora. Si lo ajusto a las 12:00 del mediodía, ¿qué hora marcará cuando sean realmente las 6:00 PM?',
    options: ['5:48 PM', '5:52 PM', '6:12 PM', '5:50 PM'],
    correctAnswer: 'A',
    type: 'single'
  },
  {
    id: 'II-3',
    serie: 'II',
    number: 3,
    question: 'En una fiesta hay 30 personas. Si cada persona saluda a todas las demás una sola vez, ¿cuántos saludos se dan en total?',
    options: ['435', '450', '465', '480'],
    correctAnswer: 'A',
    type: 'single'
  },
  {
    id: 'II-4',
    serie: 'II',
    number: 4,
    question: 'Tres amigos deciden compartir el costo de una pizza que vale $24. Si uno paga $10, otro $8, ¿cuánto debe pagar el tercero?',
    options: ['$4', '$6', '$8', '$10'],
    correctAnswer: 'B',
    type: 'single'
  },
  {
    id: 'II-5',
    serie: 'II',
    number: 5,
    question: 'Si 5 máquinas producen 5 artículos en 5 minutos, ¿cuánto tiempo tardarán 100 máquinas en producir 100 artículos?',
    options: ['5 minutos', '10 minutos', '20 minutos', '100 minutos'],
    correctAnswer: 'A',
    type: 'single'
  },

  // Serie III - Vocabulario
  {
    id: 'III-1',
    serie: 'III',
    number: 1,
    question: 'JOVIAL significa:',
    options: ['Triste', 'Alegre', 'Enojado', 'Cansado'],
    correctAnswer: 'B',
    type: 'single'
  },
  {
    id: 'III-2',
    serie: 'III',
    number: 2,
    question: 'ECUÁNIME significa:',
    options: ['Nervioso', 'Impaciente', 'Sereno', 'Agresivo'],
    correctAnswer: 'C',
    type: 'single'
  },
  {
    id: 'III-3',
    serie: 'III',
    number: 3,
    question: 'PERSPICAZ significa:',
    options: ['Lento', 'Agudo', 'Confuso', 'Distraído'],
    correctAnswer: 'B',
    type: 'single'
  },
  {
    id: 'III-4',
    serie: 'III',
    number: 4,
    question: 'EFÍMERO significa:',
    options: ['Eterno', 'Duradero', 'Pasajero', 'Permanente'],
    correctAnswer: 'C',
    type: 'single'
  },
  {
    id: 'III-5',
    serie: 'III',
    number: 5,
    question: 'ALTRUISTA significa:',
    options: ['Egoísta', 'Generoso', 'Avaro', 'Indiferente'],
    correctAnswer: 'B',
    type: 'single'
  }

  // Nota: Este es solo un ejemplo con algunas preguntas de muestra.
  // En la implementación real se deben agregar todas las 100 preguntas del test Terman-Merrill
  // distribuidas en las 10 series correspondientes.
];

// Función para obtener preguntas por serie
export const getQuestionsBySerie = (serie: string): TermanQuestion[] => {
  return TERMAN_QUESTIONS.filter(q => q.serie === serie);
};

// Función para obtener todas las series disponibles
export const getAvailableSeries = (): string[] => {
  return ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
};

// Configuración general del test
export const TEST_CONFIG = {
  totalSeries: 10,
  totalQuestions: 100,
  totalTimeMinutes: 40,
  questionsPerSerie: 10,
  passingScore: 60,
  maxTimePerSerie: 4 // minutos
}; 