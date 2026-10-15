import {Enemy} from './enemy.js';
import {distance,yawTo,relativeMove,signedAngle} from './target.js';
import {closestTarget} from './team-space.js';
export class Fighter extends Enemy{
 constructor(id,name,team,x,z,hp,role,radius=.6){super();Object.assign(this,{id,name,team,x,z,hp,maxHP:hp,role,radius,focusId:null,intent:'observe',invulnerable:0,damageTaken:0,lastAttacker:null});}
 damage(amount){if(this.hp<=0||this.invulnerable>0)return false;const d=Math.min(this.hp,amount);this.hp-=d;this.damageTaken+=d;this.invulnerable=.13;this.setState(this.hp>0?'hurt':'dead',this.hp>0?.28:Infinity);return true;}
}
export class Companion extends Fighter{
 constructor(){super('lord','ダンジョンの主','ally',-4.1,-1.5,100,'companion',.76);this.setState('wary',.35);}
 update(dt,game){this.invulnerable=Math.max(0,this.invulnerable-dt);this.time+=dt;if(this.hp<=0)return;const ox=this.x,oz=this.z;
 let target=game.actor(this.focusId);if(!['windup','attack'].includes(this.state))target=closestTarget(this,game.enemies,this.focusId,e=>e.id!==game.enemy.id&&distance(this,e)<4.8?-1.15:0);
 const p=game.player;if(p.hp>0&&distance(this,p)>6.1&&!['hurt','stagger','windup','attack','recovery'].includes(this.state)){this.state='approach';this.intent='follow';this.focusId=p.id;this.yaw=yawTo(this,p);relativeMove(this,p,1,0,dt*2.8,0);this.walk+=Math.hypot(this.x-ox,this.z-oz)*5;return;}
 if(!target||target.hp<=0){this.focusId=null;this.setState('wary',.2);return;}this.focusId=target.id;this.intent='engage';this.yaw=yawTo(this,target);
 switch(this.state){
 case 'hurt':case 'stagger':if(this.remaining<=0)this.setState('wary',.18);break;
 case 'recovery':if(this.remaining<=0)this.setState('wary',.25);break;
 case 'wary':if(this.remaining<=0)this.setState('approach',2);break;
 case 'approach':if(distance(this,target)>1.72)relativeMove(this,target,1,.18,dt*2.6,dt);else{this.struck=false;this.setState('windup',.52);}break;
 case 'windup':if(this.remaining<=0){this.setState('attack',.24);game.stats.lordAttacks++;game.events.push({type:'npc-attack',actorId:this.id,move:'slash'});}break;
 case 'attack':if(!this.struck){this.struck=true;if(distance(this,target)<=2.15){if(target.state==='guard'&&Math.abs(signedAngle(yawTo(target,this),target.yaw))<Math.PI*65/180)game.events.push({type:'npc-guard',actorId:target.id});else{const before=target.hp,prior=target.state;if(game.deal(this,target,12)){game.stats.lordHits++;game.stats.lordDamage+=before-target.hp;if(['windup','attack'].includes(prior)&&target.hp>0){target.setState('stagger',.7);game.stats.lordStops++;}}}}}if(this.remaining<=0)this.setState('recovery',.85);break;
 }
 this.velocity={x:(this.x-ox)/dt,z:(this.z-oz)/dt};this.walk+=Math.hypot(this.x-ox,this.z-oz)*5;
 }
}
