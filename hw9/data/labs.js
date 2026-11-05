/* =========================================================
   Lab 註冊表（唯一的資料來源）
   新增 / 修改 Lab 時只改這裡的 metadata；首頁卡片、Lab 頁標頭、
   上一頁/下一頁都會自動從這裡產生。欄位規則見 AGENTS.md §5。
   ========================================================= */
window.SITE = {
  title: "CUDA Playbook",
  subtitle: "CUDA 互動學習手冊",
  author: "吳盈庭",
  repo: "https://github.com/wingtingw/2026-1-generative-ai/tree/main/hw9"
};

window.LABS = [
  {
    id: "01-thread-indexing",
    num: "01",
    title: "Thread Indexing：每個 thread 算哪一格？",
    summary: "用 blockIdx、blockDim、threadIdx 算出全域索引 i，並理解為什麼一定要寫 if (i < N)。",
    tags: ["indexing", "basics"],
    level: 1,
    minutes: 10,
    status: "done"
  },
  {
    id: "02-memory-coalescing",
    num: "02",
    title: "Memory Coalescing：一個 warp 讀了幾個 sector？",
    summary: "調整 stride 與 offset，看 32 個 lane 的讀取如何被合併成 32-byte sector，以及頻寬效率怎麼掉下來。",
    tags: ["memory", "performance"],
    level: 2,
    minutes: 15,
    status: "done"
  },
  {
    id: "03-warp-divergence",
    num: "03",
    title: "Warp Divergence：if/else 讓 warp 跑兩次",
    summary: "選擇不同的分支條件，觀察同一個 warp 內 lane 走不同路徑時，SIMT 效率如何下降。",
    tags: ["warp", "performance"],
    level: 2,
    minutes: 12,
    status: "done"
  },
  {
    id: "04-shared-memory-tiling",
    num: "04",
    title: "Shared Memory Tiling：把 GEMM 切成小塊",
    summary: "（規劃中）用 tile 重複利用 shared memory 裡的資料，減少 global memory 讀取次數。",
    tags: ["memory", "gemm"],
    level: 3,
    minutes: 20,
    status: "planned"
  }
];
