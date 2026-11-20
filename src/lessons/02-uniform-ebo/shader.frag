#version 300 es
precision highp float;

// 成對接收「開啟插值」與「關閉插值」的顏色（修飾詞、名稱、型別必須與頂點著色器一致）
in vec3 v_smoothColor;
flat in vec3 v_flatColor;

// 步驟 4：宣告與頂點著色器同名的 uniform float u_time
// 在同一個 Program 裡，JS 傳一次 u_time，頂點與片段著色器會自動同時收到！
uniform float u_time;

// 接收按鈕開關狀態：0 = 開啟平滑插值（smooth），1 = 關閉插值（flat）
uniform int u_flatMode;

out vec4 outColor;

void main() {
  // 1. 依照按鈕開關，決定要使用「平滑插值後」還是「關閉插值純色」的底色
  vec3 baseColor = (u_flatMode == 1) ? v_flatColor : v_smoothColor;

  // 2. 產生隨時間流動的霓虹 RGB 顏色（0.0 ~ 1.0）：
  //    + vec3(0.0, 2.0, 4.0) 讓 R、G、B 三個顏色的波浪錯開時間點，形成彩虹循環！
  //    0.5 + 0.5 * sin(...) 把 -1.0 ~ +1.0 映射到合法的顏色範圍 0.0 ~ 1.0
  vec3 neon = 0.5 + 0.5 * sin(u_time * 1.5 + vec3(0.0, 2.0, 4.0));

  // 3. 用內建函式 mix(A, B, 比例) 將底色與動態霓虹色混合：
  //    0.45 代表「保留 55% 底色 + 混入 45% 流動霓虹色」
  vec3 finalColor = mix(baseColor, neon, 0.45);

  outColor = vec4(finalColor, 1.0);
}
