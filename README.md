# WebGL 2.0 實戰系列教程

專為前端工程師設計的 **WebGL 2.0（GLSL ES 3.00）** 循序漸進實作專案。

## 快速開始

```bash
npm install
npm run dev
```

啟動後請開啟終端機顯示的本地網址（預設為 `http://localhost:5173`）瀏覽課程列表。

## 課程進度

- [ ] **第 1 課**：WebGL 2.0 核心概念與第一個彩色三角形（`src/lessons/01-triangle`）
- [ ] **第 2 課**：著色器資料傳遞（Uniform / EBO）與動態動畫
- [ ] **第 3 課**：座標系統與 2D 矩陣變換
- [ ] **第 4 課**：紋理貼圖（Texture）與影像濾鏡實作
- [ ] **第 5 課**：3D 空間、透視投影（MVP）與深度測試
- [ ] **第 6 課**：3D 光照模型（布林-馮氏光照）
- [ ] **第 7 課**：離屏渲染（Framebuffer）與畫面後處理特效
- [ ] **第 8 課**：WebGL 2.0 高效能核心特性（Instancing、UBO 與 Transform Feedback）

## 專案結構

```text
src/
├── common/         # 共用畫布、尺寸同步與除錯提示工具
├── styles/         # 課程共用介面樣式
└── lessons/        # 各堂課獨立實作資料夾
    └── 01-triangle/
        ├── index.html   # 本課頁面
        ├── main.ts      # JavaScript / TypeScript 主程式
        ├── shader.vert  # 頂點著色器（GLSL ES 3.00）
        └── shader.frag  # 片段著色器（GLSL ES 3.00）
```
