# WebGL 2.0 學習筆記與專有名詞速查表

> 專屬個人的白話名詞小抄，每完成一堂課就會持續補充更新。

---

## 一、最容易搞混的「O 結尾三兄弟」記憶口訣

> **VBO 存頂點，EBO 存編號，VAO 是總說明書；**
> **`a_` 是每個點各自帶，`v_` 會插值變漸層，`u_` 是大家一起用！**

（最後的 `O` 全都是 `Object` 物件，直接忽略，只記前兩個字母！）

| 名詞 | 英文全名 | 白話比喻 | 裡面裝什麼 | 對應的工作台 / API |
| :--- | :--- | :--- | :--- | :--- |
| **VBO** | **V**ertex **B**uffer Object | 頂點零件倉庫 | 每個頂點真實的座標與顏色（`Float32Array`） | `gl.ARRAY_BUFFER` |
| **EBO** | **E**lement **B**uffer Object | 頂點連線編號清單 | 哪三個編號連成一個三角形（`Uint16Array`），用來重複利用頂點、省記憶體 | `gl.ELEMENT_ARRAY_BUFFER` |
| **VAO** | **V**ertex **A**rray Object | 總說明書 / 錄影帶 | **不存數字本身！** 只記錄「怎麼切 VBO 的規則」與「綁定了哪個 EBO」 | `gl.bindVertexArray(vao)` |

> **新手必記地雷**：VAO 開啟錄影（`bindVertexArray(vao)`）期間，會一併錄下當時綁定的 EBO；所以一定要**先 `gl.bindVertexArray(null)` 停止錄影**，絕對不要在解綁 VAO 之前把 EBO 解綁！

---

## 二、第 1 課核心概念：管線、GLSL 與基本繪製

### 1. GPU 與著色器（Shader）
- **Shader（著色器）**：寫給 GPU 幾千個小工人同時執行的專屬小程式（因為 GPU 看不懂 JavaScript）。
- **GLSL ES 3.00**：WebGL 2.0 專用的著色器程式語言版本；檔頭第一行必須是 `#version 300 es`（上方不可有任何空行或註解）。
- **兩站接力合作**：
  - **頂點著色器（Vertex Shader，副檔名 `.vert`）**：每個頂點跑 1 次，負責決定位置（指派給內建變數 `gl_Position`）。
  - **片段著色器（Fragment Shader，副檔名 `.frag`）**：圖形覆蓋到的每顆像素跑 1 次，負責決定最終 RGBA 顏色（輸出給自訂的 `out vec4 outColor;`）。
- **為什麼拆成 `.vert` 與 `.frag` 副檔名？** WebGL 本身只在乎收到的純文字字串；拆副檔名是業界約定，方便一眼分辨階段、對照行號除錯、自由配對材質，並讓編輯器外掛能套用正確的語法規則檢查。
- **Compile（編譯）＆ Link（連結）**：
  - `compileShader`：把純文字 GLSL 翻譯成 GPU 零件（`WebGLShader`）。
  - `createProgram`：把頂點＋片段零件組裝並檢查接點，產出可執行程式（`WebGLProgram`）。
  - WebGL 編譯／連結出錯不會主動拋出 JS 錯誤，必須手動檢查 `COMPILE_STATUS` / `LINK_STATUS` 並讀取 `InfoLog`。

### 2. GLSL 基本語法與型別（與 TypeScript 的差別）
- **型別寫在前面、變數名稱在後面**（像 C 語言）：
  ```glsl
  layout(location = 0)  in    vec2   a_position;
  // 插槽編號            方向   型別    變數名稱
  ```
- **整數與小數嚴格分家**：`float` 必須帶小數點（`1.0` 正確，`1` 會編譯錯誤）。
- **向量型別**（沒有 `vec1`，1 個小數就是 `float`）：
  - `float`：1 個小數（純量）
  - `vec2`：2 個小數（如 2D 座標 `(x, y)`）
  - `vec3`：3 個小數（如 RGB 顏色 `(r, g, b)`、3D 座標 `(x, y, z)`）
  - `vec4`：4 個小數（如 RGBA 顏色 `(r, g, b, a)`、齊次座標 `(x, y, z, w)`）
- **`precision highp float;`**：規定片段著色器內所有小數與向量預設都用 32 位元高精度計算（WebGL 規範不給 `.frag` 預設精度，沒寫一定會編譯失敗）。
- **`in` 與 `out`**：代表該站著色器的輸入入口與輸出出口；`in` 變數在著色器內是**唯讀**的。
- **`layout(location = 0)`**：明確固定該頂點屬性的硬體插槽編號，JS 設定 VAO 時直接對號碼接線。

