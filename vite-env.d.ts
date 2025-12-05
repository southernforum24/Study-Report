// vite-env.d.ts

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_GEMINI_API_KEY: string
  // ถ้ามีตัวแปรอื่น ๆ ก็ใส่เพิ่มตรงนี้
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}