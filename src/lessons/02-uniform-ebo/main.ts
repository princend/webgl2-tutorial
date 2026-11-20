import {
  getWebGL2Context,
  resizeCanvasToDisplaySize,
  setStatusMessage,
  showErrorOverlay,
} from '../../common/canvas';
import { createProgram } from '../../common/shader';
import vertexShaderSource from './shader.vert?raw';
import fragmentShaderSource from './shader.frag?raw';

function main(): void {
  const canvas = document.getElementById('gl-canvas') as HTMLCanvasElement | null;
  if (!canvas) {
    throw new Error('找不到 #gl-canvas 元素');
  }

  const gl = getWebGL2Context(canvas);

  // 直接使用第 1 課封裝好的共用工具編譯與連結著色器
  const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
  void program;

  // =========================================================================
  // TODO (步驟 1)：建立 4 個頂點的 VBO、6 個索引編號的 EBO 與 VAO，畫出正方形
  // =========================================================================

  // =========================================================================
  // TODO (步驟 2)：取得 u_aspect 位置，並傳入畫布長寬比防止正方形被拉扁
  // =========================================================================

  // =========================================================================
  // TODO (步驟 3 & 4)：建立 requestAnimationFrame 動畫迴圈，每幀傳入 u_time
  // =========================================================================

  function render(): void {
    resizeCanvasToDisplaySize(canvas!);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0.05, 0.08, 0.15, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    setStatusMessage(
      `第 2 課環境已就緒（${gl.drawingBufferWidth} × ${gl.drawingBufferHeight}）— 準備開始步驟 1：EBO 索引緩衝`,
    );
  }

  render();
  window.addEventListener('resize', render);
}

try {
  main();
} catch (error) {
  showErrorOverlay(error);
}
