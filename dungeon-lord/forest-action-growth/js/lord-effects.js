import * as THREE from 'three';
import {DuoEffects} from './duo-effects.js';
import {LORD_RULES as R} from './progression.js';
function pixelTexture(kind){const c=document.createElement('canvas');c.width=kind==='sword'?12:12;c.height=kind==='sword'?36:12;const ctx=c.getContext('2d');ctx.imageSmoothingEnabled=false;const dot=(x,y,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h);};if(kind==='sword'){
 dot(5,0,3,7,'#28213e');dot(5,1,2,5,'#d1a84f');dot(1,6,10,3,'#f0d486');dot(0,7,2,3,'#bd8a3b');dot(10,7,2,3,'#bd8a3b');dot(4,9,4,23,'#283a56');dot(5,9,2,23,'#aabccc');dot(5,9,1,23,'#fff3ca');dot(5,32,2,2,'#c6d6df');dot(5,34,1,1,'#fff3d5');
 }else{dot(3,1,6,10,'#392248');dot(1,3,10,6,'#392248');dot(3,2,6,8,'#a780dd');dot(2,3,8,6,'#a780dd');dot(4,3,4,6,'#e2caff');dot(3,4,6,4,'#e2caff');dot(5,4,2,3,'#fff1d0');}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;return t;
}
export class LordEffects extends DuoEffects{
 constructor(scene){super(scene);this.swordGroups=new Map();this.royalTexture=pixelTexture('sword');this.magicTexture=pixelTexture('magic');this.extra=[];}
 flash(x,z,type){const o=new THREE.Mesh(new THREE.RingGeometry(.55,.7,8),new THREE.MeshBasicMaterial({color:type==='protect'?'#e5cbff':'#f4d27c',transparent:true,opacity:.8,side:THREE.DoubleSide,depthWrite:false,toneMapped:false}));o.rotation.x=-Math.PI/2;o.position.set(x,.06,z);this.scene.add(o);this.extra.push({o,time:0,max:.28});}
 update(dt,game,poses,showRange,camera){super.update(dt,game,poses,showRange,camera);
  for(const b of game.projectiles){const o=this.bolts.get(b.id);if(!o)continue;if(b.team==='ally'){o.material.map=this.magicTexture;o.material.transparent=true;o.material.alphaTest=.4;o.material.color.set('#ffffff');o.scale.setScalar(game.stageId==='late'?1.5:2);}}
  const live=new Set();for(const s of game.swords){live.add(s.id);let group=this.swordGroups.get(s.id);if(!group){const root=new THREE.Group(),swords=[];for(let i=0;i<5;i++){const o=new THREE.Mesh(new THREE.PlaneGeometry(.5,1.5),new THREE.MeshBasicMaterial({map:this.royalTexture,alphaTest:.4,side:THREE.DoubleSide,toneMapped:false}));root.add(o);swords.push(o);}const seal=new THREE.Mesh(new THREE.RingGeometry(s.radius-.06,s.radius,40),new THREE.MeshBasicMaterial({color:'#e9ce7d',transparent:true,opacity:.25,side:THREE.DoubleSide,depthWrite:false,toneMapped:false}));seal.rotation.x=-Math.PI/2;seal.position.y=.028;root.add(seal);root.position.set(s.x,0,s.z);this.scene.add(root);group={root,swords,seal};this.swordGroups.set(s.id,group);}
   const fall=Math.max(0,Math.min(1,(s.time-.36)/.16)),appear=Math.min(1,s.time/.17),fade=1-Math.max(0,(s.time-R.swordDelay)/.22);for(let i=0;i<5;i++){const o=group.swords[i],a=i*Math.PI*2/5;o.position.set(Math.cos(a)*.95,3.65-fall*3.05,Math.sin(a)*.95);o.quaternion.copy(camera.quaternion);o.scale.setScalar(Math.max(.01,appear*fade));}group.seal.material.opacity=.25*fade;
  }for(const [id,g]of this.swordGroups)if(!live.has(id)){g.root.removeFromParent();g.root.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});this.swordGroups.delete(id);}
  for(let i=this.extra.length-1;i>=0;i--){const e=this.extra[i];e.time+=dt;e.o.scale.setScalar(1+e.time*8);e.o.material.opacity=Math.max(0,1-e.time/e.max);if(e.time>=e.max){e.o.removeFromParent();e.o.geometry.dispose();e.o.material.dispose();this.extra.splice(i,1);}}
  if(game.guardian){for(const o of this.lines.values())o.visible=false;this.range.visible=false;}
 }
 clear(){super.clear();for(const g of this.swordGroups.values()){g.root.removeFromParent();g.root.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});}this.swordGroups.clear();for(const e of this.extra){e.o.removeFromParent();e.o.geometry.dispose();e.o.material.dispose();}this.extra=[];}
}
