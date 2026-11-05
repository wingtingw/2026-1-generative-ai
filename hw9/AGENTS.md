# AGENTS.md — CUDA Playbook 專案規則

> 給 AI coding agent（Claude Code、Codex、Cursor…）看的專案說明書。
> **開始任何修改前，請完整讀完這份文件。** 以下所有路徑都相對於 `hw9/`。 如果使用者的要求和這份文件衝突，先指出衝突、問清楚再動手。

---

## 1. 專案目的

**CUDA Playbook（CUDA 互動學習手冊）** 是一個用來學 GPU 程式設計的靜態網站。

- 每個 **Lab** 只講 **一個** CUDA 核心概念（例如 thread indexing、memory coalescing）。
- 每個 Lab 都有：一句話目標 → 概念說明 → **可以動手調參數的互動區** → 對應的 kernel 程式碼 → 常見誤區 → 自我檢查 → 參考資料。
- 讀者：學過 C、剛開始學 CUDA 的大學生／研究生。
- 原則：**先讓讀者「看到」現象，再給公式。** 互動區是每個 Lab 的主角，不是裝飾。

非目標：這裡不是 API 文件、不放完整的效能 benchmark、不需要真的在瀏覽器裡跑 CUDA。互動區用 JavaScript 模擬「概念模型」即可，但模型必須正確，簡化的地方要寫出來（見 §7）。

## 2. 技術限制

| 項目 | 規則 |
|---|---|
| 技術 | 純 HTML + CSS + 原生 JavaScript（ES2020）。**不使用** 框架、打包工具、npm 套件。 |
| 部署 | GitHub Pages（repo `wingtingw/2026-1-generative-ai` 的 `main` 分支根目錄）。本專案位於 `hw9/`，網址 https://wingtingw.github.io/2026-1-generative-ai/hw9/，不需要 build。 |
| 外部資源 | 只允許 Google Fonts（Noto Sans TC、JetBrains Mono）。不得載入任何外部 JS / CDN。 |
| 本機預覽 | 在 `hw9/` 裡執行 `python3 -m http.server 8000`，打開 <http://localhost:8000> |
| 語言 | 內容一律用 **繁體中文（台灣用語）**；CUDA 術語保留英文並用 `code` 標示，第一次出現時附中文解釋。 |
| 路徑 | 全部使用 **相對路徑**（網站會部署在 `/<repo>/` 子路徑下，絕對路徑 `/assets/...` 會壞掉）。 |

## 3. 目錄結構

```
hw9/                          ← 本專案根目錄（repo 根目錄的 index.html 是 hw5，不屬於本專案，不要動）
├── AGENTS.md                 ← 你正在讀的規則（唯一真相來源）
├── CLAUDE.md                 ← 給 Claude Code，內容只是匯入本檔
├── README.md                 ← 給人類看的介紹
├── index.html                ← 首頁：卡片由 site.js 依 registry 自動產生
├── data/
│   └── labs.js               ← ★ Lab 註冊表（metadata 唯一來源）
├── assets/
│   ├── css/style.css         ← 全站唯一的樣式表
│   └── js/site.js            ← 全站共用：頂部列、首頁卡片、Lab 標頭、上一頁/下一頁、頁尾
├── labs/
│   └── NN-slug/              ← 每個 Lab 一個資料夾
│       ├── index.html        ← 內容（7 個固定區塊）
│       └── lab.js            ← 這個 Lab 的互動區程式
├── templates/
│   └── lab/                  ← 新 Lab 的模板（index.html + lab.js）
├── legacy/                   ← 舊作品，保留原樣，不套用本規則、不要修改
└── scripts/
    └── check_labs.py         ← 規則檢查器
```

**責任分工（不要越界）：**

- 標題、摘要、標籤、難度、時間 → **只寫在 `data/labs.js`**，不要寫死在 Lab 的 HTML 裡。
- 全站外觀 → **只寫在 `assets/css/style.css`**。Lab 頁不可以有 `<style>` 或 inline style。
- 共用行為 → `assets/js/site.js`。單一 Lab 的互動邏輯 → 該 Lab 的 `lab.js`。

## 4. 視覺風格

整體感覺：**乾淨的工程筆記本**——淺米灰底、白色卡片、等寬字標籤、少量但明確的強調色。

**顏色只能用 CSS 變數**（定義在 `style.css` 的 `:root`），而且每個顏色有固定語意，所有 Lab 都要一致：

