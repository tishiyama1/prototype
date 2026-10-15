import * as THREE from 'three';
// All scenery is baked imagery on seven simple planes. No source forest models
// are imported at runtime. The offline authoring tool lives under tests/.
export const LAYER_DEFINITIONS=Object.freeze([
 {id:'far',role:'遠景',z:-19,parallax:.030},
 {id:'rear',role:'遠景',z:-10.3,parallax:.015},
 {id:'middle',role:'中景',z:-5.5,parallax:0},
 {id:'left',role:'前景',z:3,parallax:-.010},
 {id:'right',role:'前景',z:4,parallax:-.012}
]);
export class Forest{
 constructor(scene){
  this.scene=scene;this.scenery=true;this.shadows=true;this.fogEnabled=true;this.parallax=true;this.time=0;this.layers=[];this.ready=false;
  scene.background=null;scene.fog=null;this.groundScene=new THREE.Scene();this.groundScene.background=new THREE.Color('#7b978a');
  const loader=new THREE.TextureLoader(),load=async name=>{const t=await loader.loadAsync(new URL('../media/'+name+'.webp',import.meta.url).href);t.colorSpace=THREE.SRGBColorSpace;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;t.anisotropy=2;return t;};
  // This light serves existing status/effect geometry only; images contain lighting.
  scene.add(new THREE.HemisphereLight('#e7eee0','#59634b',1.8));
  this.loading=Promise.all([fetch(new URL('../media/layers.json',import.meta.url)).then(r=>{if(!r.ok)throw Error('layer manifest');return r.json();}),Promise.all(['ground',...LAYER_DEFINITIONS.map(a=>a.id)].map(load))]).then(([dimensions,textures])=>{
   const ground=new THREE.Mesh(new THREE.PlaneGeometry(66,49.5),new THREE.MeshBasicMaterial({map:textures[0],toneMapped:false}));ground.rotation.x=-Math.PI/2;ground.position.y=-.045;ground.name='layer-ground';this.groundScene.add(ground);this.ground=ground;
   const pitch=43*Math.PI/180;for(let i=0;i<LAYER_DEFINITIONS.length;i++){
    const d=LAYER_DEFINITIONS[i],material=new THREE.MeshBasicMaterial({map:textures[i+1],transparent:true,forceSinglePass:true,alphaTest:.02,depthWrite:true,side:THREE.DoubleSide,toneMapped:false});
    const a=dimensions[d.id],g=new THREE.PlaneGeometry(a.width,a.height);g.translate(a.offsetX,a.offsetY,0);const m=new THREE.Mesh(g,material);m.rotation.x=-(Math.PI/2-pitch);m.position.set(0,0,d.z);m.name='layer-'+d.id;scene.add(m);this.layers.push({...d,mesh:m});
   }
   this.ready=true;
  });
  const p=new Float32Array(12*3);for(let i=0;i<12;i++){p[i*3]=(i%4-1.5)*4.8;p[i*3+1]=1+(i%3)*.8;p[i*3+2]=-4-Math.floor(i/4)*3;}
  this.dust=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(p,3)),new THREE.PointsMaterial({color:'#f0dfb0',size:.032,transparent:true,opacity:.25,depthWrite:false}));scene.add(this.dust);
  const soft=new THREE.CanvasTexture(this.glow());soft.colorSpace=THREE.SRGBColorSpace;
  this.light=new THREE.Mesh(new THREE.PlaneGeometry(7,4),new THREE.MeshBasicMaterial({map:soft,color:'#ffe3a9',transparent:true,opacity:.07,depthWrite:false,toneMapped:false}));this.light.rotation.x=-Math.PI/2;this.light.position.set(-3,-.018,-1);scene.add(this.light);
 }
 glow(){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#ffffff00');x.fillStyle=g;x.fillRect(0,0,64,64);return c;}
 settings(){this.dust.visible=this.light.visible=this.scenery;for(const l of this.layers){l.mesh.material.color.set(this.fogEnabled?'#ffffff':l.role==='遠景'?'#e5ecd9':'#ffffff');}}
 update(t){this.time=t;this.settings();this.dust.position.x=Math.sin(t*.3)*.14;this.dust.position.y=Math.sin(t*.4)*.08;this.light.material.opacity=.06+Math.sin(t*.4)*.012;}
 sync(camera,view,inspecting=false){
  if(!this.ready)return;for(const l of this.layers){
   const dx=this.parallax?(camera.position.x+.4)*l.parallax:0;
   l.mesh.position.x=dx+(this.scenery&&!inspecting&&l.role==='前景'?Math.sin(this.time*.65+l.z)*.018:0);
   l.mesh.position.z=l.z;
   // Foreground remains a framing device. Fade overlap rather than obscuring tells.
   l.mesh.material.opacity=1;
   if(l.role==='前景')for(const a of [view.player,view.enemy])if(!this.visibilityAgainst(l,a.x,a.z,camera)){l.mesh.material.opacity=.38;break;}
  }
 }
 visibilityAgainst(l,x,z,camera){
  const d=camera.getWorldDirection(new THREE.Vector3()),ray=new THREE.Raycaster();ray.set(new THREE.Vector3(x,1.35,z).addScaledVector(d,-45),d);ray.far=44.8;l.mesh.updateMatrixWorld(true);const h=ray.intersectObject(l.mesh)[0];if(!h)return true;
  if(!l.alpha){const image=l.mesh.material.map.image,c=document.createElement('canvas');c.width=image.width;c.height=image.height;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);l.alpha={data:ctx.getImageData(0,0,c.width,c.height).data,w:c.width,h:c.height};}
  const a=l.alpha,u=Math.max(0,Math.min(a.w-1,Math.floor(h.uv.x*a.w))),v=Math.max(0,Math.min(a.h-1,Math.floor((1-h.uv.y)*a.h)));return a.data[(v*a.w+u)*4+3]<80;
 }
 visibilityAt(x,z,camera){return this.layers.every(l=>l.role==='前景'||this.visibilityAgainst(l,x,z,camera));}
 snapshot(){return {ready:this.ready,geometry:'textured planes',pitch:43,ground:{width:66,depth:49.5},plates:this.layers.map(l=>({id:l.id,role:l.role,z:l.z,x:l.mesh.position.x,opacity:l.mesh.material.opacity})),parallax:this.parallax};}
}
