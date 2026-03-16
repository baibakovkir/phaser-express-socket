import React, { useMemo, useState } from 'react';
import { usePhaserEvent } from '../hooks/usePhaserEvent';

interface LoadingScreenProps {
  onComplete?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  usePhaserEvent('loader:progress', (current, total) => {
    if (total > 0) setProgress(Math.round((current / total) * 100));
  });

  usePhaserEvent('loader:complete', () => {
    setProgress(100);
    setTimeout(() => onComplete?.(), 500);
  });

  const tips = useMemo(() => [
    'Загрузка ресурсов...',
    'Подготовка игрового мира...',
    'Инициализация систем...',
    'Почти готово!',
  ], []);

  const currentTip = tips[Math.min(Math.floor(progress / 25), tips.length - 1)];

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gray-900/95 backdrop-blur-sm">
      <h1 className="text-4xl font-bold text-cyan-400 mb-8 tracking-wider">NINJAS X</h1>

      <div className="w-80 h-6 bg-gray-800 rounded-full overflow-hidden border-2 border-gray-600 shadow-lg">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-4 text-center">
        <p className="text-gray-300 text-sm mb-1">{currentTip}</p>
        <p className="text-cyan-400 font-mono text-lg">{progress}%</p>
      </div>

      <div className="mt-8 flex gap-2">
        <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
};

export default LoadingScreen;