### 3. 函式定義 vs 實際資料
- **Shader 的 `in` 變數** ＝ 函式的**參數型別定義**（裡面沒有任何實際三角形座標）。
- **JS 的 `vertices`（`Float32Array`）** ＝ 呼叫時實際塞進去的**頂點資料**。
- 兩者分開，同一份 Shader 就能重複用來畫任意形狀！

### 4. VAO 記憶體切割尺規（`vertexAttribPointer`）
每個 `Float32` 固定佔 **4 位元組（`Float32Array.BYTES_PER_ELEMENT`）**：
- **`stride`（跨距）**：從第 1 個頂點開頭跨到第 2 個頂點開頭的位元組距離（例：每個頂點 `x, y, r, g, b` 共 5 個小數 → `5 × 4 = 20` Bytes）。
- **`offset`（偏移量）**：在同一組頂點中，這個屬性從第幾個位元組開始（座標從 `0`；顏色跳過 `x, y` 從 `2 × 4 = 8` Bytes）。
- **`enableVertexAttribArray(index)`**：打開插槽開關（預設關閉，漏寫會畫不出來）。

### 5. 裁剪空間（Clip Space）與圖形被拉扁的原因
- WebGL 預設畫布座標中心在 `(0, 0)`、範圍固定為 `-1.0 ~ +1.0`、**Y 軸朝上**（與 CSS / Canvas 2D 相反）。
- `-1.0 ~ +1.0` 本質上是畫布的「百分比」；`gl.viewport` 會把它拉伸填滿整個長方形視窗，因此在沒有長寬比校正前，拉寬視窗圖形就會變扁。

---

## 三、第 2 課核心概念：EBO、Uniform、插值器與動畫

### 1. 索引繪製（EBO）
- GPU 永遠只畫三角形；畫正方形需要 2 個三角形共用 2 個角點。
- **VBO** 只存 4 個不重複的頂點；**EBO** 用 **`Uint16Array`**（16 位元無號整數，每個編號只佔 2 Bytes）記錄 6 個連線編號 `[0, 3, 1, 1, 3, 2]`。
- 開畫指令從 `gl.drawArrays` 改用 **`gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0)`**。

### 2. Uniform（全域參數）
- **同一幀內，所有頂點與像素收到的值完全一致**，而且頂點著色器與片段著色器只要宣告同名同型別就能**自動共用**。
- **使用三步驟（寄信流程）**：
  1. 在 Shader 宣告：`uniform float u_aspect;`（名稱自訂，習慣加 `u_` 前綴）。
  2. 初始化查信箱地址：`const uAspectLoc = gl.getUniformLocation(program, 'u_aspect');`（若 Shader 裡沒用到該變數會被編譯器優化掉，回傳 `null`）。
  3. **`gl.useProgram(program)` 之後**再投遞數值：
     - `gl.uniform1f(loc, val)`：傳 1 個小數（`vec2/3/4` 則為 `uniform2f/3f/4f`）
     - `gl.uniform1i(loc, val)`：傳 1 個整數（例如按鈕開關 `0` 或 `1`）
- **長寬比校正（`u_aspect = 寬 ÷ 高`）**：
  - 畫面偏寬（`u_aspect >= 1.0`）→ `pos.x /= u_aspect;`
  - 畫面偏瘦長（`u_aspect < 1.0`）→ `pos.y *= u_aspect;`

### 3. 光柵化與平滑漸層（插值器開關）
- **光柵化（Rasterization）**：GPU 將三角形 3 個頂點轉成實際涵蓋的像素格子。
- **重心座標插值（Interpolation）**：對於三角形內每顆像素，GPU 硬體會依照它與三個頂點的距離計算三點權重（加總必為 100%），自動把 `out` → `in` 的顏色加權平均，產生平滑漸層。
- **插值器開關（需在 `.vert` 與 `.frag` 成對修改）**：
  - 開啟（預設平滑漸層）：`out vec3 v_color;` / `in vec3 v_color;`（預設即 `smooth`）
  - 關閉（純色三角形）：`flat out vec3 v_color;` / `flat in vec3 v_color;`（整塊三角形改用最後一個頂點的純色）

### 4. 動畫迴圈與常用 GLSL 數學函式
- **`requestAnimationFrame(render)`**：每秒約 60 次（60 FPS）自動觸發重繪並傳入經過的毫秒數 `nowMs`；每幀不必重傳 VBO，只要塞新的 `u_time`（秒）即可流暢運算。
- **正弦波萬用公式**：`基準值 + 幅度 * sin(u_time * 速度)`（`sin` 永遠在 `-1.0 ~ +1.0` 之間平滑來回擺盪）。
- **`0.5 + 0.5 * sin(...)`**：把 `-1.0 ~ +1.0` 映射到合法 RGB 範圍 `0.0 ~ 1.0`。
- **`mix(A, B, t)`**：按比例 `t`（`0.0 ~ 1.0`）線性混合兩個數值或顏色。
