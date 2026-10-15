# ダンジョンの主 / Forest Action

この開発で作成した比較版・素材・テストを1フォルダに集約しています。

- [開発・検証の入口](https://tishiyama1.github.io/prototype/dungeon-lord/)
- [10連戦](forest-action-gauntlet/)
- [旅・探索・仕事](dungeon-lord-journey/)
- [前衛1対1＋後衛](forest-action-frontline/)
- [初期版](forest-action/)

既存の各 `forest-action-*` フォルダ名は配下でそのまま保持し、画像・モジュール・比較リンクの相対参照を維持します。`tests/` は本プロジェクト専用の14テスト群、`redirects/` は以前の公開URL用の転送ページです。他作品のファイルは移動しません。

## テスト

リポジトリのルートから `cd dungeon-lord` して実行します。

```sh
node tests/layout.mjs
node tests/forest-action-gauntlet/motion.mjs
node tests/forest-action-gauntlet/logic.mjs
node tests/forest-action-gauntlet/balance.mjs
node tests/forest-action-frontline/logic.mjs
node tests/dungeon-lord-journey/logic.mjs
node tests/forest-action-gauntlet/browser.cjs
```

ブラウザ検証はPlaywright/Chromiumが必要です。公開版の検証は `FOREST_ENV_BASE=https://tishiyama1.github.io/prototype/dungeon-lord/` を指定します。各比較版の詳しい仕様・検証記録は各フォルダのREADMEとVALIDATIONにあります。

## 旧URLの互換性

`redirects.json` に旧→新の27画面を記録しています。`redirects/` のHTMLはJekyllの `permalink` で公開時だけ旧パスに出力され、クエリ文字列とハッシュを保って新URLへ転送します。リポジトリのルートに旧フォルダは残しません。HTML本体のURLを移し、画像・JSを個別に直リンクした過去のURLは対象外です。

保存キー・オリジンは変えないため、同じブラウザの保存は引き継ぎます。Jekyllの生成後もCIで27転送と新しい画面の出力を検証します。

仕組みの参照: [Jekyll Pages / permalink](https://jekyllrb.com/docs/pages/)
