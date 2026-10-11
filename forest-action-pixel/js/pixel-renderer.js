import * as THREE from 'three';
import {visual,renderSize} from './visual-config.js';
export class PixelRenderer {
 constructor(renderer){
  this.renderer=renderer;this.width=1;this.height=1;this.lastSize='';this.info={};
  this.target=new THREE.WebGLRenderTarget(1,1,{minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter,generateMipmaps:false,depthBuffer:true,stencilBuffer:false});
  this.scene=new THREE.Scene();this.camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  this.material=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,toneMapped:true,uniforms:{map:{value:this.target.texture},resolution:{value:new THREE.Vector2(1,1)},pixelStep:{value:1}},
   vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
   fragmentShader:`uniform sampler2D map;uniform vec2 resolution;uniform float pixelStep;varying vec2 vUv;
    void main(){
     vec2 pixel=floor(gl_FragCoord.xy/pixelStep);
     gl_FragColor=texture2D(map,(pixel+.5)/resolution);
     #include <tonemapping_fragment>
     #include <colorspace_fragment>
     // Ordered, world-image pixel dithering: enlarged pixels stay one solid color.
     float d=(mod(pixel.x,2.)+mod(pixel.y,2.)*2.)/4.-.375;
     gl_FragColor.rgb=floor(clamp(gl_FragColor.rgb+d*.008,0.,1.)*32.+.5)/32.;
    }`});
  this.scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),this.material));renderer.info.autoReset=false;
 }
 resize(width,height){this.width=width;this.height=height;}
 render(scene,camera){
  const r=this.renderer;r.info.reset();r.shadowMap.enabled=visual.shadows;
  const size=renderSize(this.width,this.height,r.getPixelRatio(),visual.resolution);
  if(visual.pixel){
   this.material.uniforms.pixelStep.value=size.scale;
   const key=`${size.width}/${size.height}`;if(key!==this.lastSize){this.target.setSize(size.width,size.height);this.material.uniforms.resolution.value.set(size.width,size.height);this.lastSize=key;}
   r.setRenderTarget(this.target);r.render(scene,camera);r.setRenderTarget(null);r.render(this.scene,this.camera);
  }else{r.setRenderTarget(null);r.render(scene,camera);}
  this.info={pixel:visual.pixel,preset:visual.resolution,internal:visual.pixel?[size.width,size.height]:[size.displayWidth,size.displayHeight],display:[size.displayWidth,size.displayHeight],pixelStep:visual.pixel?size.scale:1,passes:visual.pixel?2:1,dpr:r.getPixelRatio(),calls:r.info.render.calls,triangles:r.info.render.triangles};
 }
}
