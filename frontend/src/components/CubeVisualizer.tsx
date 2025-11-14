import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import useCubeStore, { FACE_COLOR_MAP, FACE_ORDER, Face } from '../store/useCubeStore';
import { FACELET_KEYS } from '../utils/facelets';

const CUBE_SIZE = 180;
const FACE_OFFSET = CUBE_SIZE / 2;

const FACE_TRANSFORMS: Record<Face, string> = {
  U: `rotateX(90deg) translateZ(${FACE_OFFSET}px)`,
  D: `rotateX(-90deg) translateZ(${FACE_OFFSET}px)`,
  F: `translateZ(${FACE_OFFSET}px)`,
  B: `rotateY(180deg) translateZ(${FACE_OFFSET}px)`,
  L: `rotateY(-90deg) translateZ(${FACE_OFFSET}px)`,
  R: `rotateY(90deg) translateZ(${FACE_OFFSET}px)`,
};

const CubeVisualizer = () => {
  const faces = useCubeStore((state) => state.faces);
  const { t } = useTranslation();

  const cubeFaces = useMemo(
    () =>
      FACE_ORDER.map((face) => ({
        id: face,
        stickers: faces[face],
      })),
    [faces],
  );

  return (
    <section className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 shadow-lg">
      <header className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-slate-100">{t('visualizer.heading')}</h2>
        <p className="text-sm text-slate-300">{t('visualizer.subtitle')}</p>
      </header>
      <div className="mt-6 flex w-full justify-center">
        <div
          className="cube"
          style={{
            width: `${CUBE_SIZE}px`,
            height: `${CUBE_SIZE}px`,
          }}
        >
          {cubeFaces.map(({ id, stickers }) => (
            <div
              key={id}
              className="cube-face"
              style={{ transform: FACE_TRANSFORMS[id], width: `${CUBE_SIZE}px`, height: `${CUBE_SIZE}px` }}
            >
              {stickers.map((sticker, index) => (
                <span
                  key={`${id}-${FACELET_KEYS[index]}`}
                  className="cube-sticker"
                  style={{ backgroundColor: FACE_COLOR_MAP[sticker as Face] ?? '#1f2937' }}
                  aria-hidden="true"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default memo(CubeVisualizer);
