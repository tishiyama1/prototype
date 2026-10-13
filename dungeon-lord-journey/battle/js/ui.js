import {config,moves,resetConfig} from './config.js';
import {Cards} from './cards.js?v=wide1';
import {OUTCOMES} from './combat.js';
const $=id=>document.getElementById(id);
export const formatTime=s=>{const n=Math.max(0,Math.round(s*10));return `${Math.floor(n/600)}:${String(Math.floor(n/10)%60).padStart(2,'0')}.${n%10}`;};
export const STATES={wary:'警戒',guard:'防御',approach:'接近',retreat:'離脱',orbit:'回り込み',windup:'攻撃準備',attack:'攻撃',recovery:'硬直',hurt:'被弾',stagger:'体勢崩れ',dead:'撃破'};
const tunings=[['移動',[
 ['speed','接近・離脱速度',1,7,.1],['orbitSpeed','回り込み速度',1,7,.1],['dashDistance','高速移動距離',1,5,.1],['invincibility','回避無敵 (秒)',.05,.24,.01],['dashCooldown','回避クールダウン (秒)',.3,2,.05]]],
 ['判定条件',[
 ['flankAngle','正面と側面の境界 (度)',30,100,1],['lateralTolerance','突きの横移動許容幅',.1,1,.02],['guardBreak','強打の防御崩し距離倍率',.65,1.3,.05],['interceptGrace','迎撃の猶予 (秒)',0,.1,.005]]],
 ['カメラ・演出',[
 ['pitch','通常時の俯角 (度)',35,70,1],['zoom','通常ズーム',.7,1.5,.05],['attackZoom','攻防の微ズーム倍率',1,1.4,.02],['cameraSpeed','カメラ遷移速度',3,18,.5],['cinemaSpeed','カード演出速度',.5,3,.05],['declareTime','攻撃宣言 (秒)',.05,.5,.01],['revealTime','カード展開 (秒)',.1,1,.01],['resultTime','総合判定 (秒)',.1,1.5,.01],['actionTime','3D攻防 (秒)',.15,.7,.01],['returnTime','復帰 (秒)',.05,.5,.01],['effectStrength','カードの発光強度',0,1.5,.1]]]];
