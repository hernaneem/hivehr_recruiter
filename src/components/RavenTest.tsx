import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRaven } from '../contexts/RavenContext';
import { Loader2 } from 'lucide-react';

interface RavenTestProps {
  candidateId: string;
  jobId?: string;
}

const RavenTest: React.FC<RavenTestProps> = ({ candidateId, jobId }) => {
  const {
    items,
    currentIndex,
    timeRemaining,
    answers,
    loading,
    error,
    testToken,
    startTest,
    submitAnswer,
    nextItem,
    previousItem,
  } = useRaven();

  const navigate = useNavigate();

  useEffect(() => {
    if (!testToken && candidateId) {
      startTest(candidateId, jobId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateId, testToken]);

  if (loading || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-white space-y-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p>Cargando prueba Raven...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-400 space-y-4">
        <p>Error: {error}</p>
      </div>
    );
  }

  const item = items[currentIndex];
  const selectedAnswer = answers.find((a) => a.item_number === item.item_number)?.answer;

  const onSelect = async (answer: number) => {
  await submitAnswer(answer);
  if (currentIndex < items.length - 1) {
    nextItem();
  } else {
    navigate(`/raven-test/${testToken}/finish`);
  }
};


  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center py-8 px-4">
      {/* Timer */}
      <div className="fixed bottom-4 left-4 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20 text-white text-sm">
        ⏳ {formatTime(timeRemaining)}
      </div>

      {/* Item image */}
      <img
        src={item.asset_url}
        alt={`Item ${item.item_number}`}
        className="max-w-full w-auto h-auto object-contain mb-6 shadow-lg rounded-lg border border-white/10"
      />

      {/* Answers */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 w-full max-w-2xl">
        {Array.from({ length: item.options_count }, (_, idx) => idx + 1).map((n) => (
          <button
            key={n}
            onClick={() => onSelect(n)}
            className={`aspect-square flex items-center justify-center rounded-lg text-xl font-bold transition-all border 
              ${selectedAnswer === n ? 'bg-purple-600 border-purple-400 text-white' : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20'}
            `}
          >
            {n}
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex space-x-4 mt-8 text-white">
        <button
          onClick={previousItem}
          disabled={currentIndex === 0}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded disabled:opacity-40"
        >
          ← Anterior
        </button>
        <button
          onClick={nextItem}
          disabled={currentIndex === items.length - 1}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded disabled:opacity-40"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
};

export default RavenTest;
