import { useCallback, useMemo, useState } from 'react';
import CubeForm from './components/CubeForm';
import CubeVisualizer from './components/CubeVisualizer';
import SolutionSteps from './components/SolutionSteps';

type SolverState = {
  moves: string[];
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: string;
};

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/solve';

const App = () => {
  const [cubeState, setCubeState] = useState('');
  const [solverState, setSolverState] = useState<SolverState>({
    moves: [],
    status: 'idle',
  });

  const handleSubmit = useCallback(
    async (state: string) => {
      setCubeState(state);
      setSolverState({ moves: [], status: 'loading' });

      try {
        const response = await fetch(`${API_URL}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ state }),
        });

        if (!response.ok) {
          const body = await response.json();
          const message = body?.detail?.error ?? 'Unknown error';
          throw new Error(message);
        }

        const data = (await response.json()) as { moves: string[] };
        setSolverState({ moves: data.moves, status: 'success' });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Request failed';
        setSolverState({ moves: [], status: 'error', error: message });
      }
    },
    [],
  );

  const feedback = useMemo(() => {
    if (solverState.status === 'loading') {
      return 'Решение задачи...';
    }
    if (solverState.status === 'error') {
      return solverState.error ?? 'Ошибка обработки.';
    }
    if (solverState.status === 'success' && solverState.moves.length === 0) {
      return 'Куб уже собран!';
    }
    return undefined;
  }, [solverState]);

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Krubik Solver</h1>
        <p className="app__subtitle">
          Введите сериализованное состояние кубика (54 символа: U, D, F, B, L, R),
          чтобы получить оптимальное решение.
        </p>
      </header>
      <main className="app__main">
        <section className="app__section">
          <CubeForm onSubmit={handleSubmit} isLoading={solverState.status === 'loading'} />
        </section>
        <section className="app__section app__section--visualization">
          <CubeVisualizer state={cubeState} />
          {feedback && <p className="app__feedback">{feedback}</p>}
          <SolutionSteps moves={solverState.moves} status={solverState.status} />
        </section>
      </main>
    </div>
  );
};

export default App;
