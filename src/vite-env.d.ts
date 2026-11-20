/// <reference types="vite/client" />

// 讓 TypeScript 辨識透過 Vite 的 ?raw 匯入的著色器檔案
declare module '*.vert?raw' {
  const source: string;
  export default source;
}

declare module '*.frag?raw' {
  const source: string;
  export default source;
}

declare module '*.glsl?raw' {
  const source: string;
  export default source;
}
