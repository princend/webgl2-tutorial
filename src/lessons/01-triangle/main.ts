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
  // 1. 請 GPU 建立一個空的著色器容器（指定它是頂點著色器或片段著色器）
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error('無法建立 WebGLShader 物件');
  }

  // 2. 把 GLSL 純文字程式碼裝進這個容器
  gl.shaderSource(shader, source);

  // 3. 請 GPU 編譯器將文字原始碼翻譯成 GPU 機器碼
  gl.compileShader(shader);

  // 4. 主動詢問 GPU 編譯有沒有成功（WebGL 編譯失敗不會自動丟出 JS 例外）
  const isSuccess = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!isSuccess) {
    const log = gl.getShaderInfoLog(shader) ?? '未知的著色器編譯錯誤';
    const shaderName = type === gl.VERTEX_SHADER ? '頂點著色器' : '片段著色器';
    gl.deleteShader(shader); // 編譯失敗就釋放這個空殼，避免浪費顯示卡記憶體
    throw new Error(`${shaderName}編譯失敗：\n${log}`);
  }

  return shader;
}

/**
 * 步驟 2-B：將頂點與片段著色器連結成完整的著色器程式（Program）
 */
function createProgram(
  gl: WebGL2RenderingContext,
  vertSource: string,
  fragSource: string,
): WebGLProgram {
  // 1. 分別編譯頂點與片段著色器，取得兩個零件
  const vertShader = compileShader(gl, gl.VERTEX_SHADER, vertSource);
  const fragShader = compileShader(gl, gl.FRAGMENT_SHADER, fragSource);

  // 2. 請 GPU 建立一個空的「著色器程式（Program）」外殼
  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);
    throw new Error('無法建立 WebGLProgram 物件');
  }

  // 3. 把兩個零件掛載到程式外殼中
  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);

  // 4. 執行「連結」：串接兩站的 out / in，組裝成 GPU 可直接執行的完整程式
  gl.linkProgram(program);

  // 5. 主動詢問 GPU 連結有沒有成功
  const isSuccess = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!isSuccess) {
    const log = gl.getProgramInfoLog(program) ?? '未知的程式連結錯誤';
    gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);
    gl.deleteProgram(program);
    throw new Error(`著色器程式連結失敗：\n${log}`);
  }

  // 6. 連結成功後，Program 內部已有完整機器碼，這兩個中繼零件可以標記清理釋放記憶體
  gl.deleteShader(vertShader);
  gl.deleteShader(fragShader);

  return program;
}

