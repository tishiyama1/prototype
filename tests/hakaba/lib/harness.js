/* 勇者の墓場 ― 回帰テストの土台
   ============================================================
   hakaba.html は1ファイル完結で、外から中身を触る口がない。
   そこで起動直前に window.__H を差し込んだ複製をテンポラリに作り、
   それを Playwright で開く。元のファイルは一切書き換えない。       */

const fs = require("fs");
const os = require("os");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..", "..");
const GAME = path.join(ROOT, "hakaba.html");
const MARK = "/* ---------- 起動 ---------- */";

/* 中を覗くための足場。ゲーム側のコードは変えない */
const HOOK = `
window.__H = {
  /* 状態 */
  get scene(){return scene}, get run(){return run}, get P(){return P}, get G(){return G}, get S(){return S},
  get corpses(){return corpses}, get mons(){return mons}, get rooms(){return rooms}, get hero(){return hero},
  get uiOpen(){return uiOpen}, get uiKind(){return uiKind}, get fadeDir(){return fadeDir},
  get pos(){return run && run.pos},
  /* 卓 */
  KIND, QUAL, ENCH, MTYPE, HEROES, ENDINGS, TILE, MW, MH,
  INV_MAX: () => INV_MAX, CHEST_CHANCE: () => CHEST_CHANCE,
  KING_CHANCE: () => KING_CHANCE, KING_FLOOR: () => KING_FLOOR,
  /* 呼び出し */
  actions, SFX,
  get AC(){return AC}, get LIM(){return LIM},
  setMusic: k => setMusic(k), musKind: () => musNow(), floorMus: () => floorMus(),
  muted: () => muted, noMus: () => noMus, dbgSnd: () => dbgSnd, sfxOn: () => sfxOn(), musOn: () => musOn(),
  hearsNoise: m => hearsNoise(m), blocked: (x, y) => blocked(x, y),
  judgeEnding: () => judgeEnding(), tipGot: () => tipGot(), remainLabel: c => remainLabel(c),
  sellPrice: it => sellPrice(it), makeItem: (d, o) => makeItem(d, o),
  buildLevel: pos => buildLevel(pos),
  enterLevel: (pos, from) => enterLevel(pos, from || "down"),
  showShop: t => showShop(t), showItems: t => showItems(t), showRecords: t => showRecords(t),
  askDown: () => askDown(), askUp: () => askUp(),
  /* 便利 */
  usePotion: () => usePotion(), useSmoke: () => useSmoke(),
  hurt: () => { P.armor = 0; P.invul = 0; hitPlayer(P.x - 20, P.y, true, null); },
  put: (tx, ty) => {
    P.x = tx * TILE + 8; P.y = ty * TILE + 8;
    camx = clamp(P.x - VW / 2, 0, MW * TILE - VW);
    camy = clamp(P.y - VH / 2, 0, MH * TILE - VH);
    seen.fill(1);
  },
  /* 同じ階を組み直す ― 出現率をまとめて測るとき用 */
  reroll: (depth) => { run.floors++; run.cache = {}; run.pos = null; enterLevel({ d: depth, s: false }, "down"); },
  panel: () => { const p = document.querySelector("#ui.on .panel"); return p ? p.textContent.replace(/\\s+/g, " ").trim() : null; },
  btns: () => Array.from(document.querySelectorAll("#ui.on .btn"))
    .map(e => e.textContent.trim() + (e.classList.contains("dis") ? "[不可]" : "")),
  tabs: () => Array.from(document.querySelectorAll("#ui.on .tab")).map(e => e.textContent.trim())
};
`;

/* 足場を差し込んだ複製を作る。テストごとに使い捨て */
function instrument() {
  const src = fs.readFileSync(GAME, "utf8");
  if (src.indexOf(MARK) < 0) throw new Error("起動マーカーが見つからない ― hakaba.html の構造が変わった");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hakaba-"));
  const out = path.join(dir, "hakaba.html");
  fs.writeFileSync(out, src.replace(MARK, HOOK + "\n" + MARK));
  return out;
}

/* ブラウザを開いて、新しい周を始めたところまで進める */
async function open(opt) {
  opt = opt || {};
  const { chromium } = require(opt.playwright || "/opt/node22/lib/node_modules/playwright");
  const browser = await chromium.launch({
    args: opt.audio ? ["--autoplay-policy=no-user-gesture-required"] : []
  });
  const ctx = await browser.newContext({
    viewport: { width: 402, height: 727 }, deviceScaleFactor: opt.shot ? 3 : 2,
    isMobile: true, hasTouch: true
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push(String(e.message)));
  page.on("console", m => { if (m.type() === "error" && !/ERR_FILE/.test(m.text())) errors.push("console: " + m.text()); });
  await page.goto("file://" + instrument());
  await page.waitForTimeout(600);

  const cv = await page.evaluate(() => {
    const c = document.getElementById("cv").getBoundingClientRect();
    return { x: c.x, y: c.y, w: c.width, h: c.height };
  });

  const api = {
    page, browser, errors,
    /* 盤面の座標(208×288)で叩く */
    tap: async (x, y, wait) => {
      await page.touchscreen.tap(cv.x + x / 208 * cv.w, cv.y + y / 288 * cv.h);
      await page.waitForTimeout(wait === undefined ? 420 : wait);
    },
    /* 開いている画面を閉じる */
    clear: async () => {
      for (let i = 0; i < 4; i++) {
        const c = await page.$("#ui.on .pclose");
        if (!c) break;
        await c.click(); await page.waitForTimeout(300);
      }
    },
    newGame: async () => { await page.tap('[data-a="newg"]'); await page.waitForTimeout(800); },
    /* 地下1階へ潜る */
    dive: async () => {
      await api.tap(104, 254);
      await page.tap('[data-a="dive2"][data-d="1"]');
      await page.waitForTimeout(1500);
      await api.clear();
    },
    /* 検証モードを開ける（設定の見出しを7回叩く） */
    debugOn: async () => {
      await page.evaluate(() => __H.actions.opt({}));
      await page.waitForTimeout(300);
      for (let i = 0; i < 7; i++) { await page.click('[data-a="dbgtap"]'); await page.waitForTimeout(50); }
      await page.waitForTimeout(400);
    },
    walk: async (key, ms) => {
      await page.keyboard.down(key); await page.waitForTimeout(ms || 500); await page.keyboard.up(key);
    },
    shot: p => page.screenshot({ path: p }),
    close: () => browser.close()
  };
  return api;
}

module.exports = { open, instrument, GAME, ROOT };
