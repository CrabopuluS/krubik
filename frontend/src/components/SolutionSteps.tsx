import { useEffect, useMemo, useState } from 'react';

type SolutionStepsProps = {
  moves: string[];
  status: 'idle' | 'loading' | 'success' | 'error';
};

const SolutionSteps = ({ moves, status }: SolutionStepsProps) => {
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  useEffect(() => {
    if (status !== 'success' || moves.length === 0) {
      setActiveIndex(-1);
      return () => {};
    }

    setActiveIndex(0);
    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => {
        if (current >= moves.length - 1) {
          window.clearInterval(intervalId);
          return current;
        }
        return current + 1;
      });
    }, 800);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [moves, status]);

  const content = useMemo(() => {
    if (status === 'idle') {
      return 'Введите состояние, чтобы увидеть решение.';
    }
    if (status === 'loading') {
      return 'Решение вычисляется…';
    }
    if (status === 'error') {
      return 'Не удалось получить решение.';
    }
    if (moves.length === 0) {
      return 'Движения не требуются.';
    }
    return null;
  }, [moves.length, status]);

  if (content) {
    return <div className="solution-steps">{content}</div>;
  }

  return (
    <ol className="solution-steps" aria-live="polite">
      {moves.map((move, index) => (
        <li
          key={`${move}-${index}`}
          className={`solution-steps__item${index <= activeIndex ? ' solution-steps__item--active' : ''}`}
        >
          <span className="solution-steps__move">{move}</span>
        </li>
      ))}
    </ol>
  );
};

export default SolutionSteps;
