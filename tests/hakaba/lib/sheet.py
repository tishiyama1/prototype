#!/usr/bin/env python3
"""ドット絵を並べて描き出す ― 描き直しの目視確認に使う

    python3 tests/hakaba/lib/sheet.py out.png holy kingsw kingbase      アイコン(12x12)
    python3 tests/hakaba/lib/sheet.py out.png --big kingsword longsword 詳細画面(32x32)
"""
import sys, os, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import render

GAME = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "hakaba.html")

def load():
    s = open(GAME, encoding="utf-8").read()
    def pal(name):
        m = re.search(r"const " + name + r" = \{(.*?)\};", s, re.S).group(1)
        return dict(re.findall(r'"(.)":\s*"(#[0-9a-fA-F]{6})"', m))
    def art(block, key):
        b = re.search(r"const " + block + r" = \{(.*?)\n\};", s, re.S).group(1)
        m = re.search(re.escape(key) + r":\s*\[(.*?)\]", b, re.S)
        if not m:
            raise SystemExit("見つからない: %s.%s" % (block, key))
        return re.findall(r'"([^"]*)"', m.group(1))
    return pal, art

if __name__ == "__main__":
    if len(sys.argv) < 3:
        raise SystemExit(__doc__)
    out = sys.argv[1]
    names = sys.argv[2:]
    big = "--big" in names
    names = [n for n in names if not n.startswith("--")]
    pal, art = load()
    P = pal("BIG_PAL" if big else "I_PAL")
    blk = "BIG_ART" if big else "ICONS"
    render.sheet(out, [(art(blk, n), P) for n in names], scale=20 if big else 26, gap=3)
    print("書き出した:", out, "／", ", ".join(names))
