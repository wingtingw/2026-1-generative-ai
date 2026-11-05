#!/usr/bin/env python3
"""
CUDA Playbook 規則檢查器（AGENTS.md §8）

用法：python3 scripts/check_labs.py
只用標準函式庫。新增或修改任何 Lab 之後都要跑，全部 ✅ 才算完成。
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REQUIRED_SECTIONS = ["goal", "concept", "playground", "code", "pitfalls", "check", "refs"]
REQUIRED_FIELDS = {"id", "num", "title", "summary", "tags", "level", "minutes", "status"}
ID_RE = re.compile(r"^(\d{2})-[a-z0-9]+(-[a-z0-9]+)*$")
TAG_RE = re.compile(r"^[a-z0-9-]+$")
ALLOWED_EXTERNAL = ("https://fonts.googleapis.com", "https://fonts.gstatic.com")

errors, oks = [], []


def err(msg):
    errors.append(msg)


def load_registry():
    """把 data/labs.js 裡的 window.LABS = [...] 轉成 Python list。"""
    src = (ROOT / "data/labs.js").read_text(encoding="utf-8")
    m = re.search(r"window\.LABS\s*=\s*(\[.*?\]);", src, re.S)
    if not m:
        sys.exit("❌ data/labs.js 找不到 window.LABS = [...];")
    js = re.sub(r"/\*.*?\*/", "", m.group(1), flags=re.S)
    js = re.sub(r"(?m)^\s*//.*$", "", js)
    js = re.sub(r"(?m)(\{|,)\s*([A-Za-z_]\w*)\s*:", r'\1 "\2":', js)   # key 加引號
    js = re.sub(r",\s*([\]}])", r"\1", js)                             # 去掉尾逗號
    try:
        return json.loads(js)
    except json.JSONDecodeError as e:
        sys.exit(f"❌ data/labs.js 格式無法解析：{e}\n   （請維持「一個欄位一行、字串用雙引號」的寫法）")


def check_registry(labs):
    nums = []
    seen = set()
    for idx, lab in enumerate(labs):
        lid = lab.get("id", f"<第 {idx} 筆>")
        missing = REQUIRED_FIELDS - lab.keys()
        if missing:
            err(f"{lid}: registry 缺少欄位 {sorted(missing)}")
            continue
        m = ID_RE.match(lid)
        if not m:
            err(f"{lid}: id 必須是「兩位數-kebab-case」，例如 05-reduction")
        elif m.group(1) != lab["num"]:
            err(f"{lid}: num（{lab['num']}）和 id 開頭的編號不一致")
        if lid in seen:
            err(f"{lid}: id 重複")
        seen.add(lid)
        nums.append(int(lab["num"]))
        if lab["level"] not in (1, 2, 3):
            err(f"{lid}: level 只能是 1、2、3")
        if lab["status"] not in ("done", "planned"):
            err(f"{lid}: status 只能是 done 或 planned")
        if not (1 <= len(lab["tags"]) <= 3) or not all(TAG_RE.match(t) for t in lab["tags"]):
            err(f"{lid}: tags 要 1～3 個，且是小寫英文 kebab-case")
        if len(lab["summary"]) > 80:
            err(f"{lid}: summary 超過 80 字（目前 {len(lab['summary'])} 字）")
    if nums != sorted(nums):
        err("registry 裡的 Lab 要依編號由小到大排列")
    if nums and nums != list(range(1, len(nums) + 1)):
        err(f"Lab 編號要從 01 開始連續，目前是 {nums}")


def check_lab_folder(lab):
    lid = lab["id"]
    folder = ROOT / "labs" / lid
    if lab["status"] == "planned":
        if folder.exists():
            err(f"{lid}: status 是 planned，但資料夾已存在——做完請把 status 改成 done")
        return
    page, js = folder / "index.html", folder / "lab.js"
    if not page.exists() or not js.exists():
        err(f"{lid}: 缺少 labs/{lid}/index.html 或 lab.js")
        return
    html = page.read_text(encoding="utf-8")

    if f'data-lab="{lid}"' not in html:
        err(f"{lid}: <body> 的 data-lab 必須是 \"{lid}\"")
    if 'data-root="../../"' not in html:
        err(f"{lid}: <body> 必須有 data-root=\"../../\"")
    ids = re.findall(r'<section class="block" id="([a-z]+)"', html)
    if ids != REQUIRED_SECTIONS:
        err(f"{lid}: section 必須依序為 {REQUIRED_SECTIONS}，目前是 {ids}")
    for need in ('id="lab-head"', 'id="controls"', 'id="viz"', 'id="readout"', 'id="stats"'):
        if need not in html:
            err(f"{lid}: 缺少 {need}")
    order = ["../../data/labs.js", "../../assets/js/site.js", "lab.js"]
    pos = [html.find(f'src="{s}"') for s in order]
    if -1 in pos or pos != sorted(pos):
        err(f"{lid}: script 必須依序載入 {order}")
    if "TODO" in html or "TODO" in js.read_text(encoding="utf-8"):
        err(f"{lid}: 還有沒換掉的 TODO")
    n_quiz = html.count('<details class="quiz">')
    if n_quiz < 2:
        err(f"{lid}: 自我檢查至少要 2 題（目前 {n_quiz} 題）")
    if re.search(r"<style[\s>]", html) or re.search(r'\sstyle="(?!--sw)', html):
        err(f"{lid}: 不要寫 <style> 或 inline style，樣式放 assets/css/style.css")
    for url in re.findall(r'src="(https?://[^"]+)"', html):
        err(f"{lid}: 不允許載入外部程式 {url}")
    for url in re.findall(r'<link[^>]+href="(https?://[^"]+)"', html):
        if not url.startswith(ALLOWED_EXTERNAL):
            err(f"{lid}: 外部樣式只允許 Google Fonts，發現 {url}")
    if re.search(r'\sstyle=', js.read_text(encoding="utf-8").replace('style="--sw', "")):
        err(f"{lid}: lab.js 不要寫 inline style（圖例的 --sw 除外），請改用 class")


def check_orphans(labs):
    known = {l["id"] for l in labs}
    for d in sorted((ROOT / "labs").iterdir()):
        if d.is_dir() and d.name not in known:
            err(f"labs/{d.name}/ 沒有登記在 data/labs.js")


def main():
    labs = load_registry()
    check_registry(labs)
    for lab in labs:
        if REQUIRED_FIELDS <= lab.keys():
            check_lab_folder(lab)
    check_orphans(labs)

    done = sum(l.get("status") == "done" for l in labs)
    if errors:
        print(f"❌ 發現 {len(errors)} 個問題：")
        for e in errors:
            print("  -", e)
        sys.exit(1)
    print(f"✅ 全部通過：{len(labs)} 個 Lab（{done} 個完成、{len(labs) - done} 個規劃中）")


if __name__ == "__main__":
    main()