| 變數 | 色碼 | 語意（固定用途） |
|---|---|---|
| `--accent` | `#76b900` | 啟用中、正在工作的 thread / lane、「好」的結果 |
| `--accent-ink` | `#3f6600` | 綠色系文字、連結 |
| `--x` | `#d4621f` | x 方向 / 第一個變數 / 浪費、警告、「壞」的結果 |
| `--y` | `#0f8a7a` | y 方向 / 第二個變數 / 另一組狀態 |
| `--idle` | `#c3c9c1` | 未使用、被遮蔽、閒置 |
| `--hl` | `#111513` | 程式碼區塊背景、focus 外框 |
| `--ink` / `--muted` / `--line` / `--soft` / `--bg` / `--panel` | — | 文字、次要文字、框線、淺底、頁面底、卡片底 |

字體：內文 `Noto Sans TC`，程式碼與數字 `JetBrains Mono`。

**禁止：** 新增色碼、漸層背景、陰影堆疊、emoji 當裝飾標題（callout 內建的 💡/⚠️ 除外）、動畫超過 0.2 秒。

如果真的需要新的視覺元件，先在 `style.css` 新增一個有註解的 class，讓之後所有 Lab 都能重用，而不是在單一 Lab 裡特製。

## 5. Lab 註冊表 `data/labs.js`

每個 Lab 在 `window.LABS` 陣列中佔一筆，**依編號由小到大排列**：

```js
{
  id: "02-memory-coalescing",   // = 資料夾名稱，格式：兩位數-kebab-case
  num: "02",                    // = id 的前兩碼
  title: "Memory Coalescing：一個 warp 讀了幾個 sector？", // 「英文概念名：一個中文問題」
  summary: "……",               // 一句話，80 字以內，說讀者會「做什麼、看到什麼」
  tags: ["memory", "performance"], // 1～3 個，小寫英文 kebab-case，優先重用既有標籤
  level: 2,                     // 1 入門 / 2 進階 / 3 挑戰
  minutes: 15,                  // 預估閱讀 + 操作時間
  status: "done"                // done = 已完成；planned = 規劃中（首頁顯示虛線灰卡，不可點）
}
```

- 既有標籤：`basics`、`indexing`、`memory`、`performance`、`warp`、`gemm`。新增標籤前先確認既有的不適用。
- 寫法維持「一個欄位一行、字串用雙引號」，`check_labs.py` 靠這個格式解析。
- 首頁卡片、Lab 頁標頭、`<title>`、上一頁/下一頁 **全部** 由 `site.js` 從這裡自動產生，所以改標題只要改這裡。

## 6. Lab 頁面規格

### 6.1 命名與放置

- 資料夾：`labs/NN-slug/`，`NN` 從 `01` 連續編號不跳號，`slug` 是英文 kebab-case 的概念名。
- 每個資料夾**只有** `index.html` 和 `lab.js` 兩個檔案。需要圖片時放 `labs/NN-slug/img/`，檔名 kebab-case。
- 編號代表學習順序：後面的 Lab 可以引用前面的概念，前面的不可以依賴後面的。

### 6.2 `index.html`：7 個固定區塊

`<body>` 必須是：

```html
<body data-page="lab" data-lab="NN-slug" data-root="../../">
```

`<main class="wrap">` 裡第一個元素是 `<div id="lab-head"></div>`（由 site.js 填入），接著 **依序** 是以下 7 個 `section`，id 和順序不可以改：

| # | `id` | `h2` 文字 | 內容規則 |
|---|---|---|---|
| 1 | `goal` | 目標 | 一個 `<p class="goal">`，一句話：讀完能理解什麼。 |
| 2 | `concept` | 概念 | 2～4 段。至少一個 `.formula`（核心公式或關係式），變數用 `.vx` / `.vy` 上色，顏色要和互動區一致。 |
| 3 | `playground` | 互動區 | 固定骨架：`.playground` 裡放 `#controls`、`#viz`、`#readout`、`#stats`。簡化假設寫在下方 `.callout.tip`。 |
| 4 | `code` | Kernel 程式碼 | 一個 `pre.code`，**最小可編譯** 的 kernel（＋必要時 host 端呼叫），用 `.c` 註解 / `.k` 關鍵字 / `.n` 數字 手動上色。變數名稱要和互動區相同。 |
| 5 | `pitfalls` | 常見誤區 | `ul.pitfalls`，2～4 條，格式 `<strong>錯誤的想法：</strong>為什麼錯、正確是什麼`。 |
| 6 | `check` | 自我檢查 | 2～4 題 `details.quiz`。**至少一題要讓讀者用互動區驗證答案**。答案要附理由，不能只給數字。 |
| 7 | `refs` | 參考資料 | 優先 NVIDIA 官方文件（Programming Guide、Best Practices Guide），註明對應章節名稱。 |

每個 `h2` 帶 `data-label="1"`～`"7"`。script 載入順序固定：`../../data/labs.js` → `../../assets/js/site.js` → `lab.js`。

