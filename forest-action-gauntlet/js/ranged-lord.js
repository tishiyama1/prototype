import {Fighter} from './companion.js';
import {distance,yawTo,relativeMove} from './target.js';
import {closestTarget} from './team-space.js';
import {LORD_RULES as R,normalLordDamage} from './progression.js?v=gauntlet2';
export class RangedLord extends Fighter{
 constructor(stage){super('lord','ダンジョンの主','ally',-4.1,-1.5,stage.lordHP,'companion',.76);this.stage=stage;this.visualScale=stage.lordScale;this.intent='cast';this.setState('orbit',.35);}
 receive(raw){if(this.hp<=0||this.invulnerable>0)return false;const amount=normalLordDamage(raw,this.stage);this.lastIncoming=amount;const actual=Math.min(this.hp,amount);this.hp-=actual;this.damageTaken+=actual;this.invulnerable=.13;this.setState(this.hp>0?'hurt':'dead',this.hp>0?.28:Infinity);return true;}
 damage(raw){return this.receive(raw);}
 update(dt,game){this.invulnerable=Math.max(0,this.invulnerable-dt);this.time+=dt;if(this.hp<=0)return;const ox=this.x,oz=this.z;
  let target=game.actor(this.focusId);if(!['windup','attack'].includes(this.state)||target?.hp<=0)target=closestTarget(this,game.enemies,this.focusId);
  if(!target){this.focusId=null;return;}this.focusId=target.id;this.yaw=yawTo(this,target);
  const d=distance(this,target),p=game.player,following=distance(this,p)>7;
  switch(this.state){
   case 'hurt':case 'stagger':if(this.remaining<=0)this.setState('orbit',R.orbit);break;
   case 'recovery':if(this.remaining<=0)this.setState('orbit',R.orbit);break;
   case 'wary':case 'orbit':case 'approach':case 'retreat':{
    const close=d<R.minRange;this.intent=close?'retreat':following?'follow':'cast';
    if(close)relativeMove(this,target,-1,this.cycle%2?-.25:.25,dt*R.speed,dt*R.speed*.5);
    else if(following)relativeMove(this,p,1,0,dt*R.speed,0);
    else relativeMove(this,target,d>R.maxRange?1:0,.22,dt*R.speed,dt*R.speed*.5);
    // Retreat and follow reposition normally; weakness never alters decision policy.
    if(this.remaining<=0&&distance(this,target)<=R.maxRange+1){this.struck=false;this.cycle++;this.setState('windup',R.windup);this.intent='cast';}
    break;}
   case 'windup':if(this.remaining<=0){this.setState('attack',.18);game.castLord(target);}break;
   case 'attack':if(this.remaining<=0)this.setState('recovery',R.recovery);break;
  }
  this.velocity={x:(this.x-ox)/dt,z:(this.z-oz)/dt};this.walk+=Math.hypot(this.x-ox,this.z-oz)*5;
 }
}
