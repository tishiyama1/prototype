import * as THREE from 'three';
import {moves} from './config.js';
export class Effects {
 constructor(scene){this.scene=scene;this.particles=[];this.slashes=[];this.geo=new THREE.IcosahedronGeometry(.065,0);
  this.telegraph=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:'#ee6d49',transparent:true,opacity:.24,side:THREE.DoubleSide,depthWrite:false}));this.telegraph.rotation.x=-Math.PI/2;scene.add(this.telegraph);
  this.arcTelegraph=new THREE.Mesh(new THREE.CircleGeometry(1,40,-.7,1.4),this.telegraph.material);this.arcTelegraph.rotation.x=-Math.PI/2;scene.add(this.arcTelegraph);
  this.range=new THREE.Mesh(new THREE.RingGeometry(.99,1,72),new THREE.MeshBasicMaterial({color:'#f7ecc9',transparent:true,opacity:.23,side:THREE.DoubleSide,depthWrite:false}));this.range.rotation.x=-Math.PI/2;scene.add(this.range);
 }
 burst(x,z,kind='hit'){
  const m=new THREE.MeshBasicMaterial({color:kind==='guarded'?'#bce1ff':kind==='hurt'?'#ef9474':'#fff0a9',transparent:true});
  for(let i=0;i<12;i++){const o=new THREE.Mesh(this.geo,m);o.position.set(x,.85,z);this.scene.add(o);this.particles.push({o,m,v:new THREE.Vector3((Math.random()-.5)*5,Math.random()*3,(Math.random()-.5)*5),life:.28,max:.28});}
 }
 swing(p,move){const thrust=move==='thrust';const geo=thrust?new THREE.PlaneGeometry(2.1,.16):new THREE.RingGeometry(.65,move==='heavy'?1.5:1.4,20,1,-.85,1.7);const m=new THREE.MeshBasicMaterial({color:move==='heavy'?'#ffe2a1':'#e9f5e2',transparent:true,opacity:.65,side:THREE.DoubleSide,depthWrite:false});const o=new THREE.Mesh(geo,m);o.rotation.x=-Math.PI/2;o.rotation.z=p.yaw;if(thrust){o.position.set(p.x+Math.cos(p.yaw)*1.25,.95,p.z-Math.sin(p.yaw)*1.25);}else o.position.set(p.x,.85,p.z);this.scene.add(o);this.slashes.push({o,life:.14});}
 update(dt,game,poses,showRange){
  for(let i=this.particles.length-1;i>=0;i--){const p=this.particles[i];p.life-=dt;p.v.y-=dt*7;p.o.position.addScaledVector(p.v,dt);p.o.scale.setScalar(Math.max(.05,p.life/p.max));if(p.life<=0){p.o.removeFromParent();this.particles.splice(i,1);if(!this.particles.some(v=>v.m===p.m))p.m.dispose();}}
  for(let i=this.slashes.length-1;i>=0;i--){const s=this.slashes[i];s.life-=dt;s.o.material.opacity=Math.max(0,s.life/.14)*.7;if(s.life<=0){s.o.removeFromParent();s.o.geometry.dispose();s.o.material.dispose();this.slashes.splice(i,1);}}
  const e=game.enemy,len=e.kind==='rush'?(e.state==='attack'?e.remaining:.38)*12+1.1:e.kind==='heavy'?2.9:2.65;
  const visible=!game.cinematic&&['windup','attack'].includes(e.state)&&['playing','paused'].includes(game.status);this.telegraph.visible=visible&&e.kind==='rush';this.arcTelegraph.visible=visible&&e.kind!=='rush';this.arcTelegraph.position.set(e.x,.008,e.z);this.arcTelegraph.rotation.z=e.yaw;this.arcTelegraph.scale.setScalar(len);this.telegraph.position.set(e.x+e.aim.x*len/2,.008,e.z+e.aim.z*len/2);this.telegraph.rotation.z=e.yaw;this.telegraph.scale.set(len,e.kind==='rush'?1.36:2.0,1);this.telegraph.material.opacity=.17+Math.sin(e.time*20)*.06;
  const m=moves[game.selected];this.range.visible=showRange&&['playing','paused'].includes(game.status)&&!game.cinematic;this.range.scale.setScalar(m.range+m.step);this.range.position.set(poses.enemy.x,.002,poses.enemy.z);
 }
 clear(){for(const p of this.particles){p.o.removeFromParent();p.m.dispose();}for(const s of this.slashes){s.o.removeFromParent();s.o.geometry.dispose();s.o.material.dispose();}this.particles=[];this.slashes=[];}
}
