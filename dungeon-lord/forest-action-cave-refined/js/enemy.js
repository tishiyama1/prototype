import {distance,yawTo,relativeMove,constrain,signedAngle} from './target.js';
export class Enemy {
 constructor(){this.x=2;this.z=0;this.hp=120;this.maxHP=120;this.yaw=Math.PI;this.state='wary';this.time=0;this.duration=.85;this.walk=0;this.cycle=0;this.kind='slash';this.velocity={x:0,z:0};this.aim={x:-1,z:0};this.struck=false;this.orbitDirection=1;}
 setState(state,duration){this.state=state;this.time=0;this.duration=duration;this.velocity={x:0,z:0};}
 get remaining(){return Math.max(0,this.duration-this.time);}
 prepare(player,kind){this.kind=kind;this.yaw=yawTo(this,player);this.aim={x:Math.cos(this.yaw),z:-Math.sin(this.yaw)};this.struck=false;this.setState('windup',kind==='rush'?1.0:kind==='heavy'?1.05:.72);}
 update(dt,player){
  const x=this.x,z=this.z;this.time+=dt;if(this.hp<=0){this.state='dead';return;}
  const d=distance(this,player);
  if(!['windup','attack'].includes(this.state))this.yaw=yawTo(this,player);
  switch(this.state){
   case 'wary':if(this.remaining<=0){this.setState('guard',1.25);}break;
   case 'guard':if(this.remaining<=0){this.cycle++;this.setState('approach',2.1);}break;
   case 'approach':{
    const rush=this.cycle%2===0;
    if(d>(rush?4.3:2.15))relativeMove(this,player,1,0,dt*2.1,0);
    if(d<=(rush?4.4:2.2)||this.remaining<=0)this.prepare(player,rush?'rush':this.cycle%3===0?'heavy':'slash');break;}
   case 'windup':if(this.remaining<=0){this.setState('attack',this.kind==='rush'?.38:.22);this.struck=false;}break;
   case 'attack':{
    if(this.kind==='rush'){this.x+=this.aim.x*dt*12;this.z+=this.aim.z*dt*12;constrain(this);}
    if(!this.struck){const dx=player.x-this.x,dz=player.z-this.z,along=dx*this.aim.x+dz*this.aim.z,side=Math.abs(dx*this.aim.z-dz*this.aim.x);
     const hits=this.kind==='rush'?along>-.75&&along<1.1&&side<.68:Math.hypot(dx,dz)<(this.kind==='heavy'?2.9:2.65)&&Math.abs(signedAngle(yawTo(this,player),this.yaw))<.7;
     if(hits){this.struck=true;if(player.damage(this.kind==='heavy'?20:this.kind==='rush'?16:12))this.damageEvent=true;}}
    if(this.remaining<=0)this.setState('recovery',this.kind==='heavy'?1.55:this.kind==='rush'?1.45:.95);break;}
   case 'recovery':if(this.remaining<=0){this.orbitDirection=this.cycle%2?1:-1;this.setState('orbit',1.05);}break;
   case 'orbit':relativeMove(this,player,0,this.orbitDirection,0,dt*2.5);if(this.remaining<=0)this.setState('retreat',.65);break;
   case 'retreat':relativeMove(this,player,-1,0,dt*1.9,0);if(this.remaining<=0)this.setState('wary',.45);break;
   case 'hurt':if(this.remaining<=0)this.setState('guard',.55);break;
   case 'stagger':if(this.remaining<=0)this.setState('recovery',.35);break;
  }
  this.velocity={x:(this.x-x)/dt,z:(this.z-z)/dt};this.walk+=Math.hypot(this.x-x,this.z-z)*5;
 }
}
