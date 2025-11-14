import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import useCubeStore from '../store/useCubeStore';

const SolutionPanel = () => {
  const { t } = useTranslation();
  const moves = useCubeStore((state) => state.solution);
  const status = useCubeStore((state) => state.status);
  const source = useCubeStore((state) => state.source);

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const annotatedMoves = useMemo(() => {
    const occurrences = new Map<string, number>();
    return moves.map((move) => {
      const count = (occurrences.get(move) ?? 0) + 1;
      occurrences.set(move, count);
      return { id: `${move}-${count}`, move };
    });
  }, [moves]);

  useEffect(() => {
    setActiveIndex(0);
    setIsPlaying(false);
  }, [moves]);

  useEffect(() => {
    if (!isPlaying || moves.length === 0) {
      return () => undefined;
    }
    const timer = window.setInterval(() => {
      setActiveIndex((index) => {
        if (index + 1 >= moves.length) {
          setIsPlaying(false);
          return index;
        }
        return index + 1;
      });
    }, 750);
    return () => window.clearInterval(timer);
  }, [isPlaying, moves]);

  const statusLabel = useMemo(() => t(`status.${status}`), [status, t]);
  const sourceLabel = source ? t(`solution.source.${source}`) : null;

  return (
    <section className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 shadow-lg">
      <header className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-slate-100">{t('solution.heading')}</h2>
        <p className="text-sm text-slate-300">{statusLabel}</p>
        {sourceLabel && <p className="text-xs text-slate-400">{sourceLabel}</p>}
      </header>
      <div className="mt-4">
        {moves.length === 0 ? (
          <p className="text-sm text-slate-300">{t('solution.none')}</p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-md border border-slate-600 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
                onClick={() => setIsPlaying((playing) => !playing)}
              >
                {isPlaying ? t('solution.pause') : t('solution.play')}
              </button>
              <span className="text-xs text-slate-400">
                {activeIndex + 1} / {moves.length}
              </span>
            </div>
            <ol className="grid grid-cols-3 gap-2 text-center text-sm text-slate-100 sm:grid-cols-4">
              {annotatedMoves.map(({ id, move }, index) => (
                <li
                  key={id}
                  className={`rounded-md border px-2 py-1 transition ${
                    index === activeIndex
                      ? 'border-primary bg-primary/20 text-primary'
                      : 'border-slate-700 bg-slate-800'
                  }`}
                >
                  {move}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
};

export default SolutionPanel;
