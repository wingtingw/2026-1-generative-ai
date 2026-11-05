/* =========================================================
   CUDA Playbook — 全站共用 JS
   負責：頂部列、首頁卡片 + 標籤篩選、Lab 頁標頭、上一頁/下一頁、頁尾
   Lab 自己的互動程式寫在各自的 lab.js，不要寫在這裡（AGENTS.md §6）
   ========================================================= */
(function () {
  const body = document.body;
  const root = body.dataset.root || "./";
  const page = body.dataset.page;          // "home" | "lab"
  const labs = window.LABS || [];
  const site = window.SITE || {};
  const levelName = { 1: "入門", 2: "進階", 3: "挑戰" };
  const labUrl = (l) => `${root}labs/${l.id}/`;

  const el = (tag, attrs = {}, html = "") => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    n.innerHTML = html;
    return n;
  };
  const metaTags = (l) =>
    `<span class="tag level-${l.level}">${levelName[l.level]}</span>` +
    `<span class="tag">⏱ ${l.minutes} 分鐘</span>` +
    l.tags.map((t) => `<span class="tag">#${t}</span>`).join("");

  // ---------- 頂部列 ----------
  const current = labs.find((l) => l.id === body.dataset.lab);
  const bar = el("header", { class: "topbar" },
    `<div class="topbar-inner">
       <a class="brand" href="${root}">CUDA <b>Playbook</b></a>
       ${current ? `<span class="crumb">/ Lab ${current.num}</span>` : ""}
       <span class="topbar-spacer"></span>
       <a class="gh" href="${site.repo}">GitHub ↗</a>
     </div>`);
  body.prepend(bar);

  // ---------- 首頁 ----------
  if (page === "home") {
    const grid = document.getElementById("lab-grid");
    const filters = document.getElementById("filters");
    const allTags = [...new Set(labs.flatMap((l) => l.tags))];
    let active = "all";

    const render = () => {
      grid.innerHTML = "";
      labs
        .filter((l) => active === "all" || l.tags.includes(active))
        .forEach((l) => {
          const planned = l.status !== "done";
          const card = el(planned ? "div" : "a",
            { class: `lab-card${planned ? " planned" : ""}`, ...(planned ? {} : { href: labUrl(l) }) },
            `<span class="num">LAB ${l.num}${planned ? " · 規劃中" : ""}</span>
             <h3>${l.title}</h3>
             <p>${l.summary}</p>
             <div class="meta-row">${metaTags(l)}</div>`);
          grid.append(card);
        });
    };

    ["all", ...allTags].forEach((t) => {
      const b = el("button", { class: "chip", "aria-pressed": String(t === "all") }, t === "all" ? "全部" : `#${t}`);
      b.onclick = () => {
        active = t;
        filters.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", String(c === b)));
        render();
      };
      filters.append(b);
    });
    render();
  }

  // ---------- Lab 頁 ----------
  if (page === "lab") {
    if (!current) {
      console.error(`[site.js] 在 data/labs.js 找不到 id = "${body.dataset.lab}"`);
    } else {
      document.title = `Lab ${current.num} · ${current.title} | ${site.title}`;
      const head = document.getElementById("lab-head");
      head.className = "lab-head";
      head.innerHTML =
        `<div class="num">LAB ${current.num}</div>
         <h1>${current.title}</h1>
         <p class="summary">${current.summary}</p>
         <div class="meta-row">${metaTags(current)}</div>`;

      // 上一頁 / 下一頁：只在 status = done 的 Lab 之間跳
      const done = labs.filter((l) => l.status === "done");
      const i = done.indexOf(current);
      const prev = done[i - 1], next = done[i + 1];
      const pager = el("nav", { class: "pager" },
        (prev ? `<a class="prev" href="${labUrl(prev)}"><small>← 上一個 Lab</small>${prev.num} ${prev.title}</a>` : "") +
        (next ? `<a class="next" href="${labUrl(next)}"><small>下一個 Lab →</small>${next.num} ${next.title}</a>` : ""));
      document.querySelector("main").append(pager);
    }
  }

  // ---------- 頁尾 ----------
  body.append(el("footer", { class: "footer" },
    `${site.title} · ${site.subtitle} · by ${site.author}`));
})();
