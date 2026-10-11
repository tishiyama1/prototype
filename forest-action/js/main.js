import * as THREE from 'three';
import {Game} from './game.js';
import {Input} from './input.js';
import {CameraRig} from './camera.js';
import {CharacterView} from './character.js';
import {Forest} from './forest.js';
import {Effects} from './effects.js';
import {AudioEngine} from './audio.js';
import {UI} from './ui.js';
import {FIXED_DT} from './config.js';
const fatal=message=>{const el=document.getElementById('fatal');el.hidden=false;el.textContent=message;};
window.addEventListener('unhandledrejection',e=>{console.error(e.reason);fatal('ゲームの読み込みに失敗しました。通信環境を確認して再読み込みしてください。');});
try {
  const canvas=document.getElementById('world');
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
  const scene=new THREE.Scene(),game=new Game(),input=new Input(document.getElementById('controls'));
  const camera=new CameraRig(),forest=new Forest(scene),effects=new Effects(scene),audio=new AudioEngine(),ui=new UI(game);
  const playerView=new CharacterView(scene);let enemyViews=[];
  const buildViews=()=>{for(const v of enemyViews)v.destroy();enemyViews=game.enemies.map(()=>new CharacterView(scene,true));effects.clear();effects.createEnemyOverlays(game.enemies);};
  buildViews();let last=performance.now(),accumulator=0,worldTime=0,fps=60,slashedAttack=null,contextLost=false;
  const portrait=()=>matchMedia('(orientation:portrait) and (max-width:900px)').matches;
  const resize=()=>{renderer.setSize(innerWidth,innerHeight,false);camera.resize(innerWidth,innerHeight);if(portrait()&&game.status==='playing')pause();};
  function pause(){if(game.status!=='playing')return;game.status='paused';input.enabled=false;input.clear();accumulator=0;audio.suspend();ui.paused();}
  function start(){if(portrait())return;game.reset();buildViews();camera.x=4;slashedAttack=null;input.clear();input.enabled=true;last=performance.now();accumulator=0;ui.hideOverlay();ui.showHint('J で斬る · 赤い予告は W / S でかわす',5);audio.unlock();}
  document.getElementById('start').addEventListener('click',start);document.getElementById('retry').addEventListener('click',start);document.getElementById('restart').addEventListener('click',start);
  document.getElementById('pause').addEventListener('click',pause);
  document.getElementById('resume').addEventListener('click',()=>{if(portrait())return;game.status='playing';input.clear();input.enabled=true;accumulator=0;last=performance.now();ui.hideOverlay();audio.unlock();});
  document.getElementById('sound').addEventListener('click',()=>{document.getElementById('sound').textContent=audio.toggle()?'音 ON':'音 OFF';if(game.status==='playing')audio.unlock();});
  window.addEventListener('keydown',e=>{if(e.code==='Escape')pause();});
  window.addEventListener('blur',pause);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();last=performance.now();accumulator=0;});
  window.addEventListener('resize',resize);
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();contextLost=true;pause();fatal('描画が停止しました。ページを再読み込みしてください。');});
  resize();ui.ready();
  function frame(now){
    requestAnimationFrame(frame);if(contextLost)return;
    const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;fps+=(1/Math.max(.001,dt)-fps)*.04;
    if(!document.hidden){worldTime+=dt;forest.update(worldTime,game.player,game.enemies);}
    if(game.status==='playing'){
      accumulator+=dt;
      while(accumulator>=FIXED_DT){
        // Preserve edge inputs across hitstop; never consume them during a frozen tick.
        game.step(FIXED_DT,game.hitstop>0?{}:input.sample());accumulator-=FIXED_DT;
        for(const event of game.events){
          audio.play(event.type,event.finish);
          if(event.type==='hit'||event.type==='hurt'){effects.burst(event.x,event.z,event.finish,event.type==='hurt');camera.shake=event.finish ? .5:.28;}
          if(event.type==='result'){input.enabled=false;input.clear();ui.result();audio.suspend();}
        }
        game.events.length=0;
        if(game.player.activeAttack&&slashedAttack!==game.player.attack){effects.swing(game.player);slashedAttack=game.player.attack;}
        if(game.status!=='playing'){accumulator=0;break;}
      }
      audio.update(dt);
    }
    playerView.update(game.player,worldTime);game.enemies.forEach((enemy,i)=>enemyViews[i].update(enemy,worldTime));
    effects.update(game.hitstop>0?0:dt,game,ui.hitboxes);camera.update(dt,game.player);ui.update(game.status==='playing'?dt:0,fps);
    renderer.render(scene,camera.camera);
  }
  requestAnimationFrame(frame);
  // Read-only snapshot for browser QA. No cheats or mutable game objects on the public page.
  window.forestAction={snapshot:()=>({status:game.status,x:game.player.x,lane:game.player.lane,z:game.player.z,hp:game.player.hp,state:game.player.state,facing:game.player.facing,combo:game.player.comboCount,kills:game.kills,time:game.elapsed,score:game.score,enemyStates:game.enemies.map(e=>({x:e.x,lane:e.lane,hp:e.hp,state:e.state})),render:{calls:renderer.info.render.calls,triangles:renderer.info.render.triangles},version:'1.0.0'})};
} catch(error){console.error(error);fatal('ゲームを起動できませんでした。WebGL対応のSafari / Chromeで開き、通信環境を確認して再読み込みしてください。');}
