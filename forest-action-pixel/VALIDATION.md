# Forest Action Pixel — 検証記録

対象：既存 `tishiyama1/prototype` の main/root GitHub Pages。現行版は `/forest-action/`、新版のみ `/forest-action-pixel/` に追加。基準コミットは `debdcac051a8ddb14cc1b41f088760b4e38903f6`。

## 2026-10-11 実装環境での確認

| 確認 | 結果 |
|---|---|
| 現行版・トップページ・他15ゲームの保護 | 39ファイルのSHA256が改修前と一致 |
| 戦闘・カード・入力・カメラ等の保護 | 15モジュールが現行版とバイト単位で同一 |
| 戦闘・カードの自動テスト | 43項目PASS |
| 同じ初期状態・入力による現行版／新版比較 | 1,450固定ステップの全スナップショット一致、撃破まで完了 |
| 上記比較中の設定変更・停止・短縮 | 描画設定切替、4回の停止、10回の演出短縮でも一致 |
| PCとタッチ操作のブラウザ確認 | 29項目PASS、実キー操作で8回の攻撃／被ダメージ0で撃破、再戦成功 |
| 描画・静止画比較のブラウザ確認 | 19項目PASS |
| 低解像度・整数拡大 | 3プリセットとも中央の全サンプルが整数ブロックで同色 |
| UI | 4枚の評価カード・文字はDOMで通常解像度、横画面に収容 |
| エラー | JavaScript・WebGLシェーダ・通信エラーなし |

ブラウザはChromium / SwiftShader（ソフトウェアGPU）。PC 1280×720、モバイル相当844×390・DPR3（描画DPRは1.5）、横画面リサイズ740×360／667×375、縦画面390×844を使用しました。モバイルは仮想スティック＋攻撃の複数指入力、スワイプ、キャンセル、カード演出の短縮と詳細／高速モードを確認しました。実機Safariの検証ではありません。

Medium・影ONのPC環境で40フレームを採取し、平均約17.8FPS、フレーム時間中央値50.1ms、95パーセンタイル150msでした。描画は141 calls／113,243 triangles（影パスと拡大パスを含む）。短いソフトウェアGPU上の測定なので、iPhoneの速度を推定する根拠にはできません。60FPS達成は未確認です。

## スクリーンショット

`comparison.html` に現行版／新版およびLow／Medium／Highを掲載。いずれも初期状態、戦闘時間0、同じキャラクター位置・カメラです。現行版は開始案内だけを撮影時に隠し、新版は静止画比較モードで撮影しました。HUD・操作案内は両版で異なります。カード画像だけは実際の攻撃時の別状態です。

## 再現手順（開発者向け）

ゲームはビルド不要です。以下は検証用であり、利用者によるローカル作業は不要です。

```sh
node tests/forest-action-pixel/logic.mjs
node tests/forest-action-pixel/regression.mjs
node tests/forest-action-pixel/browser.cjs
node tests/forest-action-pixel/visual-browser.cjs
python tests/forest-action-pixel/public-files.py
```

ブラウザ検証にはPlaywrightとChromium、描画確認にはpngjsが必要です。`FOREST_QA_BROWSER`、`FOREST_QA_ARGS`、`FOREST_QA_OUTPUT` で検証環境を指定できます。戦闘確認は `FOREST_QA_URL`、描画確認は `FOREST_VISUAL_BASE` で公開URLを指定可能です。検証は実際のキー・ポインター入力と読み取り専用snapshotを使用し、ブラウザからHPやAIを変更するテスト用フックは設けていません。

`local-browser-results.json`、`local-visual-results.json` に個別の結果を保存しています。

## 公開環境

実装コミット `5c78ab6def8491b7cfd3a5c080d2e3dbf7a6044a` を既存mainへ追加し、Pages workflow `38135947638` が成功しました。実際の両URLへアクセスして確認しています。

- https://tishiyama1.github.io/prototype/forest-action/
- https://tishiyama1.github.io/prototype/forest-action-pixel/
- https://tishiyama1.github.io/prototype/forest-action-pixel/comparison.html

最終公開検証は68ファイルすべてHTTP 200／SHA256一致（既存37ファイルを含む）、新版の戦闘・タッチ操作29項目PASS、両版の起動と描画・比較19項目PASS。現行版も公開URLから接近・攻撃・カード短縮・通常復帰を実操作で確認しました。新版は8回の攻撃、被ダメージ0で撃破し、リトライできました。

`public-browser-results.json`、`public-visual-results.json`、`public-file-results.json` に実際のURLと個別結果を保存しています。高DPRでの最終canvas拡大にもNearest指定を追加しました。改修コミット `6f6d5dfdffc0f8e94e6d4f7d6de32ec9794a6804` のPages workflow `38136317740` 成功後、公開URLで描画・比較19項目を再確認し、Low／Medium／Highのモバイル相当画面で全サンプルのピクセルブロック同色を確認しました。最終公開のソフトウェアGPU測定は40フレーム、平均約16.1FPS、フレーム時間中央値16.8ms／95パーセンタイル150msです。実機60FPSは未検証です。公開画像のまとめは `media/comparison.jpg` と `media/resolutions.jpg`。

## 既知の制約・未検証

- iPhone Safari実機のFPS、発熱、長時間のバッテリー負荷、機種ごとの見え方は未検証。
- Lowでは人物が粗く、敵の細かな姿勢が読み取りにくくなります。戦闘評価ではMediumとHighも比較してください。
- 最終画面の整数拡大に合わせ、内部解像度は目標値から多少変わります。右端の最後のピクセルが一部クリップされる場合があります。
- 風の揺れと移動に伴う輪郭のピクセル変化は意図した表現ですが、ちらつきの好みは試遊での評価が必要です。
- 一部の端末では影ONが負荷になります。影OFF・Lowも試せます。ゲームロジックは同一でも、処理負荷による実時間の進行速度は差が生じ得ます。
- 前作『勇者の墓場』の素材・固有パレットは未提供のため、特定の素材を流用してはいません。低解像度の色面と落ち着いた森の色調による連続性を試す版です。
