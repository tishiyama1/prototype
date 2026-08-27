#!/usr/bin/env node
/* 回帰テストの走らせ役
     node tests/hakaba/run.js              音以外を全部
     node tests/hakaba/run.js --audio      音も含めて全部
     node tests/hakaba/run.js smoke        名前で絞る                */

const path = require("path");
const t = require("./lib/harness.js");

const CHECKS = ["smoke", "dungeon", "balance", "endings", "sound"];
const args = process.argv.slice(2);
const withAudio = args.indexOf("--audio") >= 0;
const only = args.filter(a => a[0] !== "-");

(async () => {
  let pass = 0, fail = 0;
  const failed = [];
  for (const name of CHECKS) {
    if (only.length && only.indexOf(name) < 0) continue;
    const chk = require(path.join(__dirname, "checks", name + ".js"));
    if (chk.audio && !withAudio && !only.length) { console.log("－ " + chk.name + "（--audio で走ります）"); continue; }

    console.log("\n■ " + chk.name);
    const ok = (label, cond, note) => {
      if (cond) { pass++; console.log("  ○ " + label + (note ? "  … " + note : "")); }
      else { fail++; failed.push(chk.name + " / " + label); console.log("  ✕ " + label + (note ? "  … " + note : "")); }
    };
    try {
      await chk.run(t, ok);
    } catch (e) {
      fail++; failed.push(chk.name + " / 実行できなかった");
      console.log("  ✕ 実行できなかった … " + e.message);
    }
  }
  console.log("\n" + "-".repeat(52));
  console.log(`  ○ ${pass}   ✕ ${fail}`);
  if (failed.length) { console.log("\n落ちたもの:"); for (const f of failed) console.log("  ・" + f); }
  process.exit(fail ? 1 : 0);
})();
