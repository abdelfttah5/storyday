/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Augment the NodeJS namespace to include API_KEY in ProcessEnv.
// This allows strict typing for process.env.API_KEY without conflicting with existing global declarations.
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
  }
}
