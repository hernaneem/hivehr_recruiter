import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Brain, Clock, CheckCircle, ArrowLeft, ArrowRight, AlertTriangle } from 'lucide-react';
import { useCleaver } from '../contexts/CleaverContext';
import type { CleaverTest } from '../contexts/CleaverContext';

// Grupos de palabras del test Cleaver (basado en el manual oficial)
const testGroups = [
  {
    id: 1,
    words: ["Aventurero", "Adaptable", "Animoso", "Atento"]
  },
  {
    id: 2,
    words: ["Persistente", "Juguetón", "Abnegado", "Obstinado"]
  },
  {
    id: 3,
    words: ["Sumiso", "Obsecuente", "Retraído", "Resistente"]
  },
  {
    id: 4,
    words: ["Considerado", "Controlado", "Competitivo", "Convincente"]
  },
  {
    id: 5,
    words: ["Aventurado", "Preciso", "Nervioso", "Adaptable"]
  },
  {
    id: 6,
    words: ["Agresivo", "Almable", "Resignado", "Atrevido"]
  },
  {
    id: 7,
    words: ["Ecuánime", "Efusivo", "Discorde", "Riguroso"]
  },
  {
    id: 8,
    words: ["Modesto", "Tolerante", "Vigoroso", "Cautivador"]
  },
  {
    id: 9,
    words: ["Combativo", "Deliberado", "Cordial", "Jovial"]
  },
  {
    id: 10,
    words: ["Docil", "Atractivo", "Firme", "Exacto"]
  },
  {
    id: 11,
    words: ["Exigente", "Estable", "Extrovertido", "Decidido"]
  },
  {
    id: 12,
    words: ["Cauteloso", "Determinado", "Convincente", "Bonachón"]
  },
  {
    id: 13,
    words: ["Dispuesto", "Encantador", "Temeroso", "Insistente"]
  },
  {
    id: 14,
    words: ["Inquieto", "Impresionable", "Disconforme", "Indulgente"]
  },
  {
    id: 15,
    words: ["Reposado", "Vigoroso", "Palabrero", "Bonachón"]
  },
  {
    id: 16,
    words: ["Agradable", "Osado", "Ordenado", "Firme"]
  },
  {
    id: 17,
    words: ["Temeroso", "Optimista", "Bondadoso", "Extrovertido"]
  },
  {
    id: 18,
    words: ["Preciso", "Dominante", "Estimulante", "Buen carácter"]
  },
  {
    id: 19,
    words: ["Impaciente", "Calmoso", "Histriónico", "Tímido"]
  },
  {
    id: 20,
    words: ["Persistente", "Considerado", "Equilibrado", "Cautivador"]
  },
  {
    id: 21,
    words: ["Amistoso", "Valiente", "Comedido", "Sociable"]
  },
  {
    id: 22,
    words: ["Diplomático", "Audaz", "Refinado", "Satisfecho"]
  },
  {
    id: 23,
    words: ["Tolerante", "Seguro de sí", "Cortés", "Convincente"]
  },
  {
    id: 24,
    words: ["Resignado", "Influyente", "Tranquilo", "Habitual"]
  }
];

interface TestResponse {
  group_number: number;
  most_selected: number;
  least_selected: number;
}

