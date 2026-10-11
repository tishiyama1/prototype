import { config, laneZ, smooth, clamp } from './config.js';
export class Enemy {
  constructor(id,x,lane) { Object.assign(this,{id,x,lane,z:laneZ(lane),hp:64,facing:-1,state:'idle',time:0,walk:0,attacks:0,cooldown:.4+(id%3)*.2,hit:false,transition:null,vx:0}); }
  setState(s) {this.state=s;this.time=0;}
  update(dt,p) {
    this.time+=dt; this.cooldown=Math.max(0,this.cooldown-dt);
    if(this.state==='dead')return;
    if(this.state==='hurt') {
      this.x=clamp(this.x+this.vx*dt,.6,65);this.vx*=Math.exp(-12*dt);
      if(this.time>.25)this.setState('recover');return;
    }
    if(this.state==='lane') {
      const tr=this.transition,t=clamp(this.time/.38,0,1); this.z=laneZ(tr.from)+(laneZ(tr.to)-laneZ(tr.from))*smooth(t);
      if(t===1){this.lane=tr.to;this.transition=null;this.setState('recover');this.cooldown=.45;} return;
    }
    this.z=laneZ(this.lane);
    if(this.state==='windup') {
      if(this.time >= (this.kind==='rush' ? .85 : .48)) {this.setState('strike');this.hit=false;}
      return;
    }
    if(this.state==='strike') {
      if(this.kind==='rush') {this.x=clamp(this.x+this.facing*10.5*dt,.6,65);this.walk+=dt*22;}
      if(this.time >= (this.kind==='rush' ? .48 : .16)) {this.setState('recover');this.cooldown=this.kind==='rush'?1.0:.7;}return;
    }
    if(this.state==='recover') {if(this.time > (this.kind==='rush' ? .8 : .4))this.setState('idle');return;}
    const distance=Math.abs(p.x-this.x);
    if(distance>10.5 || p.hp<=0){this.state='idle';return;}
    this.facing = p.x>=this.x ? 1:-1;
    if(this.lane!==p.lane && !p.transition) {
      this.transition={from:this.lane,to:p.lane};this.setState('lane');return;
    }
    if(this.lane!==p.lane){this.state='idle';return;}
    const rush = this.attacks%2===0;
    if(this.cooldown===0 && distance < (rush?5:1.55)) {
      this.kind=rush?'rush':'slash';this.attacks++;this.setState('windup');return;
    }
    this.state='approach';
    if(distance>1.15){this.x+=this.facing*2.0*dt;this.walk+=dt*5.2;}
  }
  hurt(damage,dir,knockback) {
    if(this.hp<=0)return;
    this.hp=Math.max(0,this.hp-damage);this.transition=null;this.z=laneZ(this.lane);
    this.vx=dir*knockback*15;this.setState(this.hp===0?'dead':'hurt');
    this.cooldown=.6;
  }
}
export function spawnEnemies() { return [[12,0],[21,1],[29,0],[33,1],[43,1],[51,0],[59,1]].map(([x,lane],id)=>new Enemy(id,x,lane)); }
