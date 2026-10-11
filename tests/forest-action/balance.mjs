import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {capture,resolve} from '../../forest-action/js/combat.js';
import {Player} from '../../forest-action/js/player.js';
import {Enemy} from '../../forest-action/js/enemy.js';
import {resetConfig} from '../../forest-action/js/config.js';
export function balanceDigest(resolver=resolve){
 resetConfig();const results=[];
 for(const state of ['wary','approach','retreat','orbit','guard','windup','attack','recovery','hurt','stagger'])
 for(const move of ['slash','thrust','heavy'])for(const d of [1.05,1.5,2,3,4.5,8])for(const remaining of [.1,.4,1.2])for(const yaw of [Math.PI,Math.PI/2]){
  const p=new Player(),e=new Enemy();p.x=-d;p.z=0;e.x=0;e.z=0;e.yaw=yaw;e.aim={x:-1,z:0};e.kind='rush';e.setState(state,remaining);e.velocity=state==='orbit'?{x:0,z:2.5}:state==='approach'?{x:-2,z:0}:{x:0,z:0};
  const r=resolver(capture(p,e,move));results.push([r.outcome,r.reason,r.damage,r.playerDamage,r.step,r.playerEnd,r.enemyEnd]);
 }
 return {cases:results.length,sha256:createHash('sha256').update(JSON.stringify(results)).digest('hex')};
}
if(process.argv[1]?.endsWith('/balance.mjs')){const baseline=JSON.parse(readFileSync(new URL('./balance-baseline.json',import.meta.url)));assert.deepEqual(balanceDigest(),baseline.digest);console.log(`PASS ${baseline.digest.cases} outcomes/damage/positions match pre-card engine ${baseline.sourceCommit}`);}
