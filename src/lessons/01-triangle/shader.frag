#version 300 es
// 片段著色器在 WebGL 中必須明確指定浮點數精度，否則會編譯失敗
precision highp float;

// 接收來自頂點著色器、經由光柵化插值後的顏色（名稱與型別必須與頂點著色器的 out 一致）
in vec3 v_color;

// 宣告最終要寫入畫布像素的 RGBA 輸出顏色（WebGL 2.0 已取代舊版的 gl_FragColor）
out vec4 outColor;

void main() {
  // 將插值後的 RGB 顏色補上不透明度 Alpha = 1.0（完全不透明）
  outColor = vec4(v_color, 1.0);
}
