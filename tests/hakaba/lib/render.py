import struct, zlib, sys

def png(path, px, w, h, scale=1):
    W, H = w*scale, h*scale
    raw = b""
    for y in range(H):
        raw += b"\x00"
        for x in range(W):
            r,g,b,a = px[(y//scale)*w + (x//scale)]
            raw += bytes((r,g,b,a))
    def ch(t, d):
        c = t + d
        return struct.pack(">I", len(d)) + c + struct.pack(">I", zlib.crc32(c) & 0xffffffff)
    out = b"\x89PNG\r\n\x1a\n"
    out += ch(b"IHDR", struct.pack(">IIBBBBB", W, H, 8, 6, 0, 0, 0))
    out += ch(b"IDAT", zlib.compress(raw, 9))
    out += ch(b"IEND", b"")
    open(path, "wb").write(out)

def hx(c):
    c = c.lstrip("#")
    return (int(c[0:2],16), int(c[2:4],16), int(c[4:6],16), 255)

def sheet(path, tiles, scale=10, gap=2, bg="#151018"):
    """tiles: [(art, pal)] を横に並べる"""
    hs = [len(a) for a,_ in tiles]; ws = [max(len(r) for r in a) for a,_ in tiles]
    H = max(hs); W = sum(ws) + gap*(len(tiles)-1)
    bgc = hx(bg)
    px = [bgc]*(W*H)
    ox = 0
    for (art, pal), w in zip(tiles, ws):
        for y,row in enumerate(art):
            for x,ch2 in enumerate(row):
                col = pal.get(ch2)
                if col: px[y*W + ox + x] = hx(col)
        ox += w + gap
    png(path, px, W, H, scale)
