// Estructura de las preguntas del Test Terman-Merrill
export interface TermanQuestion {
  id: string;
  serie: string;
  number: number;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  instruction?: string;
  example?: string;
  type: 'single' | 'multiple' | 'equal-opposite' | 'yes-no' | 'true-false' | 'open';
}

export const TERMAN_QUESTIONS: TermanQuestion[] = [
  // SERIE I - INFORMACIÓN
  {
    id: 'I-1',
    serie: 'I',
    number: 1,
    question: 'La gasolina se extrae de',
    options: ['granos', 'petróleo', 'trementina', 'semilla'],
    correctAnswer: 'B',
    type: 'single'
  },
  {
    id: 'I-2',
    serie: 'I',
    number: 2,
    question: 'Una tonelada tiene:',
    options: ['1000 Kg.', '2000 Kg.', '3000 Kg.', '4000 Kg.'],
    correctAnswer: 'A',
    type: 'single'
  },
  {
    id: 'I-3',
    serie: 'I',
    number: 3,
    question: 'La mayoría de nuestras exportaciones salen por:',
    options: ['Mazatlán', 'Acapulco', 'Progreso', 'Veracruz'],
    correctAnswer: 'D',
    type: 'single'
  },
  {
    id: 'I-4',
    serie: 'I',
    number: 4,
    question: 'El nervio óptico sirve para:',
    options: ['ver', 'oír', 'probar', 'sentir'],
    correctAnswer: 'A',
    type: 'single'
  },
  {
    id: 'I-5',
    serie: 'I',
    number: 5,
    question: 'El café es una especie de:',
    options: ['corteza', 'fruto', 'hojas', 'raíz'],
    correctAnswer: 'B',
    type: 'single'
  },
  {
    id: 'I-6',
    serie: 'I',
    number: 6,
    question: 'El jamón es carne de:',
    options: ['carnero', 'vaca', 'gallina', 'cerdo'],
    correctAnswer: 'D',
    type: 'single'
  },
  {
    id: 'I-7',
    serie: 'I',
    number: 7,
    question: 'La laringe está en:',
    options: ['abdomen', 'cabeza', 'garganta', 'espalda'],
    correctAnswer: 'C',
    type: 'single'
  },
  {
    id: 'I-8',
    serie: 'I',
    number: 8,
    question: 'La guillotina causa:',
    options: ['muerte', 'enfermedad', 'fiebre', 'malestar'],
    correctAnswer: 'A',
    type: 'single'
  },
  {
    id: 'I-9',
    serie: 'I',
    number: 9,
    question: 'La grúa se usa para:',
    options: ['perforar', 'cortar', 'levantar', 'exprimir'],
    correctAnswer: 'C',
    type: 'single'
  },
  {
    id: 'I-10',
    serie: 'I',
    number: 10,
    question: 'Una figura de seis lados se llama:',
    options: ['pentágono', 'paralelogramo', 'hexágono', 'trapecio'],
    correctAnswer: 'C',
    type: 'single'
  },
  {
    id: 'I-11',
    serie: 'I',
    number: 11,
    question: 'El kilowatt mide:',
    options: ['lluvia', 'viento', 'electricidad', 'presión'],
    correctAnswer: 'C',
    type: 'single'
  },
  {
    id: 'I-12',
    serie: 'I',
    number: 12,
    question: 'La pauta se usa en:',
    options: ['agricultura', 'música', 'fotografía', 'escenografía'],
    correctAnswer: 'B',
    type: 'single'
  },
  {
    id: 'I-13',
    serie: 'I',
    number: 13,
    question: 'Las esmeraldas son:',
    options: ['azules', 'verdes', 'rojas', 'amarillas'],
    correctAnswer: 'B',
    type: 'single'
  },
  {
    id: 'I-14',
    serie: 'I',
    number: 14,
    question: 'El metro es aproximadamente igual a:',
    options: ['pie', 'pulgada', 'yarda', 'milla'],
    correctAnswer: 'C',
    type: 'single'
  },
  {
    id: 'I-15',
    serie: 'I',
    number: 15,
    question: 'Las esponjas se obtienen de:',
    options: ['animales', 'hierbas', 'bosques', 'minas'],
    correctAnswer: 'A',
    type: 'single'
  },
  {
    id: 'I-16',
    serie: 'I',
    number: 16,
    question: 'Fraude es un término usado en:',
    options: ['medicina', 'teología', 'leyes', 'pedagogía'],
    correctAnswer: 'C',
    type: 'single'
  },

  // SERIE II - JUICIO
  {
    id: 'II-1',
    serie: 'II',
    number: 1,
    question: 'Si la Tierra estuviera más cerca del Sol:',
    options: [
      'las estrellas desaparecerían',
      'los meses serían más largos',
      'la Tierra estaría más caliente'
    ],
    correctAnswer: 'C',
    type: 'single'
  },
  {
    id: 'II-2',
    serie: 'II',
    number: 2,
    question: 'Los rayos de una rueda están frecuentemente hechos de nogal porque:',
    options: [
      'el nogal es fuerte',
      'se corta fácilmente',
      'coge bien la pintura'
    ],
    correctAnswer: 'A',
    type: 'single'
  },
  {
    id: 'II-3',
    serie: 'II',
    number: 3,
    question: 'Un tren se detiene con más dificultad que un automóvil porque:',
    options: [
      'tiene más ruedas',
      'es más pesado',
      'sus frenos no son buenos'
    ],
    correctAnswer: 'B',
    type: 'single'
  },
  {
    id: 'II-4',
    serie: 'II',
    number: 4,
    question: 'El dicho "A golpecitos se derriba un roble" quiere decir:',
    options: [
      'que los robles son débiles',
      'que son mejores los golpes pequeños',
      'que el esfuerzo constante logra resultados sorprendentes'
    ],
    correctAnswer: 'C',
    type: 'single'
  },
  {
    id: 'II-5',
    serie: 'II',
    number: 5,
    question: 'El dicho "Una olla vigilada nunca hierve" quiere decir:',
    options: [
      'que no debemos vigilarla cuando está en el fuego',
      'que tarda en hervir',
      'que el tiempo se alarga cuando esperamos algo'
    ],
    correctAnswer: 'C',
    type: 'single'
  },
  {
    id: 'II-6',
    serie: 'II',
    number: 6,
    question: 'El dicho "Siembra pasto mientras haya sol" quiere decir:',
    options: [
      'que el pasto se siembra en verano',
      'que debemos aprovechar nuestras oportunidades',
      'que el pasto no debe cortarse en la noche'
    ],
    correctAnswer: 'B',
    type: 'single'
  },
  {
    id: 'II-7',
    serie: 'II',
    number: 7,
    question: 'El dicho "Zapatero a tus zapatos" quiere decir:',
    options: [
      'que un zapatero no debe abandonar sus zapatos',
      'que los zapateros no deben estar ociosos',
      'que debemos trabajar en lo que podamos hacer mejor'
    ],
    correctAnswer: 'C',
    type: 'single'
  },
  {
    id: 'II-8',
    serie: 'II',
    number: 8,
    question: 'El dicho "La cuña para que apriete tiene que ser del mismo palo" quiere decir:',
    options: [
      'que el palo sirve para apretar',
      'que las cuñas siempre son de madera',
      'nos exigen más las personas que nos conocen'
    ],
    correctAnswer: 'C',
    type: 'single'
  },
  {
    id: 'II-9',
    serie: 'II',
    number: 9,
    question: 'Un acorazado de acero flota porque:',
    options: [
      'la máquina lo hace flotar',
      'porque tiene grandes espacios huecos',
      'contiene algo de madera'
    ],
    correctAnswer: 'B',
    type: 'single'
  },
  {
    id: 'II-10',
    serie: 'II',
    number: 10,
    question: 'Las plumas de las alas ayudan al pájaro a volar porque:',
    options: [
      'las alas ofrecen una amplia superficie ligera',
      'mantiene el aire fuera del cuerpo',
      'disminuyen su peso'
    ],
    correctAnswer: 'A',
    type: 'single'
  },
  {
    id: 'II-11',
    serie: 'II',
    number: 11,
    question: 'El dicho "Una golondrina no hace verano" quiere decir:',
    options: [
      'que las golondrinas regresan',
      'que un simple dato no es suficiente',
      'que los pájaros se agregan a nuestros placeres del verano'
    ],
    correctAnswer: 'B',
    type: 'single'
  },

  // SERIE III - VOCABULARIO (igual/opuesto)
  {
    id: 'III-1',
    serie: 'III',
    number: 1,
    question: 'salado - dulce',
    correctAnswer: 'O',
    type: 'equal-opposite'
  },
  {
    id: 'III-2',
    serie: 'III',
    number: 2,
    question: 'alegrarse - regocijarse',
    correctAnswer: 'I',
    type: 'equal-opposite'
  },
  {
    id: 'III-3',
    serie: 'III',
    number: 3,
    question: 'mayor - menor',
    correctAnswer: 'O',
    type: 'equal-opposite'
  },
  {
    id: 'III-4',
    serie: 'III',
    number: 4,
    question: 'sentarse - pararse',
    correctAnswer: 'O',
    type: 'equal-opposite'
  },
  {
    id: 'III-5',
    serie: 'III',
    number: 5,
    question: 'desperdiciar - aprovechar',
    correctAnswer: 'O',
    type: 'equal-opposite'
  },
  {
    id: 'III-6',
    serie: 'III',
    number: 6,
    question: 'conceder - negar',
    correctAnswer: 'O',
    type: 'equal-opposite'
  },
  {
    id: 'III-7',
    serie: 'III',
    number: 7,
    question: 'tónico - estimulante',
    correctAnswer: 'I',
    type: 'equal-opposite'
  },
  {
    id: 'III-8',
    serie: 'III',
    number: 8,
    question: 'rebajar - denigrar',
    correctAnswer: 'I',
    type: 'equal-opposite'
  },
  {
    id: 'III-9',
    serie: 'III',
    number: 9,
    question: 'prohibir - permitir',
    correctAnswer: 'O',
    type: 'equal-opposite'
  },
  {
    id: 'III-10',
    serie: 'III',
    number: 10,
    question: 'osado - audaz',
    correctAnswer: 'I',
    type: 'equal-opposite'
  },
  {
    id: 'III-11',
    serie: 'III',
    number: 11,
    question: 'arrebatado - prudente',
    correctAnswer: 'O',
    type: 'equal-opposite'
  },
  {
    id: 'III-12',
    serie: 'III',
    number: 12,
    question: 'obtuso - agudo',
    correctAnswer: 'O',
    type: 'equal-opposite'
  },
  {
    id: 'III-13',
    serie: 'III',
    number: 13,
    question: 'inepto - experto',
    correctAnswer: 'O',
    type: 'equal-opposite'
  },
  {
    id: 'III-14',
    serie: 'III',
    number: 14,
    question: 'esquivar - huir',
    correctAnswer: 'I',
    type: 'equal-opposite'
  },
  {
    id: 'III-15',
    serie: 'III',
    number: 15,
    question: 'rebelarse - someterse',
    correctAnswer: 'O',
    type: 'equal-opposite'
  },
  {
    id: 'III-16',
    serie: 'III',
    number: 16,
    question: 'monotonía - variedad',
    correctAnswer: 'O',
    type: 'equal-opposite'
  },
  {
    id: 'III-17',
    serie: 'III',
    number: 17,
    question: 'confrontar - consolar',
    correctAnswer: 'I',
    type: 'equal-opposite'
  },
  {
    id: 'III-18',
    serie: 'III',
    number: 18,
    question: 'expeler - retener',
    correctAnswer: 'O',
    type: 'equal-opposite'
  },
  {
    id: 'III-19',
    serie: 'III',
    number: 19,
    question: 'dócil - sumiso',
    correctAnswer: 'I',
    type: 'equal-opposite'
  },
  {
    id: 'III-20',
    serie: 'III',
    number: 20,
    question: 'transitorio - permanente',
    correctAnswer: 'O',
    type: 'equal-opposite'
  },
  {
    id: 'III-21',
    serie: 'III',
    number: 21,
    question: 'seguridad - riesgo',
    correctAnswer: 'O',
    type: 'equal-opposite'
  },
  {
    id: 'III-22',
    serie: 'III',
    number: 22,
    question: 'aprobar - objetar',
    correctAnswer: 'O',
    type: 'equal-opposite'
  },
  {
    id: 'III-23',
    serie: 'III',
    number: 23,
    question: 'expeler - arrojar',
    correctAnswer: 'I',
    type: 'equal-opposite'
  },
  {
    id: 'III-24',
    serie: 'III',
    number: 24,
    question: 'engaño - impostura',
    correctAnswer: 'I',
    type: 'equal-opposite'
  },
  {
    id: 'III-25',
    serie: 'III',
    number: 25,
    question: 'mitigar - apaciguar',
    correctAnswer: 'I',
    type: 'equal-opposite'
  },
  {
    id: 'III-26',
    serie: 'III',
    number: 26,
    question: 'incitar - aplacar',
    correctAnswer: 'O',
    type: 'equal-opposite'
  },
  {
    id: 'III-27',
    serie: 'III',
    number: 27,
    question: 'reverencia - veneración',
    correctAnswer: 'I',
    type: 'equal-opposite'
  },
  {
    id: 'III-28',
    serie: 'III',
    number: 28,
    question: 'sobriedad - frugalidad',
    correctAnswer: 'I',
    type: 'equal-opposite'
  },
  {
    id: 'III-29',
    serie: 'III',
    number: 29,
    question: 'aumentar - menguar',
    correctAnswer: 'O',
    type: 'equal-opposite'
  },
  {
    id: 'III-30',
    serie: 'III',
    number: 30,
    question: 'incitar - instigar',
    correctAnswer: 'I',
    type: 'equal-opposite'
  },

  // SERIE IV - SÍNTESIS (dos palabras que siempre tiene el sujeto)
  {
    id: 'IV-1',
    serie: 'IV',
    number: 1,
    question: 'Un CÍRCULO tiene siempre:',
    options: ['altura', 'circunferencia', 'latitud', 'longitud', 'radio'],
    correctAnswer: ['B', 'E'],
    type: 'multiple'
  },
  {
    id: 'IV-2',
    serie: 'IV',
    number: 2,
    question: 'Un PÁJARO tiene siempre:',
    options: ['huesos', 'huevos', 'pico', 'nido', 'canto'],
    correctAnswer: ['A', 'C'],
    type: 'multiple'
  },
  {
    id: 'IV-3',
    serie: 'IV',
    number: 3,
    question: 'La MÚSICA tiene siempre:',
    options: ['oyente', 'piano', 'ritmo', 'sonido', 'violín'],
    correctAnswer: ['C', 'D'],
    type: 'multiple'
  },
  {
    id: 'IV-4',
    serie: 'IV',
    number: 4,
    question: 'Un BANQUETE tiene siempre:',
    options: ['alimentos', 'música', 'personas', 'discursos', 'anfitrión'],
    correctAnswer: ['A', 'C'],
    type: 'multiple'
  },
  {
    id: 'IV-5',
    serie: 'IV',
    number: 5,
    question: 'Un CABALLO tiene siempre:',
    options: ['arnés', 'casco', 'herradura', 'establo', 'cola'],
    correctAnswer: ['B', 'E'],
    type: 'multiple'
  },
  {
    id: 'IV-6',
    serie: 'IV',
    number: 6,
    question: 'Un JUEGO tiene siempre:',
    options: ['cartas', 'multas', 'jugadores', 'castigos', 'reglas'],
    correctAnswer: ['C', 'E'],
    type: 'multiple'
  },
  {
    id: 'IV-7',
    serie: 'IV',
    number: 7,
    question: 'Un OBJETO tiene siempre:',
    options: ['calor', 'tamaño', 'sabor', 'valor', 'peso'],
    correctAnswer: ['B', 'E'],
    type: 'multiple'
  },
  {
    id: 'IV-8',
    serie: 'IV',
    number: 8,
    question: 'Una CONVERSACIÓN tiene siempre:',
    options: ['acuerdos', 'personas', 'preguntas', 'ingenio', 'palabras'],
    correctAnswer: ['B', 'E'],
    type: 'multiple'
  },
  {
    id: 'IV-9',
    serie: 'IV',
    number: 9,
    question: 'Una DEUDA tiene siempre:',
    options: ['acreedor', 'deudor', 'interés', 'hipoteca', 'pago'],
    correctAnswer: ['A', 'B'],
    type: 'multiple'
  },
  {
    id: 'IV-10',
    serie: 'IV',
    number: 10,
    question: 'Un CIUDADANO tiene siempre:',
    options: ['país', 'ocupación', 'derechos', 'propiedad', 'voto'],
    correctAnswer: ['A', 'C'],
    type: 'multiple'
  },
  {
    id: 'IV-11',
    serie: 'IV',
    number: 11,
    question: 'Un MUSEO tiene siempre:',
    options: ['animales', 'orden', 'colecciones', 'minerales', 'visitantes'],
    correctAnswer: ['B', 'C'],
    type: 'multiple'
  },
  {
    id: 'IV-12',
    serie: 'IV',
    number: 12,
    question: 'Un COMPROMISO implica siempre:',
    options: ['obligación', 'acuerdo', 'amistad', 'respeto', 'satisfacción'],
    correctAnswer: ['A', 'B'],
    type: 'multiple'
  },
  {
    id: 'IV-13',
    serie: 'IV',
    number: 13,
    question: 'Un BOSQUE tiene siempre:',
    options: ['animales', 'flores', 'sombras', 'maleza', 'árboles'],
    correctAnswer: ['C', 'E'],
    type: 'multiple'
  },
  {
    id: 'IV-14',
    serie: 'IV',
    number: 14,
    question: 'Los OBSTÁCULOS tienen siempre:',
    options: ['dificultad', 'desaliento', 'fracaso', 'impedimento', 'estímulo'],
    correctAnswer: ['A', 'D'],
    type: 'multiple'
  },
  {
    id: 'IV-15',
    serie: 'IV',
    number: 15,
    question: 'El ABORRECIMIENTO tiene siempre:',
    options: ['aversión', 'desagrado', 'temor', 'ira', 'timidez'],
    correctAnswer: ['A', 'B'],
    type: 'multiple'
  },
  {
    id: 'IV-16',
    serie: 'IV',
    number: 16,
    question: 'Una REVISTA tiene siempre:',
    options: ['anuncios', 'papel', 'fotografías', 'grabados', 'impresión'],
    correctAnswer: ['B', 'E'],
    type: 'multiple'
  },
  {
    id: 'IV-17',
    serie: 'IV',
    number: 17,
    question: 'La CONTROVERSIA implica siempre:',
    options: ['argumentos', 'desacuerdos', 'aversión', 'gritos', 'derrota'],
    correctAnswer: ['A', 'B'],
    type: 'multiple'
  },
  {
    id: 'IV-18',
    serie: 'IV',
    number: 18,
    question: 'Un BARCO tiene siempre:',
    options: ['maquinaria', 'cañones', 'quilla', 'timón', 'velas'],
    correctAnswer: ['C', 'D'],
    type: 'multiple'
  },

  // SERIE V - CONCENTRACIÓN (problemas aritméticos)
  {
    id: 'V-1',
    serie: 'V',
    number: 1,
    question: 'A 2 por 5 pesos ¿Cuántos lápices pueden comprarse con 50 pesos?',
    correctAnswer: '20',
    type: 'open'
  },
  {
    id: 'V-2',
    serie: 'V',
    number: 2,
    question: '¿Cuántas horas tardaría un automóvil en recorrer 660 kilómetros a la velocidad de 60 kilómetros por hora?',
    correctAnswer: '11',
    type: 'open'
  },
  {
    id: 'V-3',
    serie: 'V',
    number: 3,
    question: 'Si un hombre gana $200.00 diarios y gasta $140.00 ¿Cuántos días tardará en ahorrar $3,000.00?',
    correctAnswer: '50',
    type: 'open'
  },
  {
    id: 'V-4',
    serie: 'V',
    number: 4,
    question: 'Si dos pasteles cuestan $600 ¿Cuántos pesos cuesta la sexta parte de un pastel?',
    correctAnswer: '$50',
    type: 'open'
  },
  {
    id: 'V-5',
    serie: 'V',
    number: 5,
    question: '¿Cuántas veces más es 2 x 3 x 4 x 6, que 3 x 4?',
    correctAnswer: '12',
    type: 'open'
  },
  {
    id: 'V-6',
    serie: 'V',
    number: 6,
    question: '¿Cuánto es el 15% de $120.00?',
    correctAnswer: '$18',
    type: 'open'
  },
  {
    id: 'V-7',
    serie: 'V',
    number: 7,
    question: 'El cuatro por ciento de $1,000.00 es igual al ocho por ciento ¿de qué cantidad?',
    correctAnswer: '500',
    type: 'open'
  },
  {
    id: 'V-8',
    serie: 'V',
    number: 8,
    question: 'La capacidad de un refrigerador rectangular es de 48 metros cúbicos. Si tiene seis metros de largo por cuatro de ancho ¿cuál es su altura?',
    correctAnswer: '2',
    type: 'open'
  },
  {
    id: 'V-9',
    serie: 'V',
    number: 9,
    question: 'Si 7 hombres hacen un pozo de 40 metros en 2 días ¿cuántos hombres se necesitan para hacerlo en medio día?',
    correctAnswer: '28',
    type: 'open'
  },
  {
    id: 'V-10',
    serie: 'V',
    number: 10,
    question: 'A tiene $180.00; B tiene 2/3 de lo que tiene A y C 1/2 de lo que tiene B, ¿cuánto tienen todos juntos?',
    correctAnswer: '360',
    type: 'open'
  },
  {
    id: 'V-11',
    serie: 'V',
    number: 11,
    question: 'Si un hombre corre 100 metros en 10 segundos ¿cuántos metros correrá como promedio 1/5 de segundo?',
    correctAnswer: '2',
    type: 'open'
  },
  {
    id: 'V-12',
    serie: 'V',
    number: 12,
    question: 'Un hombre gasta 1/4 de su sueldo en casa y alimentos y 4/8 en otros gastos ¿qué tanto por ciento de su sueldo ahorra?',
    correctAnswer: '25',
    type: 'open'
  },

  // SERIE VI - ANÁLISIS (SI/NO)
  {
    id: 'VI-1',
    serie: 'VI',
    number: 1,
    question: 'La higiene es esencial para la salud.',
    correctAnswer: 'SI',
    type: 'yes-no'
  },
  {
    id: 'VI-2',
    serie: 'VI',
    number: 2,
    question: 'Los taquígrafos usan el microscopio.',
    correctAnswer: 'NO',
    type: 'yes-no'
  },
  {
    id: 'VI-3',
    serie: 'VI',
    number: 3,
    question: 'Los tiranos son justos con sus inferiores.',
    correctAnswer: 'NO',
    type: 'yes-no'
  },
  {
    id: 'VI-4',
    serie: 'VI',
    number: 4,
    question: 'Las personas desamparadas están sujetas con frecuencia a la caridad.',
    correctAnswer: 'SI',
    type: 'yes-no'
  },
  {
    id: 'VI-5',
    serie: 'VI',
    number: 5,
    question: 'Las personas venerables son por lo común respetadas.',
    correctAnswer: 'SI',
    type: 'yes-no'
  },
  {
    id: 'VI-6',
    serie: 'VI',
    number: 6,
    question: 'Es el escorbuto un medicamento.',
    correctAnswer: 'NO',
    type: 'yes-no'
  },
  {
    id: 'VI-7',
    serie: 'VI',
    number: 7,
    question: 'Es la amonestación una clase de instrumento musical.',
    correctAnswer: 'NO',
    type: 'yes-no'
  },
  {
    id: 'VI-8',
    serie: 'VI',
    number: 8,
    question: 'Son los colores opacos preferidos para las banderas nacionales.',
    correctAnswer: 'NO',
    type: 'yes-no'
  },
  {
    id: 'VI-9',
    serie: 'VI',
    number: 9,
    question: 'Las cosas misteriosas son a veces pavorosas.',
    correctAnswer: 'SI',
    type: 'yes-no'
  },
  {
    id: 'VI-10',
    serie: 'VI',
    number: 10,
    question: 'Personas conscientes cometen alguna vez errores.',
    correctAnswer: 'SI',
    type: 'yes-no'
  },
  {
    id: 'VI-11',
    serie: 'VI',
    number: 11,
    question: 'Son carnívoros los carneros.',
    correctAnswer: 'NO',
    type: 'yes-no'
  },
  {
    id: 'VI-12',
    serie: 'VI',
    number: 12,
    question: 'Se dan asignaturas a los caballos.',
    correctAnswer: 'NO',
    type: 'yes-no'
  },
  {
    id: 'VI-13',
    serie: 'VI',
    number: 13,
    question: 'Las cartas anónimas llevan alguna vez firma de quien las escribe.',
    correctAnswer: 'NO',
    type: 'yes-no'
  },
  {
    id: 'VI-14',
    serie: 'VI',
    number: 14,
    question: 'Son discontinuos los sonidos intermitentes.',
    correctAnswer: 'SI',
    type: 'yes-no'
  },
  {
    id: 'VI-15',
    serie: 'VI',
    number: 15,
    question: 'Las enfermedades estimulan el buen juicio.',
    correctAnswer: 'NO',
    type: 'yes-no'
  },
  {
    id: 'VI-16',
    serie: 'VI',
    number: 16,
    question: 'Son siempre perversos los hechos premeditados.',
    correctAnswer: 'NO',
    type: 'yes-no'
  },
  {
    id: 'VI-17',
    serie: 'VI',
    number: 17,
    question: 'El contacto social tiende a reducir la timidez.',
    correctAnswer: 'SI',
    type: 'yes-no'
  },
  {
    id: 'VI-18',
    serie: 'VI',
    number: 18,
    question: 'Son enfermas las personas que tienen mal carácter.',
    correctAnswer: 'NO',
    type: 'yes-no'
  },
  {
    id: 'VI-19',
    serie: 'VI',
    number: 19,
    question: 'Se caracteriza generalmente el rencor por la persistencia.',
    correctAnswer: 'SI',
    type: 'yes-no'
  },
  {
    id: 'VI-20',
    serie: 'VI',
    number: 20,
    question: 'Meticuloso quiere decir lo mismo que cuidadoso.',
    correctAnswer: 'SI',
    type: 'yes-no'
  },

  // SERIE VII - ABSTRACCIÓN (analogías)
  {
    id: 'VII-1',
    serie: 'VII',
    number: 1,
    question: 'ABRIGO es a USAR como PAN es a:',
    options: ['comer', 'hambre', 'agua', 'cocinar'],
    correctAnswer: 'A',
    type: 'single'
  },
  {
    id: 'VII-2',
    serie: 'VII',
    number: 2,
    question: 'SEMANA es a MES como MES es a:',
    options: ['año', 'hora', 'minuto', 'siglo'],
    correctAnswer: 'A',
    type: 'single'
  },
  {
    id: 'VII-3',
    serie: 'VII',
    number: 3,
    question: 'LEÓN es a ANIMAL como ROSA es a:',
    options: ['olor', 'hoja', 'planta', 'espina'],
    correctAnswer: 'C',
    type: 'single'
  },
  {
    id: 'VII-4',
    serie: 'VII',
    number: 4,
    question: 'LIBERTAD es a INDEPENDENCIA como CAUTIVERIO es a:',
    options: ['negro', 'esclavitud', 'libre', 'sufrir'],
    correctAnswer: 'B',
    type: 'single'
  },
  {
    id: 'VII-5',
    serie: 'VII',
    number: 5,
    question: 'DECIR es a DIJO como ESTAR es a:',
    options: ['cantar', 'estuvo', 'hablando', 'cantó'],
    correctAnswer: 'B',
    type: 'single'
  },
  {
    id: 'VII-6',
    serie: 'VII',
    number: 6,
    question: 'LUNES es a MARTES como VIERNES es a:',
    options: ['semana', 'jueves', 'día', 'sábado'],
    correctAnswer: 'D',
    type: 'single'
  },
  {
    id: 'VII-7',
    serie: 'VII',
    number: 7,
    question: 'PLOMO es a PESADO como CORCHO es a:',
    options: ['botella', 'peso', 'ligero', 'flotar'],
    correctAnswer: 'C',
    type: 'single'
  },
  {
    id: 'VII-8',
    serie: 'VII',
    number: 8,
    question: 'ÉXITO es a ALEGRÍA como FRACASO es a:',
    options: ['tristeza', 'suerte', 'fracasar', 'trabajo'],
    correctAnswer: 'A',
    type: 'single'
  },
  {
    id: 'VII-9',
    serie: 'VII',
    number: 9,
    question: 'GATO es a TIGRE como PERRO es a:',
    options: ['lobo', 'ladrido', 'mordida', 'agarrar'],
    correctAnswer: 'A',
    type: 'single'
  },
  {
    id: 'VII-10',
    serie: 'VII',
    number: 10,
    question: '4 es a 16 como 5 es a:',
    options: ['7', '45', '35', '25'],
    correctAnswer: 'D',
    type: 'single'
  },
  {
    id: 'VII-11',
    serie: 'VII',
    number: 11,
    question: 'LLORAR es a REÍR como TRISTE es a:',
    options: ['muerte', 'alegre', 'mortaja', 'doctor'],
    correctAnswer: 'B',
    type: 'single'
  },
  {
    id: 'VII-12',
    serie: 'VII',
    number: 12,
    question: 'VENENO es a MUERTE como ALIMENTO es a:',
    options: ['comer', 'pájaro', 'vida', 'malo'],
    correctAnswer: 'C',
    type: 'single'
  },
  {
    id: 'VII-13',
    serie: 'VII',
    number: 13,
    question: '1 es a 3 como 9 es a:',
    options: ['18', '27', '36', '45'],
    correctAnswer: 'B',
    type: 'single'
  },
  {
    id: 'VII-14',
    serie: 'VII',
    number: 14,
    question: 'ALIMENTO es a HAMBRE como AGUA es a:',
    options: ['beber', 'claro', 'sed', 'puro'],
    correctAnswer: 'C',
    type: 'single'
  },
  {
    id: 'VII-15',
    serie: 'VII',
    number: 15,
    question: 'AQUÍ es a ALLÍ como ESTE es a:',
    options: ['estos', 'aquel', 'ese', 'entonces'],
    correctAnswer: 'B',
    type: 'single'
  },
  {
    id: 'VII-16',
    serie: 'VII',
    number: 16,
    question: 'TIGRE es a PELO como TRUCHA es a:',
    options: ['agua', 'pez', 'escama', 'nadar'],
    correctAnswer: 'C',
    type: 'single'
  },
  {
    id: 'VII-17',
    serie: 'VII',
    number: 17,
    question: 'PERVERTIDO es a DEPRAVADO como INCORRUPTO es a:',
    options: ['patria', 'honrado', 'canción', 'estudio'],
    correctAnswer: 'B',
    type: 'single'
  },
  {
    id: 'VII-18',
    serie: 'VII',
    number: 18,
    question: 'B es a D como SEGUNDO es a:',
    options: ['tercero', 'último', 'cuarto', 'posterior'],
    correctAnswer: 'C',
    type: 'single'
  },
  {
    id: 'VII-19',
    serie: 'VII',
    number: 19,
    question: 'ESTADO es a GOBERNADOR como EJÉRCITO es a:',
    options: ['marina', 'soldado', 'general', 'sargento'],
    correctAnswer: 'C',
    type: 'single'
  },
  {
    id: 'VII-20',
    serie: 'VII',
    number: 20,
    question: 'SUJETO es a PREDICADO como NOMBRE es a:',
    options: ['pronombre', 'adverbio', 'verbo', 'adjetivo'],
    correctAnswer: 'C',
    type: 'single'
  },

  // SERIE VIII - PLANEACIÓN (ordenar frases)
  {
    id: 'VIII-1',
    serie: 'VIII',
    number: 1,
    question: 'con crecen los niños edad la',
    correctAnswer: 'V',
    type: 'true-false'
  },
  {
    id: 'VIII-2',
    serie: 'VIII',
    number: 2,
    question: 'buena mar beber el para agua de es',
    correctAnswer: 'F',
    type: 'true-false'
  },
  {
    id: 'VIII-3',
    serie: 'VIII',
    number: 3,
    question: 'lo es paz la guerra opuesto la a',
    correctAnswer: 'V',
    type: 'true-false'
  },
  {
    id: 'VIII-4',
    serie: 'VIII',
    number: 4,
    question: 'caballos automóvil un que caminan los despacio más',
    correctAnswer: 'V',
    type: 'true-false'
  },
  {
    id: 'VIII-5',
    serie: 'VIII',
    number: 5,
    question: 'consejo a veces es buen seguir un difícil',
    correctAnswer: 'V',
    type: 'true-false'
  },
  {
    id: 'VIII-6',
    serie: 'VIII',
    number: 6,
    question: 'cuatrocientas todos páginas contienen libros los',
    correctAnswer: 'F',
    type: 'true-false'
  },
  {
    id: 'VIII-7',
    serie: 'VIII',
    number: 7,
    question: 'crecen las que fresas el más roble',
    correctAnswer: 'F',
    type: 'true-false'
  },
  {
    id: 'VIII-8',
    serie: 'VIII',
    number: 8,
    question: 'verdadera comparada no puede amistad ser la',
    correctAnswer: 'V',
    type: 'true-false'
  },
  {
    id: 'VIII-9',
    serie: 'VIII',
    number: 9,
    question: 'envidia la perjudiciales gula son y la',
    correctAnswer: 'V',
    type: 'true-false'
  },
  {
    id: 'VIII-10',
    serie: 'VIII',
    number: 10,
    question: 'nunca acciones premiadas las deben buenas ser',
    correctAnswer: 'F',
    type: 'true-false'
  },
  {
    id: 'VIII-11',
    serie: 'VIII',
    number: 11,
    question: 'exteriores engañan nunca apariencias las nos',
    correctAnswer: 'F',
    type: 'true-false'
  },
  {
    id: 'VIII-12',
    serie: 'VIII',
    number: 12,
    question: 'nunca es hombre las que acciones demuestran un lo',
    correctAnswer: 'F',
    type: 'true-false'
  },
  {
    id: 'VIII-13',
    serie: 'VIII',
    number: 13,
    question: 'ciertas siempre la muerte de causan clases enfermedades',
    correctAnswer: 'V',
    type: 'true-false'
  },
  {
    id: 'VIII-14',
    serie: 'VIII',
    number: 14,
    question: 'odio indeseables aversión sentimientos el son y la',
    correctAnswer: 'V',
    type: 'true-false'
  },
  {
    id: 'VIII-15',
    serie: 'VIII',
    number: 15,
    question: 'frecuentemente por juzgar podemos acciones hombres nosotros sus a los',
    correctAnswer: 'V',
    type: 'true-false'
  },
  {
    id: 'VIII-16',
    serie: 'VIII',
    number: 16,
    question: 'una es sábana sarapes tan nunca los calientes como',
    correctAnswer: 'V',
    type: 'true-false'
  },
  {
    id: 'VIII-17',
    serie: 'VIII',
    number: 17,
    question: 'nunca que descuidados los tropiezan son',
    correctAnswer: 'F',
    type: 'true-false'
  },

  // SERIE IX - ORGANIZACIÓN (palabra que no corresponde)
  {
    id: 'IX-1',
    serie: 'IX',
    number: 1,
    question: 'Seleccione la palabra que NO corresponde con las demás:',
    options: ['saltar', 'correr', 'brincar', 'pararse', 'caminar'],
    correctAnswer: 'D',
    type: 'single'
  },
  {
    id: 'IX-2',
    serie: 'IX',
    number: 2,
    question: 'Seleccione la palabra que NO corresponde con las demás:',
    options: ['monarquía', 'comunista', 'demócrata', 'anarquista', 'católico'],
    correctAnswer: 'E',
    type: 'single'
  },
  {
    id: 'IX-3',
    serie: 'IX',
    number: 3,
    question: 'Seleccione la palabra que NO corresponde con las demás:',
    options: ['muerte', 'duelo', 'paseo', 'pobreza', 'tristeza'],
    correctAnswer: 'C',
    type: 'single'
  },
  {
    id: 'IX-4',
    serie: 'IX',
    number: 4,
    question: 'Seleccione la palabra que NO corresponde con las demás:',
    options: ['carpintero', 'doctor', 'abogado', 'ingeniero', 'profesor'],
    correctAnswer: 'A',
    type: 'single'
  },
  {
    id: 'IX-5',
    serie: 'IX',
    number: 5,
    question: 'Seleccione la palabra que NO corresponde con las demás:',
    options: ['cama', 'silla', 'plato', 'sofá', 'mesa'],
    correctAnswer: 'C',
    type: 'single'
  },
  {
    id: 'IX-6',
    serie: 'IX',
    number: 6,
    question: 'Seleccione la palabra que NO corresponde con las demás:',
    options: ['Francisco', 'Santiago', 'Juan', 'Sara', 'Guillermo'],
    correctAnswer: 'D',
    type: 'single'
  },
  {
    id: 'IX-7',
    serie: 'IX',
    number: 7,
    question: 'Seleccione la palabra que NO corresponde con las demás:',
    options: ['duro', 'áspero', 'liso', 'suave', 'dulce'],
    correctAnswer: 'E',
    type: 'single'
  },
  {
    id: 'IX-8',
    serie: 'IX',
    number: 8,
    question: 'Seleccione la palabra que NO corresponde con las demás:',
    options: ['digestión', 'oído', 'vista', 'olfato', 'tacto'],
    correctAnswer: 'A',
    type: 'single'
  },
  {
    id: 'IX-9',
    serie: 'IX',
    number: 9,
    question: 'Seleccione la palabra que NO corresponde con las demás:',
    options: ['automóvil', 'bicicleta', 'guayín', 'telégrafo', 'tren'],
    correctAnswer: 'D',
    type: 'single'
  },
  {
    id: 'IX-10',
    serie: 'IX',
    number: 10,
    question: 'Seleccione la palabra que NO corresponde con las demás:',
    options: ['abajo', 'acá', 'reciente', 'arriba', 'allá'],
    correctAnswer: 'C',
    type: 'single'
  },
  {
    id: 'IX-11',
    serie: 'IX',
    number: 11,
    question: 'Seleccione la palabra que NO corresponde con las demás:',
    options: ['Hidalgo', 'Morelos', 'Bravo', 'Matamoros', 'Bolívar'],
    correctAnswer: 'E',
    type: 'single'
  },
  {
    id: 'IX-12',
    serie: 'IX',
    number: 12,
    question: 'Seleccione la palabra que NO corresponde con las demás:',
    options: ['danés', 'galgo', 'buldog', 'pequinés', 'longhorm'],
    correctAnswer: 'E',
    type: 'single'
  },
  {
    id: 'IX-13',
    serie: 'IX',
    number: 13,
    question: 'Seleccione la palabra que NO corresponde con las demás:',
    options: ['tela', 'algodón', 'lino', 'seda', 'lana'],
    correctAnswer: 'A',
    type: 'single'
  },
  {
    id: 'IX-14',
    serie: 'IX',
    number: 14,
    question: 'Seleccione la palabra que NO corresponde con las demás:',
    options: ['ira', 'odio', 'alegría', 'piedad', 'razonamiento'],
    correctAnswer: 'E',
    type: 'single'
  },
  {
    id: 'IX-15',
    serie: 'IX',
    number: 15,
    question: 'Seleccione la palabra que NO corresponde con las demás:',
    options: ['Edison', 'Franklin', 'Marconi', 'Fulton', 'Shakespeare'],
    correctAnswer: 'E',
    type: 'single'
  },
  {
    id: 'IX-16',
    serie: 'IX',
    number: 16,
    question: 'Seleccione la palabra que NO corresponde con las demás:',
    options: ['mariposa', 'halcón', 'avestruz', 'petirrojo', 'golondrina'],
    correctAnswer: 'A',
    type: 'single'
  },
  {
    id: 'IX-17',
    serie: 'IX',
    number: 17,
    question: 'Seleccione la palabra que NO corresponde con las demás:',
    options: ['dar', 'prestar', 'perder', 'ahorrar', 'derrochar'],
    correctAnswer: 'D',
    type: 'single'
  },
  {
    id: 'IX-18',
    serie: 'IX',
    number: 18,
    question: 'Seleccione la palabra que NO corresponde con las demás:',
    options: ['Australia', 'Cuba', 'Córcega', 'Irlanda', 'España'],
    correctAnswer: 'E',
    type: 'single'
  },

  // SERIE X - ATENCIÓN (series numéricas)
  {
    id: 'X-1',
    serie: 'X',
    number: 1,
    question: '8 7 6 5 4 3 _ _',
    correctAnswer: '2 - 1',
    type: 'open'
  },
  {
    id: 'X-2',
    serie: 'X',
    number: 2,
    question: '3 8 13 18 23 28 _ _',
    correctAnswer: '33-38',
    type: 'open'
  },
  {
    id: 'X-3',
    serie: 'X',
    number: 3,
    question: '1 2 4 8 16 32 _ _',
    correctAnswer: '64-128',
    type: 'open'
  },
  {
    id: 'X-4',
    serie: 'X',
    number: 4,
    question: '8 8 6 6 4 4 _ _',
    correctAnswer: '2-2',
    type: 'open'
  },
  {
    id: 'X-5',
    serie: 'X',
    number: 5,
    question: '11 3/4 12 12 1/4 12 1/2 12 3/4 _ _',
    correctAnswer: '13- 13 1/4',
    type: 'open'
  },
  {
    id: 'X-6',
    serie: 'X',
    number: 6,
    question: '8 9 12 13 16 17 _ _',
    correctAnswer: '20- 21',
    type: 'open'
  },
  {
    id: 'X-7',
    serie: 'X',
    number: 7,
    question: '16 8 4 2 1 1/2 _ _',
    correctAnswer: '¼ - 1/8',
    type: 'open'
  },
  {
    id: 'X-8',
    serie: 'X',
    number: 8,
    question: '31.3 40.3 49.3 58.3 67.3 76.3 _ _',
    correctAnswer: '85.3-94.3',
    type: 'open'
  },
  {
    id: 'X-9',
    serie: 'X',
    number: 9,
    question: '3 5 4 6 5 7 _ _',
    correctAnswer: '6- 8',
    type: 'open'
  },
  {
    id: 'X-10',
    serie: 'X',
    number: 10,
    question: '7 11 15 16 20 24 25 29 _ _',
    correctAnswer: '33-34',
    type: 'open'
  },
  {
    id: 'X-11',
    serie: 'X',
    number: 11,
    question: '1/25 1/5 1 5 _ _',
    correctAnswer: '25- 125',
    type: 'open'
  }
];

