import * as THREE from 'three';
import {moves} from './config.js';
const effectCache=new Map();
function effectTexture(kind){if(effectCache.has(kind))return effectCache.get(kind);const c=document.createElement('canvas');c.width=48;c.height=kind==='thrust'?20:36;const ctx=c.getContext('2d');for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){let ink=false,core=false;if(kind==='thrust'){const shaft=x>3&&x<41&&Math.abs(y-10)<(x>35?4:2),tip=x>=40&&x<47&&Math.abs(y-10)<(47-x);ink=shaft||tip;core=ink&&Math.abs(y-10)<1;}else{const dx=(x-19)/22,dy=(y-18)/17,r=Math.hypot(dx,dy),a=Math.atan2(dy,dx);ink=r>.78&&r<1.02&&Math.abs(a)<1.35;core=r>.91&&ink;}if(ink){ctx.fillStyle=core?'#fff3cb':kind==='heavy'?'#e5b460':'#8fc6ca';ctx.fillRect(x,y,1,1);}}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;effectCache.set(kind,t);return t;}
export class Effects {
 constructor(scene){this.scene=scene;this.particles=[];this.slashes=[];this.geo=new THREE.PlaneGeometry(.10,.10);
  this.telegraph=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:'#ee6d49',transparent:true,opacity:.24,side:THREE.DoubleSide,depthWrite:false}));this.telegraph.rotation.x=-Math.PI/2;scene.add(this.telegraph);
  this.arcTelegraph=new THREE.Mesh(new THREE.CircleGeometry(1,40,-.7,1.4),this.telegraph.material);this.arcTelegraph.rotation.x=-Math.PI/2;scene.add(this.arcTelegraph);
  this.range=new THREE.Mesh(new THREE.RingGeometry(.99,1,72),new THREE.MeshBasicMaterial({color:'#f7ecc9',transparent:true,opacity:.23,side:THREE.DoubleSide,depthWrite:false}));this.range.rotation.x=-Math.PI/2;scene.add(this.range);
 }
 burst(x,z,kind='hit'){
  const m=new THREE.MeshBasicMaterial({color:kind==='guarded'?'#bce1ff':kind==='hurt'?'#ef9474':'#fff0a9',transparent:true,side:THREE.DoubleSide,toneMapped:false});
  for(let i=0;i<12;i++){const o=new THREE.Mesh(this.geo,m);o.position.set(x,.85,z);this.scene.add(o);this.particles.push({o,m,v:new THREE.Vector3((Math.random()-.5)*5,Math.random()*3,(Math.random()-.5)*5),life:.28,max:.28});}
 }
 swing(p,move){const texture=effectTexture(move),geo=new THREE.PlaneGeometry(move==='thrust'?2.2:2.7,move==='thrust'?.8:2.0),m=new THREE.MeshBasicMaterial({map:texture,transparent:true,opacity:.9,side:THREE.DoubleSide,depthWrite:false,toneMapped:false}),o=new THREE.Mesh(geo,m);o.position.set(p.x+Math.cos(p.yaw)*.85,.95,p.z-Math.sin(p.yaw)*.85);this.scene.add(o);this.slashes.push({o,life:.14,yaw:p.yaw});}
 update(dt,game,poses,showRange,camera){
  if(camera){for(const p of this.particles)p.o.quaternion.copy(camera.quaternion);for(const s of this.slashes){s.o.quaternion.copy(camera.quaternion);s.o.rotateZ(Math.atan2(Math.sin(s.yaw)*.68,Math.cos(s.yaw)));}}
  for(let i=this.particles.length-1;i>=0;i--){const p=this.particles[i];p.life-=dt;p.v.y-=dt*7;p.o.position.addScaledVector(p.v,dt);p.o.scale.setScalar(Math.max(.05,p.life/p.max));if(p.life<=0){p.o.removeFromParent();this.particles.splice(i,1);if(!this.particles.some(v=>v.m===p.m))p.m.dispose();}}
  for(let i=this.slashes.length-1;i>=0;i--){const s=this.slashes[i];s.life-=dt;s.o.material.opacity=Math.max(0,s.life/.14)*.7;if(s.life<=0){s.o.removeFromParent();s.o.geometry.dispose();s.o.material.dispose();this.slashes.splice(i,1);}}
  const e=game.enemy,len=e.kind==='rush'?(e.state==='attack'?e.remaining:.38)*12+1.1:e.kind==='heavy'?2.9:2.65;
  const visible=!game.cinematic&&['windup','attack'].includes(e.state)&&['playing','paused'].includes(game.status);this.telegraph.visible=visible&&e.kind==='rush';this.arcTelegraph.visible=visible&&e.kind!=='rush';this.arcTelegraph.position.set(e.x,.008,e.z);this.arcTelegraph.rotation.z=e.yaw;this.arcTelegraph.scale.setScalar(len);this.telegraph.position.set(e.x+e.aim.x*len/2,.008,e.z+e.aim.z*len/2);this.telegraph.rotation.z=e.yaw;this.telegraph.scale.set(len,e.kind==='rush'?1.36:2.0,1);this.telegraph.material.opacity=.17+Math.sin(e.time*20)*.06;
  const m=moves[game.selected];this.range.visible=showRange&&['playing','paused'].includes(game.status)&&!game.cinematic;this.range.scale.setScalar(m.range+m.step);this.range.position.set(poses.enemy.x,.002,poses.enemy.z);
 }
 clear(){for(const p of this.particles){p.o.removeFromParent();p.m.dispose();}for(const s of this.slashes){s.o.removeFromParent();s.o.geometry.dispose();s.o.material.dispose();}this.particles=[];this.slashes=[];}
}
