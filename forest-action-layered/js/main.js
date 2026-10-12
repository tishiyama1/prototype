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
 renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));renderer.autoClear=false;renderer.shadowMap.enabled=false;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
 const scene=new THREE.Scene(),game=new Game(),input=new Input(canvas),camera=new CameraRig(),forest=new Forest(scene),effects=new Effects(scene),audio=new AudioEngine(),ui=new UI(game);
 const playerView=new CharacterView(scene),enemyView=new CharacterView(scene,true);
 let last=performance.now(),accumulator=0,worldTime=0,fps=60,contextLost=false,lastDraw=0,inspecting=false;
 const portrait=()=>matchMedia('(orientation:portrait) and (max-width:900px)').matches;
 function pause(){if(game.status!=='playing')return;game.status='paused';input.enabled=false;input.clear();accumulator=0;audio.suspend();ui.paused();}
 function start(){if(portrait()||!forest.ready)return;inspect(false);game.reset();effects.clear();camera.reset();input.clear();input.enabled=true;input.locked=false;last=performance.now();accumulator=0;ui.hideOverlay();ui.clear();audio.unlock();}
 const resize=()=>{renderer.setSize(innerWidth,innerHeight,false);camera.resize(innerWidth,innerHeight);if(portrait())pause();};
 for(const id of ['start','retry','restart'])$(id).addEventListener('click',start);
 function inspect(active){inspecting=active;$('game-shell').classList.toggle('inspect',active);$('inspect-actions').hidden=!active;if(active){pause();input.enabled=false;input.clear();ui.hideOverlay();}}
 $('inspect-start').addEventListener('click',()=>inspect(true));$('inspect').addEventListener('click',()=>{if(inspecting)$('inspect-resume').click();else inspect(true);});$('inspect-resume').addEventListener('click',()=>{if(game.status==='ready'){start();return;}inspect(false);if(['clear','dead'].includes(game.status)){ui.result();return;}$('resume').click();});
 for(const [id,key]of [['scene-shadows','shadows'],['scene-fog','fogEnabled'],['scene-environment','scenery']])$(id).addEventListener('change',e=>{forest[key]=e.target.checked;});
 $('reset-config').addEventListener('click',()=>{forest.shadows=forest.fogEnabled=forest.scenery=forest.parallax=true;$('scene-parallax').checked=true;for(const id of ['scene-shadows','scene-fog','scene-environment'])$(id).checked=true;});
 $('pause').addEventListener('click',()=>{inspect(false);if(game.status==='paused')ui.paused();else pause();});$('resume').addEventListener('click',()=>{if(portrait())return;inspect(false);game.status='playing';input.clear();input.enabled=true;accumulator=0;last=performance.now();ui.hideOverlay();audio.unlock();});
 $('sound').addEventListener('click',()=>{$('sound').textContent=audio.toggle()?'音 ON':'音 OFF';if(game.status==='playing')audio.unlock();});
 const skip=()=>{if(game.skipPresentation()){input.clear();}};
 $('card-phase').addEventListener('pointerdown',e=>{e.preventDefault();skip();});
 window.addEventListener('keydown',e=>{if(e.code==='Escape')pause();if(e.code==='Space'&&game.cinematic){e.preventDefault();skip();}});window.addEventListener('blur',pause);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();last=performance.now();accumulator=0;});window.addEventListener('resize',resize);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();contextLost=true;pause();fatal('描画が停止しました。ページを再読み込みしてください。');});
 resize();camera.reset();ui.ready();
 $('inspect-start').disabled=true;$('start').disabled=true;$('start').textContent='背景レイヤーを準備しています…';
 forest.loading.then(()=>{$('inspect-start').disabled=false;$('start').disabled=false;$('start').textContent='森の剣鬼に挑む';}).catch(error=>{console.error(error);fatal('背景画像を読み込めませんでした。再読み込みしてください。');});
 $('scene-parallax').addEventListener('change',e=>{forest.parallax=e.target.checked;});
 function events(){for(const event of game.events){
   if(event.type==='attack')audio.play('swing');
   if(event.type==='impact'){
    const r=event.result,view=poses(game);effects.swing(view.player,r.moveId);
    if(r.hit){effects.burst(view.enemy.x,view.enemy.z);camera.shake=r.moveId==='heavy'?.6:.28;audio.play('hit',r.moveId==='heavy');}
    else if(r.outcome==='guarded'){effects.burst((view.player.x+view.enemy.x)/2,(view.player.z+view.enemy.z)/2,'guarded');audio.tone(900,1800,.13,.3,'square');}
    else if(r.outcome==='interrupted'){effects.burst(view.player.x,view.player.z,'hurt');audio.play('hurt');}
    else {audio.play('dodge');}
   }
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
  const view=poses(game);effects.update(running?dt:0,game,view,$('range-display').checked,camera.camera);camera.update(running?dt:game.status==='ready'&&!inspecting?dt:0,game,view);forest.sync(camera.camera,view,inspecting);playerView.update(view.player,worldTime,camera.camera,forest.shadows);enemyView.update(view.enemy,worldTime,camera.camera,forest.shadows);ui.update(running?dt:0,fps);if(running||now-lastDraw>=250){forest.settings();renderer.shadowMap.enabled=false;renderer.clear();renderer.render(forest.groundScene,camera.camera);renderer.clearDepth();renderer.render(scene,camera.camera);lastDraw=now;}
 }
 requestAnimationFrame(frame);
 window.forestAction=Object.freeze({visualInspection:(sampleArena=false)=>{const project=o=>{const b=new THREE.Box3().setFromObject(o),ps=[];for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z]){const p=new THREE.Vector3(x,y,z).project(camera.camera);ps.push([(p.x+1)*innerWidth/2,(1-p.y)*innerHeight/2]);}const xs=ps.map(p=>p[0]),ys=ps.map(p=>p[1]);return {x:Math.min(...xs),y:Math.min(...ys),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)};};const v=poses(game),samples=[];if(sampleArena)for(let i=0;i<48;i++){const a=i*Math.PI/24,x=Math.cos(a)*10.8,z=Math.sin(a)*6.5;samples.push({x,z,visible:forest.visibilityAt(x,z,camera.camera)});}return {hero:project(playerView.body),enemy:project(enemyView.body),visible:[forest.visibilityAt(v.player.x,v.player.z,camera.camera),forest.visibilityAt(v.enemy.x,v.enemy.z,camera.camera)],arenaSamples:samples,meshes:scene.children.filter(o=>o.isMesh).length,dpr:renderer.getPixelRatio()};},snapshot:()=>({...game.snapshot(),camera:{zoom:camera.zoom,focus:camera.focus.toArray(),position:camera.camera.position.toArray()},render:{calls:renderer.info.render.calls,triangles:renderer.info.render.triangles},visual:{style:'layered',layers:forest.snapshot(),sprites:[playerView.frame,enemyView.frame],inspecting,shadows:forest.shadows,fog:forest.fogEnabled,environment:forest.scenery,pitch:90-camera.camera.position.clone().sub(camera.focus).angleTo(new THREE.Vector3(0,1,0))*180/Math.PI},input:{radial:input.joy.radial,orbit:input.joy.orbit,swipes:input.swipes.size,pressed:input.attackPointers.size}})});
} catch(error){console.error(error);fatal('ゲームを起動できませんでした。WebGL対応のSafari / Chromeで開き、通信環境を確認して再読み込みしてください。');}