### 6.3 `lab.js`：互動區程式

固定結構（參考 `templates/lab/lab.js`）：

```js
(function () {
  const state = { /* 所有可調參數 + 預設值 */ };
  // 1. 在 #controls 產生控制項，事件只做兩件事：更新 state、呼叫 render()
  // 2. render()：依 state 整個重畫 #viz 和 #stats
  // 3. hover 格子時更新 #readout，用一句完整的中文說明「這格代表什麼、數字怎麼算出來」
  render();
})();
```

規則：

- 用 IIFE 包起來，不污染全域；只能操作 `#controls`、`#viz`、`#readout`、`#stats`。
- 格子一律用共用的 `.cell`（狀態 class：`.on` / `.x` / `.y` / `.focus`），分組用 `.group` + `.group-label`，每列標題用 `.row-label`。
- 每個視覺化都要有 `.legend` 圖例。圖例色塊用 `style="--sw:var(--accent)"`——**這是唯一允許的 inline style**。
- `#stats` 放 3～4 個 `.stat`，最後一個是這個 Lab 的「關鍵指標」（例如效率），好的用 `.good`、差的用 `.bad`。
- 預設參數要呈現「最典型、最好懂」的情況，讓讀者一打開就看得懂，再自己調出壞情況。
- 不使用 `localStorage`、網路請求、`alert()`。

## 7. 內容寫作規則

1. **正確性優先**：CUDA 的數字（warp = 32、sector = 32 bytes 等）要和 NVIDIA 官方文件一致。不確定的事不要寫成肯定句。
2. **簡化要誠實**：互動區是概念模型，凡是忽略的因素（cache、多個 warp、編譯器最佳化…）都要寫在 `.callout.tip` 或 `.callout.warn`。
3. **三處一致**：概念區的公式、互動區的變數名、kernel 程式碼的變數名要是同一套（例如都叫 `stride`、`offset`）。
4. 語氣：像學長姊寫給學弟妹的筆記，口語但精確；用「你」稱呼讀者；不寫「本文將介紹…」這種開場。
5. 一段不超過 4 句；數字和單位之間不空格的寫法統一為 `32 bytes`、`128 B`（stats 裡用 `B`）。

## 8. 新增一個 Lab 的 SOP（AI 請照順序做）

1. **確認主題**：一個 Lab 一個概念。如果使用者給的主題太大（例如「CUDA 最佳化」），先提議拆成數個 Lab 並問使用者。
2. **登記**：在 `data/labs.js` 新增一筆（或把 `planned` 那筆改成 `done`），依 §5 填好欄位。
3. **複製模板**：`cp -r templates/lab labs/NN-slug`
4. **改 `index.html`**：設定 `data-lab`，依 §6.2 填滿 7 個區塊，換掉所有 `TODO`。
5. **寫 `lab.js`**：依 §6.3，先決定「讀者要調哪 1～3 個參數、要看到什麼現象、關鍵指標是什麼」再寫。
6. **檢查**：執行 `python3 scripts/check_labs.py`，必須全部 ✅。
7. **自己操作一次**：本機開 server，把每個控制項都調一遍，確認 readout 的數字和 stats 對得上、自我檢查的答案和互動區結果一致。
8. **回報**：告訴使用者新增了哪些檔案、互動區做了什麼、哪些地方做了簡化。

**修改既有 Lab** 時：保持 7 個區塊結構不變；改標題/摘要去 `data/labs.js`；改完一樣要跑 `check_labs.py`。

## 9. 禁止事項

- ❌ 修改 `legacy/` 裡的任何檔案，或 `hw9/` 以外的檔案（repo 裡其他資料夾是別週的作業）。
- ❌ 在 Lab 頁裡寫 `<style>`、inline style（`--sw` 圖例除外）、新的色碼。
- ❌ 引入框架、npm、CDN、build 步驟。
- ❌ 把 metadata（標題、摘要、標籤）寫死在 HTML 裡。
- ❌ 刪除或重新編號已發佈的 Lab（網址會壞掉）。要淘汰就把內容改成指向新 Lab。
- ❌ 沒跑 `check_labs.py` 就說完成。

## 10. Commit 規則

- 訊息格式：`<type>(<scope>): <說明>`，例如 `feat(lab-04): add shared memory tiling playground`、`fix(lab-02): offset 超過範圍時 sector 數錯誤`、`docs(agents): 補充標籤清單`。
- type：`feat` 新 Lab 或功能、`fix` 修正、`style` 只改外觀、`docs` 文件、`chore` 雜項。
- 一個 commit 只做一件事；新增 Lab 時 registry、資料夾一起 commit。
