#version 300 es
// 注意：#version 300 es 必須位在第一行最前面，上方不可有任何空行或註解！

// TODO (步驟 1-A)：宣告頂點著色器的輸入與輸出變數
// 1. 使用 layout(location = 0) 宣告輸入的 2D 頂點位置：in vec2 a_position;
// 2. 使用 layout(location = 1) 宣告輸入的 RGB 頂點顏色：in vec3 a_color;
// 3. 宣告要傳遞給片段著色器的輸出顏色：out vec3 v_color;

void main() {
  // TODO (步驟 1-A)：
  // 1. 將 2D 座標轉換成四維裁剪空間座標賦值給內建變數 gl_Position（z = 0.0, w = 1.0）
  // 2. 將 a_color 傳給 v_color（光柵化階段會自動在三個頂點間進行顏色插值）
  gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
}
