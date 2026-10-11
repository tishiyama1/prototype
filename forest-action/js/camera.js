import * as THREE from 'three';
import { config } from './config.js';
export class CameraRig {
  constructor() { this.camera = new THREE.OrthographicCamera(-10,10,6,-6,.1,120); this.x=4; this.target = new THREE.Vector3(); this.aspect=1; this.shake=0; }
  resize(w,h) { this.aspect=w/h; }
  update(dt,player) {
    const halfHeight=5.4/config.zoom, halfWidth=halfHeight*this.aspect;
    const desired = player.x + (0.5-config.screenPosition)*2*halfWidth + player.facing * .6;
    this.x += (desired-this.x)*(1-Math.exp(-config.follow*dt));
    this.camera.left=-halfWidth;this.camera.right=halfWidth;this.camera.top=halfHeight;this.camera.bottom=-halfHeight;
    this.camera.updateProjectionMatrix();
    this.shake = Math.max(0,this.shake-dt*2);
    const pitch=config.pitch*Math.PI/180;
    this.target.set(this.x, .6, 0);
    this.camera.position.set(this.x + Math.sin(performance.now()*.05)*this.shake*.08, .6+Math.sin(pitch)*32, Math.cos(pitch)*32);
    this.camera.lookAt(this.target);
  }
}
