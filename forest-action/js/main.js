import * as THREE from 'three';
import {Game} from './game.js';
import {Input} from './input.js';
import {CameraRig} from './camera.js';
import {CharacterView} from './character.js';
import {Forest} from './forest.js';
import {Effects} from './effects.js';
import {AudioEngine} from './audio.js';
import {UI} from './ui.js';
import {poses} from './presentation.js';
import {FIXED_DT} from './config.js';
const $=id=>document.getElementById(id);
const fatal=message=>{$('fatal').hidden=false;$('fatal').textContent=message;};
window.addEventListener('unhandledrejection',e=>{console.error(e.reason);fatal('ゲームの読み込みに失敗しました。通信環境を確認して再読み込みしてください。');});
try {
 const canvas=$('world'),renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
 const scene=new THREE.Scene(),game=new Game(),input=new Input(canvas),camera=new CameraRig(),forest=new Forest(scene),effects=new Effects(scene),audio=new AudioEngine(),ui=new UI(game);
 const playerView=new CharacterView(scene),enemyView=new CharacterView(scene,true);
 let last=performance.now(),accumulator=0,worldTime=0,fps=60,contextLost=false,lastDraw=0;
 const portrait=()=>matchMedia('(orientation:portrait) and (max-width:900px)').matches;
 function pause(){if(game.status!=='playing')return;game.status='paused';input.enabled=false;input.clear();accumulator=0;audio.suspend();ui.paused();}
 function start(){if(portrait())return;game.reset();effects.clear();camera.reset();input.clear();input.enabled=true;input.locked=false;last=performance.now();accumulator=0;ui.hideOverlay();ui.clear();audio.unlock();}
 const resize=()=>{renderer.setSize(innerWidth,innerHeight,false);camera.resize(innerWidth,innerHeight);if(portrait())pause();};
 for(const id of ['start','retry','restart'])$(id).addEventListener('click',start);
 $('pause').addEventListener('click',pause);$('resume').addEventListener('click',()=>{if(portrait())return;game.status='playing';input.clear();input.enabled=true;accumulator=0;last=performance.now();ui.hideOverlay();audio.unlock();});
 $('sound').addEventListener('click',()=>{$('sound').textContent=audio.toggle()?'音 ON':'音 OFF';if(game.status==='playing')audio.unlock();});
 window.addEventListener('keydown',e=>{if(e.code==='Escape')pause();});window.addEventListener('blur',pause);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();last=performance.now();accumulator=0;});window.addEventListener('resize',resize);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();contextLost=true;pause();fatal('描画が停止しました。ページを再読み込みしてください。');});
 resize();camera.reset();ui.ready();
 function events(){for(const event of game.events){
   if(event.type==='attack')audio.play('swing');
   if(event.type==='impact'){
    const r=event.result,view=poses(game);effects.swing(view.player,r.moveId);
    if(r.hit){effects.burst(view.enemy.x,view.enemy.z);camera.shake=r.moveId==='heavy'?.6:.28;audio.play('hit',r.moveId==='heavy');ui.showOutcome(r);}
    else if(r.outcome==='guarded'){effects.burst((view.player.x+view.enemy.x)/2,(view.player.z+view.enemy.z)/2,'guarded');audio.tone(900,1800,.13,.3,'square');ui.showOutcome(r);}
    else if(r.outcome==='interrupted'){effects.burst(view.player.x,view.player.z,'hurt');audio.play('hurt');ui.showOutcome(r);}
    else {audio.play('dodge');ui.showOutcome(r);}
   }
   if(event.type==='resolved')ui.showOutcome(event.result);
   if(event.type==='hurt'){effects.burst(event.x,event.z,'hurt');audio.play('hurt');}
   if(event.type==='dodge')audio.play('dodge');
   if(event.type==='result'){input.enabled=false;input.clear();ui.result();}
  }game.events.length=0;}
 function frame(now){requestAnimationFrame(frame);if(contextLost)return;
  const raw=Math.max(0,(now-last)/1000),dt=Math.min(.05,raw);last=now;fps+=(1/Math.max(.001,raw)-fps)*.04;
  const running=game.status==='playing';if(running){worldTime+=dt;forest.update(worldTime);accumulator+=dt;
   while(accumulator>=FIXED_DT){input.locked=!!game.cinematic;game.step(FIXED_DT,input.sample());accumulator-=FIXED_DT;events();if(game.status!=='playing'){accumulator=0;break;}}
   input.locked=!!game.cinematic;audio.update(dt);
  }
  const view=poses(game);playerView.update(view.player,worldTime);enemyView.update(view.enemy,worldTime);effects.update(running?dt:0,game,view,$('range-display').checked);camera.update(running?dt:game.status==='ready'?dt:0,game,view);ui.update(running?dt:0,fps);if(running||now-lastDraw>=250){renderer.render(scene,camera.camera);lastDraw=now;}
 }
 requestAnimationFrame(frame);
 window.forestAction=Object.freeze({snapshot:()=>({...game.snapshot(),camera:{zoom:camera.zoom,focus:camera.focus.toArray(),position:camera.camera.position.toArray()},render:{calls:renderer.info.render.calls,triangles:renderer.info.render.triangles},input:{radial:input.joy.radial,orbit:input.joy.orbit,swipes:input.swipes.size,pressed:input.attackPointers.size}})});
} catch(error){console.error(error);fatal('ゲームを起動できませんでした。WebGL対応のSafari / Chromeで開き、通信環境を確認して再読み込みしてください。');}
