import {ImpactUI} from './impact-ui.js';
import * as THREE from 'three';
import {Game} from './game.js';
import {Input} from './input.js';
import {CameraRig} from './camera.js';
import {CharacterView} from './character.js';
import {Forest} from './forest.js';
import {LordEffects as Effects} from './lord-effects.js';
import {STAGES,stageOf} from './progression.js';
import {Cave} from './cave.js';
import {AudioEngine} from './audio.js';
import {UI} from './ui.js?v=wide1';
import {poses} from './presentation.js';
import {EnvironmentEffects} from './environment-effects.js';
import {EnvironmentUI} from './environment-ui.js';
import {FIXED_DT} from './config.js';
const $=id=>document.getElementById(id);
const fatal=message=>{$('fatal').hidden=false;$('fatal').textContent=message;};
window.addEventListener('unhandledrejection',e=>{console.error(e.reason);fatal('ゲームの読み込みに失敗しました。通信環境を確認して再読み込みしてください。');});
try {
 const sceneKind=new URLSearchParams(location.search).get('scene')==='cave'?'cave':'forest';
 const canvas=$('world'),renderer=new THREE.WebGLRenderer({canvas,antialias:sceneKind!=='cave',alpha:sceneKind==='cave',powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));renderer.autoClear=false;renderer.shadowMap.enabled=false;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
 const impactUI=new ImpactUI();const scene=new THREE.Scene(),game=new Game(),input=new Input(canvas),camera=new CameraRig(),forest=sceneKind==='cave'?new Cave(scene):new Forest(scene),effects=new Effects(scene),audio=new AudioEngine(),ui=new UI(game,{mode:()=>impactUI.mode});
 forest.scenery=false;const ambient=new EnvironmentEffects(scene,sceneKind,forest),environmentUI=new EnvironmentUI(ambient);
 const views=new Map(game.actors.map(a=>[a.id,new CharacterView(scene,a.team==='enemy',{id:a.id,archetype:a.id==='lord'?'dungeon-lord':a.id==='enemy-b'?'support':a.id==='enemy-a'?'sword-fiend':'adventurer'})]));
 game.setStage(stageOf(new URLSearchParams(location.search).get('stage')),false);
 const playerView=views.get('player');
 document.querySelector('.subtitle').textContent=sceneKind==='cave'?'洞窟の共闘':'古道の共闘';
 const labels=new Map(game.actors.map(a=>{const el=document.createElement(a.team==='enemy'?'button':'div');el.className='actor-label '+(a.team==='enemy'?'enemy':'ally');el.setAttribute('aria-label',a.name);el.innerHTML='<b></b><small></small><i></i>';if(a.team==='enemy')el.addEventListener('click',()=>game.selectEnemy(a.id));$('actor-labels').append(el);return[a.id,el];}));
 for(const b of document.querySelectorAll('[data-target]'))b.addEventListener('click',()=>game.selectEnemy(b.dataset.target));
 function teamUI(view){const tag=id=>id==='player'?'人間':id==='lord'?'主':id==='enemy-a'?'A':id==='enemy-b'?'B':'—';for(const a of game.actors){const el=labels.get(a.id),pose=view.actors[a.id],pt=new THREE.Vector3(0,2.35*(pose.visualScale||1),0).applyQuaternion(camera.camera.quaternion).add(new THREE.Vector3(pose.x,0,pose.z)).project(camera.camera);el.style.left=(pt.x+1)*innerWidth/2+'px';el.style.top=(1-pt.y)*innerHeight/2+'px';el.classList.toggle('selected',a.id===game.targets.active?.id);el.classList.toggle('dead',a.hp<=0);el.querySelector('b').textContent=tag(a.id)+' '+a.hp;el.querySelector('small').textContent=a.hp<=0?'倒れた':(a.focusId?'→ '+tag(a.focusId)+' · ':'')+({wary:'警戒',idle:'待機',move:'移動',dash:'回避',approach:'接近',orbit:'旋回',retreat:'離脱',guard:'防御',windup:'構え',attack:'攻撃',recovery:'硬直',stagger:'崩れ',hurt:'被弾'}[a.state]||a.state);el.querySelector('i').style.width=a.hp/a.maxHP*100+'%';if(el.tagName==='BUTTON')el.disabled=a.hp<=0||!!game.cinematic||!!game.guardian;}
 $('lord-hp').textContent=game.lord.hp;$('lord-fill').style.width=game.lord.hp/game.lord.maxHP*100+'%';for(const [id,prefix]of [['enemy-a','a'],['enemy-b','b']]){const a=game.actor(id);$(prefix+'-hp').textContent=a.hp;$(prefix+'-fill').style.width=a.hp/a.maxHP*100+'%';const b=document.querySelector('[data-target="'+id+'"]');b.classList.toggle('selected',game.targets.active?.id===id);b.setAttribute('aria-pressed',game.targets.active?.id===id);b.disabled=a.hp<=0||!!game.cinematic||!!game.guardian;}
 $('game-shell').classList.toggle('spectating',game.player.hp<=0);$('duo-notice').textContent=game.player.hp<=0&&game.status==='playing'?'人間が倒れました · 主の戦いを見守っています':game.debugRun?'検証用戦闘 · HPと配置を設定しています':game.pendingTarget?'回避後にターゲットを切り替えます':'';}
 function stageUI(){for(const b of document.querySelectorAll('[data-stage]')){b.classList.toggle('selected',b.dataset.stage===game.stageId);b.setAttribute('aria-pressed',b.dataset.stage===game.stageId);}const st=game.stage;$('stage-description').textContent=st.name+'：'+st.description;$('lord-preview').textContent=st.lordAttack==='kings-swords'?'王の剣を再生':'魔法弾を再生';$('stage-stats').textContent=`${st.name} · 人間HP ${st.heroHP} / 主HP ${st.lordHP}\n人間の威力 ${Object.values(game.currentMoves).map(m=>m.damage).join(' / ')}\n主の威力 ${st.lordPower} / 大きさ ${st.lordScale}倍\n敵A HP120 / 敵B HP75（全段階固定）`;for(const a of document.querySelectorAll('.version-links a')){const u=new URL(a.href);if(u.pathname===location.pathname&&u.searchParams.has('scene')){u.searchParams.set('stage',game.stageId);a.href=u.pathname+u.search;}}}
 for(const b of document.querySelectorAll('[data-stage]'))b.addEventListener('click',()=>{const playing=game.status!=='ready';game.stageId=b.dataset.stage;if(playing)start();else{game.setStage(b.dataset.stage,false);effects.clear();camera.reset();ui.clear();}stageUI();const u=new URL(location.href);u.searchParams.set('stage',game.stageId);history.replaceState(null,'',u);});
 for(const b of document.querySelectorAll('[data-scenario]'))b.addEventListener('click',()=>{start();game.debugScenario(b.dataset.scenario);$('debug-panel').hidden=true;events();});stageUI();
 let last=performance.now(),accumulator=0,worldTime=0,environmentTime=0,fps=60,contextLost=false,lastDraw=0,inspecting=false;
 const portrait=()=>matchMedia('(orientation:portrait) and (max-width:900px)').matches;
 function pause(){if(game.status!=='playing')return;game.status='paused';input.enabled=false;input.clear();accumulator=0;audio.suspend();ui.paused();}
 function start(){if(portrait()||!forest.ready)return;inspect(false);game.reset();effects.clear();camera.reset();input.clear();input.enabled=true;input.locked=false;last=performance.now();accumulator=0;ui.hideOverlay();ui.clear();audio.unlock();}
 const resize=()=>{renderer.setSize(innerWidth,innerHeight,false);camera.resize(innerWidth,innerHeight);if(portrait())pause();};
 for(const id of ['start','retry','restart'])$(id).addEventListener('click',start);
 function inspect(active){inspecting=active;$('game-shell').classList.toggle('inspect',active);$('inspect-actions').hidden=!active;if(active){pause();input.enabled=false;input.clear();ui.hideOverlay();last=performance.now();environmentUI.refresh();}}
 $('inspect-start').addEventListener('click',()=>inspect(true));$('inspect').addEventListener('click',()=>{if(inspecting)$('inspect-resume').click();else inspect(true);});$('inspect-resume').addEventListener('click',()=>{if(game.status==='ready'){start();return;}inspect(false);if(['clear','dead'].includes(game.status)){ui.result();return;}$('resume').click();});
 for(const [id,key]of [['scene-shadows','shadows'],['scene-fog','fogEnabled']])$(id).addEventListener('change',e=>{forest[key]=e.target.checked;});
 $('reset-config').addEventListener('click',()=>{forest.shadows=forest.fogEnabled=forest.parallax=true;environmentUI.reset();$('scene-parallax').checked=true;for(const id of ['scene-shadows','scene-fog','scene-environment'])$(id).checked=true;});
 $('pause').addEventListener('click',()=>{inspect(false);if(game.status==='paused')ui.paused();else pause();});$('resume').addEventListener('click',()=>{if(portrait())return;inspect(false);game.status='playing';input.clear();input.enabled=true;accumulator=0;last=performance.now();ui.hideOverlay();audio.unlock();});
 $('sound').addEventListener('click',()=>{$('sound').textContent=audio.toggle()?'音 ON':'音 OFF';if(game.status==='playing')audio.unlock();});
 const skip=()=>{if(game.skipPresentation()){input.clear();}};
 $('card-phase').addEventListener('pointerdown',e=>{e.preventDefault();skip();});
 window.addEventListener('keydown',e=>{if(e.code==='Tab'&&game.status==='playing'){e.preventDefault();game.cycleEnemy();}if(e.code==='Escape')pause();if(e.code==='Space'&&game.cinematic){e.preventDefault();skip();}});window.addEventListener('blur',pause);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();last=performance.now();accumulator=0;});window.addEventListener('resize',resize);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();contextLost=true;pause();fatal('描画が停止しました。ページを再読み込みしてください。');});
 resize();camera.reset();ui.ready();
 $('inspect-start').disabled=true;$('start').disabled=true;$('start').textContent='背景レイヤーを準備しています…';
 forest.loading.then(()=>{$('inspect-start').disabled=false;$('start').disabled=false;$('start').textContent='選んだ段階で戦う';if(environmentUI.autoDemo)inspect(true);}).catch(error=>{console.error(error);fatal('背景画像を読み込めませんでした。再読み込みしてください。');});
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
   if(event.type==='npc-attack'){const a=game.actor(event.actorId);effects.swing(a,event.move);audio.play('swing');}
   if(event.type==='npc-guard'){const a=game.actor(event.actorId);effects.burst(a.x,a.z,'guarded');}
   if(event.type==='hurt'){effects.burst(event.x,event.z,'hurt');audio.play('hurt');}
   if(event.type==='king-swords'){effects.flash(event.x,event.z,'royal');audio.tone(440,880,.16,.12,'square');}
   if(event.type==='swords-impact'){effects.burst(event.x,event.z);effects.flash(event.x,event.z,'royal');camera.shake=.45;audio.play('hit',true);}
   if(event.type==='lord-magic')audio.tone(580,760,.1,.10,'square');
   if(event.type==='guardian-start'){effects.flash(game.player.x,game.player.z,'protect');effects.flash(game.lord.x,game.lord.z,'protect');audio.play('dodge');}
   if(event.type==='guardian-hit'){effects.burst(event.x,event.z,'hurt');camera.shake=.35;audio.play('hurt');}
   if(event.type==='guardian-counter'){effects.flash(event.x,event.z,'protect');effects.swing({...game.lord,yaw:game.lord.yaw},'heavy');audio.play('hit',true);}
   if(event.type==='dodge')audio.play('dodge');
   if(event.type==='result'){input.enabled=false;input.clear();ui.result();}
  }game.events.length=0;}
 function frame(now){requestAnimationFrame(frame);if(contextLost)return;
  const raw=Math.max(0,(now-last)/1000),dt=Math.min(.05,raw);last=now;fps+=(1/Math.max(.001,raw)-fps)*.04;
  const running=game.status==='playing';if(running){worldTime+=dt;accumulator+=dt;
   while(accumulator>=FIXED_DT){input.locked=!!game.cinematic||!!game.guardian;game.step(FIXED_DT,input.sample());accumulator-=FIXED_DT;events();if(game.status!=='playing'){accumulator=0;break;}}
   input.locked=!!game.cinematic||!!game.guardian;audio.update(dt);
  }
  const envRunning=!document.hidden&&!portrait()&&(running||(inspecting&&environmentUI.live));if(envRunning)environmentTime+=Math.min(1,raw);
  const view=poses(game);$('guardian-banner').hidden=!game.guardian;$('guardian-banner').textContent=game.guardian?(game.guardian.received?game.guardian.survived?'身代わり · 主が押し返す':'身代わり · 最後まで守る':game.stageId==='early'?'転移 · あなたを守る':'疾駆 · あなたを守る'):'';effects.update(running?dt:0,game,view,$('range-display').checked,camera.camera);camera.update(running?dt:game.status==='ready'&&!inspecting?dt:0,game,view);forest.sync(camera.camera,view,inspecting);ambient.update(environmentTime,camera.camera,view);for(const [id,character]of views)character.update({...view.actors[id],selected:id===game.targets.active?.id},worldTime,camera.camera,forest.shadows);teamUI(view);ui.update(running?dt:0,fps);if(running||(inspecting&&!portrait())||now-lastDraw>=250){forest.settings();renderer.shadowMap.enabled=false;renderer.clear();if(sceneKind==='forest'){renderer.render(forest.groundScene,camera.camera);renderer.clearDepth();}renderer.render(scene,camera.camera);lastDraw=now;}
 }
 requestAnimationFrame(frame);
 window.forestAction=Object.freeze({visualInspection:(sampleArena=false)=>{const project=o=>{const b=new THREE.Box3().setFromObject(o),ps=[];for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z]){const p=new THREE.Vector3(x,y,z).project(camera.camera);ps.push([(p.x+1)*innerWidth/2,(1-p.y)*innerHeight/2]);}const xs=ps.map(p=>p[0]),ys=ps.map(p=>p[1]);return {x:Math.min(...xs),y:Math.min(...ys),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)};};const v=poses(game),samples=[];if(sampleArena)for(let i=0;i<48;i++){const a=i*Math.PI/24,x=Math.cos(a)*10.8,z=Math.sin(a)*6.5;samples.push({x,z,visible:forest.visibilityAt(x,z,camera.camera)});}return {hero:project(playerView.body),enemy:project(views.get(game.enemy.id).body),visible:[forest.visibilityAt(v.player.x,v.player.z,camera.camera),forest.visibilityAt(v.enemy.x,v.enemy.z,camera.camera)],arenaSamples:samples,meshes:scene.children.filter(o=>o.isMesh).length,dpr:renderer.getPixelRatio()};},snapshot:()=>({...game.snapshot(),camera:{zoom:camera.zoom,focus:camera.focus.toArray(),position:camera.camera.position.toArray()},render:{calls:renderer.info.render.calls,triangles:renderer.info.render.triangles},visual:{style:'progression',cardImpact:ui.cards.impact.snapshot(),layers:forest.snapshot(),sprites:Object.fromEntries([...views].map(([id,v])=>[id,v.frame])),scene:sceneKind,inspecting,shadows:forest.shadows,fog:forest.fogEnabled,environment:ambient.snapshot(),environmentLive:environmentUI.live,pitch:90-camera.camera.position.clone().sub(camera.focus).angleTo(new THREE.Vector3(0,1,0))*180/Math.PI},input:{enabled:input.enabled,locked:input.locked,radial:input.joy.radial,orbit:input.joy.orbit,swipes:input.swipes.size,pressed:input.attackPointers.size}})});
} catch(error){console.error(error);fatal('ゲームを起動できませんでした。WebGL対応のSafari / Chromeで開き、通信環境を確認して再読み込みしてください。');}
