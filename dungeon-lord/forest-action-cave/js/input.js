const direction={KeyW:['radial',1],KeyS:['radial',-1],KeyA:['orbit',-1],KeyD:['orbit',1],ArrowUp:['radial',1],ArrowDown:['radial',-1],ArrowLeft:['orbit',-1],ArrowRight:['orbit',1]};
export class Input {
 constructor(canvas){
  this.enabled=false;this.locked=false;this.keys=new Set();this.joy={radial:0,orbit:0};this.attack=false;this.move=null;this.dash=null;this.stickPointer=null;this.swipes=new Map();this.attackPointers=new Set();
  this.stick=document.getElementById('joystick');this.knob=document.getElementById('stick-knob');this.button=document.getElementById('attack');
  window.addEventListener('keydown',e=>{
   if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;
   if(!direction[e.code]&&!['KeyJ','Digit1','Digit2','Digit3','ShiftLeft','ShiftRight'].includes(e.code))return;
   e.preventDefault();if(!this.enabled)return;
   this.keys.add(e.code);if(e.repeat)return;
   if(!this.locked){if(e.code==='KeyJ')this.attack=true;if(/^Digit[123]$/.test(e.code))this.move=['slash','thrust','heavy'][Number(e.code.slice(-1))-1];
    if((direction[e.code]&&e.shiftKey)||e.code.startsWith('Shift')){const v=this.keyboard();if(Math.hypot(v.radial,v.orbit)>.1)this.dash=v;}}
  });
  window.addEventListener('keyup',e=>{this.keys.delete(e.code);});
  this.stick.addEventListener('pointerdown',e=>{e.preventDefault();if(!this.enabled||this.locked||this.stickPointer!==null)return;this.stickPointer=e.pointerId;this.stick.setPointerCapture(e.pointerId);this.updateStick(e);});
  this.stick.addEventListener('pointermove',e=>{if(e.pointerId===this.stickPointer)this.updateStick(e);});
  for(const type of ['pointerup','pointercancel','lostpointercapture'])this.stick.addEventListener(type,e=>{if(e.pointerId===this.stickPointer)this.releaseStick();});
  this.button.addEventListener('pointerdown',e=>{e.preventDefault();if(!this.enabled||this.locked)return;this.button.setPointerCapture(e.pointerId);this.attackPointers.add(e.pointerId);this.button.classList.add('pressed');this.attack=true;});
  const releaseAttack=e=>{this.attackPointers.delete(e.pointerId);this.button.classList.toggle('pressed',this.attackPointers.size>0);};
  for(const type of ['pointerup','pointercancel','lostpointercapture'])this.button.addEventListener(type,releaseAttack);
  this.button.addEventListener('pointermove',e=>{const b=this.button.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)releaseAttack(e);});
  for(const button of document.querySelectorAll('[data-move]'))button.addEventListener('pointerdown',e=>{e.preventDefault();if(this.enabled&&!this.locked)this.move=button.dataset.move;});
  // Only a gesture beginning on the actual canvas may become a swipe.
  canvas.addEventListener('pointerdown',e=>{e.preventDefault();if(!this.enabled||this.locked)return;canvas.setPointerCapture(e.pointerId);this.swipes.set(e.pointerId,{x:e.clientX,y:e.clientY,time:e.timeStamp});});
  canvas.addEventListener('pointermove',e=>{if(e.clientX<0||e.clientY<0||e.clientX>innerWidth||e.clientY>innerHeight)this.swipes.delete(e.pointerId);});
  canvas.addEventListener('pointerup',e=>{
   const s=this.swipes.get(e.pointerId);this.swipes.delete(e.pointerId);if(!s||!this.enabled||this.locked)return;
   const dx=e.clientX-s.x,dy=e.clientY-s.y,n=Math.hypot(dx,dy);if(n>=28&&e.timeStamp-s.time<650)this.dash={radial:-dy/n,orbit:dx/n};
  });
  for(const type of ['pointercancel','lostpointercapture'])canvas.addEventListener(type,e=>this.swipes.delete(e.pointerId));
  window.addEventListener('blur',()=>this.clear());document.addEventListener('visibilitychange',()=>{if(document.hidden)this.clear();});
  window.addEventListener('pointermove',e=>{if(e.clientX<0||e.clientY<0||e.clientX>innerWidth||e.clientY>innerHeight){if(e.pointerId===this.stickPointer)this.releaseStick();this.swipes.delete(e.pointerId);releaseAttack(e);}});
  document.addEventListener('contextmenu',e=>e.preventDefault());
 }
 keyboard(){let radial=0,orbit=0;for(const k of this.keys){if(direction[k]){const [axis,sign]=direction[k];if(axis==='radial')radial+=sign;else orbit+=sign;}}return {radial:Math.max(-1,Math.min(1,radial)),orbit:Math.max(-1,Math.min(1,orbit))};}
 updateStick(e){if(e.clientX<0||e.clientY<0||e.clientX>innerWidth||e.clientY>innerHeight){this.releaseStick();return;}const b=this.stick.getBoundingClientRect(),r=b.width*.30,dx=e.clientX-b.left-b.width/2,dy=e.clientY-b.top-b.height/2,n=Math.hypot(dx,dy),scale=n>r?r/n:1;this.joy={radial:-dy*scale/r,orbit:dx*scale/r};if(n<r*.10)this.joy={radial:0,orbit:0};this.knob.style.transform=`translate(${dx*scale}px,${dy*scale}px)`;this.stick.classList.add('active');}
 releaseStick(){this.stickPointer=null;this.joy={radial:0,orbit:0};this.knob.style.transform='';this.stick.classList.remove('active');}
 clear(){this.keys.clear();this.releaseStick();this.swipes.clear();this.attackPointers.clear();this.button.classList.remove('pressed');this.attack=false;this.move=null;this.dash=null;}
 sample(){const k=this.keyboard(),r={radial:this.stickPointer!==null?this.joy.radial:k.radial,orbit:this.stickPointer!==null?this.joy.orbit:k.orbit,attack:!this.locked&&this.attack,move:!this.locked?this.move:null,dash:!this.locked?this.dash:null};this.attack=false;this.move=null;this.dash=null;return this.enabled?r:{};}
}
