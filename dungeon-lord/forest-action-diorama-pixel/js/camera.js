import * as THREE from 'three';
import {config,smooth,lerp} from './config.js';
export class CameraRig {
 constructor(){this.camera=new THREE.OrthographicCamera(-15,15,9,-9,.1,100);this.aspect=1;this.focus=new THREE.Vector3(-.4,.4,-3.2);this.zoom=config.zoom;this.azimuth=0;this.shake=0;}
 resize(w,h){this.aspect=w/h;}
 reset(){this.focus.set(-.4,.4,-3.2);this.zoom=config.zoom;this.azimuth=0;this.shake=0;}
 update(dt,game,poses){
  const c=game.cinematic;let blend=0;if(c){const t=poses.phase;blend=smooth(t/.23)*(1-smooth((t-.76)/.24));}
  const pair=new THREE.Vector3((poses.player.x+poses.enemy.x)/2,.4,(poses.player.z+poses.enemy.z)/2);
  const desired=new THREE.Vector3(pair.x*(.5+blend*.12),.4,-3.55+pair.z*.35);
  const follow=1-Math.exp(-config.cameraSpeed*dt);this.focus.lerp(desired,follow);this.azimuth=0;
  // Framing is presentation only. Movement and swipes never read camera transforms.
  const baseHalf=Math.max(8.5,12.8/this.aspect),pitch=config.pitch*Math.PI/180;
  let needed=0;
  for(const a of [poses.player,poses.enemy]){
   needed=Math.max(needed,(Math.abs(a.x-desired.x)+1.7)/this.aspect,Math.abs((a.z-desired.z)*Math.sin(pitch))+2.1);
  }
  const fit=baseHalf/Math.max(4.8,needed);const target=Math.min(config.zoom*(1+blend*(Math.min(1.4,config.attackZoom)-1)),fit);
  this.zoom=lerp(this.zoom,target,follow);const half=baseHalf/this.zoom;
  Object.assign(this.camera,{left:-half*this.aspect,right:half*this.aspect,top:half,bottom:-half});this.camera.updateProjectionMatrix();
  const r=30,sh=Math.sin(game.presentationTime*91)*this.shake*.10;
  this.camera.position.set(this.focus.x+sh,this.focus.y+Math.sin(pitch)*r,this.focus.z+Math.cos(pitch)*r);this.camera.lookAt(this.focus);this.shake=Math.max(0,this.shake-dt*2);
 }
}
