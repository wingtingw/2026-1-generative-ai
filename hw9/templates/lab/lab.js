/* =========================================================
   Lab TODO — 互動區程式
   結構固定為：state → controls → render()（AGENTS.md §6.3）
   只能操作 #controls、#viz、#readout、#stats 這 4 個元素
   ========================================================= */
(function () {
  // 1) 狀態：所有可調參數都放這裡，並給預設值
  const state = { n: 8 };

  // 2) 控制項
  const controls = document.getElementById("controls");
  controls.innerHTML = `
    <label class="control">TODO 參數 <output id="n-out"></output>
      <input id="n" type="range" min="1" max="32" value="${state.n}">
    </label>`;
  controls.querySelector("#n").oninput = (e) => { state.n = +e.target.value; render(); };

  // 3) 畫面：每次參數變動就整個重畫
  function render() {
    document.getElementById("n-out").textContent = state.n;
    const viz = document.getElementById("viz");
    viz.innerHTML = `<div class="cells">${
      Array.from({ length: state.n }, (_, i) => `<div class="cell on" data-i="${i}">${i}</div>`).join("")
    }</div>`;
    viz.querySelectorAll(".cell").forEach((c) => {
      c.onmouseenter = () => {
        document.getElementById("readout").textContent = `TODO：格子 ${c.dataset.i} 的說明`;
      };
    });
    document.getElementById("stats").innerHTML = `
      <div class="stat"><div class="label">TODO 指標</div><div class="value">${state.n}</div></div>`;
  }
  render();
})();
