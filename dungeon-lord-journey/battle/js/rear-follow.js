import {distance} from './target.js';

export const REAR_FOLLOW=Object.freeze({gap:3.2,speed:6.8,deadZone:.12});
export function rearPosition(front,opponent){
 const dx=front.x-opponent.x,dz=front.z-opponent.z,n=Math.hypot(dx,dz)||1;
 // Front fighters stay in the ellipse. Rear fighters can use its outer margin,
 // so retreating to the edge does not pile the Lord onto the hero.
 return {x:front.x+dx/n*REAR_FOLLOW.gap,z:front.z+dz/n*REAR_FOLLOW.gap};
}
export function followRear(actor,front,opponent,dt){
 const target=rearPosition(front,opponent),dx=target.x-actor.x,dz=target.z-actor.z,n=Math.hypot(dx,dz);
 actor.following=n>REAR_FOLLOW.deadZone;if(!actor.following)return;
 // Catch up smoothly after a dodge; never participate in front-line collisions.
 const speed=REAR_FOLLOW.speed+Math.max(0,distance(actor,front)-5)*2;
 const step=Math.min(n,speed*dt);actor.x+=dx/n*step;actor.z+=dz/n*step;
 actor.walk+=step*4.7;
}
