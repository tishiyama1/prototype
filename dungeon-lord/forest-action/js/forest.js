import * as THREE from 'three';
import {ARENA} from './config.js';
const material=color=>new THREE.MeshStandardMaterial({color,flatShading:true,roughness:1});
function instanced(scene,geometry,mat,items,cast=false){const mesh=new THREE.InstancedMesh(geometry,mat,items.length),o=new THREE.Object3D();items.forEach((i,n)=>{o.position.set(...i.p);o.scale.set(...i.s);o.rotation.set(0,i.r||0,0);o.updateMatrix();mesh.setMatrixAt(n,o.matrix);if(i.c)mesh.setColorAt(n,new THREE.Color(i.c));});mesh.castShadow=cast;mesh.receiveShadow=true;scene.add(mesh);return mesh;}
export class Forest {
 constructor(scene){
  this.wind={value:0};let seed=7261;const rng=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  scene.background=new THREE.Color('#96afa0');scene.fog=new THREE.FogExp2('#96afa0',.013);
  scene.add(new THREE.HemisphereLight('#edf3d6','#2b4234',2.1));
  const sun=new THREE.DirectionalLight('#ffe3ac',3.0);sun.position.set(-9,20,7);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-17,right:17,top:14,bottom:-14,near:1,far:50});sun.shadow.bias=-.001;sun.shadow.normalBias=.04;scene.add(sun,sun.target);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(90,70),material('#557654'));ground.rotation.x=-Math.PI/2;ground.position.y=-.06;ground.receiveShadow=true;scene.add(ground);
  const field=new THREE.Mesh(new THREE.CircleGeometry(1,80),material('#ada986'));field.rotation.x=-Math.PI/2;field.scale.set(ARENA.x,ARENA.z,1);field.position.y=-.035;field.receiveShadow=true;scene.add(field);
  const edge=new THREE.Mesh(new THREE.RingGeometry(.99,1.012,80),new THREE.MeshBasicMaterial({color:'#d9d29d',transparent:true,opacity:.23,side:THREE.DoubleSide,depthWrite:false}));edge.rotation.x=-Math.PI/2;edge.scale.set(ARENA.x,ARENA.z,1);edge.position.y=-.03;scene.add(edge);
  const trunks=[],crowns=[],rocks=[],grass=[],flowers=[],leaves=[];this.front=[];
  for(let i=0;i<90;i++){
   const theta=i/90*Math.PI*2+(rng()-.5)*.15,ring=1.25+rng()*.95,x=Math.cos(theta)*ARENA.x*ring,z=Math.sin(theta)*ARENA.z*ring,h=3.5+rng()*5.5;
   // Low rocks and grass define the foreground boundary without hiding the duel.
   if(z>3.5){rocks.push({p:[x,.27,z],s:[.7,.42,.65],c:'#7e8e72'});continue;}
   const radius=.18+rng()*.24;
   trunks.push({p:[x,h/2,z],s:[radius,h,radius],c:i%2?'#655c45':'#59604a'});
   for(let j=0;j<2;j++)crowns.push({p:[x+(rng()-.5)*2,h+rng(),z+(rng()-.5)*2],s:[1.5+rng(),1.2+rng(),1.5+rng()],c:['#47744e','#648753','#819a63'][i%3]});
  }
  instanced(scene,new THREE.CylinderGeometry(.7,1,1,7),material('#635b46'),trunks,true);
  const canopy=material('#6e925b');this.animateMaterial(canopy,.025);instanced(scene,new THREE.IcosahedronGeometry(1,1),canopy,crowns);
  for(let i=0;i<620;i++){
   const theta=rng()*Math.PI*2,ring=i<160?Math.sqrt(rng())*.98:1.02+rng()*.8,x=Math.cos(theta)*ARENA.x*ring,z=Math.sin(theta)*ARENA.z*ring,s=.13+rng()*.23;
   if(i>=160)grass.push({p:[x,s/2,z],s:[s*.7,s,s*.65],r:rng()*6,c:['#88a255','#6f8d4d','#9cb369'][i%3]});
   if(i%9===0)flowers.push({p:[x,.1,z],s:[.045,.04,.045],c:i%18?'#cfab9a':'#eadbb0'});
   if(i%3===0)leaves.push({p:[x,-.015,z],s:[.10,.012,.055],r:rng()*6,c:i%2?'#b2a473':'#c5b88a'});
   if(i%30===0&&i>=160)rocks.push({p:[x,.25,z],s:[.5+rng()*.5,.25+rng()*.3,.55],r:rng()*6,c:'#7b896f'});
  }
  const gm=material('#8e9e54');this.animateMaterial(gm,.18);instanced(scene,new THREE.ConeGeometry(.5,1,3),gm,grass);
  instanced(scene,new THREE.IcosahedronGeometry(1,0),material('#caba87'),flowers);instanced(scene,new THREE.IcosahedronGeometry(1,0),material('#b3a26d'),leaves);instanced(scene,new THREE.DodecahedronGeometry(1,0),material('#829073'),rocks,true);
  const specks=new Float32Array(70*3);for(let i=0;i<70;i++){specks[i*3]=(rng()-.5)*26;specks[i*3+1]=.6+rng()*4;specks[i*3+2]=(rng()-.5)*16;}
  const dg=new THREE.BufferGeometry();dg.setAttribute('position',new THREE.BufferAttribute(specks,3));this.dust=new THREE.Points(dg,new THREE.PointsMaterial({color:'#f1e5b7',size:.045,transparent:true,opacity:.55,depthWrite:false}));scene.add(this.dust);
  this.beams=[];for(let i=0;i<4;i++){const b=new THREE.Mesh(new THREE.PlaneGeometry(1.4,12),new THREE.MeshBasicMaterial({color:'#fff0c0',transparent:true,opacity:.045,side:THREE.DoubleSide,depthWrite:false}));b.position.set(-8+i*5,5,-8);b.rotation.z=-.4;scene.add(b);this.beams.push(b);}
 }
 animateMaterial(m,strength){m.onBeforeCompile=shader=>{shader.uniforms.windTime=this.wind;shader.vertexShader='uniform float windTime;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>\nfloat phase=windTime*1.3;\n#ifdef USE_INSTANCING\nphase+=instanceMatrix[3].x*.7+instanceMatrix[3].z;\n#endif\ntransformed.x+=sin(phase)*max(position.y,0.0)*${strength.toFixed(3)};`);};m.customProgramCacheKey=()=>`forest-wind-${strength}`;}
 update(t){this.wind.value=t;this.dust.position.y=Math.sin(t*.4)*.13;this.beams.forEach((b,i)=>b.material.opacity=.03+Math.sin(t*.7+i)*.012);}
}
