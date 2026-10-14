import {config,clamp} from './config.js';
import {relativeMove,distance,constrain} from './target.js';
export const DODGE=Object.freeze({duration:.24,invincible:.12,buffer:.30});
export class Player {
 constructor(){this.x=-3.6;this.z=2;this.hp=100;this.maxHP=100;this.yaw=0;this.state='idle';this.time=0;this.walk=0;this.cooldown=0;this.invulnerable=0;this.damageTaken=0;this.dash=null;this.pendingDodge=null;this.dodgeCount=0;this.attackCooldown=0;}
 get invincible(){return !!this.dash&&this.dash.time<Math.min(config.invincibility,DODGE.invincible);}
 update(dt,input,target){
  this.recentDodge=Math.max(0,(this.recentDodge||0)-dt);this.recentHurt=Math.max(0,(this.recentHurt||0)-dt);
  this.cooldown=Math.max(0,this.cooldown-dt);this.attackCooldown=Math.max(0,this.attackCooldown-dt);this.invulnerable=Math.max(0,this.invulnerable-dt);this.time+=dt;
  if(this.pendingDodge){this.pendingDodge.life-=dt;if(this.pendingDodge.life<=0)this.pendingDodge=null;}if(input.dash)this.pendingDodge={...input.dash,life:DODGE.buffer};
  if(this.hp<=0){this.state='dead';return;}
  if(this.state==='hurt'){if(this.time<.24)return;this.state='idle';}
  let radial=input.radial||0,orbit=input.orbit||0;const magnitude=Math.hypot(radial,orbit);if(magnitude>1){radial/=magnitude;orbit/=magnitude;}
  if(this.pendingDodge&&!this.dash&&this.cooldown<=0){const d=this.pendingDodge;this.pendingDodge=null;const n=d.world?Math.hypot(d.x,d.z):Math.hypot(d.radial,d.orbit);if(n>.01){this.dash=d.world?{time:0,world:true,x:d.x/n,z:d.z/n}:{time:0,radial:d.radial/n,orbit:d.orbit/n};this.dodgeCount++;this.recentDodge=.7;this.cooldown=DODGE.duration;this.state='dash';this.time=0;}}
  const x=this.x,z=this.z;
  if(this.dash){const d=this.dash,previous=clamp(d.time/.24,0,1);d.time+=dt;const next=clamp(d.time/.24,0,1),delta=(Math.sin(next*Math.PI/2)-Math.sin(previous*Math.PI/2))*config.dashDistance;if(d.world){this.x+=d.x*delta;this.z+=d.z*delta;constrain(this);}else relativeMove(this,target,d.radial,d.orbit,delta,delta);this.state='dash';if(next>=1){this.dash=null;this.state='idle';this.time=0;}}
  else {if(input.worldMove){const v=input.worldMove;this.x+=v.x*v.strength*config.speed*dt;this.z+=v.z*v.strength*config.speed*dt;constrain(this);}else relativeMove(this,target,radial,orbit,config.speed*dt,config.orbitSpeed*dt);this.state=input.worldMove||magnitude>.02?'move':'idle';}
  const moved=Math.hypot(this.x-x,this.z-z);this.steady=moved<.002?(this.steady||0)+dt:0;this.walk+=moved*4.7;
 }
 damage(amount){if(this.hp<=0||this.invincible||this.invulnerable>0)return false;const d=Math.min(this.hp,amount);this.hp-=d;this.recentHurt=.9;this.damageTaken+=d;this.state=this.hp>0?'hurt':'dead';this.time=0;this.dash=null;this.pendingDodge=null;this.invulnerable=.42;return true;}
}
