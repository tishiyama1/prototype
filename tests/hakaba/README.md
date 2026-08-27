# 勇者の墓場 ― 回帰テスト

[`hakaba.html`](../../hakaba.html) を触ったあとに走らせる確認一式です。
ゲーム本体は**1ファイル完結で、外から中を触る口がありません**。そこで
起動直前に `window.__H` を差し込んだ複製をテンポラリに作り、それを
Playwright で開いています。**元のファイルは一切書き換えません。**

## 走らせかた

```bash
node tests/hakaba/run.js            # 音以外を全部
node tests/hakaba/run.js --audio    # 音も含めて全部
node tests/hakaba/run.js balance    # 名前で絞る
```

Playwright が要ります（この環境では `/opt/node22/lib/node_modules/playwright`）。
別の場所にある場合は `lib/harness.js` の `opt.playwright` を渡してください。

## 中身

| | 見ているもの |
| --- | --- |
| `smoke` | 町の5画面が開いて閉じる／潜れる／歩ける／地図・道具・中断が出る |
| `dungeon` | **全30階で亡骸まで歩いて行ける**／階層を移れる／**倒れた瞬間に階段を押しても詰まない** |
| `balance` | 宝箱と王の剣の**出現率・品質・損耗・中身**／道具の持てる数 |
| `endings` | ENDが10種そろう／**取り立てENDが二重に数えられない**／各END画面のボタン |
| `sound` | 検証〈音〉が**試聴だけの状態**になる／全15音と全8曲が実際に鳴る（出力を実測） |

`dungeon` と `balance` は乱数を何千回も回すので、それぞれ1〜2分かかります。

## 落ちたときの読みかた

数を見る項目（出現率など）は**幅を持たせて**あります。宝箱 0.4〜1.6%、王の剣
5〜16% など。これを外れたら、`CHEST_CHANCE` や `KING_CHANCE` を触ったか、
配置の呼び出し順が変わったかのどちらかです。

`dungeon` の「亡骸まで歩いて行ける」が落ちたら、地形生成の連結修復
（`openBlockedPaths`）が効いていません。これは**過去に25/145階が到達不能
だった**のを直した箇所なので、生成まわりを触ったときの見張りです。

## ドット絵の見比べ

描き直したときの目視用です。

```bash
python3 tests/hakaba/lib/sheet.py /tmp/a.png holy kingsw kingbase
python3 tests/hakaba/lib/sheet.py /tmp/b.png --big kingsword
```

## 音を測る

`lib/wav.py` に WAV の解析があります（peak / RMS / 帯域の割合 / 隣り合う標本の
跳ね / 中高域の音程感）。**「破裂音がする」「ポコと鳴る」といった指摘を数字で
確かめる**のに使いました。

```python
import wav
wav.stats("a.wav")          # sec / peak / rms / hi2 / hi4
wav.tonalMid(seg, sr)       # 1に近いほど澄んだ音程（＝ピコっぽい）
```

## iOSへ移すとき

このテストは**分割作業の安全網**です。`hakaba.html` を複数モジュールへ割る
ときは、`lib/harness.js` の差し込み先（`起動` マーカー）と `window.__H` が
公開している名前だけ追従させれば、中身のチェックはそのまま使えます。
