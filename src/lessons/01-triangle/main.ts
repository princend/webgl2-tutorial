import {
  getWebGL2Context,
  resizeCanvasToDisplaySize,
  setStatusMessage,
  showErrorOverlay,
} from '../../common/canvas';
import vertexShaderSource from './shader.vert?raw';
import fragmentShaderSource from './shader.frag?raw';

/**
 * 步驟 2-A：編譯單一著色器（頂點著色器或片段著色器）
 */
function compileShader(
  gl: WebGL2RenderingContext,
  type: GLenum,
  source: string,
): WebGLShader {
  // TODO (步驟 2-A)：實作以下四個動作
  // 1. 建立著色器物件：gl.createShader(type)（若為 null 請拋出錯誤）
  // 2. 載入原始碼：gl.shaderSource(shader, source)
  // 3. 進行編譯：gl.compileShader(shader)
  // 4. 檢查編譯結果：gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  //    若為 false，先用 gl.getShaderInfoLog(shader) 取得錯誤訊息，
  //    呼叫 gl.deleteShader(shader) 釋放資源後拋出 Error。
  throw new Error('尚未實作 compileShader（請完成步驟 2-A）');
}

/**
 * 步驟 2-B：將頂點與片段著色器連結成完整的著色器程式（Program）
 */
function createProgram(
  gl: WebGL2RenderingContext,
  vertSource: string,
  fragSource: string,
): WebGLProgram {
  // TODO (步驟 2-B)：實作以下動作
  // 1. 呼叫 compileShader 分別編譯 gl.VERTEX_SHADER 與 gl.FRAGMENT_SHADER
  // 2. 建立程式物件：gl.createProgram()（若為 null 請拋出錯誤）
  // 3. 掛載兩個著色器：gl.attachShader(program, ...)
  // 4. 執行連結：gl.linkProgram(program)
  // 5. 檢查連結結果：gl.getProgramParameter(program, gl.LINK_STATUS)
  //    若失敗則讀取 gl.getProgramInfoLog(program)、刪除資源並拋出 Error
  // 6. 連結成功後可呼叫 gl.deleteShader(...) 清理已不再需要的中繼著色器物件
  throw new Error('尚未實作 createProgram（請完成步驟 2-B）');
}

function main(): void {
  const canvas = document.getElementById('gl-canvas') as HTMLCanvasElement | null;
  if (!canvas) {
    throw new Error('找不到 #gl-canvas 元素');
  }

  // 1. 取得 WebGL 2.0 渲染環境
  const gl = getWebGL2Context(canvas);

  // 確保外部匯入的著色器原始碼可供後續步驟使用
  void vertexShaderSource;
  void fragmentShaderSource;
  void compileShader;
  void createProgram;

  // =========================================================================
  // TODO (步驟 3)：建立著色器程式，並準備三角形頂點資料上傳到 VBO
  // =========================================================================
  // 提示：
  // 1. 呼叫 const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
  // 2. 準備交錯排列的頂點陣列（每個頂點包含 5 個 float：x, y, r, g, b）：
  //    - 上方頂點：位置 ( 0.0,  0.6)，顏色紅色 (1.0, 0.2, 0.4)
  //    - 左下頂點：位置 (-0.6, -0.5)，顏色綠色 (0.2, 0.9, 0.5)
  //    - 右下頂點：位置 ( 0.6, -0.5)，顏色藍色 (0.2, 0.5, 1.0)
  //    const vertices = new Float32Array([ ... ]);
  // 3. 建立 VBO：const vbo = gl.createBuffer();
  // 4. 綁定到 ARRAY_BUFFER 槽位：gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  // 5. 將資料複製到 GPU 記憶體：gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  // =========================================================================
  // TODO (步驟 4)：建立 VAO 並設定頂點屬性解析方式
  // =========================================================================
  // 提示：每個頂點佔 5 個 float，每個 float 佔 4 位元組（Float32Array.BYTES_PER_ELEMENT）
  // 所以 stride（跨距）= 5 * 4 = 20 位元組
  //
  // 1. 建立並綁定 VAO：
  //    const vao = gl.createVertexArray();
  //    gl.bindVertexArray(vao);
  // 2. 確保 VBO 已綁定在 gl.ARRAY_BUFFER（若步驟 3 已綁定且未解綁即已生效，
  //    但最安全的習慣是在 bindVertexArray 之後再 bindBuffer 一次）
  // 3. 設定 location = 0（a_position，2 個 float，offset = 0）：
  //    gl.enableVertexAttribArray(0);
  //    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, stride, 0);
  // 4. 設定 location = 1（a_color，3 個 float，offset = 2 * 4 = 8 位元組）：
  //    gl.enableVertexAttribArray(1);
  //    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, stride, 2 * Float32Array.BYTES_PER_ELEMENT);
  // 5. 解綁 VAO 避免後續操作誤改狀態：
  //    gl.bindVertexArray(null);

  // =========================================================================
  // 畫面繪製函式
  // =========================================================================
  function render(): void {
    resizeCanvasToDisplaySize(canvas!);

    // 告訴 WebGL 裁剪空間（-1 ~ +1）要映射到畫布的哪個像素區域
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    // 設定清除背景用的顏色（RGBA，範圍 0.0 ~ 1.0）並清除顏色緩衝區
    gl.clearColor(0.05, 0.08, 0.15, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // TODO (步驟 5)：執行繪製指令！
    // 1. gl.useProgram(program);
    // 2. gl.bindVertexArray(vao);
    // 3. gl.drawArrays(gl.TRIANGLES, 0, 3);
    // 4. gl.bindVertexArray(null);
  }

  // 初次繪製與視窗縮放時重新繪製
  render();
  window.addEventListener('resize', render);

  setStatusMessage(
    `WebGL 2.0 環境已啟動（${gl.drawingBufferWidth} × ${gl.drawingBufferHeight}）— 請依照 main.ts 步驟完成實作`,
  );
}

try {
  main();
} catch (error) {
  showErrorOverlay(error);
}
