import * as THREE from 'three';
import {config,smooth,lerp} from './config.js';
export class CameraRig {
 constructor(){this.camera=new THREE.OrthographicCamera(-15,15,9,-9,.1,100);this.aspect=1;this.focus=new THREE.Vector3(0,.4,0);this.zoom=1;this.azimuth=0;this.shake=0;}
 resize(w,h){this.aspect=w/h;}
 reset(){this.focus.set(0,.4,0);this.zoom=config.zoom;this.azimuth=0;this.shake=0;}
 update(dt,game,poses){
  const c=game.cinematic;
  let blend=0;
  if(c){const t=poses.phase;blend=smooth(t/.23)*(1-smooth((t-.76)/.24));}
  const pair=new THREE.Vector3((poses.player.x+poses.enemy.x)/2,.65,(poses.player.z+poses.enemy.z)/2);
  const desired=new THREE.Vector3(0,.4,0).lerp(pair,blend*.25);
  const follow=1-Math.exp(-config.cameraSpeed*dt);this.focus.lerp(desired,follow);
  this.zoom=lerp(this.zoom,config.zoom*(1+blend*(Math.min(1.4,config.attackZoom)-1)),follow);this.azimuth=0;
  const half=Math.max(8.5,12.8/this.aspect)/this.zoom;
  this.camera.left=-half*this.aspect;this.camera.right=half*this.aspect;this.camera.top=half;this.camera.bottom=-half;this.camera.updateProjectionMatrix();
  const pitch=config.pitch*Math.PI/180,r=30,sh=Math.sin(game.presentationTime*91)*this.shake*.10;
  this.camera.position.set(this.focus.x+Math.sin(this.azimuth)*Math.cos(pitch)*r+sh,this.focus.y+Math.sin(pitch)*r,this.focus.z+Math.cos(this.azimuth)*Math.cos(pitch)*r);
  this.camera.lookAt(this.focus);this.shake=Math.max(0,this.shake-dt*2);
 }
}
