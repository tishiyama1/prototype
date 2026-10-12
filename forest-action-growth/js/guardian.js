import {constrain,distance} from './target.js';
import {normalLordDamage} from './progression.js';
export const GUARDIAN_TIMING=Object.freeze({arrival:.10,damage:.16,counter:.34,total:.65});
export function beginGuardian(game,raw,source){
 if(game.guardian||game.lord.hp<=0)return false;
 const p=game.player,l=game.lord,s=source||game.enemy,dx=s.x-p.x,dz=s.z-p.z,n=Math.hypot(dx,dz)||1;
 const end=constrain({x:p.x+dx/n*1.35,z:p.z+dz/n*1.35});
 game.guardian={time:0,raw,sourceId:s.id,amount:normalLordDamage(raw,game.stage)*10,origin:{x:l.x,z:l.z},end,received:false,countered:false,survived:null};
 // Reliable arrival is a rule, never dependent on speed, pathfinding or remaining power.
 Object.assign(l,end);l.yaw=Math.atan2(-dz,dx);l.setState('guard',.65);l.intent='protect';p.dash=null;p.invulnerable=1;p.state='idle';p.time=0;
 game.stats.sacrifices++;game.events.push({type:'guardian-start',sourceId:s.id,stage:game.stageId});return true;
}
export function tickGuardian(game,dt){const g=game.guardian;if(!g)return;g.time+=dt;game.presentationTime+=dt;
 if(!g.received&&g.time>=GUARDIAN_TIMING.damage){g.received=true;const before=game.lord.hp;game.lord.receive(g.raw,{sacrifice:true});g.survived=game.lord.hp>0;game.stats.sacrificeDamage+=before-game.lord.hp;game.events.push({type:'guardian-hit',survived:g.survived,amount:g.amount,x:game.lord.x,z:game.lord.z});}
 if(g.survived&&!g.countered&&g.time>=GUARDIAN_TIMING.counter){g.countered=true;
  g.knockbacks={};for(const e of game.enemies.filter(e=>e.hp>0&&(e.id===g.sourceId||distance(e,game.player)<3.8))){const origin={x:e.x,z:e.z};const dx=e.x-game.player.x,dz=e.z-game.player.z,n=Math.hypot(dx,dz)||1;constrain(Object.assign(e,{x:e.x+dx/n*3.8,z:e.z+dz/n*3.8}));e.setState('stagger',1.1);g.knockbacks[e.id]={origin,end:{x:e.x,z:e.z}};}
  // Protection retaliation is positional, never a late-game high damage attack.
  game.events.push({type:'guardian-counter',x:game.lord.x,z:game.lord.z});
 }
 if(g.time>=GUARDIAN_TIMING.total){game.lastGuardian={stage:game.stageId,sourceId:g.sourceId,raw:g.raw,amount:g.amount,survived:g.survived};game.guardian=null;game.checkEnd();}
}
