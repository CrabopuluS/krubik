// Precomputed keys ensure stable identifiers for individual cube facelets across renders.
export const FACELET_KEYS = Array.from({ length: 9 }, (_, index) => {
  const row = Math.floor(index / 3);
  const column = index % 3;
  return `r${row}c${column}`;
});

export default FACELET_KEYS;
