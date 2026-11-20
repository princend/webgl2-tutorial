#version 300 es
// 注意：#version 300 es 必須位在第一行最前面，上方不可有任何空行或註解！

// 從頂點緩衝區（VBO / VAO）接收的每個頂點資料
layout(location = 0) in vec2 a_position; // 屬性編號 0：2D 頂點位置 (x, y)
layout(location = 1) in vec3 a_color;    // 屬性編號 1：RGB 頂點顏色 (r, g, b)

// 傳遞給下一個階段（光柵化插值 → 片段著色器）的顏色
out vec3 v_color;

void main() {
  // 1. 將 2D 座標補上 z = 0.0、w = 1.0，轉為 4D 裁剪空間座標賦值給內建變數 gl_Position
  gl_Position = vec4(a_position, 0.0, 1.0);

  // 2. 將這個頂點的顏色送往光柵化階段（三個頂點之間的像素會自動線性插值）
  v_color = a_color;
}
