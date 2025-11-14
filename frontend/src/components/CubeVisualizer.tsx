import { useMemo } from 'react';

const FACE_ORDER = ['U', 'R', 'F', 'D', 'L', 'B'] as const;
const FACE_NAMES: Record<(typeof FACE_ORDER)[number], string> = {
  U: 'Верх',
  R: 'Правая',
  F: 'Передняя',
  D: 'Нижняя',
  L: 'Левая',
  B: 'Задняя',
};

const COLOR_CLASS: Record<string, string> = {
  U: 'cube-visualizer__sticker--up',
  R: 'cube-visualizer__sticker--right',
  F: 'cube-visualizer__sticker--front',
  D: 'cube-visualizer__sticker--down',
  L: 'cube-visualizer__sticker--left',
  B: 'cube-visualizer__sticker--back',
};

type CubeVisualizerProps = {
  state: string;
};

type Face = {
  id: (typeof FACE_ORDER)[number];
  stickers: string[];
};

const buildFaces = (state: string): Face[] => {
  if (state.length < 54) {
    return FACE_ORDER.map((face) => ({ id: face, stickers: Array(9).fill(face) }));
  }

  const faces: Face[] = [];
  let index = 0;
  FACE_ORDER.forEach((face) => {
    faces.push({ id: face, stickers: state.slice(index, index + 9).split('') });
    index += 9;
  });
  return faces;
};

const CubeVisualizer = ({ state }: CubeVisualizerProps) => {
  const faces = useMemo(() => buildFaces(state), [state]);

  return (
    <div className="cube-visualizer" aria-live="polite">
      {faces.map((face) => (
        <div key={face.id} className="cube-visualizer__face">
          <h2 className="cube-visualizer__face-title">{FACE_NAMES[face.id]}</h2>
          <div className="cube-visualizer__grid">
            {face.stickers.map((sticker, index) => (
              <span
                key={`${face.id}-${index}`}
                className={`cube-visualizer__sticker ${COLOR_CLASS[sticker] ?? ''}`}
                aria-label={`${FACE_NAMES[face.id]}: ${sticker}`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CubeVisualizer;
