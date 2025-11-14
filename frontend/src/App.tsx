import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

import CubeInputWizard from './components/CubeInputWizard';
import CubeVisualizer from './components/CubeVisualizer';
import LanguageSelector from './components/LanguageSelector';
import SolutionPanel from './components/SolutionPanel';
import Toast from './components/Toast';
import useCubeStore from './store/useCubeStore';

const App = () => {
  const { t } = useTranslation();
  const error = useCubeStore((state) => state.error);
  const clearError = useCubeStore((state) => state.clearError);

  return (
    <Suspense fallback={<div className="p-6 text-slate-100">{t('status.loading')}</div>}>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <header className="border-b border-slate-800 bg-slate-900/60">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">{t('title')}</h1>
              <p className="text-sm text-slate-300">{t('subtitle')}</p>
            </div>
            <LanguageSelector />
          </div>
        </header>
        <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 lg:flex-row">
          <div className="lg:w-1/2">
            <CubeInputWizard />
          </div>
          <div className="flex flex-1 flex-col gap-6">
            <CubeVisualizer />
            <SolutionPanel />
          </div>
        </main>
        {error && <Toast message={error} onClose={clearError} />}
      </div>
    </Suspense>
  );
};

export default App;
