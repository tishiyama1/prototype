import * as THREE from 'three';
import {config,laneZ} from './config.js';
const material=(color)=>new THREE.MeshStandardMaterial({color,flatShading:true,roughness:1});
const rng=(()=>{let s=7261;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};})();
function instanced(scene,geometry,mat,items,cast=false) {
  const mesh=new THREE.InstancedMesh(geometry,mat,items.length),o=new THREE.Object3D();
  items.forEach((i,n)=>{o.position.set(...i.p);o.scale.set(...(i.s||[1,1,1]));o.rotation.set(...(i.r||[0,0,0]));o.updateMatrix();mesh.setMatrixAt(n,o.matrix);if(i.c)mesh.setColorAt(n,new THREE.Color(i.c));});
  mesh.castShadow=cast;mesh.receiveShadow=true;scene.add(mesh);return mesh;
}
export class Forest {
  constructor(scene) {
    this.scene=scene;this.wind={value:0};
    scene.background=new THREE.Color('#93b3a6');scene.fog=new THREE.FogExp2('#93b3a6',.016);
    scene.add(new THREE.HemisphereLight('#ecf5d2','#294137',2.1));
    const sun=new THREE.DirectionalLight('#ffe3ad',3.1);sun.position.set(-10,18,10);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-18,right:18,top:18,bottom:-18,near:.1,far:50});sun.shadow.bias=-.001;sun.shadow.normalBias=.04;scene.add(sun,sun.target);this.sun=sun;
    const g=new THREE.PlaneGeometry(108,55,80,40);g.rotateX(-Math.PI/2);const pos=g.attributes.position;
    for(let i=0;i<pos.count;i++){const x=pos.getX(i)+33,z=pos.getZ(i);const bank=Math.max(0,Math.abs(z)-3);pos.setY(i,-.045+bank*.045+Math.sin(x*.35+z)*Math.min(.55,bank*.07));}
    g.computeVertexNormals();const ground=new THREE.Mesh(g,material('#567852'));ground.position.x=33;ground.receiveShadow=true;scene.add(ground);
    this.paths=[];
    for(let lane=0;lane<2;lane++) {
      const path=new THREE.Mesh(new THREE.PlaneGeometry(72,1.48,72,2),material(lane===0?'#b0a47b':'#afa982'));const vertices=path.geometry.attributes.position;for(let i=0;i<vertices.count;i++){const x=vertices.getX(i),y=vertices.getY(i);if(Math.abs(y)>.1)vertices.setY(i,y+Math.sin(x*2.1+lane)*.065+Math.sin(x*.7)*.09);}path.geometry.computeVertexNormals();path.rotation.x=-Math.PI/2;path.position.set(33,-.022,laneZ(lane));path.receiveShadow=true;scene.add(path);this.paths.push(path);
    }
    const trunks=[],crowns=[],rocks=[],grass=[],flowers=[],leaves=[],shrubs=[];
    this.frontTrees=[];
    for(let i=0;i<125;i++) {
      const x=-15+rng()*100,z=-4-rng()*24,h=4+rng()*8,r=.22+rng()*.43;
      trunks.push({p:[x,h/2,z],s:[r,h,r],r:[0,rng()*6,0],c:['#4c5440','#66583e','#71684e'][i%3]});
      for(let j=0;j<3;j++)crowns.push({p:[x+(rng()-.5)*3,h+(rng()-.5)*2,z+(rng()-.5)*2],s:[2+rng()*1.5,1.6+rng()*1.6,1.8+rng()*1.5],c:['#3d6e4c','#628755','#738d53','#8ca569'][i%4]});
      if(i<30)rocks.push({p:[x,.3,z],s:[.5+rng(),.3+rng()*.5,.4+rng()],r:[rng(),rng()*6,0],c:'#748168'});
    }

    // Midground trees keep visible crowns in an orthographic side view.
    for(let i=0;i<40;i++){
      const x=-10+i*2.2+(rng()-.5),z=-3.7-rng()*2.2,h=2.7+rng()*1.5,r=.14+rng()*.1;
      trunks.push({p:[x,h/2,z],s:[r,h,r],c:'#6c6948'});
      crowns.push({p:[x,h,z],s:[1.2+rng()*.7,.8+rng()*.6,1.1+rng()*.8],c:['#658657','#7c975c','#839e68'][i%3]});
    }
    instanced(scene,new THREE.CylinderGeometry(.7,1,1,7),material('#5c5643'),trunks,true);
    const canopy=material('#6f945a');this.animateMaterial(canopy,.025);// Instantiated below after the foreground canopy is added.
    for(let i=0;i<11;i++) {
      // Sparse foreground giants; fade when their projected silhouette overlaps the adventurer.
      const x=-8+i*8.8,z=7.5+rng()*3,h=6+rng()*5;const group=new THREE.Group();group.position.set(x,0,z);
      const m=material('#4f5e46');m.transparent=true;
      const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.33,.65,h,7),m);trunk.position.y=h/2;group.add(trunk);
      for(let j=0;j<3;j++){const root=new THREE.Mesh(new THREE.ConeGeometry(.35,1.8,5),m);root.rotation.z=(j-1)*.5;root.position.set((j-1)*.4,.5,0);group.add(root);}
      scene.add(group);this.frontTrees.push({group,material:m,x,z});
      for(let j=0;j<3;j++)crowns.push({p:[x+(j-1)*1.6,h+2.4+rng(),z],s:[2.3,1.3,2],c:['#3d6445','#6b8a50','#759450'][j]});
    }
    instanced(scene,new THREE.IcosahedronGeometry(1,1),canopy,crowns);
    for(let i=0;i<700;i++) {
      const x=-10+rng()*91;let z=(rng()-.5)*20;
      if(Math.abs(z)<3.4){if(Math.abs(z)<.5)z*=.85;else z=(z<0?-1:1)*(3.2+rng()*1.2);}
      const s=.15+rng()*.3;
      grass.push({p:[x,s/2,z],s:[s*.7,s,s*.65],r:[0,rng()*6,0],c:['#80994e','#92a85a','#658449'][i%3]});
      if(i%8===0)flowers.push({p:[x,s+.03,z],s:[.06,.05,.06],c:i%16===0?'#edd8a0':'#d09c8c'});
      if(i%4===0)leaves.push({p:[x,.005,z],s:[.12,.012,.06],r:[0,rng()*6,0],c:i%8?'#ac954f':'#bdac70'});
      if(i%16===0 && Math.abs(z)>3)shrubs.push({p:[x,.38,z],s:[.7,.6,.8],c:'#73905a'});
    }
    const grassMat=material('#8a9d52');this.animateMaterial(grassMat,.18);instanced(scene,new THREE.ConeGeometry(.5,1,3),grassMat,grass);
    instanced(scene,new THREE.IcosahedronGeometry(1,0),material('#cdbf85'),flowers);
    instanced(scene,new THREE.IcosahedronGeometry(1,0),material('#ac954f'),leaves);
    instanced(scene,new THREE.IcosahedronGeometry(1,1),canopy,shrubs);
    for(let i=0;i<45;i++){
      const x=-7+rng()*80,z=(i%2?1:-1)*(3.2+rng()*3);rocks.push({p:[x,.2,z],s:[.3+rng()*.8,.2+rng()*.45,.4+rng()*.6],r:[rng(),rng()*6,0],c:'#788776'});
    }
    instanced(scene,new THREE.DodecahedronGeometry(1,0),material('#7d8975'),rocks,true);
    // Warm shafts of light behind the playable paths, with no expensive post-processing.
    this.beams=[];
    for(let i=0;i<8;i++) {
      const beam=new THREE.Mesh(new THREE.PlaneGeometry(1.8,13),new THREE.MeshBasicMaterial({color:'#ffefbd',transparent:true,opacity:.065,depthWrite:false,side:THREE.DoubleSide}));
      beam.position.set(-4+i*10,5.8,-3.7);beam.rotation.z=-.37;scene.add(beam);this.beams.push(beam);
    }
    const specks=new Float32Array(100*3);for(let i=0;i<100;i++){specks[i*3]=-5+rng()*77;specks[i*3+1]=.7+rng()*4;specks[i*3+2]=-8+rng()*14;}
    const dustGeo=new THREE.BufferGeometry();dustGeo.setAttribute('position',new THREE.BufferAttribute(specks,3));
    this.dust=new THREE.Points(dustGeo,new THREE.PointsMaterial({color:'#f1e3b1',size:.045,transparent:true,opacity:.65,depthWrite:false}));scene.add(this.dust);
    this.goal=new THREE.Group();this.goal.position.x=66;
    for(const z of [-3.2,3.2]){const stone=new THREE.Mesh(new THREE.BoxGeometry(.65,2.8,.65),material('#778b79'));stone.position.set(0,1.4,z);stone.rotation.z=z*.02;stone.castShadow=true;this.goal.add(stone);}
    const arch=new THREE.Mesh(new THREE.BoxGeometry(.7,.45,7),material('#899b84'));arch.position.y=3;this.goal.add(arch);
    this.goalLight=new THREE.Mesh(new THREE.TorusGeometry(.45,.045,6,28),new THREE.MeshBasicMaterial({color:'#ffe6a1'}));this.goalLight.position.set(0,2.2,0);this.goalLight.rotation.y=Math.PI/2;this.goal.add(this.goalLight);scene.add(this.goal);
    const sign=new THREE.Group();sign.position.set(3,0,-3.0);const post=new THREE.Mesh(new THREE.CylinderGeometry(.06,.08,1.45,5),material('#7a6449'));post.position.y=.72;sign.add(post);const board=new THREE.Mesh(new THREE.BoxGeometry(.95,.34,.09),material('#9b8055'));board.position.set(.2,1.3,0);sign.add(board);scene.add(sign);
  }
  animateMaterial(m,strength) {
    m.onBeforeCompile = shader=>{shader.uniforms.windTime=this.wind;shader.vertexShader='uniform float windTime;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>\nfloat phase = windTime * 1.3;\n#ifdef USE_INSTANCING\nphase += instanceMatrix[3].x * .7 + instanceMatrix[3].z;\n#endif\ntransformed.x += sin(phase) * max(position.y,0.0) * ${strength.toFixed(3)};`);
    };
    m.customProgramCacheKey=()=>`forest-wind-${strength}`;
  }
  update(t,player,enemies=[]) {
    this.wind.value=t;this.paths.forEach((p,lane)=>p.position.z=laneZ(lane));
    this.sun.position.x=player.x-10;this.sun.target.position.x=player.x;
    for(const f of this.frontTrees) {const overlap=Math.abs(f.x-player.x)<1.9 || enemies.some(e=>e.hp>0&&Math.abs(f.x-e.x)<1.5);f.material.opacity=overlap ? .18: .9;f.material.depthWrite=!overlap;}
    this.dust.position.y=Math.sin(t*.4)*.17;this.dust.position.x=Math.sin(t*.22)*.2;
    this.beams.forEach((b,i)=>b.material.opacity=.035+Math.sin(t*.7+i)*.012);
    this.goalLight.rotation.z=t*.5;
  }
}
