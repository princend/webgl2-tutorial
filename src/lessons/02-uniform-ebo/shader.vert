#version 300 es

layout(location = 0) in vec2 a_position; // 0 號插槽：2D 頂點位置 (x, y)
layout(location = 1) in vec3 a_color;    // 1 號插槽：RGB 頂點顏色 (r, g, b)

// 步驟 2：宣告 uniform 全域參數，接收 JS 傳進來的畫布長寬比（寬 ÷ 高）
uniform float u_aspect;
// 步驟 3：宣告 uniform 全域參數，接收 JS 傳進來的經過時間（單位：秒）
uniform float u_time;

// 同時輸出兩份顏色，方便在網頁按鈕即時對比「開啟 vs 關閉插值器」的差異：
out vec3 v_smoothColor;      // 預設（smooth）：GPU 光柵化會自動做平滑漸層插值
flat out vec3 v_flatColor;   // 加上 flat：關閉插值，整個三角形改用最後一個頂點的純色

void main() {
  // 1. 呼吸縮放：sin(...) 在 -1.0 ~ +1.0 之間來回擺盪
  //    乘 0.15 縮成 ±0.15，再加 1.0 → 縮放倍率在 0.85 ~ 1.15 倍之間平滑呼吸
  float scale = 1.0 + 0.15 * sin(u_time * 2.5);

  // 2. 在正中央原地縮放（向量乘純量會同時縮放 x 和 y）
  vec2 pos = a_position * scale;

  // 3. 最後一步做畫布長寬比校正，確保無論視窗多寬或多窄都永遠保持正方形
  if (u_aspect >= 1.0) {
    pos.x /= u_aspect; // 畫面偏寬：把橫向縮回來
  } else {
    pos.y *= u_aspect; // 畫面偏瘦長：把縱向縮回來
  }

  gl_Position = vec4(pos, 0.0, 1.0);
  v_smoothColor = a_color;
  v_flatColor = a_color;
}
