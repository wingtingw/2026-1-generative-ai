# CUDA Playbook · CUDA 互動學習手冊

一個用「動手調參數」的方式學 CUDA 的靜態網站。每個 Lab 只講一個概念，配一個互動區、對應的 kernel 程式碼和自我檢查題。

🌐 網站：https://wingtingw.github.io/2026-1-generative-ai/hw9/

| Lab | 主題 |
|---|---|
| 01 | Thread Indexing：每個 thread 算哪一格？ |
| 02 | Memory Coalescing：一個 warp 讀了幾個 sector？ |
| 03 | Warp Divergence：if/else 讓 warp 跑兩次 |
| 04 | Shared Memory Tiling（規劃中） |

## 本機預覽

```bash
python3 -m http.server 8000
# 打開 http://localhost:8000
```

## 用 AI 繼續擴充

這個專案的規則都寫在 [`AGENTS.md`](AGENTS.md)（`CLAUDE.md` 會匯入它）。
請 AI 讀完後照 §8 的 SOP 新增 Lab，再執行：

```bash
python3 scripts/check_labs.py
```

全部 ✅ 才算完成。

## 結構

- `data/labs.js`：Lab 註冊表（首頁卡片與每頁標頭都由它產生）
- `labs/NN-slug/`：每個 Lab 的內容（`index.html`）與互動程式（`lab.js`）
- `templates/lab/`：新 Lab 模板
- `assets/`：全站共用的 CSS 與 JS
- `legacy/`：之前做的 CUDA Index Playground（保留原樣）
