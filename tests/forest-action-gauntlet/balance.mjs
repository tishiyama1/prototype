import {Game} from '../../forest-action-gauntlet/js/game.js';
import {run,newRun,record,choose,choices} from '../../forest-action-gauntlet/js/run-state.js';
import {WEAPONS} from '../../forest-action-gauntlet/js/run-data.js';
import {policy} from './policy.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const rows=[];
for(const mode of ['standard','weak','overwhelming'])for(const weapon of Object.keys(WEAPONS)){
 newRun(mode);run.weapon=weapon;run.owned=[weapon];
 for(let stage=1;stage<=10;stage++){
  const g=new Game();g.reset();g.runSkill=run.skills.includes('lunge');for(let i=0;i<180*120&&g.status==='playing';i++)g.step(1/120,policy(g,WEAPONS[weapon]));const r=record(g);if(!r)throw Error('timeout '+mode+' '+weapon+' '+stage);rows.push({...r,startingWeapon:weapon});if(!r.win)break;const opts=choices();let pick=run.hp<70?opts.find(x=>x.kind==='heal'):null;pick=pick||opts.find(x=>x.kind==='upgrade')||opts.find(x=>x.kind==='skill')||opts.find(x=>x.kind==='boots')||opts.find(x=>x.kind==='armor')||opts.find(x=>x.kind==='heal')||opts[0];choose(pick.id);
 }
}
assert.equal(rows.length,120);assert.ok(rows.every(r=>r.win));for(const mode of ['standard','weak','overwhelming'])for(const weapon of Object.keys(WEAPONS)){const a=rows.filter(r=>r.mode===mode&&r.startingWeapon===weapon);assert.ok(a.some(r=>r.promoted.length>0));assert.ok(a.every(r=>Object.values(r.gains).every(n=>n<=4)));}const sword=rows.filter(r=>r.mode==='standard'&&r.startingWeapon==='sword'),hero=sword.reduce((s,r)=>s+r.hero,0),lord=sword.reduce((s,r)=>s+r.lord,0);assert.ok(lord/(hero+lord)>=.15&&lord/(hero+lord)<=.35);
fs.writeFileSync('tests/forest-action-gauntlet/balance-results.json',JSON.stringify({method:'Deterministic tactical input through real fixed-step combat, normal unskipped cards. Simulated active time includes presentation; no HP override.',rows},null,2));
for(const mode of ['standard','weak','overwhelming'])for(const weapon of Object.keys(WEAPONS)){const a=rows.filter(r=>r.mode===mode&&r.startingWeapon===weapon),won=a.filter(r=>r.win),hero=a.reduce((s,r)=>s+r.hero,0),lord=a.reduce((s,r)=>s+r.lord,0);console.log(mode,weapon,won.length+'/10','mean '+(won.reduce((s,r)=>s+r.seconds,0)/Math.max(1,won.length)).toFixed(1)+'s','lord '+(lord/(lord+hero)*100).toFixed(1)+'%','hp '+a.at(-1).hp);}
