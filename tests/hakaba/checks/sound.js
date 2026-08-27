/* 音 ― 検証タブの試聴が「押したものだけ鳴る」状態か、
   16音と8曲がエラーなく鳴るか。実際に出力を測る（--audio のときだけ） */
module.exports = {
  name: "音（試聴の隔離・全音・全曲）",
  audio: true,
  async run(t, ok) {
    const h = await t.open({ audio: true });
    try {
      await h.newGame();

      /* 出力のピークを測る足場 */
      await h.page.evaluate(() => {
        window.__lvl = ms => {
          const a = __H.AC, sp = a.createScriptProcessor(2048, 1, 1), mute = a.createGain();
          mute.gain.value = 0;
          let peak = 0;
          sp.onaudioprocess = e => {
            const d = e.inputBuffer.getChannelData(0);
            for (let i = 0; i < d.length; i++) { const v = Math.abs(d[i]); if (v > peak) peak = v; }
          };
          __H.LIM.connect(sp); sp.connect(mute); mute.connect(a.destination);
          return new Promise(r => setTimeout(() => { __H.LIM.disconnect(sp); sp.disconnect(); r(+peak.toFixed(4)); }, ms));
        };
      });

      /* 設定は「両方 消す」にしておく ― 試聴はそれを跨いで鳴るはず */
      await h.page.evaluate(() => __H.actions.opt({})); await h.page.waitForTimeout(300);
      await h.page.click('[data-a="setmute"][data-i="1"]'); await h.page.waitForTimeout(250);
      await h.page.click('[data-a="setmus"][data-i="1"]'); await h.page.waitForTimeout(350);

      await h.debugOn();
      await h.page.click('[data-a="dbg"]'); await h.page.waitForTimeout(500);
      await h.page.click('[data-a="dbgtab"][data-i="snd"]'); await h.page.waitForTimeout(1800);

      ok("入ると曲が止まる", (await h.page.evaluate(() => __H.musKind())) === "");
      ok("試聴だけの状態", await h.page.evaluate(() => __H.dbgSnd() && !__H.sfxOn()));
      ok("何もしなければ無音", (await h.page.evaluate(() => __lvl(1200))) === 0);

      const during = async fn => {
        const p = h.page.evaluate(() => __lvl(1300));
        await h.page.waitForTimeout(100); await fn();
        return p;
      };
      ok("押せないボタンは鳴らない",
        (await during(() => h.page.evaluate(() => document.querySelector('[data-a="dbgMus"][data-i=""]').click()))) === 0);
      ok("タブを叩いても鳴らない",
        (await during(() => h.page.evaluate(() => document.querySelector('[data-a="dbgtab"][data-i="snd"]').click()))) === 0);

      const lv = await during(() => h.page.click('[data-a="dbgSfx"][data-i="alert"]'));
      ok("押した音だけ鳴る（設定が消すでも）", lv > 0.02, "peak " + lv);

      /* 全16音 */
      const keys = await h.page.evaluate(() =>
        Array.from(document.querySelectorAll('[data-a="dbgSfx"]')).map(e => e.dataset.i));
      /* SFX を直に呼ぶと関門に弾かれる（それが正しい）。ボタンを押して確かめる */
      const each = {};
      for (const k of keys) {
        const p = h.page.evaluate(() => __lvl(900));
        await h.page.waitForTimeout(80);
        await h.page.click(`[data-a="dbgSfx"][data-i="${k}"]`);
        each[k] = await p;
      }
      const silent = Object.keys(each).filter(k => each[k] < 0.003);
      ok("全" + keys.length + "音が鳴る", silent.length === 0, "無音だった音: " + silent.join(","));

      /* 全8曲 */
      const moods = await h.page.evaluate(() =>
        Array.from(document.querySelectorAll('[data-a="dbgMus"]')).map(e => e.dataset.i).filter(Boolean));
      const quiet = [];
      for (const m of moods) {
        await h.page.click(`[data-a="dbgMus"][data-i="${m}"]`);
        await h.page.waitForTimeout(2600);
        const p = await h.page.evaluate(() => __lvl(1500));
        if (p < 0.01) quiet.push(m + "(" + p + ")");
      }
      ok("全" + moods.length + "曲が鳴る", quiet.length === 0, quiet.join(","));

      await h.page.click('[data-a="dbgback"]'); await h.page.waitForTimeout(1600);
      ok("出ると元に戻る", await h.page.evaluate(() => !__H.dbgSnd()));
      const opt = await h.page.evaluate(() =>
        JSON.parse(localStorage.getItem("yuusha_no_hakaba_v2")).opt);
      ok("設定を書き換えていない", opt.mute === true && opt.nomus === true, JSON.stringify(opt));

      ok("エラーなし", h.errors.length === 0, h.errors.join(" / "));
    } finally { await h.close(); }
  }
};
