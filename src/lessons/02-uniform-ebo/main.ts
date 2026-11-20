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

  // =========================================================================
  // 步驟 1：建立 4 個頂點的 VBO、6 個索引編號的 EBO 與 VAO，畫出正方形
  // =========================================================================
  // 1. 只準備 4 個不重複的角頂點（每個頂點 5 個小數：x, y, r, g, b）
  const vertices = new Float32Array([
    //    x,     y,     r,    g,    b
    -0.45,  0.45,  1.0,  0.25, 0.55, // 頂點 0：左上（桃紅）
     0.45,  0.45,  1.0,  0.80, 0.20, // 頂點 1：右上（金黃）
     0.45, -0.45,  0.15, 0.90, 0.85, // 頂點 2：右下（亮青）
    -0.45, -0.45,  0.35, 0.45, 1.0,  // 頂點 3：左下（藍紫）
  ]);

  // 2. 準備索引清單（Uint16Array = 無正負號 16 位元整數，每個編號只佔 2 Bytes）
  //    用編號指定「哪 3 個頂點連成一個三角形」，總共 2 個三角形（6 個編號）
  const indices = new Uint16Array([
    0, 3, 1, // 三角形 A：左上 → 左下 → 右上
    1, 3, 2, // 三角形 B：右上 → 左下 → 右下（重複使用頂點 1 與 3，省記憶體！）
  ]);

  // 3. 建立並綁定 VAO（開始錄影：接下來的 VBO 規則與 EBO 綁定都會記錄進去）
  const vao = gl.createVertexArray();
  if (!vao) {
    throw new Error('無法建立 VAO');
  }
  gl.bindVertexArray(vao);

  // 4. 建立並上傳 VBO（頂點倉庫 → 放上 ARRAY_BUFFER 操作台）
  const vbo = gl.createBuffer();
  if (!vbo) {
    throw new Error('無法建立 VBO');
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  // 5. 建立並上傳 EBO（索引清單 → 放上 ELEMENT_ARRAY_BUFFER 操作台）
  //    注意：因為此時 VAO 處於綁定狀態，這個 EBO 會自動被記錄進 VAO 裡！
  const ebo = gl.createBuffer();
  if (!ebo) {
    throw new Error('無法建立 EBO');
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  // 6. 設定 0 號（座標）與 1 號（顏色）頂點屬性讀取規則（與第 1 課完全相同）
  const bytesPerFloat = Float32Array.BYTES_PER_ELEMENT;
  const stride = 5 * bytesPerFloat;

  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, stride, 0);

  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 3, gl.FLOAT, false, stride, 2 * bytesPerFloat);

  // 7. 先解綁 VAO（停止錄影），再解綁 VBO！
  //    切記：千萬不可在解綁 VAO 前解綁 EBO，否則 VAO 會把「空 EBO」錄進去！
  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // =========================================================================
  // 步驟 2 & 3：取得 uniform 信箱位置（u_aspect 長寬比、u_time 時間、u_flatMode 開關）
  // =========================================================================
  // 向 GPU 查詢 uniform 的信箱地址，存起來重複使用（不用每幀都查）
  const uAspectLoc = gl.getUniformLocation(program, 'u_aspect');
  const uTimeLoc = gl.getUniformLocation(program, 'u_time');
  const uFlatModeLoc = gl.getUniformLocation(program, 'u_flatMode');

  // 綁定網頁上的「插值器開關」按鈕（切換 smooth 平滑漸層 vs flat 純色三角形）
  let isFlatMode = false;
  const toggleBtn = document.getElementById('toggle-interp-btn') as HTMLButtonElement | null;
  toggleBtn?.addEventListener('click', () => {
    isFlatMode = !isFlatMode;
    toggleBtn.classList.toggle('active', isFlatMode);
    toggleBtn.textContent = isFlatMode
      ? '插值器：關閉（flat 純色三角形）'
      : '插值器：開啟（smooth 平滑漸層）';
  });

  // 步驟 3：動畫迴圈！瀏覽器會在每次螢幕準備刷新（約每秒 60 次）時呼叫 render，
  // 並自動傳入「頁面啟動至今經過的毫秒數 nowMs」
  function render(nowMs: number): void {
    // 把毫秒轉成秒（例如 1500ms → 1.5s），放進 sin() 比較好控制速度
    const timeSec = nowMs * 0.001;

    resizeCanvasToDisplaySize(canvas!);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0.05, 0.08, 0.15, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 1. 啟動著色器程式
    gl.useProgram(program);

    // 2. 每幀把最新的長寬比、時間（float）與插值器開關（int：0 或 1）投進 GPU 信箱
    const aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
    gl.uniform1f(uAspectLoc, aspect);
    gl.uniform1f(uTimeLoc, timeSec);
    gl.uniform1i(uFlatModeLoc, isFlatMode ? 1 : 0);

    // 3. 綁定 VAO 並開畫
    gl.bindVertexArray(vao);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);

    setStatusMessage(
      `第 2 課完成！目前：${isFlatMode ? 'flat 關閉插值' : 'smooth 平滑插值'} ｜ u_time = ${timeSec.toFixed(1)}s`,
    );

    // 4. 預約下一次螢幕刷新時再畫下一幀，形成流暢的 60 FPS 動畫迴圈
    requestAnimationFrame(render);
  }

  // 啟動第 1 幀動畫（之後每幀會自動檢查畫布大小，不再需要額外綁 resize 事件）
  requestAnimationFrame(render);
}

try {
  main();
} catch (error) {
  showErrorOverlay(error);
}
