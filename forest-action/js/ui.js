import {config,DEFAULTS,STAGE_END,clamp} from './config.js';
const $=id=>document.getElementById(id);
export const formatTime=s=>{const ticks=Math.max(0,Math.round(s*10));return `${Math.floor(ticks/600)}:${String(Math.floor(ticks/10)%60).padStart(2,'0')}.${ticks%10}`;};
const sliders=[['speed','移動速度',2,10,.1],['acceleration','加速度',10,100,1],['deceleration','減速度',10,100,1],['attackSpeed','攻撃速度',.5,2,.05],['attackRange','攻撃範囲',1,3,.05],['hitstop','ヒットストップ (秒)',0,.12,.005],['dodgeDistance','回避距離',1,4,.1],['invincibility','回避無敵 (秒)',.05,.28,.01],['laneTime','レーン切替 (秒)',.1,.6,.01],['laneDistance','レーン間距離',1.7,4,.1],['pitch','カメラ俯角 (度)',15,40,1],['zoom','ズーム',.7,1.5,.05],['follow','カメラ追従',2,20,.5],['screenPosition','画面内の左右位置',.25,.65,.01]];
export class UI {
  constructor(game) {
    this.game=game;this.hintTTL=0;this.best={};
    try{const saved=JSON.parse(localStorage.getItem('forest-action:best:v1')||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))this.best=saved;}catch{}
    for(const [key,label,min,max,step] of sliders){const wrap=document.createElement('div');wrap.innerHTML=`<label class="slider-label" for="tune-${key}">${label}<output>${config[key]}</output></label><input id="tune-${key}" type="range" min="${min}" max="${max}" step="${step}" value="${config[key]}">`;wrap.querySelector('input').addEventListener('input',e=>{config[key]=Number(e.target.value);wrap.querySelector('output').textContent=config[key];});$('sliders').append(wrap);}
    $('reset-config').addEventListener('click',()=>{Object.assign(config,DEFAULTS);for(const [key]of sliders){const input=$('tune-'+key);input.value=config[key];input.parentNode.querySelector('output').textContent=config[key];}});
    $('debug-toggle').addEventListener('click',()=>{$('debug-panel').hidden=!$('debug-panel').hidden;});$('debug-close').addEventListener('click',()=>{$('debug-panel').hidden=true;});
  }
  get hitboxes(){return $('hitboxes').checked;}
  ready(){$('start').disabled=false;$('start').textContent='森へ入る';}
  hideOverlay(){$('overlay').hidden=true;for(const id of ['intro','result','pause-panel'])$(id).hidden=true;}
  paused(){$('overlay').hidden=false;$('intro').hidden=true;$('result').hidden=true;$('pause-panel').hidden=false;}
  showHint(message,seconds=3){$('hint').textContent=message;this.hintTTL=seconds;$('hint').classList.add('show');}
  update(dt,fps) {
    const g=this.game,p=g.player;
    $('hp-text').textContent=p.hp;$('hp-fill').style.width=p.hp+'%';
    $('lane-label').textContent=p.state==='lane'?'切替中 → '+(p.transition.to?'BACK':'FRONT'):(p.lane?'BACK · 奥':'FRONT · 手前');
    $('progress-fill').style.width=clamp(p.x/STAGE_END*100,0,100)+'%';
    $('progress-text').textContent=p.x>61?(g.kills<g.enemies.length?'残った敵を倒して出口へ':'森の出口'):'森の小径';
    $('stats').textContent=`${formatTime(g.elapsed)} · ${g.kills} / ${g.enemies.length}`;
    $('dodge-ready').style.transform=`translateY(${clamp(p.dodgeCooldown/.64,0,1)*100}%)`;
    $('combo').textContent=p.state==='attack' && p.attack.index>0?(p.attack.index===2?'III · FINISH':'II · COMBO'):'';
    if(!$('debug-panel').hidden)$('debug-status').textContent=`${Math.round(fps)} FPS · HP ${p.hp}\n${p.lane?'BACK':'FRONT'} · ${p.state}${p.invincible?' · 無敵':''}`;
    if(this.hintTTL>0){this.hintTTL-=dt;if(this.hintTTL<=0)$('hint').classList.remove('show');}
  }
  result(){
    const g=this.game,clear=g.status==='clear';
    $('result-eyebrow').textContent=clear?'FOREST CLEARED':'FALLEN IN THE FOREST';$('result-title').textContent=clear?'森を抜けた。':'まだ、森の途中。';
    $('result-time').textContent=formatTime(g.elapsed);$('result-kills').textContent=`${g.kills} / ${g.enemies.length}`;$('result-damage').textContent=g.player.damageTaken;$('result-score').textContent=g.score.toLocaleString();
    if(clear){this.best.time=Math.min(Number.isFinite(this.best.time)?this.best.time:Infinity,g.elapsed);this.best.score=Math.max(Number.isFinite(this.best.score)?this.best.score:0,g.score);try{localStorage.setItem('forest-action:best:v1',JSON.stringify(this.best));}catch{}}
    $('best').textContent=Number.isFinite(this.best.time)?`BEST ${formatTime(this.best.time)} / ${this.best.score.toLocaleString()} pts`:'赤い予告を見たら、奥・手前へ。';
    $('intro').hidden=true;$('pause-panel').hidden=true;$('result').hidden=false;$('overlay').hidden=false;
  }
}
