/* 配分 ― 宝箱と王の剣の出かた／中身、道具の持てる数 */
module.exports = {
  name: "配分（宝箱・王の剣・道具の上限）",
  async run(t, ok) {
    const h = await t.open();
    try {
      await h.newGame();
      await h.dive();

      /* 宝箱 ― どの階にもごく稀に。中身は墓ねずみの当たりより上 */
      const chest = await h.page.evaluate(n => {
        const out = { hits: 0, n, q: {}, items: [], wear: 0 };
        for (let i = 0; i < n; i++) {
          __H.buildLevel({ d: 1 + Math.floor(Math.random() * 29), s: false });
          const b = __H.corpses.find(c => c.type === "chest");
          if (!b) continue;
          out.hits++; out.items.push(b.items.length);
          for (const it of b.items) { out.q[it.q] = (out.q[it.q] || 0) + 1; out.wear = Math.max(out.wear, it.wear); }
        }
        return out;
      }, 4000);
      const rate = chest.hits / chest.n;
      ok("宝箱の出現率が 0.4〜1.6%", rate > 0.004 && rate < 0.016, (rate * 100).toFixed(2) + "%");
      ok("宝箱の中身は2〜3点", Math.min(...chest.items) >= 2 && Math.max(...chest.items) <= 3);
      ok("宝箱は名工以上のみ", !chest.q[0] && !chest.q[1] && !chest.q[2], JSON.stringify(chest.q));
      ok("宝箱はほぼ無傷", chest.wear <= 0.1, "損耗の最大 " + chest.wear.toFixed(3));

      const val = await h.page.evaluate(n => {
        const avg = a => Math.round(a.reduce((x, y) => x + y, 0) / a.length);
        const c = [], r = [];
        for (let i = 0; i < n; i++) {
          const d = 1 + Math.floor(Math.random() * 29);
          let v = 0;
          const k = Math.random() < 0.35 ? 3 : 2;
          for (let j = 0; j < k; j++)
            v += __H.sellPrice(__H.makeItem(d, {
              cat: j === 0 ? "val" : ["val", "weapon", "armor", "shield", "acc"][Math.floor(Math.random() * 5)],
              boost: 1.8, q: j === 0 ? 4 : (Math.random() < 0.6 ? 4 : 3), wear: Math.random() * 0.1
            }));
          c.push(v);
          r.push(__H.sellPrice(__H.makeItem(d, { cat: "val", boost: 1.4, q: Math.random() < 0.45 ? 4 : 3 })));
        }
        return { chest: avg(c), rat: avg(r) };
      }, 3000);
      ok("宝箱は墓ねずみより高い", val.chest > val.rat * 1.8, "宝箱 " + val.chest + "G / 墓ねずみ " + val.rat + "G");

      /* 王の剣 ― 29階だけ、10回に1回 */
      const king = await h.page.evaluate(n => {
        const out = { d29: 0, other: 0, n, q: {}, wear: 0, alone: 0, kinds: {} };
        for (let i = 0; i < n; i++) {
          const d = [28, 29, 30][i % 3];
          __H.buildLevel({ d, s: false });
          const b = __H.corpses.find(c => c.type === "king");
          if (!b) continue;
          if (d === 29) out.d29++; else out.other++;
          const it = b.items[0];
          out.kinds[it.k] = (out.kinds[it.k] || 0) + 1;
          out.q[it.q] = (out.q[it.q] || 0) + 1;
          out.wear = Math.max(out.wear, it.wear);
          const r = __H.rooms.find(rr => b.tx >= rr.x && b.tx < rr.x + rr.w && b.ty >= rr.y && b.ty < rr.y + rr.h);
          if (r) {
            const inR = (x, y) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
            if (!__H.corpses.some(c => c !== b && inR(c.tx, c.ty)) &&
                !__H.mons.some(m => inR(Math.floor(m.x / 16), Math.floor(m.y / 16)))) out.alone++;
          }
        }
        return out;
      }, 1200);
      const kr = king.d29 / (king.n / 3);
      ok("王の剣は29階だけ", king.other === 0, "他の階で " + king.other + " 回");
      ok("王の剣の出現率が 5〜16%", kr > 0.05 && kr < 0.16, (kr * 100).toFixed(1) + "%");
      ok("中身は王の剣のみ", Object.keys(king.kinds).join() === "kingsword", JSON.stringify(king.kinds));
      ok("王の剣は名工以上", !king.q[0] && !king.q[1] && !king.q[2], JSON.stringify(king.q));
      ok("王の剣は無傷", king.wear === 0, "損耗 " + king.wear);
      ok("部屋には他に何も無い", king.alone === king.d29, king.alone + "/" + king.d29);

      /* 道具は各5個まで */
      const inv = await h.page.evaluate(() => {
        __H.G.gold = 999999; __H.G.inv.potion = 0;
        const seq = [];
        for (let i = 0; i < 8; i++) { __H.actions.buy({ i: "potion" }); seq.push(__H.G.inv.potion); }
        return { seq, max: __H.INV_MAX() };
      });
      ok("道具は上限で止まる", Math.max(...inv.seq) === inv.max, inv.seq.join(","));

      ok("エラーなし", h.errors.length === 0, h.errors.join(" / "));
    } finally { await h.close(); }
  }
};
