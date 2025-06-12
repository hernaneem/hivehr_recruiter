// Estructura de datos para el Test MOSS
export interface MossQuestion {
  id: number;
  text: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
}

export interface MossArea {
  code: string;
  name: string;
  description: string;
  questionIds: number[];
}

export interface MossResult {
  area: string;
  score: number;
  percentage: number;
  level: string;
}

// Respuestas correctas para cada pregunta
export const MOSS_ANSWER_KEY: Record<number, string> = {
  1: 'c', 2: 'b', 3: 'd', 4: 'b', 5: 'b',
  6: 'b', 7: 'b', 8: 'b', 9: 'c', 10: 'c',
  11: 'a', 12: 'c', 13: 'd', 14: 'd', 15: 'd',
  16: 'd', 17: 'b', 18: 'd', 19: 'c', 20: 'b',
  21: 'a', 22: 'a', 23: 'a', 24: 'd', 25: 'b',
  26: 'c', 27: 'a', 28: 'c', 29: 'a', 30: 'd'
};

// Áreas evaluadas por el test
export const MOSS_AREAS: MossArea[] = [
  {
    code: 'HS',
    name: 'Habilidad en Supervisión',
    description: 'Capacidad para supervisar efectivamente a la gente, mantener la importancia del propósito y crear compromiso.',
    questionIds: [2, 3, 16, 18, 24, 30]
  },
  {
    code: 'CDRH',
    name: 'Capacidad de Decisiones en las Relaciones Humanas',
    description: 'Flexibilidad para tomar decisiones en cuestiones relacionadas con el manejo de personal y relaciones laborales.',
    questionIds: [4, 6, 20, 23, 29]
  },
  {
    code: 'CEPI',
    name: 'Capacidad de Evaluación de Problemas Interpersonales',
    description: 'Habilidad para identificar problemas y oportunidades, evaluar opciones y encontrar soluciones efectivas.',
    questionIds: [7, 9, 12, 14, 19, 21, 26, 27]
  },
  {
    code: 'HERI',
    name: 'Habilidad para Establecer Relaciones Interpersonales',
    description: 'Capacidad para establecer relaciones profundas y significativas, mostrando comprensión y simpatía.',
    questionIds: [1, 10, 11, 13, 25]
  },
  {
    code: 'SCTRI',
    name: 'Sentido Común y Tacto en las Relaciones Interpersonales',
    description: 'Habilidad para resolver problemas con astucia y madurez, manteniendo buenas relaciones laborales.',
    questionIds: [5, 8, 15, 17, 22, 28]
  }
];

// Niveles de evaluación
export const MOSS_LEVELS = [
  { min: 98, max: 100, level: 'Muy Superior' },
  { min: 83, max: 97, level: 'Superior' },
  { min: 64, max: 82, level: 'Medio Superior' },
  { min: 42, max: 63, level: 'Medio' },
  { min: 27, max: 41, level: 'Medio Inferior' },
  { min: 7, max: 26, level: 'Inferior' },
  { min: 2, max: 6, level: 'Deficiente' }
];

