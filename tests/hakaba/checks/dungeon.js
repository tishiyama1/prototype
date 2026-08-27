/* 地形と階層 ― 全階が歩いて回れるか、階段で移れるか、
   倒れた瞬間に階段を押しても詰まないか（PR #70 の再発防止） */
module.exports = {
  name: "ダンジョン（連結性・階層移動・階段バグ）",
  async run(t, ok) {
    const h = await t.open();
    try {
      await h.newGame();
      await h.dive();

      /* 降り立った場所から、全部の亡骸に歩いて行けるか */
      const conn = await h.page.evaluate(() => {
        const bad = [];
        for (let d = 1; d <= 30; d++) {
          __H.reroll(d);
          const T = __H.TILE, W = __H.MW, H = __H.MH;
          const start = [Math.floor(__H.P.x / T), Math.floor(__H.P.y / T)];
          const seen = new Set([start.join(",")]);
          const q = [start];
          while (q.length) {
            const [x, y] = q.shift();
            for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
              const nx = x + dx, ny = y + dy, k = nx + "," + ny;
              if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
              if (seen.has(k) || __H.blocked(nx, ny)) continue;
              seen.add(k); q.push([nx, ny]);
            }
          }
          const unreach = __H.corpses.filter(c => !seen.has(c.tx + "," + c.ty)).length;
          if (unreach) bad.push({ 階: d, 届かない亡骸: unreach });
        }
        return bad;
      });
      ok("全30階、亡骸まで歩いて行ける", conn.length === 0, JSON.stringify(conn));

      /* 階段で移れる */
      const move = await h.page.evaluate(() => {
        __H.reroll(5);
        __H.enterLevel({ d: 6, s: false }, "down");
        return __H.pos.d;
      });
      ok("階層を移れる", move === 6, "着いた階 " + move);

      /* 倒れた瞬間に「降りる」を押しても、次の階へ運ばれず夢の画面へ落ちる */
      await h.page.evaluate(() => __H.reroll(3));
      await h.page.waitForTimeout(300);
      const depth0 = await h.page.evaluate(() => __H.pos.d);
      await h.page.evaluate(() => __H.askDown());
      await h.page.waitForTimeout(250);
      const hasBtn = await h.page.evaluate(() => !!document.querySelector('[data-a="godown"]'));
      ok("階段の問いが開く", hasBtn);
      await h.page.evaluate(() => { __H.P.hp = 1; __H.hurt(); });        // とどめ
      await h.page.evaluate(() => __H.actions.godown({}));               // すかさず降りる
      await h.page.waitForTimeout(2500);
      const st = await h.page.evaluate(() => ({
        d: __H.pos && __H.pos.d, ui: __H.uiKind, invul: +__H.P.invul.toFixed(2), scene: __H.scene
      }));
      ok("階を移されない", st.d === depth0, "地下" + depth0 + "階 → " + st.d + "階");
      ok("夢の画面へ落ちる", st.ui === "dream", "uiKind=" + st.ui);
      ok("点滅したまま固まらない", st.invul === 0, "invul=" + st.invul);

      ok("エラーなし", h.errors.length === 0, h.errors.join(" / "));
    } finally { await h.close(); }
  }
};
