import {constrain} from './target.js';
export const GUARDIAN_TIMING=Object.freeze({arrival:.10,damage:.18,total:.85});
export function beginGuardian(game,raw,source){if(game.guardian||game.lord.hp<=0)return false;
 const p=game.player,l=game.lord,s=source||game.front,dx=s.x-p.x,dz=s.z-p.z,n=Math.hypot(dx,dz)||1,end=constrain({x:p.x+dx/n*1.3,z:p.z+dz/n*1.3});
 game.guardian={time:0,raw,sourceId:s.id,origin:{x:l.x,z:l.z},end,received:false,survived:false};Object.assign(l,end);l.yaw=Math.atan2(-dz,dx);l.setState('guard',.85);l.intent='protect';p.dash=null;p.invulnerable=1;p.state='idle';p.time=0;game.stats.sacrifices++;game.projectiles=[];game.swords=[];game.events.push({type:'guardian-start',sourceId:s.id,stage:game.stageId});return true;
}
export function tickGuardian(game,dt){const g=game.guardian;if(!g)return;g.time+=dt;game.presentationTime+=dt;
 if(!g.received&&g.time>=GUARDIAN_TIMING.damage){g.received=true;game.lord.hp=0;game.lord.setState('dead',Infinity);game.events.push({type:'guardian-hit',survived:false,x:game.lord.x,z:game.lord.z});}
 if(g.time>=GUARDIAN_TIMING.total){game.lastGuardian={stage:game.stageId,sourceId:g.sourceId,raw:g.raw,survived:false};game.guardian=null;game.checkEnd();}
}