// Preguntas del test
export const MOSS_QUESTIONS: MossQuestion[] = [
  {
    id: 1,
    text: "Se le ha asignado un puesto en una gran empresa. La mejor forma de establecer relaciones amistosas y cordiales con sus nuevos compañeros será:",
    options: {
      a: "Evitando tomar nota de los errores en que incurran.",
      b: "Hablando bien de ellos al jefe.",
      c: "Mostrando interés en el trabajo de ellos.",
      d: "Pidiéndoles les permitan hacer los trabajos que usted puede hacer mejor."
    }
  },
  {
    id: 2,
    text: "Tiene usted un empleado muy eficiente pero que constantemente se queja del trabajo, sus quejas producen mal efecto en los demás empleados, lo mejor sería:",
    options: {
      a: "Pedir a los demás empleados que no hagan caso.",
      b: "Averiguar la causa de esa actitud y procurar su modificación.",
      c: "Cambiarlo de departamento donde quede a cargo de otro jefe.",
      d: "Permitirle planear lo más posible acerca de su trabajo."
    }
  },
  {
    id: 3,
    text: "Un empleado de 60 años de edad que ha sido leal a la empresa durante 25 años se queja del exceso de trabajo. Lo mejor sería:",
    options: {
      a: "Decirle que vuelva a su trabajo porque si no será desvinculado.",
      b: "Despedirlo, substituyéndolo por alguien más joven.",
      c: "Darle un aumento de sueldo que evite que continúe quejándose.",
      d: "Aminorar su trabajo."
    }
  },
  {
    id: 4,
    text: "Uno de los socios, sin autoridad sobre usted le ordena haga algo en forma bien distinta de lo que planeaba. ¿Qué haría usted?",
    options: {
      a: "Acatar la orden y no armar mayor revuelo.",
      b: "Ignorar las indicaciones y hacerlo según había planeado.",
      c: "Decirle que esto no es asunto que a usted le interesa y que usted hará las cosas a su modo.",
      d: "Decirle que lo haga él mismo."
    }
  },
  {
    id: 5,
    text: "Usted visita a un amigo íntimo que ha estado enfermo por algún tiempo. Lo mejor sería:",
    options: {
      a: "Platicarle sus diversiones recientes.",
      b: "Platicarle nuevas cosas referentes a sus amigos mutuos.",
      c: "Comentar su enfermedad.",
      d: "Enfatizar lo mucho que le apena verle enfermo."
    }
  },
  {
    id: 6,
    text: "Trabaja usted en una industria y su jefe quiere que tome un curso relacionado con su carrera pero que sea compatible con el horario de su trabajo. Lo mejor sería:",
    options: {
      a: "Continuar normalmente su carrera e informar al jefe sí pregunta.",
      b: "Explicar la situación u obtener su opinión en cuanto a la importancia relativa de ambas situaciones.",
      c: "Dejar la escuela en relación a los intereses del trabajo.",
      d: "Asistir en forma alterna y no hacer comentarios."
    }
  },
  {
    id: 7,
    text: "Un agente viajero con 15 años de antigüedad decide, presionado por su familia sentar raíces. Se le cambia a las oficinas generales. Es de esperar que:",
    options: {
      a: "Guste de los descansos del trabajo de oficina.",
      b: "Se sienta inquieto por la rutina de la oficina.",
      c: "Busque otro trabajo.",
      d: "Resulte muy ineficiente en el trabajo de oficina."
    }
  },
  {
    id: 8,
    text: "Tiene dos invitados a cenar, el uno radical y el otro conservador. Surge una acalorada discusión respecto a la política. Lo mejor sería:",
    options: {
      a: "Tomar partido.",
      b: "Intentar cambiar de tema.",
      c: "Intervenir dando los propios puntos de vista y mostrar donde ambos pecan de extremosos.",
      d: "Pedir cambien de tema para evitar mayor discusión."
    }
  },
  {
    id: 9,
    text: "Un joven invita a una dama al teatro, al llegar se percata de que ha olvidado la cartera. Sería mejor:",
    options: {
      a: "Tratar de obtener boletos dejando el reloj en prenda.",
      b: "Buscar a algún amigo a quien pedir prestado.",
      c: "Decidir de acuerdo con ella lo procedente.",
      d: "Dar una excusa plausible para ir a casa por dinero."
    }
  },
  {
    id: 10,
    text: "Usted ha tenido experiencia como vendedor y acaba de conseguir de una tienda un empleo. La mejor forma de relacionarse con los empleados del departamento seria.",
    options: {
      a: "Permitirle hacer la mayoría de las ventas por unos días en tanto observa sus métodos.",
      b: "Tratar de instituir los métodos que anteriormente le fueron útiles.",
      c: "Adaptarse mejor a las condiciones y aceptar consejos de sus compañeros.",
      d: "Pedir al jefe todo el consejo necesario."
    }
  },
  {
    id: 11,
    text: "Es usted un joven empleado que va a comer con una maestra a quien conoce superficialmente. Lo mejor sería iniciar la conversación acerca de:",
    options: {
      a: "Algún tópico de actualidad.",
      b: "Algún aspecto interesante de su propio trabajo.",
      c: "Las tendencias actuales en el terreno docente.",
      d: "Las sociedades de padres de familia."
    }
  },
  {
    id: 12,
    text: "Una señora de especiales méritos que por largo tiempo ha dirigido trabajos benéficos dejando las labores de su casa a cargo de la servidumbre, se cambia a otra población. Es de esperarse que ella:",
    options: {
      a: "Se sienta insatisfecha de su nuevo hogar.",
      b: "Se interese más por los trabajos domésticos.",
      c: "Intervenga poco a poco en la vida de la comunidad, continuando así sus intereses.",
      d: "Adopte nuevos intereses en la nueva comunidad."
    }
  },
  {
    id: 13,
    text: "Quiere pedirle un favor a un conocido con quien tiene poca confianza. La mejor forma de lograrlo sería:",
    options: {
      a: "Haciéndole creer que será él quien se beneficie más.",
      b: "Enfatice la importancia que para usted tiene que se le conceda.",
      c: "Ofrecer algo de retribución.",
      d: "Decir que lo que desea en forma breve indicando los motivos."
    }
  },
  {
    id: 14,
    text: "Un joven de 24 años gasta bastante tiempo y dinero en diversiones, solo ha hecho ver que así no logrará al éxito en el trabajo. Probablemente cambie sus costumbres. Si:",
    options: {
      a: "Sus hábitos nocturnos lesionan su salud.",
      b: "Sus amigos enfatizan el daño que se hace a sí mismo.",
      c: "Su jefe se da cuenta y lo previene.",
      d: "Se interesa en el desarrollo de alguna fase de su trabajo."
    }
  },
  {
    id: 15,
    text: "Tras de haber hecho un buen número de favores a un amigo, este empieza a dar por hecho que usted será quien le resuelva todas sus pequeñas dificultades. La mejor forma de readaptar la situación sin ofenderle sería:",
    options: {
      a: "Explicar el daño que se está causando.",
      b: "Pedir a un amigo mutuo que trate de arreglar las cosas.",
      c: "Ayudarle una vez más pero de tal manera que sienta que mejor hubiera sido no haberlo solicitado.",
      d: "Darle una excusa para no seguir ayudándole."
    }
  },
  {
    id: 16,
    text: "Una persona recién ascendida a un mejor puesto de autoridad lograría mejor sus metas y la buena voluntad de los empleados:",
    options: {
      a: "Tratando de que cada empleado entienda qué es la verdadera eficiencia.",
      b: "Ascendiendo cuanto antes a quienes considere lo merezcan.",
      c: "Preguntando confidencialmente a cada empleado en cuanto a los cambios que estiman necesarios.",
      d: "Seguir los sistemas del anterior jefe y gradualmente hacer los cambios necesarios."
    }
  },
  {
    id: 17,
    text: "Vive a 15 km. del centro y ha ofrecido llevar de regreso a un amigo a las 16:00 p.m. él lo espera desde las 15:00 y a las 16:00 horas usted se entera que no podrá salir antes de las 17:30, sería mejor:",
    options: {
      a: "Pedirle un taxi.",
      b: "Explicarle y dejar que él decida.",
      c: "Pedirle que espere hasta las 17:30 horas.",
      d: "Proponerle que se lleve su auto."
    }
  },
  {
    id: 18,
    text: "Es usted un ejecutivo y dos de sus empleados se llevan mal, ambos son eficientes. Lo mejor sería:",
    options: {
      a: "Despedir al menos eficiente.",
      b: "Dar trabajo en común que a ambos interese.",
      c: "Hacerles ver el daño que se hacen.",
      d: "Darles trabajos distintos."
    }
  },
  {
    id: 19,
    text: "El señor González ha estado conservando su puesto subordinado por 10 años, desempeña su trabajo callado y confidencialmente y se le extrañará cuando se vaya. De obtener el trabajo en otra empresa, muy probablemente:",
    options: {
      a: "Asuma fácilmente responsabilidad como supervisor.",
      b: "Haga ver de inmediato su valor.",
      c: "Sea lento para abrirse las necesarias oportunidades.",
      d: "Renuncie ante la más ligera crítica de su trabajo."
    }
  },
  {
    id: 20,
    text: "Va usted a ser maestro de ceremonias, en una cena el próximo sábado día en que por la mañana, debido a enfermedad de su familia, se ve imposibilitado para asistir lo mejor sería:",
    options: {
      a: "Cancelar la cena.",
      b: "Encontrar quien lo sustituya.",
      c: "Detallar los planes que tenía y evitarlos.",
      d: "Enviar una nota explicando la causa de su ausencia."
    }
  },
  {
    id: 21,
    text: "En igualdad de circunstancias el empleado que mejor se adapta a un nuevo puesto es aquel que:",
    options: {
      a: "Ha sido bueno en puestos anteriores.",
      b: "Ha tenido éxito durante 10 años en su puesto.",
      c: "Tiene sus propias ideas e invariablemente se rige por ellas.",
      d: "Cuenta con una buena recomendación de su jefe anterior."
    }
  },
  {
    id: 22,
    text: "Un conocido le platica acerca de una afición que él tiene, su conversación le aburre. Lo mejor sería:",
    options: {
      a: "Escuchar de manera cortés, pero aburrida.",
      b: "Escuchar con fingido interés.",
      c: "Decirle francamente que el tema no le interesa.",
      d: "Mirar el reloj con impaciencia."
    }
  },
  {
    id: 23,
    text: "Es usted un empleado ordinario en una oficina grande. El jefe entra cuando usted lee en vez de trabajar. Lo mejor sería:",
    options: {
      a: "Doblar el periódico y volver a trabajo.",
      b: "Pretender que obtiene recortes necesarios al trabajo.",
      c: "Tratar de interesar al jefe leyéndole un encabezado importante.",
      d: "Seguir leyendo sin mostrar embarazo."
    }
  },
  {
    id: 24,
    text: "Es usted un maestro de primaria. Camino a la escuela tras de la primera nevada, algunos de sus alumnos lanzan bolas de nieve. Desde el punto de vista de la buena administración de la escolar, usted debería:",
    options: {
      a: "Castigarle ahí mismo por su indisciplina.",
      b: "Decirles que de volverlo a hacer los castigará.",
      c: "Pasar la queja a sus padres.",
      d: "Tomarlo como broma y no hacer caso al respecto."
    }
  },
  {
    id: 25,
    text: "Preside el Comité de Mejoras Materiales en su colonia; las últimas reuniones han sido de escasa asistencia. Se mejoraría la asistencia:",
    options: {
      a: "Visitando vecinos prominentes explicándoles los problemas.",
      b: "Avisar de un programa interesante para la reunión.",
      c: "Poner avisos en los lugares públicos.",
      d: "Enviar avisos personales."
    }
  },
  {
    id: 26,
    text: "Salinas, eficiente, pero de esos que \"todo lo saben\", critica a Montoya, el jefe opina que la idea de Montoya ahorra tiempo. Probablemente Salinas:",
    options: {
      a: "Pida otro trabajo al jefe.",
      b: "Lo haga a su modo sin comentarios.",
      c: "Lo haga con Montoya, pero siga criticándolo.",
      d: "Lo haga con Montoya, pero mal a propósito."
    }
  },
  {
    id: 27,
    text: "Un hombre de 64 años tuvo algún éxito cuando joven como político, sus modos directos le han impedido descollar los últimos 20 años, lo más probable es que:",
    options: {
      a: "Persista en su manera de ser.",
      b: "Cambie para lograr éxito.",
      c: "Forme un nuevo partido político.",
      d: "Abandone la política por inmoral."
    }
  },
  {
    id: 28,
    text: "Es usted un joven que encuentra en la calle a una mujer de más edad a quien apenas conoce y que parece haber estado llorando. Lo mejor sería:",
    options: {
      a: "Preguntarle por qué está triste.",
      b: "Pasarle el brazo por el hombro y consolarla.",
      c: "Simular no advertir su pena.",
      d: "Simular no haberla visto."
    }
  },
  {
    id: 29,
    text: "Un compañero flojea de tal manera que usted le toca más de lo que le corresponde. La mejor forma de conservar las relaciones sería:",
    options: {
      a: "Explicar el caso al jefe cortésmente.",
      b: "Cortésmente indicarle que debe hacer lo que le corresponde o que usted se quejara con el jefe.",
      c: "Hacer tanto como pueda eficientemente y no decir nada del caso al jefe.",
      d: "Hacer lo suyo y dejar pendiente lo que el compañero no haga."
    }
  },
  {
    id: 30,
    text: "Se le ha asignado un puesto ejecutivo, en una organización. Para ganar el respeto y la admiración de sus subordinados, sin perjuicio de sus planes, habría que:",
    options: {
      a: "Ceder en todos los pequeños puntos posibles.",
      b: "Tratar de convencerlos de todas sus ideas.",
      c: "Ceder parcialmente en todas las cuestiones importantes.",
      d: "Abogar por muchas reformas."
    }
  }
]; 