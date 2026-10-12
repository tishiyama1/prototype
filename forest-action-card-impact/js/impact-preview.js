import {Cards} from './cards.js';
import {ImpactUI} from './impact-ui.js';
import {createTimeline,phase} from './attack-phase.js';
import {capture,resolve} from './combat.js';
import {assess} from './assessment.js';
import {moves} from './config.js';
const $=id=>document.getElementById(id),control=new ImpactUI(),game={cinematic:null,presentationTime:0};
const cards=new Cards(game,{mode:()=>control.mode,preview:true});
let move='heavy',outcome='hit',last=performance.now(),live=true,done=false;
function replay(){
 const player={x:0,z:0,yaw:0,hp:100,state:'idle',time:0},enemy={x:0,z:moves[move].range,yaw:Math.PI,hp:120,state:'stagger',time:0,duration:2,remaining:2,kind:'heavy',velocity:{x:0,z:0},aim:{x:0,z:-1},orbitDirection:1};
 const r=resolve(capture(player,enemy,move)),a=assess(r);
 // Only this isolated preview overrides its display label. Real assess() and
 // resolve() are unmodified and always return critical:false today.
 const assessment={...a,outcome:{...a.outcome,type:outcome==='critical'?'CRITICAL':'HIT',critical:outcome==='critical'}};
 game.cinematic={result:r,assessment,timeline:createTimeline(),impact:false,time:0};game.presentationTime=0;last=performance.now();live=true;done=false;
 for(const b of document.querySelectorAll('[data-preview-move]')){const selected=b.dataset.previewMove===move;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));}
 for(const b of document.querySelectorAll('[data-preview-outcome]')){const selected=b.dataset.previewOutcome===outcome;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));}
 $('preview-freeze').textContent='Ⅱ 停止';cards.update();
}
for(const b of document.querySelectorAll('[data-preview-move]'))b.addEventListener('click',()=>{move=b.dataset.previewMove;replay();});
for(const b of document.querySelectorAll('[data-preview-outcome]'))b.addEventListener('click',()=>{outcome=b.dataset.previewOutcome;replay();});
for(const b of document.querySelectorAll('[data-impact]'))b.addEventListener('click',replay);
$('preview-replay').addEventListener('click',replay);
$('preview-freeze').addEventListener('click',()=>{live=!live;last=performance.now();$('preview-freeze').textContent=live?'Ⅱ 停止':'▶ 続ける';});
document.addEventListener('visibilitychange',()=>{last=performance.now();});
function frame(now){requestAnimationFrame(frame);const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;
 const c=game.cinematic;if(live&&!document.hidden&&!done){game.presentationTime+=dt;c.time+=dt;if(phase(c).action>=.54)c.impact=true;if(c.time>=c.timeline.total){done=true;}}
 cards.update();$('preview-state').textContent=done?'再生完了':({'declare':'宣言','reveal':'展開','result':'判定','action':'攻撃','return':'復帰'})[phase(c).name];
}
if(new URLSearchParams(location.search).get('capture')!=='1'){const video=document.querySelector('video');video.src=video.dataset.src;}
replay();requestAnimationFrame(frame);
window.cardImpactPreview=Object.freeze({snapshot:()=>({move,outcome,live,done,clock:game.presentationTime,time:game.cinematic.time,phase:phase(game.cinematic),impact:cards.impact.snapshot()})});
