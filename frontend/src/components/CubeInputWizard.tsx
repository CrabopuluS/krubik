import { DragEvent, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import useCubeStore, { FACE_COLOR_MAP, FACE_ORDER, Face } from '../store/useCubeStore';
import useSolveCube from '../hooks/useSolveCube';
import { FACELET_KEYS } from '../utils/facelets';

const CubeInputWizard = () => {
  const { t } = useTranslation();
  const [activeFaceIndex, setActiveFaceIndex] = useState(0);
  const [activeColor, setActiveColor] = useState<Face>('U');

  const faces = useCubeStore((state) => state.faces);
  const setFacelet = useCubeStore((state) => state.setFacelet);
  const resetFaces = useCubeStore((state) => state.resetFaces);
  const serialize = useCubeStore((state) => state.serialize);
  const status = useCubeStore((state) => state.status);
  const { mutate, isPending } = useSolveCube();

  const currentFace = FACE_ORDER[activeFaceIndex];
  const stickers = faces[currentFace];

  const palette = useMemo(() => FACE_ORDER, []);
  const isBusy = status === 'loading' || isPending;

  const handleNext = () =>
    setActiveFaceIndex((index) => Math.min(index + 1, FACE_ORDER.length - 1));
  const handlePrevious = () => setActiveFaceIndex((index) => Math.max(index - 1, 0));

  const applyColor = useCallback(
    (index: number, color: string) => {
      setFacelet(currentFace, index, color);
    },
    [currentFace, setFacelet],
  );

  const handleDrop = (event: DragEvent<HTMLDivElement>, index: number) => {
    event.preventDefault();
    const color = event.dataTransfer.getData('text/plain') as Face;
    if (color) {
      applyColor(index, color);
    }
  };

  const handleSolve = () => {
    mutate(serialize());
  };

  return (
    <section className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 shadow-lg">
      <header className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-slate-100">
          {t('wizard.heading', { face: currentFace })}
        </h2>
        <p className="text-sm text-slate-300">{t(`wizard.instructions.${currentFace}`)}</p>
        <p className="text-xs text-slate-400">{t('wizard.hint')}</p>
      </header>
      <div className="mt-4 flex flex-col gap-4 md:flex-row">
        <div className="flex flex-col items-center gap-3">
          <div className="grid grid-cols-3 gap-1 rounded-lg border border-slate-700 bg-slate-800 p-2">
            {stickers.map((sticker, index) => (
              <div
                key={`${currentFace}-${FACELET_KEYS[index]}`}
                role="button"
                tabIndex={0}
                aria-label={`Set ${currentFace} facelet ${index + 1}`}
                className="size-12 rounded-md border border-slate-700 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary"
                style={{ backgroundColor: FACE_COLOR_MAP[sticker as Face] ?? '#1f2937' }}
                onClick={() => applyColor(index, activeColor)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    applyColor(index, activeColor);
                  }
                }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleDrop(event, index)}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-md border border-slate-600 px-3 py-1 text-sm text-slate-200 transition hover:bg-slate-700 disabled:opacity-50"
              onClick={handlePrevious}
              disabled={activeFaceIndex === 0 || isBusy}
            >
              {t('buttons.previous')}
            </button>
            <button
              type="button"
              className="rounded-md border border-slate-600 px-3 py-1 text-sm text-slate-200 transition hover:bg-slate-700 disabled:opacity-50"
              onClick={handleNext}
              disabled={activeFaceIndex === FACE_ORDER.length - 1 || isBusy}
            >
              {t('buttons.next')}
            </button>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">{t('palette.label')}</h3>
            <p className="text-xs text-slate-400">{t('palette.help')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {palette.map((color) => (
              <button
                key={color}
                type="button"
                draggable
                onDragStart={(event) => event.dataTransfer.setData('text/plain', color)}
                onClick={() => setActiveColor(color)}
                className={`flex size-12 items-center justify-center rounded-md border text-sm font-bold shadow transition focus:outline-none focus:ring-2 focus:ring-primary ${
                  activeColor === color ? 'border-primary ring-2 ring-primary' : 'border-slate-700'
                }`}
                style={{ backgroundColor: FACE_COLOR_MAP[color] }}
              >
                {color}
              </button>
            ))}
          </div>
          <div className="mt-auto flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="rounded-md border border-red-500 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-600/20 disabled:opacity-50"
              onClick={resetFaces}
              disabled={isBusy}
            >
              {t('buttons.reset')}
            </button>
            <button
              type="button"
              className="ml-auto rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50"
              onClick={handleSolve}
              disabled={isBusy}
            >
              {isBusy ? t('status.loading') : t('buttons.solve')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CubeInputWizard;
