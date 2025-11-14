import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { solveCube } from '../api/client';
import useCubeStore from '../store/useCubeStore';

const useSolveCube = () => {
  const { i18n } = useTranslation();
  const setStatus = useCubeStore((state) => state.setStatus);
  const setSolution = useCubeStore((state) => state.setSolution);
  const setError = useCubeStore((state) => state.setError);
  const clearError = useCubeStore((state) => state.clearError);

  return useMutation({
    mutationFn: (state: string) => solveCube(state, i18n.language),
    onMutate: () => {
      setStatus('loading');
      clearError();
    },
    onSuccess: (data) => {
      setSolution(data.moves, data.source);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setError(message);
    },
  });
};

export default useSolveCube;
