/* 通し確認 ― 町の各画面が開いて閉じ、潜れて、歩けて、地図と道具が出る */
module.exports = {
  name: "通し（町 → 潜行 → 操作）",
  async run(t, ok) {
    const h = await t.open();
    try {
      await h.newGame();

      for (const [nm, x, y, head] of [
        ["よろず買取", 35, 140, "よろず買取"],
        ["冒険者ギルド", 169, 137, "冒険者ギルド"],
        ["倉庫", 30, 210, "倉庫"],
        ["記録と図鑑", 166, 208, "記録と図鑑"],
        ["あそびかた", 197, 212, "あそびかた"]
      ]) {
        await h.tap(x, y);
        const p = await h.page.evaluate(() => __H.panel());
        ok(nm + " が開く", p && p.indexOf(head) === 0, p && p.slice(0, 20));
        await h.clear();
        ok(nm + " が閉じる", await h.page.evaluate(() => !__H.uiOpen));
      }

      await h.dive();
      ok("潜れた", await h.page.evaluate(() => __H.scene === "dungeon" && !!__H.run));
      ok("HUDが出る", await h.page.evaluate(() => document.getElementById("hud").textContent.indexOf("地下 1 階") >= 0));

      const before = await h.page.evaluate(() => [__H.P.x, __H.P.y]);
      for (const k of ["ArrowRight", "ArrowDown", "ArrowLeft"]) await h.walk(k, 400);
      await h.clear();
      const after = await h.page.evaluate(() => [__H.P.x, __H.P.y]);
      ok("歩ける", before[0] !== after[0] || before[1] !== after[1], before + " → " + after);

      await h.page.keyboard.press("m"); await h.page.waitForTimeout(400);
      ok("地図が開く", await h.page.evaluate(() => document.getElementById("pad").classList.contains("on")));
      await h.page.keyboard.press("m"); await h.page.waitForTimeout(250);

      await h.page.keyboard.press("i"); await h.page.waitForTimeout(400);
      ok("道具が開く", (await h.page.evaluate(() => __H.uiKind)) === "items");
      await h.page.keyboard.press("Escape"); await h.page.waitForTimeout(300);
      await h.page.keyboard.press("Escape"); await h.page.waitForTimeout(400);
      ok("中断が開く", (await h.page.evaluate(() => __H.uiKind)) === "pause");

      ok("エラーなし", h.errors.length === 0, h.errors.join(" / "));
    } finally { await h.close(); }
  }
};
