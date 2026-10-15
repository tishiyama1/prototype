import * as THREE from 'three';
import {ARENA} from './config.js';
import {visual} from './visual-config.js';
import {groundTexture,barkTexture} from './ground-texture.js';
const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,flatShading:true,roughness:1,...extra});
function instances(scene,geometry,material,items,cast=false){
 const mesh=new THREE.InstancedMesh(geometry,material,items.length),o=new THREE.Object3D();
 items.forEach((v,i)=>{o.position.set(...v.p);o.scale.set(...v.s);o.rotation.set(...(v.rot||[0,v.r||0,0]));o.updateMatrix();mesh.setMatrixAt(i,o.matrix);if(v.c)mesh.setColorAt(i,new THREE.Color(v.c));});
 mesh.castShadow=cast;mesh.receiveShadow=true;scene.add(mesh);return mesh;
}
function segment(items,a,b,ra,rb,color){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),d=bv.clone().sub(av),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize()),rot=new THREE.Euler().setFromQuaternion(q);items.push({p:av.add(bv).multiplyScalar(.5).toArray(),s:[ra,d.length(),rb],rot:[rot.x,rot.y,rot.z],c:color});}
export class Forest {
 constructor(scene){
  this.scene=scene;this.wind={value:0};this.fog=new THREE.Fog('#728a7a',22,61);this.ambient=[];
  let seed=81891;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  scene.background=new THREE.Color('#728a7a');scene.fog=this.fog;
  scene.add(new THREE.HemisphereLight('#e6e2bd','#293b32',2.05));
  const sun=new THREE.DirectionalLight('#ffe0a1',2.45);sun.position.set(-13,23,11);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-22,right:22,top:18,bottom:-18,near:1,far:60});sun.shadow.bias=-.001;sun.shadow.normalBias=.08;sun.shadow.radius=2;scene.add(sun,sun.target);
  // One continuous terrain: a clearing fades organically into the woodland floor.
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(52,36),mat('#ffffff',{map:groundTexture()}));ground.rotation.x=-Math.PI/2;ground.position.y=-.06;ground.receiveShadow=true;scene.add(ground);
  const farGround=new THREE.Mesh(new THREE.PlaneGeometry(130,110),mat('#40503c'));farGround.rotation.x=-Math.PI/2;farGround.position.y=-.09;farGround.receiveShadow=true;scene.add(farGround);
  const trunks=[],roots=[],limbs=[],crowns=[],pines=[],rocks=[],moss=[],bushes=[],ferns=[],grass=[],leaves=[],stones=[],logs=[];
  const canopyColors=['#3c5940','#4a6741','#597543','#6a804a','#788b50'],barkColors=['#b7aa90','#a5967d','#968c78'];
  // Dense rear forest; the camera-facing quarter contains only low plants and rocks.
  for(let i=0;i<160;i++){
   const angle=i*2.399963+rand()*.4,ring=1.19+rand()*1.35,x=Math.cos(angle)*ARENA.x*ring,z=Math.sin(angle)*ARENA.z*ring;
   if(z>3.2&&Math.abs(x)<16)continue;
   const huge=i%17===0,h=huge?8+rand()*2.5:3.8+rand()*4.1,radius=huge?.55+rand()*.22:.20+rand()*.24,kind=i%5===0?'pine':'oak';
   trunks.push({p:[x,h*.46,z],s:[radius,h*.92,radius],r:rand()*.4,c:barkColors[i%3]});
   for(let k=0;k<3;k++){
    const a=k*Math.PI*2/3+rand(),extent=radius*3.5+rand()*.5;
    segment(roots,[x,h*.12,z],[x+Math.cos(a)*extent,.02,z+Math.sin(a)*extent],radius*.44,.11,'#a69b80');
   }
   if(kind==='pine')for(let k=0;k<3;k++)pines.push({p:[x,h*.65+k*h*.13,z],s:[1.8-k*.35,h*.35,1.65-k*.28],c:canopyColors[(i+k)%4]});
   else{
    for(let k=0;k<3;k++){
     const a=k*2.1+i,reach=huge?2.4:1.1+rand();
     segment(limbs,[x,h*.55,z],[x+Math.cos(a)*reach,h*.81,z+Math.sin(a)*reach],radius*.45,radius*.22,barkColors[i%3]);
     crowns.push({p:[x+Math.cos(a)*reach*.7,h*.85+rand()*.65,z+Math.sin(a)*reach*.7],s:[huge?2.6:1.6+rand()*.55,huge?1.8:1.1+rand()*.6,huge?2.3:1.4+rand()*.65],r:a,c:canopyColors[(i+k)%canopyColors.length]});
    }
    // An upper tuft breaks the mushroom-like silhouette.
    crowns.push({p:[x-.25,h*1.08,z],s:[huge?2:1.3,.95,huge?1.7:1.1],r:i,c:canopyColors[(i+2)%canopyColors.length]});
   }
  }
  instances(scene,new THREE.CylinderGeometry(.72,1,1,7),mat('#ffffff',{map:barkTexture()}),trunks,true);
  instances(scene,new THREE.CylinderGeometry(.45,.8,1,5),mat('#635a42'),roots,true);
  instances(scene,new THREE.CylinderGeometry(.8,1,1,6),mat('#8d8065'),limbs,true);
  const leafMaterial=mat('#ffffff');this.animate(leafMaterial,.025);
  instances(scene,new THREE.IcosahedronGeometry(1,1),leafMaterial,crowns,true);
  instances(scene,new THREE.ConeGeometry(1,1,7),leafMaterial,pines,true);
  for(let i=0;i<800;i++){
   const theta=rand()*Math.PI*2,ring=i<85?.3+Math.sqrt(rand())*.65:1.04+rand()*1.2,x=Math.cos(theta)*ARENA.x*ring,z=Math.sin(theta)*ARENA.z*ring;
   const s=.10+rand()*.24;
   if(i>=85){grass.push({p:[x,s*.55,z],s:[s*.8,s,s*.8],r:theta,c:['#718047','#5e7442','#869053'][i%3]});
    if(i%5===0)ferns.push({p:[x,.14,z],s:[.35+rand()*.4,.3+rand()*.2,.4],r:rand()*6,c:['#617c48','#738a51'][i%2]});
    if(i%13===0)bushes.push({p:[x,.35,z],s:[.6+rand()*.5,.4+rand()*.35,.6+rand()*.4],c:canopyColors[(i+1)%5]});
   }
   if(i%2===0)leaves.push({p:[x,-.018,z],s:[.10+rand()*.07,.02,.055],r:theta,c:['#a28b54','#9e7949','#b19a62'][i%3]});
   if(i%17===0)stones.push({p:[x,.025,z],s:[.12,.08,.10],r:theta,c:'#a6a186'});
   if(i%23===0&&ring>1.07){const radius=.35+rand()*.7;rocks.push({p:[x,radius*.4,z],s:[radius,radius*.65,radius*.8],r:theta,c:['#929584','#797f70','#a0a18b'][i%3]});moss.push({p:[x-.07,radius*.76,z],s:[radius*.8,.12,radius*.65],r:theta,c:'#69814a'});}
  }
  const plant=mat('#ffffff');this.animate(plant,.14);
  instances(scene,new THREE.ConeGeometry(.5,1,3),plant,grass);
  // Eight large fronds as a single geometry, instanced across the woodland edge.
  const fernGeo=new THREE.BufferGeometry(),verts=[];
  for(let i=0;i<8;i++){const a=i*Math.PI/4,ex=Math.cos(a),ez=Math.sin(a);verts.push(0,0,0,ex*.6,.72,ez*.6,ex,0.15,ez);}
  fernGeo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));fernGeo.computeVertexNormals();const fernMat=mat('#ffffff',{side:THREE.DoubleSide});this.animate(fernMat,.1);instances(scene,fernGeo,fernMat,ferns);
  instances(scene,new THREE.IcosahedronGeometry(1,0),leafMaterial,bushes);
  instances(scene,new THREE.DodecahedronGeometry(1,0),mat('#ffffff'),rocks,true);
  instances(scene,new THREE.IcosahedronGeometry(1,0),mat('#ffffff'),moss);
  instances(scene,new THREE.IcosahedronGeometry(1,0),mat('#ffffff'),stones);
  instances(scene,new THREE.BoxGeometry(1,1,1),mat('#ffffff'),leaves);
  // Asymmetric landmarks: fallen timber and a split rock, all outside the duel.
  const logRoots=[];
  for(const [x,z,angle]of [[-10.5,-7.2,.5],[13,-3.8,-.7],[-14,3.8,1.8]]){
   logs.push({p:[x,.36,z],s:[.48,3.8,.5],rot:[Math.PI/2,0,angle],c:'#a89a7c'});
   for(let j=0;j<3;j++)segment(logRoots,[x+j*.45,.2,z],[x+j*.45+.5,.02,z+.7],.18,.10,'#9c8c70');
  }
  instances(scene,new THREE.CylinderGeometry(.85,1,1,8),mat('#86785e',{map:barkTexture()}),logs,true);
  instances(scene,new THREE.CylinderGeometry(.45,.8,1,5),mat('#635a42'),logRoots,true);
  // Warm ground pools are sparse and broad, not an overlaid high-frequency shadow pattern.
  this.pools=[];
  for(const [x,z,s]of [[-6,-3,2.4],[6,-1,1.5],[0,4,1.2]]){
   const mesh=new THREE.Mesh(new THREE.CircleGeometry(1,9),new THREE.MeshBasicMaterial({color:'#d5ba70',transparent:true,opacity:.11,depthWrite:false}));mesh.rotation.x=-Math.PI/2;mesh.scale.set(s,s*.65,1);mesh.position.set(x,-.03,z);scene.add(mesh);this.pools.push(mesh);this.ambient.push(mesh);
  }
  const dust=new Float32Array(32*3);for(let i=0;i<32;i++){dust[i*3]=(rand()-.5)*25;dust[i*3+1]=.5+rand()*3.5;dust[i*3+2]=(rand()-.5)*15;}
  const dustGeo=new THREE.BufferGeometry();dustGeo.setAttribute('position',new THREE.BufferAttribute(dust,3));this.dust=new THREE.Points(dustGeo,new THREE.PointsMaterial({color:'#dec68b',size:.065,transparent:true,opacity:.45,depthWrite:false}));scene.add(this.dust);this.ambient.push(this.dust);
  this.beams=[];for(const [x,z]of [[-8,-10],[1,-12],[9,-8]]){
   const b=new THREE.Mesh(new THREE.PlaneGeometry(1.3,9),new THREE.MeshBasicMaterial({color:'#f1dba6',transparent:true,opacity:.045,side:THREE.DoubleSide,depthWrite:false}));b.position.set(x,5,z);b.rotation.z=-.38;scene.add(b);this.beams.push(b);this.ambient.push(b);
  }
 }
 animate(material,strength){material.onBeforeCompile=shader=>{shader.uniforms.windTime=this.wind;shader.vertexShader='uniform float windTime;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>\nfloat phase=windTime*1.1;\n#ifdef USE_INSTANCING\nphase+=instanceMatrix[3].x*.6+instanceMatrix[3].z;\n#endif\ntransformed.x+=sin(phase)*max(position.y,0.0)*${strength};`);};material.customProgramCacheKey=()=>`pixel-forest-${strength}`;}
 settings(){this.scene.fog=visual.fog?this.fog:null;this.ambient.forEach(o=>o.visible=visual.environment);this.wind.value=visual.environment?this.time||0:0;}
 update(t){this.time=t;this.settings();this.dust.position.y=Math.sin(t*.35)*.12;this.beams.forEach((b,i)=>b.material.opacity=.035+Math.sin(t*.45+i)*.008);}
}
