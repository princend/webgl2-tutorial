/**
 * 共用著色器工具（延續第 1 課學過的編譯與連結流程）
 */

/**
 * 編譯單一著色器（頂點著色器或片段著色器）
 */
export function compileShader(
  gl: WebGL2RenderingContext,
  type: GLenum,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error('無法建立 WebGLShader 物件');
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const isSuccess = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!isSuccess) {
    const log = gl.getShaderInfoLog(shader) ?? '未知的著色器編譯錯誤';
    const shaderName = type === gl.VERTEX_SHADER ? '頂點著色器' : '片段著色器';
    gl.deleteShader(shader);
    throw new Error(`${shaderName}編譯失敗：\n${log}`);
  }

  return shader;
}

/**
 * 將頂點與片段著色器連結成完整的 WebGLProgram
 */
export function createProgram(
  gl: WebGL2RenderingContext,
  vertSource: string,
  fragSource: string,
): WebGLProgram {
  const vertShader = compileShader(gl, gl.VERTEX_SHADER, vertSource);
  const fragShader = compileShader(gl, gl.FRAGMENT_SHADER, fragSource);

  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);
    throw new Error('無法建立 WebGLProgram 物件');
  }

  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);

  const isSuccess = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!isSuccess) {
    const log = gl.getProgramInfoLog(program) ?? '未知的程式連結錯誤';
    gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);
    gl.deleteProgram(program);
    throw new Error(`著色器程式連結失敗：\n${log}`);
  }

  gl.deleteShader(vertShader);
  gl.deleteShader(fragShader);

  return program;
}
