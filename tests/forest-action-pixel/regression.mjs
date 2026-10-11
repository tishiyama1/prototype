import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Game as Original} from '../../forest-action/js/game.js';
import {Game as Pixel} from '../../forest-action-pixel/js/game.js';
import {FIXED_DT} from '../../forest-action/js/config.js';
import {visual,renderSize} from '../../forest-action-pixel/js/visual-config.js';
import {distance} from '../../forest-action/js/target.js';
const baseline=JSON.parse(readFileSync(new URL('./protected-baseline.json',import.meta.url)));
for(const [file,hash]of Object.entries(baseline.files))assert.equal(createHash('sha256').update(readFileSync(new URL('../../'+file,import.meta.url))).digest('hex'),hash,file+' was changed');
console.log(`PASS ${Object.keys(baseline.files).length} original/public files unchanged`);
const core=['config','game','player','enemy','target','combat','assessment','attack-phase','presentation','camera','input','ui','cards','audio','effects'];
for(const name of core)assert.equal(readFileSync(new URL(`../../forest-action/js/${name}.js`,import.meta.url),'utf8'),readFileSync(new URL(`../../forest-action-pixel/js/${name}.js`,import.meta.url),'utf8'),name);
console.log(`PASS ${core.length} battle/card/camera/input modules byte-identical`);
const a=new Original(),b=new Pixel();a.reset();b.reset();let ticks=0,pauses=0,skips=0;
while(a.status==='playing'&&ticks<120*180){
 ticks++;const e=a.enemy,p=a.player,d=distance(p,e);let input={};
 if(!a.cinematic){
  if(['recovery','stagger','hurt','guard'].includes(e.state)){
   if(d<=1.78&&e.remaining>.61)input={move:'heavy',attack:true};
   else if(d<=2.78&&e.state!=='guard'&&e.remaining>.21)input={move:'slash',attack:true};else input={radial:1};
  }else if(e.state==='approach'&&d<2.65)input={move:'slash',attack:true};
  else if(e.state==='windup'){if(e.kind==='rush'&&d<4.65&&e.remaining>.4)input={move:'thrust',attack:true};else if(e.remaining<.28)input={dash:{radial:-.3,orbit:1},radial:-.3,orbit:1};else input={orbit:1,radial:-.2};}
  else if(e.state==='attack')input={radial:-1,orbit:1};else if(e.state==='orbit')input={radial:1,orbit:.5};else input={radial:d>2?1:0};
 }
 if(ticks%180===0){visual.resolution=['low','medium','high'][ticks/180%3|0];visual.pixel=!visual.pixel;visual.fog=!visual.fog;visual.shadows=!visual.shadows;visual.environment=!visual.environment;}
 if(a.cinematic&&ticks%100===0){a.status=b.status='paused';a.step(5,input);b.step(5,input);assert.deepEqual(a.snapshot(),b.snapshot());a.status=b.status='playing';pauses++;}
 if(a.cinematic&&ticks%130===0){a.skipPresentation();b.skipPresentation();skips++;}
 a.step(FIXED_DT,input);b.step(FIXED_DT,input);assert.deepEqual(a.snapshot(),b.snapshot(),`frame ${ticks}`);a.events.length=b.events.length=0;
}
assert.equal(a.status,'clear');assert.equal(b.status,'clear');console.log(`PASS ${ticks} identical fixed-step snapshots through victory; ${pauses} pauses / ${skips} skips`);
for(const [w,h,dpr]of [[1280,720,1],[844,390,1.5],[667,375,1.5],[390,844,1.5]]){
 const levels=['low','medium','high'].map(level=>renderSize(w,h,dpr,level));assert.ok(levels[0].height<levels[1].height&&levels[1].height<levels[2].height);for(const n of levels){assert.equal(n.scale,Math.round(n.scale));assert.ok(n.width*n.height<=n.displayWidth*n.displayHeight);assert.ok(Math.abs(n.width/n.height-w/h)<.02);}
}
console.log('PASS resolution/DPR sizing, integer enlargement and aspect preservation');
