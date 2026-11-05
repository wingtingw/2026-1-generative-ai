/* =========================================================
   Lab 03 — Warp Divergence 互動區
   state → controls → render()
   ========================================================= */
(function () {
  const WARP = 32, THREADS = 64;

  // 固定種子的「隨機資料」，讓每次打開頁面結果一樣
  const data = Array.from({ length: THREADS }, (_, i) => Math.sin(i * 12.9898 + 4.1414) * 43758.5453 % 1);

  const presets = {
    "tid % 2 == 0":          (t) => t % 2 === 0,
    "tid < 16":              (t) => t < 16,
    "tid < 32":              (t) => t < 32,
    "tid < 40":              (t) => t < 40,
    "(tid / 32) % 2 == 0":   (t) => Math.floor(t / 32) % 2 === 0,
    "a[tid] > 0（資料相依）": (t) => data[t] > 0
  };
  const state = { cond: "tid % 2 == 0" };

  const controls = document.getElementById("controls");
  controls.innerHTML = `
    <label class="control">分支條件 if ( … )
      <select id="cond">${Object.keys(presets).map((k) => `<option ${k === state.cond ? "selected" : ""}>${k}</option>`).join("")}</select>
    </label>`;
  const $ = (id) => document.getElementById(id);
  $("cond").onchange = (e) => { state.cond = e.target.value; render(); };

  function render() {
    const f = presets[state.cond];
    let html = "", passes = 0;

    for (let w = 0; w < THREADS / WARP; w++) {
      const lanes = Array.from({ length: WARP }, (_, l) => w * WARP + l);
      const taken = lanes.map(f);
      const nIf = taken.filter(Boolean).length, nElse = WARP - nIf;
      const paths = (nIf > 0) + (nElse > 0);
      passes += paths;

      const row = (label, active, cls, count) => {
        const skipped = count === 0;
        return `<div class="row-label">${label}：${skipped ? "沒有 lane 要走 → 跳過" : `${count} 個 lane 工作、${WARP - count} 個閒置`}</div>
          <div class="cells${skipped ? " dim" : ""}">${
            lanes.map((t, l) => `<div class="cell ${active[l] ? cls : ""}" data-t="${t}">${l}</div>`).join("")
          }</div>`;
      };
      html += `<div class="group stack">
        <div class="group-label">warp ${w}（threadIdx.x ${w * WARP} ～ ${w * WARP + WARP - 1}）· 需要執行 ${paths} 條路徑 ${paths === 2 ? "⚠️ divergence" : "✅"}</div>
        ${row("第 1 輪：if 路徑", taken, "on", nIf)}
        ${row("第 2 輪：else 路徑", taken.map((v) => !v), "y", nElse)}
      </div>`;
    }
    html += `<div class="legend">
      <span style="--sw:var(--accent)">執行 if 的 lane</span>
      <span style="--sw:var(--y)">執行 else 的 lane</span>
      <span style="--sw:var(--idle)">被遮蔽、閒置</span></div>`;
    const viz = $("viz");
    viz.innerHTML = html;

    viz.querySelectorAll(".cell").forEach((c) => {
      c.onmouseenter = () => {
        const t = +c.dataset.t;
        viz.querySelectorAll(".cell").forEach((o) => o.classList.toggle("focus", +o.dataset.t === t));
        const extra = state.cond.startsWith("a[") ? `（a[${t}] = ${data[t].toFixed(2)}）` : "";
        $("readout").textContent =
          `threadIdx.x = ${t}（warp ${Math.floor(t / WARP)}、lane ${t % WARP}）${extra}：條件 ${f(t) ? "成立 → 走 if" : "不成立 → 走 else"}`;
      };
    });

    const eff = THREADS / (WARP * passes);
    $("stats").innerHTML = `
      <div class="stat"><div class="label">warp 數</div><div class="value">${THREADS / WARP}</div></div>
      <div class="stat"><div class="label">實際執行的路徑數</div><div class="value">${passes}</div></div>
      <div class="stat"><div class="label">理想路徑數（無分歧）</div><div class="value">${THREADS / WARP}</div></div>
      <div class="stat"><div class="label">SIMT 效率</div><div class="value ${eff >= 0.99 ? "good" : "bad"}">${(eff * 100).toFixed(1)}%</div></div>`;
  }
  render();
})();