export class UI {
 constructor(game,cardOptions={}){this.game=game;this.cards=new Cards(game,cardOptions);this.inputs=[];
  for(const [title,items]of tunings){this.group(title);for(const row of items)this.slider(config,...row);}
  for(const [id,move]of Object.entries(moves)){this.group(move.name);this.slider(move,'step','最大自動踏み込み',0,4,.1,id);this.slider(move,'range','最適間合い',1,3,.1,id);this.slider(move,'startup','発生時間 (秒)',.1,1,.01,id);this.slider(move,'damage','威力',1,50,1,id);}
  $('card-mode').addEventListener('change',e=>config.cardMode=e.target.value);
  $('cinema-enabled').addEventListener('change',e=>config.cinema=e.target.checked);
  $('reset-config').addEventListener('click',()=>{resetConfig();for(const {input,output,obj,key}of this.inputs){input.value=obj[key];output.textContent=obj[key];}$('cinema-enabled').checked=config.cinema;$('card-mode').value=config.cardMode;});
 }
 group(title){const el=document.createElement('div');el.className='tune-group';el.textContent=title;$('sliders').append(el);}
 slider(obj,key,label,min,max,step,prefix=''){const wrap=document.createElement('div'),id='tune-'+(prefix?prefix+'-':'')+key;wrap.innerHTML=`<label class="slider-label" for="${id}">${label}<output>${obj[key]}</output></label><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${obj[key]}">`;const input=wrap.querySelector('input'),output=wrap.querySelector('output');input.addEventListener('input',()=>{obj[key]=Number(input.value);output.textContent=obj[key];});$('sliders').append(wrap);this.inputs.push({input,output,obj,key});}
 ready(){$('start').disabled=false;$('start').textContent='剣を交える';}
 hideOverlay(){$('overlay').hidden=true;for(const id of ['intro','result','pause-panel'])$(id).hidden=true;}
 paused(){this.hideOverlay();$('overlay').hidden=false;$('pause-panel').hidden=false;}
 clear(){this.cards.clear();}
 update(dt,fps){this.cards.update();const g=this.game,p=g.player,e=g.enemy,m=g.currentMoves[g.selected],rel=g.targets.snapshot(p)||{distance:0,angle:0};
  $('hp-text').textContent=p.hp;$('hp-fill').style.width=p.hp/p.maxHP*100+'%';$('enemy-hp-text').textContent=e.hp;$('enemy-hp-fill').style.width=e.hp/e.maxHP*100+'%';
  $('enemy-intent').textContent='敵前衛 · '+(STATES[e.state]||e.state)+(e.state==='windup'?' · '+(e.role==='support'?'呪弾':e.kind==='rush'?'突進':e.kind==='heavy'?'大振り':'斬撃'):'');$('distance-label').textContent=`間合い ${rel.distance.toFixed(1)} · ${Math.abs(rel.angle)<65?'正面':'側面'}`;$('timer').textContent=formatTime(g.elapsed);
  $('dash-ready').textContent=p.cooldown>0?`${p.cooldown.toFixed(1)}s`:'回避 OK';$('attack-name').textContent=m.name;$('attack').querySelector('span').textContent=p.attackCooldown>0?`構え直し ${p.attackCooldown.toFixed(1)}s`:'攻撃';$('move-range').textContent=`選択中：${m.name} · 射程 ${(m.range+m.step).toFixed(1)} / 威力 ${m.damage}`;
  for(const b of document.querySelectorAll('[data-move]')){const selected=b.dataset.move===g.selected;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',selected);}
  $('game-shell').classList.toggle('busy',!!g.cinematic||!!g.guardian||!!g.fleeing);$('attack').disabled=!!g.cinematic||!!g.guardian||!!g.fleeing||p.state==='hurt'||!!p.dash||p.attackCooldown>0||p.hp<=0||g.status!=='playing';
  if(!$('debug-panel').hidden)$('debug-status').textContent=`${Math.round(fps)} FPS · ${g.cinematic?'攻防演出 / 通常時間停止':'リアルタイム'}\n敵：${STATES[e.state]} / 残り ${e.remaining.toFixed(2)}s\n距離 ${rel.distance.toFixed(2)} · 相対角度 ${rel.angle.toFixed(1)}°\n技：${m.name} · HP ${p.hp} / ${e.hp}\n戦闘 ${g.elapsed.toFixed(2)}s / 演出 ${g.presentationTime.toFixed(2)}s\n${g.lastResult?.reason||'攻撃すると判定理由を表示します'}`;
  if(!$('debug-panel').hidden)$('debug-status').textContent+='\n'+g.actors.map(a=>`${a.name}: ${a.hp} HP / ${a.state} → ${a.focusId||'—'}`).join('\n')+`\n主：${g.stats.lordHits}命中 / ${g.stats.lordDamage}ダメージ / ${g.stats.lordStops}足止め · 弾 ${g.projectiles.length}`;
  if(!$('debug-panel').hidden&&g.lastResult){const a=g.lastResult,s=a.snapshot,assessment=g.snapshot().last.assessment;$('debug-status').textContent+=`\n指示時：${s.move.name} / 敵 ${STATES[s.enemy.state]}\n距離 ${a.distance.toFixed(2)} / 角度 ${a.angle.toFixed(1)}°\n${Object.entries(assessment.factors).map(([k,f])=>`${({range:'間合い',opening:'隙',posture:'体勢',environment:'環境',attackMethod:'攻撃手段'})[k]}：${f.label} [${f.grade}] · ${f.detail}`).join('\n')}\n総合 ${assessment.outcome.type} / ダメージ ${a.damage} / 被ダメージ ${a.playerDamage}`;}
 }
 result(){const g=this.game,clear=g.status==='clear';$('lord-result').textContent=`主の援護：${g.stats.lordHits}命中 / ${g.stats.lordDamage}ダメージ / ${g.stats.lordStops}足止め · 主の被ダメージ ${g.lord.damageTaken} · 身代わり ${g.stats.sacrifices}回 · 人間 ${g.stats.heroDamage} / 主 ${g.stats.lordDamage}ダメージ${g.debugRun?' · 検証用戦闘':''}`;$('result-eyebrow').textContent=clear?'DUEL COMPLETE':'FALLEN IN THE FOREST';$('result-title').textContent=clear?'二人で、切り開いた。':g.lastGuardian?.survived===false?'主は、あなたを守った。':'主が、倒れた。';$('result-time').textContent=formatTime(g.elapsed);$('result-damage').textContent=g.player.damageTaken;$('result-attacks').textContent=g.attacks;$('result-accuracy').textContent=g.accuracy.toFixed(0)+'%';$('result-breakdown').replaceChildren();for(const [key,name]of Object.entries(OUTCOMES)){const el=document.createElement('span');el.innerHTML=`${name}<b>${g.counts[key]}</b>`;$('result-breakdown').append(el);}this.hideOverlay();$('overlay').hidden=false;$('result').hidden=false;}
}
