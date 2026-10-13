import {Fighter} from './companion.js';
import {distance,yawTo,relativeMove,signedAngle} from './target.js';
export class Support extends Fighter{
 constructor(){super('enemy-b','呪術の後衛','enemy',4.3,2.2,75,'support',.55);this.intent='cast';this.setState('orbit',.75);}
 update(dt,target,game){this.invulnerable=Math.max(0,this.invulnerable-dt);this.time+=dt;if(this.hp<=0)return;if(!target){this.setState('wary',.2);return;}const x=this.x,z=this.z,d=distance(this,target);if(!['windup','attack'].includes(this.state))this.yaw=yawTo(this,target);
 switch(this.state){case 'hurt':case 'stagger':if(this.remaining<=0)this.setState('recovery',.4);break;
 case 'recovery':case 'wary':case 'guard':if(this.remaining<=0){this.cycle++;this.orbitDirection=this.cycle%2?1:-1;this.setState('orbit',.9);}break;
 case 'orbit':case 'approach':case 'retreat':this.intent=d<4.6?'retreat':'cast';relativeMove(this,target,d<4.6?-1:d>6?1:0,this.orbitDirection,dt*2,dt*1.5);if(this.remaining<=0){this.aim={x:Math.cos(this.yaw),z:-Math.sin(this.yaw)};this.struck=false;this.setState('windup',.95);}break;
 case 'windup':if(this.remaining<=0){this.setState('attack',.18);game.events.push({type:'npc-attack',actorId:this.id,move:'thrust'});}break;
 case 'attack':if(!this.struck){this.struck=true;if(d<2.65&&Math.abs(signedAngle(yawTo(this,target),this.yaw))<.7)game.deal(this,target,12);else game.fire(this,target);}if(this.remaining<=0)this.setState('recovery',1.25);break;
 }this.velocity={x:(this.x-x)/dt,z:(this.z-z)/dt};this.walk+=Math.hypot(this.x-x,this.z-z)*5;
 }
}
