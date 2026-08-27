/* 終わりかた ― 判定、記録、画面のボタン */
module.exports = {
  name: "エンディング（判定・記録・ボタン）",
  async run(t, ok) {
    const h = await t.open();
    try {
      await h.newGame();

      const list = await h.page.evaluate(() => Object.keys(__H.ENDINGS));
      ok("ENDは10種", list.length === 10, list.join(","));
      ok("取り立てENDがある", list.indexOf("fail") >= 0);

      /* 期限切れ → 取り立てEND。街へ戻るたびに数え直さない */
      await h.page.evaluate(() => {
        __H.G.day = __H.G.limit + 1; __H.G.debt = 42000;
        __H.actions.totitle({});
      });
      await h.page.waitForTimeout(1400);
      await h.page.click('[data-a="cont"]'); await h.page.waitForTimeout(1500);

      const head = await h.page.evaluate(() => {
        const e = document.querySelector("#ui.on h2"); return e ? e.textContent.trim() : null;
      });
      ok("取り立てENDが出る", /取り立てEND/.test(head || ""), head);
      ok("記録に1件", (await h.page.evaluate(() => (__H.S.rec.ends || {}).fail)) === 1);

      for (let i = 0; i < 3; i++) {
        await h.page.click('[data-a="dex"]'); await h.page.waitForTimeout(500);
        const b = await h.page.$('[data-a="titleback"], .pclose');
        if (b) await b.click();
        await h.page.waitForTimeout(700);
      }
      ok("往復しても増えない", (await h.page.evaluate(() => (__H.S.rec.ends || {}).fail)) === 1);
      ok("取り立ての行き先はタイトル", (await h.page.evaluate(() => __H.btns())).join().indexOf("タイトルへ") >= 0,
         (await h.page.evaluate(() => __H.btns())).join(" / "));

      /* 完済 */
      await h.page.evaluate(() => {
        __H.G.ended = null; __H.G.debt = 0; __H.G.day = 5;
        __H.actions.totitle({});
      });
      await h.page.waitForTimeout(1400);
      await h.page.click('[data-a="cont"]'); await h.page.waitForTimeout(1500);
      const cb = await h.page.evaluate(() => __H.btns());
      ok("完済にタイトルへがある", cb.join().indexOf("タイトルへ") >= 0, cb.join(" / "));
      ok("完済に続けるがある", cb.join().indexOf("このまま続ける") >= 0, cb.join(" / "));
      ok("やり直す系は消えている", cb.join().indexOf("新しい借金") < 0, cb.join(" / "));

      ok("エラーなし", h.errors.length === 0, h.errors.join(" / "));
    } finally { await h.close(); }
  }
};
