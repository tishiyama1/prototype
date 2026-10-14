import {GUARDIAN_TIMING} from './guardian.js?v=gauntlet2';
import {smooth,lerp} from './config.js';
import {phase} from './attack-phase.js';
import {yawTo} from './target.js';
function pairPoses(game){
 const c=game.cinematic;if(!c){const settled=a=>a.state==='dead'?{...a,time:Math.max(.5,a.time)}:a;return {player:settled(game.player),enemy:settled(game.enemy),phase:0};}
 if(phase(c).index<3)return {player:game.player,enemy:game.enemy,phase:0};
 const r=c.result,t=phase(c).action,step=smooth((t-.30)/.24),response=smooth((t-.48)/.22);
 const p={...game.player,state:'cinematic',moveId:r.moveId,phase:t,outcome:r.outcome,time:c.time},e={...game.enemy,time:c.time};
 p.x=lerp(c.origin.player.x,r.playerEnd.x,step);p.z=lerp(c.origin.player.z,r.playerEnd.z,step);
 e.x=lerp(c.origin.enemy.x,r.enemyEnd.x,response);e.z=lerp(c.origin.enemy.z,r.enemyEnd.z,response);
 p.yaw=yawTo(c.origin.player,c.origin.enemy);e.yaw=yawTo(c.origin.enemy,c.origin.player);
 if(r.outcome==='evaded'){e.state=t>.38?'evade':game.enemy.state;e.phase=response;}
 else if(r.outcome==='guarded'){e.state='guard';e.phase=t;}
 else if(r.outcome==='interrupted'){e.state=t>.36?'counter':'windup';e.phase=t;if(t>.52){p.state='hurt';p.time=(t-.52)*.7;}}
 else if(r.hit&&t>.54){e.state=game.enemy.hp-r.damage<=0?'dead':r.moveId==='heavy'||r.outcome==='intercept'?'stagger':'hurt';e.time=(t-.54)*1.9;}
 return {player:p,enemy:e,phase:t};
}

export function poses(game){const v=pairPoses(game);v.actors=Object.fromEntries(game.actors.map(a=>[a.id,a.state==='dead'?{...a,time:Math.max(.5,a.time)}:a]));v.actors.player=v.player;v.actors[game.enemy.id]=v.enemy;v.actors['enemy-b']={...v.actors['enemy-b'],fled:!!game.support.fled};
 const g=game.guardian;if(g){v.actors.lord={...game.lord,time:Math.max(0,g.time-(g.received?GUARDIAN_TIMING.damage:0)),state:g.time<GUARDIAN_TIMING.arrival?'dash':g.received?'dead':'guard'};v.enemy=v.actors[game.enemy.id];}return v;}
