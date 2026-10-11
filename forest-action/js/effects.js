import * as THREE from 'three';
import {config, laneZ} from './config.js';
export class Effects {
  constructor(scene){this.scene=scene;this.particles=[];this.slashes=[];this.telegraphs=[];this.debug=[];this.geo=new THREE.IcosahedronGeometry(.06,0);}
  burst(x,z,finish=false,hurt=false) {
    const material=new THREE.MeshBasicMaterial({color:hurt?'#f49475':finish?'#fff0ae':'#e9f2ca',transparent:true});
    for(let i=0;i<12;i++){const o=new THREE.Mesh(this.geo,material);o.position.set(x, .65+Math.random()*.6,z);this.scene.add(o);this.particles.push({o,m:material,v:new THREE.Vector3((Math.random()-.5)*6,Math.random()*4,(Math.random()-.5)*3),life:.25+Math.random()*.2,max:.45});}
  }
  swing(p) {
    const reverse=p.attack.index===1;
    const geo=new THREE.RingGeometry(.7,p.attack.range,20,1,-.65,1.3);
    const material=new THREE.MeshBasicMaterial({color:p.attack.index===2?'#ffe7a1':'#e7f1dd',transparent:true,opacity:.75,side:THREE.DoubleSide,depthWrite:false});
    const mesh=new THREE.Mesh(geo,material);mesh.rotation.x=-Math.PI/2;mesh.rotation.z=reverse ? .18:-.18;mesh.rotation.y=p.facing===1?0:Math.PI;
    mesh.position.set(p.x,.82,p.z);this.scene.add(mesh);this.slashes.push({mesh,life:.12});
  }
  createEnemyOverlays(enemies) {
    for(const o of [...this.telegraphs,...this.debug]){this.scene.remove(o);o.geometry.dispose();o.material.dispose();}
    this.telegraphs=[];this.debug=[];
    for(const e of enemies){const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:'#ef7356',transparent:true,opacity:.27,side:THREE.DoubleSide,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.y=.015;this.scene.add(m);this.telegraphs.push(m);}
    for(let i=0;i<enemies.length+1;i++){const b=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:i===0?'#83ecde':'#fd775a',wireframe:true}));this.scene.add(b);this.debug.push(b);}
  }
  update(dt,game,showBoxes) {
    for(let i=this.particles.length-1;i>=0;i--){const p=this.particles[i];p.life-=dt;p.v.y-=dt*7;p.o.position.addScaledVector(p.v,dt);p.m.opacity=Math.max(0,p.life/p.max);if(p.life<=0){this.scene.remove(p.o);this.particles.splice(i,1);if(!this.particles.some(v=>v.m===p.m))p.m.dispose();}}
    for(let i=this.slashes.length-1;i>=0;i--){const s=this.slashes[i];s.life-=dt;s.mesh.material.opacity=Math.max(0,s.life/.12)*.6;if(s.life<=0){this.scene.remove(s.mesh);s.mesh.geometry.dispose();s.mesh.material.dispose();this.slashes.splice(i,1);}}
    game.enemies.forEach((e,i)=>{
      const tele=this.telegraphs[i];tele.visible=e.state==='windup'||e.state==='strike';
      const length=e.kind==='rush'?5.6:1.7;tele.scale.set(length,.8,1);tele.position.set(e.x+e.facing*length/2,.012,laneZ(e.lane));tele.material.opacity=e.state==='strike' ? .4:.17+Math.sin(e.time*18)*.07;
      const b=this.debug[i+1];b.visible=showBoxes&&e.hp>0;const active=e.state==='strike';b.scale.set(active?(e.kind==='rush'?1.45:2.1):.6,1.45,.6);b.position.set(e.x+(active?e.facing*.65:0),.75,laneZ(e.lane));
    });
    const p=game.player,b=this.debug[0],active=p.activeAttack;b.visible=showBoxes;b.scale.set(active?p.attack.range+.25:.6,1.55,.6);b.position.set(p.x+(active?p.attack.facing*(p.attack.range-.25)/2:0),.78,laneZ(p.lane));
  }
  clear(){for(const p of this.particles){this.scene.remove(p.o);p.m.dispose();}for(const s of this.slashes){this.scene.remove(s.mesh);s.mesh.geometry.dispose();s.mesh.material.dispose();}this.particles=[];this.slashes=[];}
}
