"""Check deployed bytes without assuming successful Pages deployment."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from urllib.request import urlopen,Request
from hashlib import sha256
import json,sys,time
root=Path(__file__).resolve().parents[2]
baseline=json.loads(Path(__file__).with_name('protected-baseline.json').read_text())
base='https://tishiyama1.github.io/prototype/'
files={p:h for p,h in baseline['files'].items() if Path(p).suffix!='.md'}
for p in (root/'forest-action-pixel').rglob('*'):
    if p.is_file() and p.suffix in ['.html','.css','.js','.png','.jpg']:
        files[p.relative_to(root).as_posix()]=sha256(p.read_bytes()).hexdigest()
stamp=str(int(time.time()))
def check(item):
    p,expected=item
    with urlopen(Request(base+p+'?qa='+stamp,headers={'Cache-Control':'no-cache'}),timeout=40) as r:
        data=r.read();actual=sha256(data).hexdigest()
        assert r.status==200 and actual==expected,(p,r.status,expected,actual)
        return {'path':p,'status':r.status,'sha256':actual,'bytes':len(data)}
with ThreadPoolExecutor(max_workers=6) as pool:checks=list(pool.map(check,files.items()))
record={'base':base,'verified_at_utc':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'checks':checks,'original_files':sum(p in baseline['files'] for p in files),'all_match':True}
Path(sys.argv[1] if len(sys.argv)>1 else '/tmp/forest-pixel-public-files.json').write_text(json.dumps(record,indent=2))
print('PASS',len(checks),'deployed files HTTP 200 and SHA256 match;',record['original_files'],'protected original/public files')
