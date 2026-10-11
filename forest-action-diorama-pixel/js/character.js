import * as THREE from 'three';
import {WIDTH,CELL} from './sprite-state.js';
import {atlasFor,selectFrame} from './sprite-art.js';
import {softLight} from './surface.js';
export class CharacterView{
 constructor(scene,enemy=false,options={}){
  this.enemy=enemy;this.archetype=options.archetype||(enemy?'sword-fiend':'adventurer');this.id=options.id||this.archetype;this.root=new THREE.Group();scene.add(this.root);
  this.atlases=new Map();for(const move of ['slash','thrust','heavy']){const a=atlasFor(this.archetype==='sword-fiend',move);this.atlases.set(move,{...a,texture:a.texture.clone()});}
  const h=2.65,g=new THREE.PlaneGeometry(h*WIDTH/CELL,h);g.translate(0,h*(44/48-.5),0);
  this.material=new THREE.MeshBasicMaterial({map:this.atlases.get('slash').texture,alphaTest:.5,side:THREE.DoubleSide,toneMapped:false});this.body=new THREE.Mesh(g,this.material);this.root.add(this.body);this.body.castShadow=false;
  this.shadow=new THREE.Mesh(new THREE.PlaneGeometry(1.15,.72),new THREE.MeshBasicMaterial({map:softLight(),color:'#1b2823',transparent:true,opacity:.30,depthWrite:false}));this.shadow.rotation.x=-Math.PI/2;this.shadow.position.y=.012;this.root.add(this.shadow);
  this.projectedShadow=new THREE.Mesh(g.clone(),new THREE.MeshBasicMaterial({map:this.material.map,color:'#000000',transparent:true,opacity:.17,side:THREE.DoubleSide,depthWrite:false,alphaTest:.01}));this.root.add(this.projectedShadow);this.shadowSource=g.attributes.position.array.slice();
  this.ring=new THREE.Mesh(new THREE.RingGeometry(.29,.36,32),new THREE.MeshBasicMaterial({color:enemy?'#d8aa73':'#d0ead9',transparent:true,opacity:.65,side:THREE.DoubleSide,depthWrite:false}));this.ring.rotation.x=-Math.PI/2;this.ring.position.y=.025;this.root.add(this.ring);
  if(enemy){this.hp=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:'#e6c271'}));this.hp.position.y=1.85;this.hp.scale.set(.65,.065,.04);this.root.add(this.hp);}
 }
 update(a,time,camera,shadows=true){
  this.root.position.set(a.x,0,a.z);if(camera)this.body.quaternion.copy(camera.quaternion);
  const atlas=this.atlases.get(a.moveId||'slash');this.material.map=atlas.texture;this.frame=selectFrame(atlas.texture,atlas.rows,a,time);this.projectedShadow.material.map=atlas.texture;this.projectedShadow.visible=shadows;if(camera){const up=new THREE.Vector3(0,1,0).applyQuaternion(camera.quaternion),right=new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion),pos=this.projectedShadow.geometry.attributes.position;for(let i=0;i<pos.count;i++){const x=this.shadowSource[i*3],y=this.shadowSource[i*3+1],height=up.y*y;pos.setXYZ(i,right.x*x+up.x*y+height*12/23,.010,right.z*x+up.z*y+height*8/23);}pos.needsUpdate=true;this.projectedShadow.geometry.computeBoundingSphere();}this.material.color.set(a.state==='hurt'&&Math.floor(a.time*20)%2?'#ffe9cc':'#ffffff');
  this.ring.visible=a.state!=='dead';this.ring.material.color.set(a.state==='windup'?'#ff7049':a.state==='guard'?'#a8caff':a.state==='recovery'||a.state==='stagger'?'#ffe283':this.enemy?'#d8aa73':'#d0ead9');this.ring.scale.setScalar(a.state==='windup'?1+Math.sin(time*22)*.10:1);
  this.shadow.material.opacity=a.state==='dead'?.14:a.state==='dash'?.18:.30;
  if(this.hp){if(camera){this.hp.position.set(0,2.15,0).applyQuaternion(camera.quaternion);this.hp.quaternion.copy(camera.quaternion);}this.hp.visible=a.hp>0&&a.hp<a.maxHP;this.hp.scale.x=.65*a.hp/a.maxHP;}
 }
 destroy(){this.root.removeFromParent();for(const a of this.atlases.values())a.texture.dispose();this.body.geometry.dispose();this.material.dispose();for(const o of [this.shadow,this.projectedShadow,this.ring,this.hp].filter(Boolean)){o.geometry.dispose();o.material.dispose();}}
}
