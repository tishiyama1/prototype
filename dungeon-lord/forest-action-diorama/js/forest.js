import * as THREE from 'three';
import {ARENA} from './config.js';
import {seeded,earthTexture,barkTexture,stoneTexture,softLight} from './surface.js';
const material=(color,more={})=>new THREE.MeshStandardMaterial({color,roughness:1,...more});
function batch(scene,geo,mat,items,cast=false){const mesh=new THREE.InstancedMesh(geo,mat,items.length),o=new THREE.Object3D();for(let i=0;i<items.length;i++){const a=items[i];o.position.set(...a.p);o.scale.set(...a.s);o.rotation.set(...(a.rot||[0,a.r||0,0]));o.updateMatrix();mesh.setMatrixAt(i,o.matrix);if(a.c)mesh.setColorAt(i,new THREE.Color(a.c));}mesh.castShadow=cast;mesh.receiveShadow=true;mesh.computeBoundingSphere();scene.add(mesh);return mesh;}
function twig(items,a,b,radius,color){const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),d=vb.clone().sub(va),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize()),e=new THREE.Euler().setFromQuaternion(q);items.push({p:va.add(vb).multiplyScalar(.5).toArray(),s:[radius,d.length(),radius],rot:[e.x,e.y,e.z],c:color});}
function bevelBox(){const s=new THREE.Shape();s.moveTo(-.43,-.43);s.lineTo(.43,-.43);s.lineTo(.43,.43);s.lineTo(-.43,.43);s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:.86,bevelEnabled:true,bevelThickness:.07,bevelSize:.07,bevelSegments:1,steps:1});g.translate(0,0,-.43);g.computeVertexNormals();return g;}
function plantGeometry(fern=false){const p=[];for(let k=0;k<(fern?7:6);k++){const a=k*2.39996,length=fern?.7:1,wide=fern?.18:.10,x=Math.cos(a),z=Math.sin(a),sx=-z*wide,sz=x*wide,mid=[x*.38,length*.55,z*.38],tip=[x*(fern?.95:.45),length*(fern?.34:1),z*(fern?.95:.45)];p.push(0,0,0,mid[0]+sx,mid[1],mid[2]+sz,mid[0]-sx,mid[1],mid[2]-sz,mid[0]+sx,mid[1],mid[2]+sz,...tip,mid[0]-sx,mid[1],mid[2]-sz);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.computeVertexNormals();return g;}
function groundHeight(x,z){const e=Math.hypot(x/ARENA.x,z/ARENA.z);return -.045+THREE.MathUtils.smoothstep(e,1.22,1.9)*(.38+.17*Math.sin(x*.5)*Math.cos(z*.39));}
export class Forest{
 constructor(scene){
  this.scene=scene;this.wind={value:0};this.obstacles=[];this.time=0;this.scenery=true;this.shadows=true;this.fogEnabled=true;this.fog=new THREE.Fog('#7b978a',31,69);scene.background=new THREE.Color('#7b978a');scene.fog=this.fog;
  const r=seeded(8142),hemi=new THREE.HemisphereLight('#e7eee0','#59634b',1.8);scene.add(hemi);
  const sun=new THREE.DirectionalLight('#ffe7bf',1.9);sun.position.set(-12,23,-8);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-22,right:22,top:19,bottom:-19,near:1,far:65});sun.shadow.bias=-.001;sun.shadow.normalBias=.035;sun.shadow.radius=2;scene.add(sun,sun.target);this.sun=sun;
  const floorGeo=new THREE.PlaneGeometry(66,48,72,48),v=floorGeo.attributes.position;for(let i=0;i<v.count;i++)v.setZ(i,groundHeight(v.getX(i),-v.getY(i)));floorGeo.computeVertexNormals();const floor=new THREE.Mesh(floorGeo,material('#ffffff',{map:earthTexture()}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
  const horizon=new THREE.Mesh(new THREE.PlaneGeometry(140,110),material('#607561'));horizon.rotation.x=-Math.PI/2;horizon.position.y=-.10;scene.add(horizon);
  const trunks=[],branches=[],roots=[],nearLeaves=[],farLeaves=[],stones=[],rubble=[],moss=[],grass=[],ferns=[],bushes=[],fallen=[],wall=[],flatStones=[],ivy=[];
  const leafPalette=['#3e6954','#50785b','#648763','#799768'],barkPalette=['#a58b6f','#95826b','#b39a7d'];
  const tree=(x,z,h,size,far=false)=>{
   const y=groundHeight(x,z),bend=(r()-.5)*.6,bark=barkPalette[Math.floor(r()*3)];
   twig(trunks,[x,y,z],[x+bend*.25,y+h*.40,z+.1],size*.24,bark);twig(trunks,[x+bend*.25,y+h*.38,z+.1],[x+bend,y+h*.77,z-.18],size*.17,bark);twig(trunks,[x+bend,y+h*.74,z-.18],[x+bend*.5,y+h,z],size*.095,bark);
   if(!far)for(let j=0;j<5;j++){const a=j*1.256+r()*.4,ex=Math.cos(a)*size*.95,ez=Math.sin(a)*size*.8;twig(roots,[x,y+.8,z],[x+ex*.4,y+.16,z+ez*.4],size*.14,bark);twig(roots,[x+ex*.4,y+.16,z+ez*.4],[x+ex,groundHeight(x+ex,z+ez),z+ez],size*.10,bark);}
   const leaves=far?farLeaves:nearLeaves,number=far?3:5;
   for(let j=0;j<number;j++){const a=j*2.4+x*.2,reach=size*(j===number-1?.1:.60);if(!far&&j<3)twig(branches,[x+bend,y+h*.58,z],[x+Math.cos(a)*size*.8,y+h*.90,z+Math.sin(a)*size*.6],size*.065,bark);
    leaves.push({p:[x+bend*.6+Math.cos(a)*reach,y+h+(j===number-1?.55:(r()-.5)*.6),z+Math.sin(a)*reach],s:[size*(.65+r()*.15),size*.42,size*(.60+r()*.15)],r:a,c:leafPalette[Math.floor(r()*4)]});
   }
  };
  // Deliberate stage masses, not an even ring of trees.
  for(const t of [[-16,3.2,8.1,3.1],[16.2,5,8.6,3.2],[-12.5,-4.8,5.8,2.3],[-8.4,-9.3,3.0,2.5],[-.4,-10.4,2.7,2.4],[10.8,-9.6,3.8,2.5],[14.6,-5.9,7.1,2.5],[-15.2,-9.7,7.8,2.8]])tree(...t);
  const clusters=[[-20,-14,5,5,10],[-8,-21,7,6,13],[6,-24,7,5,12],[21,-16,5,6,10]];
  for(const [cx,cz,rx,rz,count]of clusters)for(let i=0;i<count;i++){const a=r()*6.28,d=Math.sqrt(r()),x=cx+Math.cos(a)*rx*d,z=cz+Math.sin(a)*rz*d;tree(x,z,4.4+r()*3.7,1.3+r()*.85,true);}
  const wood=material('#ffffff',{map:barkTexture()}),cylinder=new THREE.CylinderGeometry(.72,1,1,8);
  this.obstacles.push(batch(scene,cylinder,wood,trunks,true),batch(scene,cylinder,wood,branches,true));batch(scene,cylinder,wood,roots,true);
  const leafGeo=new THREE.SphereGeometry(1,12,8),leafColors=[];for(let i=0;i<leafGeo.attributes.position.count;i++){const y=leafGeo.attributes.position.getY(i),light=.80+(y+1)*.10;leafColors.push(light,light,light);}leafGeo.setAttribute('color',new THREE.Float32BufferAttribute(leafColors,3));
  const leafMat=material('#ffffff',{vertexColors:true});this.animate(leafMat,.022);this.obstacles.push(batch(scene,leafGeo,leafMat,nearLeaves,true),batch(scene,leafGeo,leafMat,farLeaves));
  const stoneGeo=bevelBox(),stoneMat=material('#ffffff',{map:stoneTexture()});
  // Collapsed retaining wall along the ancient road's rear-left bank.
  for(let i=0;i<8;i++){const x=-10.4+i*.70,z=-4.7-i*.42,y=groundHeight(x,z);const levels=i<2?1:i<5?3:2;
   for(let j=0;j<levels;j++){if(i===4&&j===2)continue;wall.push({p:[x+(j%2?.12:0),y+.23+j*.40,z],s:[.86,.43,.68],r:.46+(r()-.5)*.12,c:j===0?'#989c8a':'#b2b09b'});if(j===levels-1)moss.push({p:[x-.05,y+.47+j*.4,z],s:[.59,.035,.43],r:.46,c:'#738762'});}
   if(i%2===0)rubble.push({p:[x+.6,y+.15,z+.75],s:[.38,.30,.43],rot:[.1,r()*3,.18],c:'#9b9f90'});
  }
  this.obstacles.push(batch(scene,stoneGeo,stoneMat,wall,true));batch(scene,stoneGeo,stoneMat,rubble,true);
  // Sparse embedded paving describes the road without covering the duel in a pattern.
  for(let i=0;i<48;i++){const x=-19+r()*37,z=-.26*x+.65*Math.sin(x*.13)+(r()-.5)*2.2;if(Math.abs(x)<5&&i%7)continue;flatStones.push({p:[x,groundHeight(x,z)+.008,z],s:[.36+r()*.27,.025,.40+r()*.30],r:(r()-.5)*.8,c:['#c9c5b2','#bebda9','#d0c8b5'][i%3]});}const pavingShape=new THREE.Shape();pavingShape.moveTo(-.46,-.25);pavingShape.lineTo(-.35,-.43);pavingShape.lineTo(.29,-.40);pavingShape.lineTo(.47,-.13);pavingShape.lineTo(.38,.38);pavingShape.lineTo(-.22,.44);pavingShape.lineTo(-.47,.18);pavingShape.closePath();const pavingGeo=new THREE.ExtrudeGeometry(pavingShape,{depth:1,bevelEnabled:false,steps:1});pavingGeo.rotateX(-Math.PI/2);pavingGeo.translate(0,-.5,0);batch(scene,pavingGeo,stoneMat,flatStones);
  // One broken stele. The symbols are carved shapes, not story text.
  const group=new THREE.Group();group.position.set(6.8,groundHeight(6.8,-7.3),-7.3);group.rotation.set(0,.12,-.075);scene.add(group);
  const shape=new THREE.Shape();shape.moveTo(-.55,.30);shape.lineTo(.57,.30);shape.lineTo(.57,2.11);shape.lineTo(.25,2.28);shape.lineTo(.03,2.17);shape.lineTo(-.16,2.38);shape.lineTo(-.55,2.18);shape.closePath();
  const slab=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.42,bevelEnabled:true,bevelSize:.07,bevelThickness:.06,bevelSegments:1,steps:1}),stoneMat);slab.castShadow=true;slab.receiveShadow=true;group.add(slab);
  const base=new THREE.Mesh(stoneGeo,stoneMat);base.scale.set(1.45,.38,.96);base.position.set(0,.17,.17);base.castShadow=true;group.add(base);this.obstacles.push(group);
  const engraving=new THREE.MeshStandardMaterial({color:'#617164',roughness:1});
  for(const [x,y,w,h,angle] of [[0,1.35,.048,.58,0],[-.14,1.52,.42,.045,.7],[.13,1.52,.42,.045,-.7],[0,.78,.36,.035,0],[-.08,.93,.035,.23,.25]]){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,.009),engraving);m.position.set(x,y,.487);m.rotation.z=angle;group.add(m);}
  const crack=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-.40,2.05,.49),new THREE.Vector3(-.16,1.88,.49),new THREE.Vector3(-.23,1.70,.49)]);group.add(new THREE.Line(crack,new THREE.LineBasicMaterial({color:'#5c6b5e'})));
  const chip=new THREE.Mesh(stoneGeo,stoneMat);chip.position.set(7.55,.16,-6.95);chip.scale.set(.40,.31,.47);chip.rotation.set(.14,.7,-.28);chip.castShadow=true;scene.add(chip);
  for(let j=0;j<14;j++){const y=.35+j*.13;ivy.push({p:[6.33+Math.sin(j*.6)*.1,y,-6.77],s:[.15,.22,.16],r:j*.8,c:'#4d7552'});}batch(scene,new THREE.IcosahedronGeometry(1,0),material('#ffffff'),ivy);
  // Understory is clustered near landmarks and banks, with quiet gaps between them.
  const patches=[[-12.8,-1.5,2.7,2,60],[-8,-6.5,3,1.9,48],[7.9,-7.2,2.4,1.8,52],[11.3,1,2,3.8,60],[-6,7.2,4,1.1,58],[7,8,4,1.2,52],[-16,-9,3.5,4,65],[16,-9,3,4,65]];
  for(const [cx,cz,rx,rz,count]of patches)for(let i=0;i<count;i++){const a=r()*6.28,d=Math.sqrt(r()),x=cx+Math.cos(a)*rx*d,z=cz+Math.sin(a)*rz*d,e=Math.hypot(x/ARENA.x,z/ARENA.z);if(e<.98)continue;const y=groundHeight(x,z),size=.18+r()*.25;
   grass.push({p:[x,y,z],s:[size,size,size],r:a,c:['#71865b','#869465','#5e7854'][i%3]});if(i%6===0)ferns.push({p:[x,y,z],s:[.4+r()*.35,.45,.5],r:a,c:'#577b57'});if(i%16===0)bushes.push({p:[x,y+.25,z],s:[.65,.36,.6],r:a,c:'#5d7c57'});if(i%14===0)fallen.push({p:[x,y+.01,z],s:[.16,.035,.08],r:a,c:['#a38d64','#b09b72','#8f7856'][i%3]});
  }
  for(let i=0;i<50;i++){const x=(r()-.5)*25,z=(r()-.5)*18,e=Math.hypot(x/ARENA.x,z/ARENA.z);if(e<1.12){if(i%5===0)fallen.push({p:[x,-.024,z],s:[.09,.014,.045],r:r()*6,c:'#ab9773'});continue;}const size=.35+r()*.6;stones.push({p:[x,groundHeight(x,z)+size*.25,z],s:[size,size*.62,size*.83],r:r()*6,c:['#8c9582','#9ca38e','#b1b3a0'][i%3]});moss.push({p:[x,groundHeight(x,z)+size*.57,z],s:[size*.68,.045,size*.58],r:r()*6,c:'#748a63'});}
  const plantMat=material('#ffffff',{side:THREE.DoubleSide});this.animate(plantMat,.085);batch(scene,plantGeometry(),plantMat,grass);batch(scene,plantGeometry(true),plantMat,ferns);const bushMat=material('#ffffff');this.animate(bushMat,.022);batch(scene,new THREE.SphereGeometry(1,7,5),bushMat,bushes);
  batch(scene,new THREE.DodecahedronGeometry(1,0),material('#ffffff'),stones,true);batch(scene,new THREE.SphereGeometry(1,7,4),material('#ffffff'),moss);batch(scene,new THREE.BoxGeometry(1,1,1),material('#ffffff'),fallen);
  // A fallen trunk at the western margin, rooted in the scenery rather than the duel.
  const log=new THREE.Mesh(new THREE.CylinderGeometry(.32,.47,3.5,10),wood);log.position.set(-14.1,.34,1.6);log.rotation.set(Math.PI/2,0,.85);log.castShadow=true;log.receiveShadow=true;scene.add(log);
  const cap=new THREE.Mesh(new THREE.CircleGeometry(.32,10),material('#b4a080'));const axis=new THREE.Vector3(0,1,0).applyQuaternion(log.quaternion);cap.position.copy(log.position).addScaledVector(axis,1.752);cap.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),axis);scene.add(cap);
  const contactTexture=softLight();this.lightPatches=[];for(const [x,z,size]of [[-3,-1,3.1],[5,-3,2.0]]){const patch=new THREE.Mesh(new THREE.PlaneGeometry(size*2,size*1.3),new THREE.MeshBasicMaterial({color:'#f1d5a0',map:contactTexture,transparent:true,opacity:.09,depthWrite:false}));patch.rotation.x=-Math.PI/2;patch.position.set(x,-.022,z);scene.add(patch);this.lightPatches.push(patch);}
  const particles=new Float32Array(16*3);for(let i=0;i<16;i++){particles[i*3]=(r()-.5)*20;particles[i*3+1]=1+r()*3;particles[i*3+2]=-2-r()*8;}const dg=new THREE.BufferGeometry();dg.setAttribute('position',new THREE.BufferAttribute(particles,3));this.dust=new THREE.Points(dg,new THREE.PointsMaterial({color:'#efddac',size:.035,transparent:true,opacity:.32,depthWrite:false}));scene.add(this.dust);
 }
 animate(mat,strength){mat.onBeforeCompile=s=>{s.uniforms.windTime=this.wind;s.vertexShader='uniform float windTime;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>\nfloat phase=windTime*.9;\n#ifdef USE_INSTANCING\nphase+=instanceMatrix[3].x*.5+instanceMatrix[3].z*.7;\n#endif\ntransformed.x+=sin(phase)*max(position.y,0.0)*${strength};`);};mat.customProgramCacheKey=()=>`diorama-wind-${strength}`;}
 settings(){this.scene.fog=this.fogEnabled?this.fog:null;this.wind.value=this.scenery?this.time:0;this.dust.visible=this.scenery;for(const m of this.lightPatches)m.visible=this.scenery;}
 update(t){this.time=t;this.settings();this.dust.position.x=Math.sin(t*.3)*.14;this.dust.position.y=Math.sin(t*.4)*.08;}
 visibilityAt(x,z,camera){const ray=new THREE.Raycaster(),direction=camera.getWorldDirection(new THREE.Vector3()),results=[];this.scene.updateMatrixWorld(true);for(const y of [.80,1.35]){const point=new THREE.Vector3(x,y,z),origin=point.clone().addScaledVector(direction,-45);ray.set(origin,direction);ray.far=44.9;const hits=ray.intersectObjects(this.obstacles,true);results.push(hits.length===0);}return results.every(Boolean);}
}
