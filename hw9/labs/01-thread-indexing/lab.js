/* =========================================================
   Lab 01 — Thread Indexing 互動區
   state → controls → render()
   ========================================================= */
(function () {
  const state = { blockDim: 8, gridDim: 3, N: 20, focus: null }; // focus = 目前指到的全域索引 i

  const controls = document.getElementById("controls");
  controls.innerHTML = `
    <label class="control">blockDim.x
      <select id="blockDim">${[4, 8, 16, 32].map((v) => `<option ${v === state.blockDim ? "selected" : ""}>${v}</option>`).join("")}</select>
    </label>
    <label class="control">gridDim.x <output id="grid-out"></output>
      <input id="gridDim" type="range" min="1" max="16" value="${state.gridDim}">
    </label>
    <label class="control">N（資料長度） <output id="n-out"></output>
      <input id="N" type="range" min="1" max="64" value="${state.N}">
    </label>
    <button class="btn" id="auto">自動算 gridDim = ⌈N / blockDim⌉</button>`;

  const $ = (id) => document.getElementById(id);
  $("blockDim").onchange = (e) => { state.blockDim = +e.target.value; render(); };
  $("gridDim").oninput = (e) => { state.gridDim = +e.target.value; render(); };
  $("N").oninput = (e) => { state.N = +e.target.value; render(); };
  $("auto").onclick = () => {
    state.gridDim = Math.min(16, Math.ceil(state.N / state.blockDim));
    $("gridDim").value = state.gridDim;
    render();
  };

  function describeThread(b, t) {
    const i = b * state.blockDim + t;
    const ok = i < state.N;
    return `blockIdx.x = ${b}, threadIdx.x = ${t} → i = ${b} × ${state.blockDim} + ${t} = ${i}　` +
      (ok ? `✅ 處理 a[${i}]` : `⛔ i ≥ N（${state.N}），被 if (i < N) 擋掉`);
  }
  function describeElem(i) {
    const total = state.gridDim * state.blockDim;
    if (i >= total) return `a[${i}]：thread 總數只有 ${total}，沒有任何 thread 負責這格 ⚠️`;
    const b = Math.floor(i / state.blockDim), t = i % state.blockDim;
    return `a[${i}] 由 blockIdx.x = ${b}、threadIdx.x = ${t} 的 thread 負責`;
  }

  function render() {
    const { blockDim, gridDim, N } = state;
    $("grid-out").textContent = gridDim;
    $("n-out").textContent = N;
    const total = gridDim * blockDim;

    // grid：每個 block 一組 thread
    let html = `<div class="row-label">GRID（gridDim.x = ${gridDim}，每格數字 = threadIdx.x）</div><div class="cells wide">`;
    for (let b = 0; b < gridDim; b++) {
      html += `<div class="group"><div class="group-label">blockIdx.x = ${b}</div><div class="cells">`;
      for (let t = 0; t < blockDim; t++) {
        const i = b * blockDim + t;
        const cls = i < N ? "on" : "";
        html += `<div class="cell ${cls}${state.focus === i ? " focus" : ""}" data-b="${b}" data-t="${t}" data-i="${i}">${t}</div>`;
      }
      html += `</div></div>`;
    }
    html += `</div>`;

    // 資料陣列
    html += `<div class="row-label">陣列 a[0 … ${N - 1}]（每格數字 = 索引）</div><div class="cells">`;
    for (let i = 0; i < N; i++) {
      const cls = i < total ? "y" : "x";
      html += `<div class="cell ${cls}${state.focus === i ? " focus" : ""}" data-elem="${i}" data-i="${i}">${i}</div>`;
    }
    html += `</div>
      <div class="legend">
        <span style="--sw:var(--accent)">有工作的 thread</span>
        <span style="--sw:var(--idle)">被 if (i &lt; N) 擋掉</span>
        <span style="--sw:var(--y)">有人處理的元素</span>
        <span style="--sw:var(--x)">沒人處理（grid 開太小）</span>
      </div>`;
    const viz = $("viz");
    viz.innerHTML = html;

    viz.querySelectorAll(".cell").forEach((c) => {
      c.onmouseenter = () => {
        state.focus = +c.dataset.i;
        $("readout").textContent = c.dataset.elem !== undefined
          ? describeElem(+c.dataset.elem)
          : describeThread(+c.dataset.b, +c.dataset.t);
        viz.querySelectorAll(".cell").forEach((o) => o.classList.toggle("focus", +o.dataset.i === state.focus));
      };
    });

    const idle = Math.max(0, total - N);
    const missed = Math.max(0, N - total);
    $("stats").innerHTML = `
      <div class="stat"><div class="label">開出的 thread 總數</div><div class="value">${total}</div></div>
      <div class="stat"><div class="label">有工作的 thread</div><div class="value good">${Math.min(total, N)}</div></div>
      <div class="stat"><div class="label">被 if 擋掉的 thread</div><div class="value">${idle}</div></div>
      <div class="stat"><div class="label">沒人處理的元素</div><div class="value ${missed ? "bad" : "good"}">${missed}</div></div>`;
  }
  render();
})();
