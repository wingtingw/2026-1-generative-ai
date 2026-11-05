/* =========================================================
   Lab 02 — Memory Coalescing 互動區
   state → controls → render()
   ========================================================= */
(function () {
  const WARP = 32, SECTOR = 32;
  const state = { stride: 1, offset: 0, size: 4 };

  const controls = document.getElementById("controls");
  controls.innerHTML = `
    <label class="control">stride（元素）
      <select id="stride">${[1, 2, 3, 4, 8, 16, 32].map((v) => `<option ${v === state.stride ? "selected" : ""}>${v}</option>`).join("")}</select>
    </label>
    <label class="control">offset（元素） <output id="off-out"></output>
      <input id="offset" type="range" min="0" max="8" value="${state.offset}">
    </label>
    <label class="control">型別
      <select id="size"><option value="4" selected>float（4 bytes）</option><option value="8">double（8 bytes）</option></select>
    </label>`;

  const $ = (id) => document.getElementById(id);
  $("stride").onchange = (e) => { state.stride = +e.target.value; render(); };
  $("offset").oninput = (e) => { state.offset = +e.target.value; render(); };
  $("size").onchange = (e) => { state.size = +e.target.value; render(); };

  function render() {
    const { stride, offset, size } = state;
    $("off-out").textContent = offset;

    const addr = Array.from({ length: WARP }, (_, lane) => (lane * stride + offset) * size);
    const sectorOf = addr.map((a) => Math.floor(a / SECTOR));
    const touched = new Set(sectorOf);
    const shown = Math.max(8, Math.max(...sectorOf) + 1);

    let html = `<div class="row-label">WARP 的 32 個 lane（數字 = lane 編號）</div><div class="cells">`;
    for (let l = 0; l < WARP; l++) html += `<div class="cell on" data-lane="${l}">${l}</div>`;
    html += `</div><div class="row-label">global memory 的 32-byte sector（數字 = sector 編號，顯示 0 ～ ${shown - 1}）</div><div class="cells">`;
    for (let s = 0; s < shown; s++) html += `<div class="cell ${touched.has(s) ? "x" : ""}" data-sector="${s}">${s}</div>`;
    html += `</div>
      <div class="legend">
        <span style="--sw:var(--x)">會被搬運的 sector</span>
        <span style="--sw:var(--idle)">沒碰到的 sector</span>
      </div>`;
    const viz = $("viz");
    viz.innerHTML = html;

    const clearFocus = () => viz.querySelectorAll(".focus").forEach((c) => c.classList.remove("focus"));
    viz.querySelectorAll("[data-lane]").forEach((c) => {
      c.onmouseenter = () => {
        const l = +c.dataset.lane, s = sectorOf[l];
        clearFocus();
        c.classList.add("focus");
        viz.querySelector(`[data-sector="${s}"]`).classList.add("focus");
        $("readout").textContent =
          `lane ${l} 讀 in[${l} × ${stride} + ${offset}] = in[${l * stride + offset}]，位址 ${addr[l]} bytes → sector ${s}（${s * SECTOR}～${s * SECTOR + SECTOR - 1}）`;
      };
    });
    viz.querySelectorAll("[data-sector]").forEach((c) => {
      c.onmouseenter = () => {
        const s = +c.dataset.sector;
        const lanes = sectorOf.map((v, l) => (v === s ? l : -1)).filter((l) => l >= 0);
        clearFocus();
        c.classList.add("focus");
        lanes.forEach((l) => viz.querySelector(`[data-lane="${l}"]`).classList.add("focus"));
        const used = lanes.length * size;
        $("readout").textContent = lanes.length
          ? `sector ${s}：被 lane ${lanes.join(", ")} 使用，32 bytes 裡用到 ${used} bytes（${Math.round((used / SECTOR) * 100)}%）`
          : `sector ${s}：沒有 lane 讀它，不會被搬運`;
      };
    });

    const requested = WARP * size;
    const moved = touched.size * SECTOR;
    const eff = requested / moved;
    $("stats").innerHTML = `
      <div class="stat"><div class="label">實際需要的資料</div><div class="value">${requested} B</div></div>
      <div class="stat"><div class="label">碰到的 sector 數</div><div class="value">${touched.size}</div></div>
      <div class="stat"><div class="label">實際搬運量</div><div class="value">${moved} B</div></div>
      <div class="stat"><div class="label">頻寬效率</div><div class="value ${eff >= 0.99 ? "good" : eff < 0.5 ? "bad" : ""}">${(eff * 100).toFixed(1)}%</div></div>`;
  }
  render();
})();
