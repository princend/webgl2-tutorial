#version 300 es
precision highp float;

in vec3 v_color;

// TODO (步驟 4)：宣告 uniform float u_time，讓像素顏色隨時間流動變化

out vec4 outColor;

void main() {
  outColor = vec4(v_color, 1.0);
}
