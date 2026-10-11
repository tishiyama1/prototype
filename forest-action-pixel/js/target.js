import {ARENA,clamp} from './config.js';
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export const yawTo=(a,b)=>Math.atan2(-(b.z-a.z),b.x-a.x);
export const signedAngle=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
export function constrain(p){const ax=ARENA.x-ARENA.margin,az=ARENA.z-ARENA.margin,r=Math.hypot(p.x/ax,p.z/az);if(r>1){p.x/=r;p.z/=r;}return p;}
// Polar integration preserves radius during orbit, regardless of camera position.
export function relativeMove(actor,target,radial,orbit,radialDistance,orbitDistance){
 let dx=actor.x-target.x,dz=actor.z-target.z,r=Math.hypot(dx,dz),theta=Math.atan2(dz,dx);
 if(r<.001){r=1.05;theta=Math.PI;}
 const nextR=Math.max(1.05,r-radial*radialDistance);
 theta-=orbit*orbitDistance/Math.max(1.05,(r+nextR)/2);
 actor.x=target.x+Math.cos(theta)*nextR;actor.z=target.z+Math.sin(theta)*nextR;constrain(actor);
}
export function separate(a,b,min=1.05){const d=distance(a,b);if(d<min){const t=Math.atan2(a.z-b.z,a.x-b.x);a.x=b.x+Math.cos(t)*min;a.z=b.z+Math.sin(t)*min;constrain(a);}}
export class TargetLock {
 constructor(){this.target=null;}
 set(target){this.target=target;}
 get active(){return this.target?.hp>0?this.target:null;}
 face(actor){if(this.active)actor.yaw=yawTo(actor,this.active);}
 snapshot(actor){const t=this.target;if(!t)return null;return {distance:distance(actor,t),angle:signedAngle(yawTo(t,actor),t.yaw)*180/Math.PI};}
}
