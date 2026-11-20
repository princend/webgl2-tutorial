#version 300 es
// 片段著色器在 WebGL 中必須明確指定浮點數精度，否則會編譯失敗
precision highp float;

// TODO (步驟 1-B)：宣告片段著色器的輸入與輸出變數
// 1. 接收來自頂點著色器插值後的顏色（名稱與型別必須和頂點著色器的 out 一致）：in vec3 v_color;
// 2. 宣告片段著色器的最終顏色輸出（WebGL 2.0 已廢棄 gl_FragColor）：out vec4 outColor;

void main() {
  // TODO (步驟 1-B)：將接收到的 RGB 顏色補上不透明度 1.0，輸出給 outColor
}
