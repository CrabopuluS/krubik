import { create } from 'zustand';

export const FACE_ORDER = ['U', 'R', 'F', 'D', 'L', 'B'] as const;
export type Face = (typeof FACE_ORDER)[number];

export const FACE_COLOR_MAP: Record<Face, string> = {
  U: '#f8fafc',
  R: '#ef4444',
  F: '#22c55e',
  D: '#f97316',
  L: '#facc15',
  B: '#3b82f6',
};

type SolverSource = 'external' | 'local' | null;
type SolverStatus = 'idle' | 'loading' | 'success' | 'error';

type FacesState = Record<Face, string[]>;

interface CubeStore {
  faces: FacesState;
  solution: string[];
  source: SolverSource;
  status: SolverStatus;
  error: string | null;
  setFacelet: (face: Face, index: number, color: string) => void;
  resetFaces: () => void;
  setSolution: (moves: string[], source: Exclude<SolverSource, null>) => void;
  setStatus: (status: SolverStatus) => void;
  setError: (message: string) => void;
  clearError: () => void;
  serialize: () => string;
}

const createFaceArray = (face: Face): string[] => Array.from({ length: 9 }, () => face);

const createDefaultFaces = (): FacesState =>
  FACE_ORDER.reduce((acc, face) => ({ ...acc, [face]: createFaceArray(face) }), {} as FacesState);

const useCubeStore = create<CubeStore>((set, get) => ({
  faces: createDefaultFaces(),
  solution: [],
  source: null,
  status: 'idle',
  error: null,
  setFacelet: (face, index, color) =>
    set((state) => {
      const updated = state.faces[face].slice();
      updated[index] = color.toUpperCase();
      return {
        faces: {
          ...state.faces,
          [face]: updated,
        },
      };
    }),
  resetFaces: () =>
    set(() => ({
      faces: createDefaultFaces(),
      solution: [],
      source: null,
      status: 'idle',
      error: null,
    })),
  setSolution: (moves, source) =>
    set(() => ({
      solution: moves,
      source,
      status: 'success',
    })),
  setStatus: (status) => set(() => ({ status })),
  setError: (message) =>
    set(() => ({
      error: message,
      status: 'error',
    })),
  clearError: () => set(() => ({ error: null })),
  serialize: () => FACE_ORDER.map((face) => get().faces[face].join('')).join(''),
}));

export default useCubeStore;
