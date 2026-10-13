import {Fighter} from './companion.js';
import {ENEMIES} from './run-data.js';
import {distance,yawTo,relativeMove,constrain,signedAngle} from './target.js';
export class Encounter extends Fighter{
 constructor(stage){super('enemy-a',ENEMIES[stage.enemy].name,'enemy',2.2,-.4,stage.hp,'front');this.profile=ENEMIES[stage.enemy];this.type=stage.enemy;this.attackRange=this.profile.range;this.innerRange=this.profile.inner;this.setState('approach',2);}
 prepare(p){this.kind=this.profile.attack;this.aim={x:Math.cos(yawTo(this,p)),z:-Math.sin(yawTo(this,p))};this.yaw=yawTo(this,p);this.struck=false;this.setState('windup',this.profile.windup);}
 update(dt,p){const x=this.x,z=this.z;this.time+=dt;if(this.hp<=0){this.state='dead';return;}const v=this.profile,d=distance(this,p);if(!['windup','attack'].includes(this.state))this.yaw=yawTo(this,p);
  if(this.state==='approach'){if(d>v.range*.88)relativeMove(this,p,1,0,dt*v.speed,0);if(d<=v.range*.9||this.remaining<=0)this.prepare(p);}
  else if(this.state==='windup'&&this.remaining<=0){this.struck=false;this.setState('attack',this.kind==='rush'?.4:.23);}
  else if(this.state==='attack'){if(this.kind==='rush'){this.x+=this.aim.x*dt*12;this.z+=this.aim.z*dt*12;constrain(this);}const range=distance(this,p),dx=p.x-this.x,dz=p.z-this.z,along=dx*this.aim.x+dz*this.aim.z,side=Math.abs(dx*this.aim.z-dz*this.aim.x);const hit=this.kind==='rush'?along>-.75&&along<1.2&&side<.7:range>=v.inner&&range<v.range&&Math.abs(signedAngle(yawTo(this,p),this.yaw))<.65;if(!this.struck&&hit){this.struck=true;if(p.damage(this.kind==='heavy'?16:this.kind==='rush'?12:9))this.damageEvent=true;}if(this.remaining<=0)this.setState('recovery',v.recovery);}
  else if(['hurt','stagger','recovery'].includes(this.state)&&this.remaining<=0){this.cycle++;this.setState(v.guard?'guard':'approach',v.guard||1.8);}
  else if(this.state==='guard'&&this.remaining<=0)this.setState('approach',2);
  else if(this.state==='orbit'){relativeMove(this,p,0,this.orbitDirection,0,dt*v.speed);if(this.remaining<=0)this.setState('approach',2);}
  else if(['retreat','wary'].includes(this.state)){if(this.state==='retreat')relativeMove(this,p,-1,0,dt*v.speed,0);if(this.remaining<=0)this.setState('approach',2);}
  this.velocity={x:(this.x-x)/dt,z:(this.z-z)/dt};this.walk+=Math.hypot(this.x-x,this.z-z)*5;
 }
}
