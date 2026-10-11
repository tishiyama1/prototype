import {Player} from './player.js';
import {Enemy} from './enemy.js';
import {TargetLock,separate} from './target.js';
import {capture,resolve,OUTCOMES} from './combat.js';
import {config,clamp} from './config.js';
export class Game {
 constructor(){this.reset(false);}
 reset(playing=true){this.player=new Player();this.enemy=new Enemy();this.targets=new TargetLock();this.targets.set(this.enemy);this.targets.face(this.player);this.status=playing?'playing':'ready';this.selected='slash';this.elapsed=0;this.presentationTime=0;this.attacks=0;this.counts=Object.fromEntries(Object.keys(OUTCOMES).map(k=>[k,0]));this.lastResult=null;this.cinematic=null;this.events=[];this.hits=0;}
 select(move){if(['slash','thrust','heavy'].includes(move))this.selected=move;}
 commandAttack(){
  if(this.status!=='playing'||this.cinematic||this.player.hp<=0||this.enemy.hp<=0||this.player.state==='hurt'||this.player.dash||this.player.attackCooldown>0)return false;
  const result=resolve(capture(this.player,this.enemy,this.selected));
  this.attacks++;this.lastResult=result;this.player.dash=null;
  this.cinematic={result,time:0,impact:false,hitstop:0,origin:{player:{x:this.player.x,z:this.player.z,yaw:this.player.yaw},enemy:{x:this.enemy.x,z:this.enemy.z,yaw:this.enemy.yaw}}};
  this.events.push({type:'attack',move:this.selected});
  if(!config.cinema)this.finishCinematic();return true;
 }
 finishCinematic(){
  const c=this.cinematic;if(!c)return;
  const r=c.result;Object.assign(this.player,r.playerEnd);Object.assign(this.enemy,r.enemyEnd);
  this.enemy.hp=Math.max(0,this.enemy.hp-r.damage);
  if(r.playerDamage){const amount=Math.min(this.player.hp,r.playerDamage);this.player.hp-=amount;this.player.damageTaken+=amount;this.player.invulnerable=.42;}
  this.counts[r.outcome]++;if(r.hit)this.hits++;
  if(this.enemy.hp<=0)this.enemy.setState('dead',Infinity);
  else if(r.hit)this.enemy.setState(r.moveId==='heavy'||r.outcome==='intercept'?'stagger':'hurt',r.moveId==='heavy'||r.outcome==='intercept'?1.05:.35);
  else if(r.outcome==='interrupted')this.enemy.setState('recovery',1.0);
  else if(r.outcome==='evaded')this.enemy.setState('orbit',.5);
  // Guard and whiff preserve the frozen enemy action/time exactly.
  this.player.attackCooldown=r.move.recovery;
  this.player.state=this.player.hp<=0?'dead':r.playerDamage?'hurt':'idle';this.player.time=0;
  this.targets.face(this.player);this.cinematic=null;this.events.push({type:'resolved',result:r});this.checkEnd();
 }
 checkEnd(){if(this.enemy.hp<=0||this.player.hp<=0){this.status=this.player.hp<=0?'dead':'clear';this.events.push({type:'result'});}}
 step(dt,input={}){
  if(this.status!=='playing')return;
  if(this.cinematic){
   const c=this.cinematic;this.presentationTime+=dt;
   if(!config.cinema){this.finishCinematic();return;}
   if(c.hitstop>0){c.hitstop=Math.max(0,c.hitstop-dt);return;}
   c.time+=dt*config.cinemaSpeed;
   if(!c.impact&&c.time>=c.result.duration*.54){c.impact=true;if(c.result.hit)c.hitstop=.045;this.events.push({type:'impact',result:c.result});}
   if(c.time>=c.result.duration)this.finishCinematic();return;
  }
  if(input.move)this.select(input.move);
  if(input.attack&&this.commandAttack())return;
  this.elapsed+=dt;
  this.player.update(dt,input,this.enemy);this.enemy.update(dt,this.player);separate(this.player,this.enemy);this.targets.face(this.player);
  if(this.enemy.damageEvent){this.enemy.damageEvent=false;this.events.push({type:'hurt',x:this.player.x,z:this.player.z});}
  if(input.dash&&this.player.dash&&this.player.dash.time<=dt)this.events.push({type:'dodge'});
  this.checkEnd();
 }
 get accuracy(){return this.attacks?this.hits/this.attacks*100:0;}
 snapshot(){const relation=this.targets.snapshot(this.player);return {status:this.status,version:'2.0.0',selected:this.selected,player:{x:this.player.x,z:this.player.z,yaw:this.player.yaw,hp:this.player.hp,state:this.player.state,time:this.player.time,cooldown:this.player.cooldown,attackCooldown:this.player.attackCooldown,invincible:this.player.invincible},enemy:{x:this.enemy.x,z:this.enemy.z,yaw:this.enemy.yaw,hp:this.enemy.hp,state:this.enemy.state,time:this.enemy.time,remaining:this.enemy.remaining,kind:this.enemy.kind},relation,time:this.elapsed,presentationTime:this.presentationTime,busy:!!this.cinematic,cinemaTime:this.cinematic?.time||0,attacks:this.attacks,hits:this.hits,damage:this.player.damageTaken,counts:{...this.counts},last:this.lastResult?{outcome:this.lastResult.outcome,reason:this.lastResult.reason,step:this.lastResult.step,damage:this.lastResult.damage,playerDamage:this.lastResult.playerDamage}:null};}
}
