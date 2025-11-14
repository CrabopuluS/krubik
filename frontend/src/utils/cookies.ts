export const getCookie = (name: string): string | null => {
  const value = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));
  if (!value) {
    return null;
  }
  return value.split('=')[1] ?? null;
};

export const setCookie = (name: string, value: string, days = 1): void => {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
};