const CleaverTestInterface = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { getTestByToken, completeTest } = useCleaver();
  
  const [test, setTest] = useState<CleaverTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentGroup, setCurrentGroup] = useState(0);
  const [responses, setResponses] = useState<TestResponse[]>([]);
  const [mostSelected, setMostSelected] = useState<number | null>(null);
  const [leastSelected, setLeastSelected] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadTest = async () => {
      if (!token) {
        setError('Token de test no válido');
        setLoading(false);
        return;
      }

      try {
        const testData = await getTestByToken(token);
        if (!testData) {
          setError('El test no existe, ha expirado o ya fue completado');
        } else if (testData.status === 'completed') {
          setError('Este test ya fue completado');
        } else if (testData.status === 'expired') {
          setError('Este test ha expirado');
        } else {
          setTest(testData);
          setStartTime(new Date());
        }
      } catch (err) {
        setError('Error cargando el test');
      } finally {
        setLoading(false);
      }
    };

    loadTest();
  }, [token, getTestByToken]);

  // Cargar respuesta existente cuando cambie el grupo
  useEffect(() => {
    const existingResponse = responses.find(r => r.group_number === currentGroup + 1);
    if (existingResponse) {
      setMostSelected(existingResponse.most_selected - 1);
      setLeastSelected(existingResponse.least_selected - 1);
    } else {
      setMostSelected(null);
      setLeastSelected(null);
    }
  }, [currentGroup, responses]);

  const handleWordSelection = (wordIndex: number, type: 'most' | 'least') => {
    if (type === 'most') {
      if (mostSelected === wordIndex) {
        setMostSelected(null);
      } else {
        setMostSelected(wordIndex);
        if (leastSelected === wordIndex) {
          setLeastSelected(null);
        }
      }
    } else {
      if (leastSelected === wordIndex) {
        setLeastSelected(null);
      } else {
        setLeastSelected(wordIndex);
        if (mostSelected === wordIndex) {
          setMostSelected(null);
        }
      }
    }
  };

  const canProceed = () => {
    return mostSelected !== null && leastSelected !== null && mostSelected !== leastSelected;
  };

  const saveCurrentResponse = (callback?: () => void) => {
    if (!canProceed()) {
      callback && callback();
      return;
    }

    const newResponse: TestResponse = {
      group_number: currentGroup + 1,
      most_selected: mostSelected! + 1, // +1 porque las posiciones empiezan en 1
      least_selected: leastSelected! + 1
    };

    setResponses(prevResponses => {
      const updatedResponses = [...prevResponses];
      const existingIndex = updatedResponses.findIndex(r => r.group_number === currentGroup + 1);
      
      if (existingIndex >= 0) {
        updatedResponses[existingIndex] = newResponse;
      } else {
        updatedResponses.push(newResponse);
      }
      
      callback && callback();
      return updatedResponses;
    });
  };

  const handleNext = () => {
    if (!canProceed()) return;

    // Guardar la respuesta actual y luego navegar
    saveCurrentResponse(() => {
      if (currentGroup < testGroups.length - 1) {
        setCurrentGroup(currentGroup + 1);
      }
    });
  };

  const handlePrevious = () => {
    if (currentGroup > 0) {
      // Primero guardar la respuesta actual si está completa, luego navegar
      saveCurrentResponse(() => {
        setCurrentGroup(currentGroup - 1);
      });
    }
  };

  const getAllResponses = () => {
    // Incluir la respuesta actual si está completa
    let allResponses = [...responses];
    
    if (canProceed()) {
      const currentResponse: TestResponse = {
        group_number: currentGroup + 1,
        most_selected: mostSelected! + 1,
        least_selected: leastSelected! + 1
      };
      
      const existingIndex = allResponses.findIndex(r => r.group_number === currentGroup + 1);
      if (existingIndex >= 0) {
        allResponses[existingIndex] = currentResponse;
      } else {
        allResponses.push(currentResponse);
      }
    }
    
    return allResponses;
  };

  const handleSubmit = async () => {
    if (!test) return;

    // Guardar respuesta actual antes de enviar
    if (canProceed()) {
      saveCurrentResponse();
    }

    const finalResponses = getAllResponses();
    
    if (finalResponses.length !== testGroups.length) {
      alert(`Faltan respuestas. Has completado ${finalResponses.length} de ${testGroups.length} grupos.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await completeTest(test.id, finalResponses);
      
      // Navegar a página de confirmación
      navigate(`/cleaver-test/${token}/completed`);
    } catch (err) {
      alert('Error enviando el test. Por favor, inténtalo de nuevo.');
      setIsSubmitting(false);
    }
  };

  const getElapsedTime = () => {
    if (!startTime) return '0:00';
    const now = new Date();
    const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
          <AlertTriangle className="text-red-400 w-16 h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Test No Disponible</h1>
          <p className="text-red-300 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  const currentGroupData = testGroups[currentGroup];
  const progress = ((currentGroup + 1) / testGroups.length) * 100;
  const isLastGroup = currentGroup === testGroups.length - 1;
  
  // Verificar si todas las respuestas están completas (incluyendo la actual)
  const allCompleted = () => {
    const allResponses = getAllResponses();
    return allResponses.length === testGroups.length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Test Cleaver DISC</h1>
                <p className="text-white/70">{test.candidate?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-white/70">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{getElapsedTime()}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex justify-between text-sm text-white/70">
            <span>Grupo {currentGroup + 1} de {testGroups.length}</span>
            <span>{Math.round(progress)}% completado</span>
          </div>
        </div>

        {/* Test Interface */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              Grupo {currentGroup + 1}
            </h2>
            <p className="text-white/70 mb-6">
              Selecciona la palabra que <strong className="text-green-400">MÁS te describe</strong> y 
              la que <strong className="text-red-400">MENOS te describe</strong>
            </p>
          </div>

          {/* Words Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {currentGroupData.words.map((word, index) => (
              <div key={index} className="relative">
                <div 
                  className={`
                    p-6 rounded-xl border-2 transition-all cursor-pointer text-center
                    ${mostSelected === index 
                      ? 'bg-green-500/30 border-green-400 text-green-300' 
                      : leastSelected === index 
                        ? 'bg-red-500/30 border-red-400 text-red-300'
                        : 'bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/40'
                    }
                  `}
                >
                  <div className="text-lg font-medium mb-3">{word}</div>
                  
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => handleWordSelection(index, 'most')}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-all
                        ${mostSelected === index
                          ? 'bg-green-500 text-white'
                          : 'bg-green-500/20 text-green-300 hover:bg-green-500/40'
                        }
                      `}
                    >
                      + MÁS
                    </button>
                    
                    <button
                      onClick={() => handleWordSelection(index, 'least')}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-all
                        ${leastSelected === index
                          ? 'bg-red-500 text-white'
                          : 'bg-red-500/20 text-red-300 hover:bg-red-500/40'
                        }
                      `}
                    >
                      - MENOS
                    </button>
                  </div>
                </div>

                {/* Selection indicators */}
                {mostSelected === index && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    +
                  </div>
                )}
                {leastSelected === index && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    -
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Validation Message */}
          {!canProceed() && (mostSelected !== null || leastSelected !== null) && (
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-6 text-center">
              <p className="text-yellow-300">
                ⚠️ Debes seleccionar una palabra que MÁS te describe y otra que MENOS te describe
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentGroup === 0}
              className={`
                flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all
                ${currentGroup === 0
                  ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                }
              `}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            <div className="text-center">
              <div className="text-white/70 text-sm">
                Respuestas: {getAllResponses().length} / {testGroups.length}
              </div>
            </div>

            {!isLastGroup ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`
                  flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all
                  ${!canProceed()
                    ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                  }
                `}
              >
                <span>Siguiente</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!allCompleted() || isSubmitting}
                className={`
                  flex items-center space-x-2 px-8 py-3 rounded-lg font-medium transition-all
                  ${!allCompleted() || isSubmitting
                    ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
                  }
                `}
              >
                <CheckCircle className="w-4 h-4" />
                <span>{isSubmitting ? 'Enviando...' : 'Finalizar Test'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 mt-6">
          <p className="text-blue-300 text-sm text-center">
            💡 <strong>Consejo:</strong> Responde de forma espontánea según tu comportamiento natural en el trabajo
          </p>
        </div>
      </div>
    </div>
  );
};

export default CleaverTestInterface; 