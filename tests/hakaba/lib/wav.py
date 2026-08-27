import struct, array, sys, math, io

def rd(p):
    b = open(p,'rb').read()
    assert b[:4]==b'RIFF'
    i = 12; sr=None; data=None
    while i < len(b):
        cid = b[i:i+4]; sz = struct.unpack('<I', b[i+4:i+8])[0]
        if cid == b'fmt ': sr = struct.unpack('<I', b[i+12:i+16])[0]
        elif cid == b'data': data = b[i+8:i+8+sz]
        i += 8 + sz + (sz & 1)
    a = array.array('h'); a.frombytes(data)
    return sr, a

def wr(p, sr, a):
    d = a.tobytes()
    h = b'RIFF' + struct.pack('<I', 36+len(d)) + b'WAVEfmt ' + struct.pack('<IHHIIHH',16,1,1,sr,sr*2,2,16) + b'data' + struct.pack('<I', len(d))
    open(p,'wb').write(h+d)

def hp(a, sr, fc):
    rc = 1.0/(2*math.pi*fc); al = rc/(rc+1.0/sr)
    y = 0.0; px = 0.0; e = 0.0
    for x in a:
        x = x/32768.0
        y = al*(y + x - px); px = x
        e += y*y
    return e

def stats(p):
    sr, a = rd(p)
    n = len(a)
    pk = max(abs(min(a)), abs(max(a)))/32768.0
    e = sum((x/32768.0)**2 for x in a)
    rms = math.sqrt(e/n)
    e2 = hp(a, sr, 2000.0); e4 = hp(a, sr, 4000.0)
    return dict(sec=round(n/sr,1), peak=round(pk,3), rms=round(rms,4),
                hi2=round(e2/e,3) if e else 0, hi4=round(e4/e,3) if e else 0)

if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'stat':
        for p in sys.argv[2:]:
            print(p.split('/')[-1].ljust(16), stats(p))
    elif cmd == 'cat':
        out = sys.argv[2]; srx=None; acc = array.array('h')
        for p in sys.argv[3:]:
            sr, a = rd(p); srx = sr
            acc.extend(a); acc.extend(array.array('h',[0])*int(sr*0.8))
        wr(out, srx, acc)
        print('wrote', out, round(len(acc)/srx,1), 's')

def slices(p, names, gap=1.0, off=0.0):
    sr, a = rd(p)
    out = []
    for i, nm in enumerate(names):
        s = int((off + i*gap)*sr); e = min(len(a), s + int(gap*sr))
        seg = a[s:e]
        if not len(seg): continue
        pk = max(abs(min(seg)), abs(max(seg)))/32768.0
        en = sum((x/32768.0)**2 for x in seg) or 1e-12
        out.append((nm, round(pk,3), round(hp(seg,sr,2000.0)/en,3), round(hp(seg,sr,4000.0)/en,3)))
    return out

def decim(seg, sr, target=8000):
    k = max(1, int(round(sr/target)))
    al = 0.3; y = 0.0; out = []
    for x in seg:
        y += (x - y) * al
        out.append(y)
    return out[::k], sr//k

def tonal(seg, sr):
    """澄んだ音程の強さ。自己相関の最大（60〜2000Hz相当のずらし幅）"""
    d, dsr = decim(seg, sr)
    # いちばん鳴っている 120ms を切り出す
    W = int(dsr*0.12)
    if len(d) < W*2: W = max(8, len(d)//2)
    best=0; bi=0
    for i in range(0, len(d)-W, max(1, W//4)):
        e = sum(x*x for x in d[i:i+W])
        if e > best: best=e; bi=i
    w = d[bi:bi+W]
    m = sum(w)/len(w); w=[x-m for x in w]
    e0 = sum(x*x for x in w) or 1e-9
    lo = max(2, int(dsr/2000)); hi = min(len(w)-1, int(dsr/60))
    top = 0.0
    for lag in range(lo, hi):
        c = sum(w[i]*w[i+lag] for i in range(len(w)-lag))
        n = c/e0
        if n > top: top = n
    return round(top, 3)

def hpsig(seg, sr, fc):
    import math
    rc = 1.0/(2*math.pi*fc); al = rc/(rc+1.0/sr)
    y=0.0; px=0.0; out=[]
    for x in seg:
        x=x/32768.0
        y = al*(y + x - px); px = x
        out.append(y)
    return out

def tonalMid(seg, sr, fc=600.0, f_lo=600.0, f_hi=4000.0):
    """中高域だけの澄んだ音程の強さ。ポコ／ピコはここに出る"""
    d = hpsig(seg, sr, fc)
    k = max(1, int(round(sr/16000.0)))
    d = d[::k]; dsr = sr//k
    W = int(dsr*0.06)
    if len(d) < W*2: W = max(16, len(d)//2)
    best=0.0; bi=0
    for i in range(0, len(d)-W, max(1, W//4)):
        e = sum(x*x for x in d[i:i+W])
        if e > best: best=e; bi=i
    w = d[bi:bi+W]
    m = sum(w)/len(w); w=[x-m for x in w]
    e0 = sum(x*x for x in w) or 1e-12
    lo = max(2, int(dsr/f_hi)); hi = min(len(w)-1, int(dsr/f_lo))
    top=0.0
    for lag in range(lo, hi+1):
        c = sum(w[i]*w[i+lag] for i in range(len(w)-lag))
        if c/e0 > top: top = c/e0
    return round(top,3)
