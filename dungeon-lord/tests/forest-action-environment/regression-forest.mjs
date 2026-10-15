import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Game as Original} from '../../forest-action-diorama-pixel/js/game.js';
import {Game as Diorama} from '../../forest-action-forest-environment/js/game.js';
import * as oldConfig from '../../forest-action-diorama-pixel/js/config.js';
import * as newConfig from '../../forest-action-forest-environment/js/config.js';
import {FIXED_DT} from '../../forest-action-diorama-pixel/js/config.js';
import {distance} from '../../forest-action-diorama-pixel/js/target.js';
const baseline=JSON.parse(readFileSync(new URL('./protected-baseline.json',import.meta.url)));
for(const [file,hash]of Object.entries(baseline.files))assert.equal(createHash('sha256').update(readFileSync(new URL('../../'+file,import.meta.url))).digest('hex'),hash,file+' was changed');
console.log(`PASS ${Object.keys(baseline.files).length} original/public files unchanged`);
const core=['game','player','enemy','target','combat','assessment','attack-phase','presentation','input','ui','cards','audio','camera','config','character','effects','sprite-art','sprite-state','surface'];
for(const name of core)assert.equal(readFileSync(new URL(`../../forest-action-diorama-pixel/js/${name}.js`,import.meta.url),'utf8'),readFileSync(new URL(`../../forest-action-forest-environment/js/${name}.js`,import.meta.url),'utf8'),name);
console.log(`PASS ${core.length} battle/card/input modules byte-identical`);
const omitCamera=({pitch,zoom,...rest})=>rest;
assert.deepEqual(omitCamera(newConfig.DEFAULTS),omitCamera(oldConfig.DEFAULTS));
assert.deepEqual(newConfig.MOVE_DEFAULTS,oldConfig.MOVE_DEFAULTS);assert.deepEqual(newConfig.ARENA,oldConfig.ARENA);assert.equal(newConfig.FIXED_DT,oldConfig.FIXED_DT);
assert.deepEqual(newConfig.DEFAULTS,oldConfig.DEFAULTS);console.log('PASS all movement, camera, attack, card and arena defaults unchanged');
const a=new Original(),b=new Diorama();a.reset();b.reset();let ticks=0,pauses=0,skips=0;
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

 if(a.cinematic&&ticks%100===0){a.status=b.status='paused';a.step(5,input);b.step(5,input);assert.deepEqual(a.snapshot(),b.snapshot());a.status=b.status='playing';pauses++;}
 if(a.cinematic&&ticks%130===0){a.skipPresentation();b.skipPresentation();skips++;}
 a.step(FIXED_DT,input);b.step(FIXED_DT,input);assert.deepEqual(a.snapshot(),b.snapshot(),`frame ${ticks}`);a.events.length=b.events.length=0;
}
assert.equal(a.status,'clear');assert.equal(b.status,'clear');console.log(`PASS ${ticks} identical fixed-step snapshots through victory; ${pauses} pauses / ${skips} skips`);
a.reset();b.reset();assert.deepEqual(a.snapshot(),b.snapshot());console.log('PASS retry resets both versions to identical battle state');

const {facing,spriteFrame,STATES}=await import('../../forest-action-forest-environment/js/sprite-state.js');
assert.equal(facing(0),2);assert.equal(facing(Math.PI),3);assert.equal(facing(Math.PI/2),1);assert.equal(facing(-Math.PI/2),0);
for(const state of [...STATES,'approach','orbit','retreat'])for(const yaw of [0,1,2,3,-2]){const f=spriteFrame({state,yaw,phase:.8,walk:.6,time:.3},2);assert.ok(f.index>=0&&f.index<STATES.length*24);assert.deepEqual(f,spriteFrame({state,yaw,phase:.8,walk:.6,time:.3},2));}
console.log('PASS four directional sprites, all action frame indices, deterministic presentation');