function main(): void {
  const canvas = document.getElementById('gl-canvas') as HTMLCanvasElement | null;
  if (!canvas) {
    throw new Error('找不到 #gl-canvas 元素');
  }

  // 1. 取得 WebGL 2.0 渲染環境
  const gl = getWebGL2Context(canvas);

  // =========================================================================
  // 步驟 3：建立著色器程式，並準備三角形頂點資料上傳到 GPU 緩衝區（VBO）
  // =========================================================================
  // 1. 呼叫步驟 2 寫好的函式，將兩份 GLSL 原始碼編譯並連結成 GPU 可執行程式
  const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);

  // 2. 準備交錯排列的頂點陣列（每個頂點佔 5 個 32 位元浮點數：x, y, r, g, b）
  //    座標使用裁剪空間（-1.0 ~ +1.0，Y 軸朝上），顏色範圍為 0.0 ~ 1.0

  const vertices = new Float32Array([
    //   x,    y,     r,   g,   b
    0.0, 0.6, 1.0, 0.2, 0.4, // 上方頂點（偏桃紅色）
    -0.6, -0.5, 0.2, 0.9, 0.5, // 左下頂點（偏翠綠色）
    0.6, -0.5, 0.2, 0.5, 1.0, // 右下頂點（偏天藍色）
  ]);

  // 3. 在顯示卡記憶體中建立一個空的頂點緩衝物件（VBO，純數字倉庫）
  const vbo = gl.createBuffer();
  if (!vbo) {
    throw new Error('無法建立頂點緩衝區（VBO）');
  }

  // 4. 將這個 VBO 放上「ARRAY_BUFFER」操作槽位（告訴 GPU 接下來要操作哪一個箱子）
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);

  // 5. 將 CPU 端的 Float32Array 二進位資料複製上傳到 GPU 記憶體中
  //    gl.STATIC_DRAW 提示 GPU：這份資料上傳一次後只會重複讀取繪製、不太會修改
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  // =========================================================================
  // 步驟 4：建立 VAO（資料讀取說明書），設定如何從 VBO 切出座標與顏色
  // =========================================================================
  // 每個 Float32 數字佔 4 位元組（Bytes），每個頂點包含 5 個數字（x, y, r, g, b）
  const bytesPerFloat = Float32Array.BYTES_PER_ELEMENT; // 數值為 4
  const stride = 5 * bytesPerFloat; // 跨距：每組頂點佔 5 × 4 = 20 位元組

  // 1. 建立一張空白的 VAO 說明書，並綁定（開始記錄以下所有的讀取規則）
  const vao = gl.createVertexArray();
  if (!vao) {
    throw new Error('無法建立頂點陣列物件（VAO）');
  }
  gl.bindVertexArray(vao);

  // 2. 確保我們的 VBO 綁定在 ARRAY_BUFFER 上，讓接下來的指標都指向這個倉庫
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);

  // 3. 設定 0 號插槽（對應 shader.vert 的 layout(location = 0) in vec2 a_position）
  gl.enableVertexAttribArray(0); // 打開 0 號插槽開關
  gl.vertexAttribPointer(
    0, // index：對應 layout(location = 0)
    2, // size：每次讀取 2 個數字（x, y）
    gl.FLOAT, // type：每個數字是 32 位元浮點數
    false, // normalized：浮點數不需要正規化，固定填 false
    stride, // stride：跨距 20 Bytes（跳到下一個頂點的距離）
    0, // offset：從每個頂點的第 0 Byte 開始讀
  );

  // 4. 設定 1 號插槽（對應 shader.vert 的 layout(location = 1) in vec3 a_color）
  gl.enableVertexAttribArray(1); // 打開 1 號插槽開關
  gl.vertexAttribPointer(
    1, // index：對應 layout(location = 1)
    3, // size：每次讀取 3 個數字（r, g, b）
    gl.FLOAT, // type：每個數字是 32 位元浮點數
    false, // normalized：固定填 false
    stride, // stride：跨距 20 Bytes
    2 * bytesPerFloat, // offset：跳過前面的 x, y（2 × 4 = 8 Bytes）再開始讀顏色
  );

  // 5. 規則記錄完畢！解綁 VAO（把說明書合起來收好，避免之後誤改狀態）
  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

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

    // =========================================================================
    // 步驟 5：執行繪製指令！
    // =========================================================================
    // 1. 啟動我們組裝好的著色器程式（告訴 GPU 接下來要用哪一套「頂點＋片段」著色器）
    gl.useProgram(program);

    // 2. 綁定我們寫好的 VAO 說明書（一鍵套用剛剛設定的所有 VBO 與 0、1 號插槽規則）
    gl.bindVertexArray(vao);

    // 3. 正式下令開畫！
    //    - gl.TRIANGLES：每 3 個頂點連成一個實心三角形
    //    - 0：從第 0 個頂點開始讀
    //    - 3：總共讀取 3 個頂點（所以頂點著色器會同時跑 3 次）
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // 4. 畫完把 VAO 解綁收好，保持乾淨的狀態
    gl.bindVertexArray(null);

    setStatusMessage(
      `第 1 課完成！WebGL 2.0 彩色三角形已繪製（${gl.drawingBufferWidth} × ${gl.drawingBufferHeight}）`,
    );
  }

  // 初次繪製與視窗縮放時重新繪製
  render();
  window.addEventListener('resize', render);
}

try {
  main();
} catch (error) {
  showErrorOverlay(error);
}
