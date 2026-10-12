"""Encode real captures after the browser process exits; validate all 7 clips."""
import json, pathlib, subprocess, sys

out = pathlib.Path(sys.argv[1])
root = pathlib.Path(__file__).resolve().parents[2]
meta = out / 'capture-wide.json'
if not meta.exists():
    meta = out / 'recording-wide.json'
data = json.loads(meta.read_text())
assert len(data['clips']) == 7

def probe(file):
    return json.loads(subprocess.check_output([
        '/usr/bin/ffprobe', '-v', 'error', '-show_entries',
        'format=duration,size', '-of', 'json', str(file)]))['format']

for clip in data['clips']:
    assert clip['observedImpact']['rectangles'] > 0
    folder = out / ('wide-record-' + clip['name'])
    dest = out / ('wide-' + clip['name'] + '.mp4')
    subprocess.run(['/usr/bin/ffmpeg', '-nostdin', '-y', '-loglevel', 'error',
                    '-safe', '0', '-f', 'concat', '-i', str(folder / 'frames.ffconcat'),
                    '-vf', 'scale=960:540,fps=30', '-c:v', 'libx264', '-preset', 'fast',
                    '-crf', '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(dest)], check=True)
    clip['file'] = str(dest)
    clip['probe'] = probe(dest)
    assert float(clip['probe']['duration']) > 1
    print(clip['name'], clip['probe'])

listing = out / 'wide-clips.ffconcat'
listing.write_text('ffconcat version 1.0\n' + '\n'.join("file '" + c['file'] + "'" for c in data['clips']))
dest = root / 'forest-action-card-impact/media/card-impact-wide.mp4'
subprocess.run(['/usr/bin/ffmpeg', '-nostdin', '-y', '-loglevel', 'error', '-safe', '0',
                '-f', 'concat', '-i', str(listing), '-c', 'copy', '-movflags', '+faststart', str(dest)], check=True)
data['probe'] = {'format': probe(dest)}
assert float(data['probe']['format']['duration']) >= 9
data['description'] = 'Real browser frames; original timing retained, duplicated to H264 30fps. All 7 clips decoded and verified before joining. No synthetic animation.'
(out / 'recording-wide.json').write_text(json.dumps(data, indent=2))
print('FINAL', data['probe'])
