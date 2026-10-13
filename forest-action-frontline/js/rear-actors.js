import {RangedLord} from './ranged-lord.js';
import {Fighter} from './companion.js';
import {yawTo} from './target.js';
export const REAR_POSTS=Object.freeze({lord:Object.freeze({x:-8,z:-4.6}),support:Object.freeze({x:8,z:-4.6})});
export class RearLord extends RangedLord{
 constructor(stage){super(stage);Object.assign(this,REAR_POSTS.lord);this.role='ally-rear';this.radius=0;this.setState('wary',.65);this.focusId='enemy-a';}
 update(dt,game){this.time+=dt;this.invulnerable=Math.max(0,this.invulnerable-dt);if(this.hp<=0)return;const target=game.front;this.yaw=yawTo(this,target);this.focusId=target.id;this.intent='support';
  // Every stage uses the same stationary ranged policy. No melee or pursuit.
  if(['hurt','stagger'].includes(this.state)){if(this.remaining<=0)this.setState('wary',.35);return;}
  if(this.state==='wary'&&this.remaining<=0)this.setState('windup',.55);
  else if(this.state==='windup'&&this.remaining<=0){game.castLord(target);this.setState('attack',.18);}
  else if(this.state==='attack'&&this.remaining<=0)this.setState('recovery',1.40);
  else if(this.state==='recovery'&&this.remaining<=0)this.setState('wary',.20);
 }
}
export class RearSupport extends Fighter{
 constructor(){super('enemy-b','敵の援護役','enemy',REAR_POSTS.support.x,REAR_POSTS.support.z,75,'enemy-rear',0);this.setState('wary',3.5);this.intent='support';this.focusId='player';this.volley=0;this.telegraph=null;}
 damage(){return false;}
 update(dt,target,game){if(this.hp<=0)return;this.time+=dt;this.yaw=yawTo(this,target);
  if(this.state==='wary'&&this.remaining<=0){this.volley++;this.intent=this.volley%2?'ranged':'rally';
   if(this.intent==='ranged'){this.aim={x:Math.cos(this.yaw),z:-Math.sin(this.yaw)};this.telegraph={x:target.x,z:target.z};this.setState('windup',1.10);game.events.push({type:'rear-warning'});}
   else this.setState('guard',.60);
  }else if(this.state==='windup'&&this.remaining<=0){game.fire(this,target);this.telegraph=null;this.setState('recovery',1.6);}
  else if(this.state==='guard'&&this.remaining<=0){
   // Support cannot erase a punishable recovery or react to the attack button.
   if(['wary','guard'].includes(game.front.state)&&game.front.hp>0){game.front.duration+=.35;game.stats.rearPulses++;game.events.push({type:'rear-rally',x:game.front.x,z:game.front.z});}
   this.setState('recovery',1.60);
  }else if(this.state==='recovery'&&this.remaining<=0)this.setState('wary',2.4);
 }
}
