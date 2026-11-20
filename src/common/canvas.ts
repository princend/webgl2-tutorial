/**
 * 取得 WebGL 2.0 渲染環境，若瀏覽器不支援則直接拋出清楚的錯誤訊息。
 */
export function getWebGL2Context(canvas: HTMLCanvasElement): WebGL2RenderingContext {
  const gl = canvas.getContext('webgl2', {
    antialias: true, // 開啟抗鋸齒讓幾何邊緣更平滑
  });

  if (!gl) {
    throw new Error('你的瀏覽器或裝置目前不支援 WebGL 2.0。');
  }

  return gl;
}

/**
 * 同步畫布的實際像素解析度與 CSS 顯示尺寸（支援 Retina / 高解析度螢幕）。
 * 回傳值代表尺寸是否有發生變化。
 */
export function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement): boolean {
  // 限制最大像素倍率為 2，兼顧清晰度與效能
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const displayWidth = Math.floor(canvas.clientWidth * dpr);
  const displayHeight = Math.floor(canvas.clientHeight * dpr);

  const needResize = canvas.width !== displayWidth || canvas.height !== displayHeight;
  if (needResize) {
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }

  return needResize;
}

/**
 * 更新左上角教學資訊面板的狀態文字。
 */
export function setStatusMessage(message: string): void {
  const el = document.getElementById('hud-status');
  if (el) {
    el.textContent = message;
  }
}

/**
 * 在畫面下方顯示錯誤訊息（特別方便檢視著色器 GLSL 編譯錯誤）。
 */
export function showErrorOverlay(error: unknown): void {
  const el = document.getElementById('error-overlay');
  const message = error instanceof Error ? error.message : String(error);
  console.error(error);

  if (el) {
    el.textContent = `執行錯誤：\n${message}`;
    el.classList.add('visible');
  }
}
