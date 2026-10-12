"""Pack offline raster passes, trimming transparent margins without shifting anchors."""
from pathlib import Path
from PIL import Image
import json
root=Path(__file__).resolve().parents[2]/'forest-action-layered/media'
manifest={}
previous=json.loads((root/'layers.json').read_text()) if (root/'layers.json').exists() else {}
for name in ['ground','far','rear','middle','left','right']:
 p=root/(name+'.png')
 if not p.exists() and name in previous:
  existing=Image.open(p.with_suffix('.webp'));existing.load();assert list(existing.size)==previous[name]['pixels'];manifest[name]=previous[name];manifest[name]['bytes']=p.with_suffix('.webp').stat().st_size;continue
 im=Image.open(p).convert('RGBA');w,h=im.size
 if name=='ground':box=(0,0,w,h)
 else:
  box=im.getchannel('A').getbbox()
  if box is None:raise ValueError(name+' empty')
  box=(max(0,box[0]-4),max(0,box[1]-4),min(w,box[2]+4),min(h,box[3]+4))
 crop=im.crop(box);dest=p.with_suffix('.webp');tmp=dest.with_suffix('.tmp');crop.save(tmp,'WEBP',quality=94,method=6);tmp.replace(dest)
 manifest[name]={'pixels':list(crop.size),'width':(box[2]-box[0])/w*66,'height':(box[3]-box[1])/h*(49.5 if name=='ground' else 44),'offsetX':((box[0]+box[2])/2/w-.5)*66,'offsetY':(.5-(box[1]+box[3])/2/h)*44,'bytes':dest.stat().st_size}
 print(name,crop.size,dest.stat().st_size);p.unlink()
front=root/'front.png'
if front.exists():front.unlink()
(root/'layers.json').write_text(json.dumps(manifest,indent=2))
