#version 300 es

layout(location = 0) in vec2 a_position; // 0 號插槽：2D 頂點位置 (x, y)
layout(location = 1) in vec3 a_color;    // 1 號插槽：RGB 頂點顏色 (r, g, b)

// TODO (步驟 2)：宣告 uniform float u_aspect（校正畫布長寬比，防止被拉扁）
// TODO (步驟 3)：宣告 uniform float u_time（經過的秒數，用來做漂浮與呼吸縮放動畫）

out vec3 v_color;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_color = a_color;
}
