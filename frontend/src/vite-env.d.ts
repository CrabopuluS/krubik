/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_CSRF_COOKIE?: string;
  readonly VITE_CSRF_HEADER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
