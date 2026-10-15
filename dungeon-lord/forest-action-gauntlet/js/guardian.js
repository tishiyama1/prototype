import {constrain} from './target.js';
export const GUARDIAN_TIMING=Object.freeze({arrival:.20,damage:.32,total:1.1,scale:.25});
export function beginGuardian(game,raw,source){if(game.guardian||game.lord.hp<=0)return false;
 const p=game.player,l=game.lord,s=source||game.front,dx=s.x-p.x,dz=s.z-p.z,n=Math.hypot(dx,dz)||1,end=constrain({x:p.x+dx/n*1.3,z:p.z+dz/n*1.3});
 game.guardian={time:0,raw,sourceId:s.id,origin:{x:l.x,z:l.z},end,received:false,survived:false};l.yaw=Math.atan2(-dz,dx);l.setState('guard',.85);l.intent='protect';p.dash=null;p.pendingDodge=null;p.invulnerable=1;p.state='idle';p.time=0;game.stats.sacrifices++;game.projectiles=[];game.swords=[];game.events.push({type:'guardian-start',sourceId:s.id,stage:game.stageId});return true;
}
export function tickGuardian(game,dt){const g=game.guardian;if(!g)return;g.time+=dt*GUARDIAN_TIMING.scale;game.presentationTime+=dt;const t=Math.min(1,g.time/GUARDIAN_TIMING.arrival),ease=t*t*(3-2*t);game.lord.x=g.origin.x+(g.end.x-g.origin.x)*ease;game.lord.z=g.origin.z+(g.end.z-g.origin.z)*ease;game.lord.time=Math.max(0,g.time-(g.received?GUARDIAN_TIMING.damage:0));
 if(!g.received&&g.time>=GUARDIAN_TIMING.damage){g.received=true;game.lord.hp=0;game.lord.setState('dead',Infinity);game.events.push({type:'guardian-hit',survived:false,x:game.lord.x,z:game.lord.z});}
 if(g.time>=GUARDIAN_TIMING.total){game.lastGuardian={stage:game.stageId,sourceId:g.sourceId,raw:g.raw,survived:false};game.guardian=null;game.checkEnd();}
}