// Instrucciones por serie
export const SERIES_INSTRUCTIONS = {
  I: 'Ponga la letra correspondiente a la palabra que complete correctamente la oración.',
  II: 'Ponga la letra correspondiente a la palabra que complete la oración.',
  III: 'Cuando las dos palabras signifiquen lo mismo, ponga la letra I de igual; cuando signifiquen lo opuesto, ponga la letra O.',
  IV: 'Anote las letras correspondientes a las dos palabras que indican algo que SIEMPRE TIENE EL SUJETO. Anote solamente dos para cada renglón.',
  V: 'Encuentre las respuestas lo más pronto posible.',
  VI: 'Anote SI o NO según corresponda a cada afirmación.',
  VII: 'Complete las analogías seleccionando la opción correcta.',
  VIII: 'Las palabras de cada oración están mezcladas. Si el significado de la oración ordenada es VERDADERO, anote V; si es FALSO anote F.',
  IX: 'Ponga la letra de la palabra que no corresponda con las demás del renglón.',
  X: 'Procure encontrar la forma en que están hechas las series. Escriba los dos números que faltan.'
};

// Ejemplos por serie
export const SERIES_EXAMPLES = {
  I: {
    question: 'El iniciador de nuestra guerra de independencia fue:',
    options: ['Morelos', 'Zaragoza', 'Iturbide', 'Hidalgo'],
    answer: 'd'
  },
  II: {
    question: '¿Por qué compramos relojes? Porque:',
    options: ['Nos gusta oírlos sonar', 'Tienen manecillas', 'Nos indican las horas'],
    answer: 'c'
  },
  III: {
    question1: 'tirar - arrojar',
    answer1: 'I',
    question2: 'norte - sur',
    answer2: 'O'
  },
  IV: {
    question: 'Un hombre tiene siempre:',
    options: ['cuerpo', 'gorra', 'guantes', 'boca', 'dinero'],
    answer: ['a', 'd']
  },
  V: {
    question1: 'Si 3 manzanas cuestan $6 ¿Cuánto cuestan 5 manzanas?',
    answer1: '$10',
    question2: 'Un hombre camina 4 km en 1 hora ¿Cuántos km camina en 3 horas?',
    answer2: '12 km'
  },
  VI: {
    question1: 'Los gatos son animales.',
    answer1: 'SI',
    question2: 'Los peces vuelan.',
    answer2: 'NO'
  },
  VII: {
    question1: 'El OÍDO es a OÍR como el OJO es a:',
    options1: ['mesa', 'ver', 'mano', 'jugar'],
    answer1: 'b',
    question2: 'El SOMBRERO es a la CABEZA como el ZAPATO es a:',
    options2: ['brazo', 'abrigo', 'pie', 'pierna'],
    answer2: 'c'
  },
  VIII: {
    question1: 'oír son los para oídos',
    answer1: 'V',
    question2: 'comer para pólvora la buena es',
    answer2: 'F'
  },
  IX: {
    question1: ['bala', 'cañón', 'pistola', 'espada', 'lápiz'],
    answer1: 'e',
    question2: ['Canadá', 'Sonora', 'China', 'India', 'Francia'],
    answer2: 'b'
  },
  X: {
    question1: '5 10 15 20 _ _',
    answer1: '25 30',
    question2: '20 18 16 14 12 _ _',
    answer2: '10 8'
  }
};