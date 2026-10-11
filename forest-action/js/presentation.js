import {clamp,smooth,lerp} from './config.js';
import {yawTo} from './target.js';
export function poses(game){
 const c=game.cinematic;if(!c){const settled=a=>a.state==='dead'?{...a,time:Math.max(.5,a.time)}:a;return {player:settled(game.player),enemy:settled(game.enemy),phase:0};}
 const r=c.result,t=clamp(c.time/r.duration,0,1),step=smooth((t-.30)/.24),response=smooth((t-.48)/.22);
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
