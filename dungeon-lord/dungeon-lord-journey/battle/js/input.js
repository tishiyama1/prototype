const direction={KeyW:['radial',1],KeyS:['radial',-1],KeyA:['orbit',-1],KeyD:['orbit',1],ArrowUp:['radial',1],ArrowDown:['radial',-1],ArrowLeft:['orbit',-1],ArrowRight:['orbit',1]};
export class Input {
 constructor(canvas,screenDirection=(dx,dy)=>({x:dx,z:dy})){
  this.enabled=false;this.locked=false;this.keys=new Set();this.joy={radial:0,orbit:0};this.attack=false;this.move=null;this.dash=null;this.swipes=new Map();this.attackPointers=new Set();this.screenDirection=screenDirection;
  this.button=document.getElementById('attack');
  window.addEventListener('keydown',e=>{
   if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;
   if(!direction[e.code]&&!['KeyJ','Digit1','Digit2','Digit3','ShiftLeft','ShiftRight'].includes(e.code))return;
   e.preventDefault();if(!this.enabled)return;
   this.keys.add(e.code);if(e.repeat||this.locked)return;
   if(e.code==='KeyJ')this.attack=true;
   if(/^Digit[123]$/.test(e.code))this.move=['slash','thrust','heavy'][Number(e.code.slice(-1))-1];
   if((direction[e.code]&&e.shiftKey)||e.code.startsWith('Shift')){const v=this.keyboard();if(Math.hypot(v.radial,v.orbit)>.1)this.dash=v;}
  });
  window.addEventListener('keyup',e=>this.keys.delete(e.code));
  this.button.addEventListener('pointerdown',e=>{e.preventDefault();if(!this.enabled||this.locked)return;this.button.setPointerCapture(e.pointerId);this.attackPointers.add(e.pointerId);this.button.classList.add('pressed');this.attack=true;});
  const releaseAttack=e=>{this.attackPointers.delete(e.pointerId);this.button.classList.toggle('pressed',this.attackPointers.size>0);};
  for(const type of ['pointerup','pointercancel','lostpointercapture'])this.button.addEventListener(type,releaseAttack);
  for(const button of document.querySelectorAll('[data-move]'))button.addEventListener('pointerdown',e=>{e.preventDefault();if(this.enabled&&!this.locked)this.move=button.dataset.move;});
  // UI touches never count as holding the field. A second finger can still attack.
  canvas.addEventListener('pointerdown',e=>{e.preventDefault();if(!this.enabled||this.locked||this.swipes.size||e.button!==0)return;canvas.setPointerCapture(e.pointerId);this.swipes.set(e.pointerId,{x:e.clientX,y:e.clientY,time:e.timeStamp,swiped:false});});
  canvas.addEventListener('pointermove',e=>{
   if(e.clientX<0||e.clientY<0||e.clientX>innerWidth||e.clientY>innerHeight){this.swipes.delete(e.pointerId);return;}
   this.swipe(e);
  });
  canvas.addEventListener('pointerup',e=>{this.swipe(e);this.swipes.delete(e.pointerId);});
  for(const type of ['pointercancel','lostpointercapture'])canvas.addEventListener(type,e=>this.swipes.delete(e.pointerId));
  window.addEventListener('blur',()=>this.clear());document.addEventListener('visibilitychange',()=>{if(document.hidden)this.clear();});
  document.addEventListener('contextmenu',e=>e.preventDefault());
 }
 swipe(e){const s=this.swipes.get(e.pointerId);if(!s||s.swiped||!this.enabled||this.locked)return;
  const dx=e.clientX-s.x,dy=e.clientY-s.y;
  if(Math.hypot(dx,dy)>=28&&e.timeStamp-s.time<650){s.swiped=true;const d=this.screenDirection(dx,dy),n=Math.hypot(d.x,d.z);if(n>.001)this.dash={world:true,x:d.x/n,z:d.z/n};}
 }
 keyboard(){let radial=0,orbit=0;for(const k of this.keys){if(direction[k]){const [axis,sign]=direction[k];if(axis==='radial')radial+=sign;else orbit+=sign;}}return {radial:Math.max(-1,Math.min(1,radial)),orbit:Math.max(-1,Math.min(1,orbit))};}
 clearCommands(){this.attack=false;this.move=null;this.dash=null;}
 clear(){this.keys.clear();this.swipes.clear();this.attackPointers.clear();this.joy={radial:0,orbit:0};this.button.classList.remove('pressed');this.clearCommands();}
 sample(){const k=this.keyboard(),keyMove=[...this.keys].some(key=>direction[key]);
  const radial=this.locked?0:keyMove?k.radial:this.swipes.size?1:-1,orbit=this.locked?0:keyMove?k.orbit:0;
  this.joy={radial,orbit};const r={radial,orbit,attack:!this.locked&&this.attack,move:!this.locked?this.move:null,dash:!this.locked?this.dash:null};
  this.attack=false;this.move=null;this.dash=null;return this.enabled?r:{};
 }
}
