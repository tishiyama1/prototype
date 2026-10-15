import * as THREE from 'three';
/** Data-driven image scenery. No model/physics/AI dependencies. Art + scene.json
 * are the per-scene inputs. CSS image layers share the orthographic projection; transparent WebGL
 * keeps sprites, effects, foreground depth and actor shadows on their XZ coordinates. */
export class SceneBackdrop{
 constructor(scene,manifestURL,{mount=true}={}){
  this.scene=scene;this.shadows=this.fogEnabled=this.scenery=this.parallax=true;this.time=0;this.layers=[];this.ready=false;
  this.groundScene=new THREE.Scene();this.backdropScene=this.groundScene;scene.background=null;scene.fog=null;
  this.lightPools=[];this.lamps=[];this.host=document.createElement('div');this.host.id='cave-backdrop';this.host.style.cssText='position:absolute;inset:0;overflow:hidden;pointer-events:none;background:#101820';const canvas=document.getElementById('world');if(mount)canvas.parentNode.insertBefore(this.host,canvas);this.images=[];
  this.loading=this.load(manifestURL);
 }
 async load(url){
  const response=await fetch(url);if(!response.ok)throw Error('scene manifest');const data=await response.json();this.definition=data;
  this.groundScene.background=new THREE.Color(data.background);const loader=new THREE.TextureLoader();
  const defs=[data.ground,...data.layers],textures=await Promise.all(defs.map(async d=>{const t=await loader.loadAsync(new URL(d.file,url).href);t.colorSpace=THREE.SRGBColorSpace;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;t.anisotropy=2;return t;}));
  const g=data.ground;this.ground=new THREE.Mesh(new THREE.PlaneGeometry(g.width,g.height),new THREE.MeshBasicMaterial({map:textures[0],toneMapped:false}));this.ground.rotation.x=-Math.PI/2;this.ground.position.set(...g.position);this.ground.name='layer-ground';this.groundScene.add(this.ground);this.addImage(this.ground,textures[0].image);
  const pitch=data.pitch*Math.PI/180;
  for(let i=0;i<data.layers.length;i++){
   const d=data.layers[i],geo=new THREE.PlaneGeometry(d.width,d.height);geo.translate(d.offsetX||0,d.offsetY||0,0);
   const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:textures[i+1],transparent:true,forceSinglePass:true,alphaTest:.015,depthWrite:d.pass==='actors',depthTest:d.pass==='actors',side:THREE.DoubleSide,toneMapped:false}));
   m.rotation.x=-(Math.PI/2-pitch);m.position.set(...d.position);m.name='layer-'+d.id;m.renderOrder=d.pass==='backdrop'?i:0;
   (d.pass==='backdrop'?this.backdropScene:this.scene).add(m);const layer={...d,mesh:m};this.layers.push(layer);if(d.pass==='backdrop')layer.image=this.addImage(m,textures[i+1].image);
   if(d.lamp){const lamp=new THREE.Mesh(new THREE.PlaneGeometry(d.lamp.size,d.lamp.size),new THREE.MeshBasicMaterial({map:this.glowTexture(),color:'#ffb340',transparent:true,opacity:.055,depthTest:false,depthWrite:false,toneMapped:false,blending:THREE.AdditiveBlending}));lamp.position.set(d.lamp.x,d.lamp.y,.02);lamp.renderOrder=10;m.add(lamp);lamp.base=.055;this.lamps.push(lamp);const glow=document.createElement('div');glow.style.cssText='position:absolute;left:0;top:0;width:64px;height:64px;transform-origin:0 0;pointer-events:none;mix-blend-mode:screen;background:radial-gradient(closest-side,#ffbd6080,transparent)';this.host.appendChild(glow);lamp.dom=glow;this.images.push({mesh:lamp,element:glow,width:64,height:64,lamp:true});
    // Broad faint wall bounce; simple light planes only, no moving wall image.
    for(const [x,y,w,h,base]of [[-13.0,1.3,3.8,6,.028],[14.2,1.0,2.8,5,.018]]){const bounce=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({transparent:true,opacity:base,depthWrite:false,toneMapped:false}));bounce.position.set(x,y,.025);bounce.base=base;m.add(bounce);this.lamps.push(bounce);const el=document.createElement('div');el.style.cssText='position:absolute;left:0;top:0;width:64px;height:64px;transform-origin:0 0;pointer-events:none;mix-blend-mode:screen;background:radial-gradient(closest-side,#f2c987a0,transparent)';this.host.appendChild(el);bounce.dom=el;this.images.push({mesh:bounce,element:el,width:64,height:64,lamp:true});}}
  }
  for(const d of data.lightPools){const m=new THREE.Mesh(new THREE.PlaneGeometry(d.width,d.height),new THREE.MeshBasicMaterial({map:this.glowTexture(),color:d.color,transparent:true,opacity:d.opacity,depthWrite:false,toneMapped:false}));m.rotation.x=-Math.PI/2;m.position.set(d.x,-.018,d.z);this.scene.add(m);this.lightPools.push({mesh:m,base:d.opacity});}
  const positions=new Float32Array(10*3);for(let i=0;i<10;i++){positions[i*3]=(i%5-2)*3.8;positions[i*3+1]=.9+(i%3)*.75;positions[i*3+2]=-5-Math.floor(i/5)*2;}
  this.dust=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(positions,3)),new THREE.PointsMaterial({color:'#e6c398',size:.025,transparent:true,opacity:.23,depthWrite:false}));this.scene.add(this.dust);this.ready=true;this.update(0);
 }
 addImage(mesh,image){const element=image;const width=image.naturalWidth,height=image.naturalHeight;element.alt='';element.draggable=false;element.style.cssText=`position:absolute;left:0;top:0;width:${width}px;height:${height}px;max-width:none;transform-origin:0 0;pointer-events:none;will-change:transform`;this.host.appendChild(element);this.images.push({mesh,element,width,height});return element;}
 projectImage(a,camera){a.mesh.updateWorldMatrix(true,false);const p=a.mesh.geometry.attributes.position,point=i=>{const v=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(a.mesh.matrixWorld).project(camera);return [(v.x+1)*innerWidth/2,(1-v.y)*innerHeight/2];},tl=point(0),tr=point(1),bl=point(2);a.element.style.transform=`matrix(${(tr[0]-tl[0])/a.width},${(tr[1]-tl[1])/a.width},${(bl[0]-tl[0])/a.height},${(bl[1]-tl[1])/a.height},${tl[0]},${tl[1]})`;if(a.lamp){a.element.hidden=!this.scenery;a.element.style.opacity=a.mesh.material.opacity;}}
 glowTexture(){if(this.glow)return this.glow;const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#ffffff00');x.fillStyle=g;x.fillRect(0,0,64,64);this.glow=new THREE.CanvasTexture(c);return this.glow;}
 settings(){if(!this.ready)return;this.dust.visible=this.scenery;for(const a of [...this.lamps,...this.lightPools.map(p=>p.mesh)])a.visible=this.scenery;for(const l of this.layers){l.mesh.material.color.set(l.role==='遠景'&&!this.fogEnabled?'#c0c7ce':'#ffffff');if(l.image)l.image.style.filter=l.role==='遠景'&&!this.fogEnabled?'brightness(.88) saturate(.88)':'none';}}
 update(t){this.time=t;this.settings();if(!this.ready)return;const flicker=1+.045*Math.sin(t*.8)+.02*Math.sin(t*1.3);for(const lamp of this.lamps)lamp.material.opacity=lamp.base*flicker;for(const p of this.lightPools)p.mesh.material.opacity=p.base*flicker;this.dust.position.x=Math.sin(t*.18)*.10;this.dust.position.y=Math.sin(t*.26)*.08;}
 sync(camera,view,inspecting=false){
  if(!this.ready)return;for(const l of this.layers){
   // Orthographic translation has no inherent parallax: synthesize tiny offsets.
   l.mesh.position.x=l.position[0]+(this.parallax?(camera.position.x+.4)*l.parallaxX:0);
   l.mesh.position.z=l.position[2]+(this.parallax?(camera.position.z-18.74061104857512)*l.parallaxZ:0);
   // Stone stays stationary: only the lamp/light/motes animate, never rock sway.
   l.mesh.material.opacity=1;
   if(l.pass==='actors')for(const actor of Object.values(view.actors).filter(a=>a.hp>0))if(!this.visibilityAgainst(l,actor.x,actor.z,camera)){l.mesh.material.opacity=.38;break;}
  }
  for(const image of this.images)this.projectImage(image,camera);
 }
 visibilityAgainst(layer,x,z,camera){
  const direction=camera.getWorldDirection(new THREE.Vector3()),ray=new THREE.Raycaster();ray.set(new THREE.Vector3(x,1.35,z).addScaledVector(direction,-45),direction);ray.far=44.8;layer.mesh.updateMatrixWorld(true);const hit=ray.intersectObject(layer.mesh)[0];if(!hit)return true;
  if(!layer.alpha){const image=layer.mesh.material.map.image,c=document.createElement('canvas');c.width=image.width;c.height=image.height;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);layer.alpha={data:ctx.getImageData(0,0,c.width,c.height).data,w:c.width,h:c.height};}
  const a=layer.alpha,u=Math.max(0,Math.min(a.w-1,Math.floor(hit.uv.x*a.w))),v=Math.max(0,Math.min(a.h-1,Math.floor((1-hit.uv.y)*a.h)));return a.data[(v*a.w+u)*4+3]<80;
 }
 visibilityAt(x,z,camera){return this.layers.filter(l=>l.pass==='actors').every(l=>l.mesh.material.opacity<.5||this.visibilityAgainst(l,x,z,camera));}
 snapshot(){return {id:this.definition?.id,ready:this.ready,source:'generated 2D layers',compositor:'CSS images + transparent WebGL',geometry:'textured planes',pitch:this.definition?.pitch,ground:this.definition?.ground,plates:this.layers.map(l=>({id:l.id,role:l.role,pass:l.pass,z:l.mesh.position.z,x:l.mesh.position.x,opacity:l.mesh.material.opacity})),parallax:this.parallax,environment:{lights:this.lamps.map(l=>l.material.opacity),dust:10,stoneSway:false}};}
}
