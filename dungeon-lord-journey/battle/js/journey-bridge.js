import {journeyContext as context} from './journey-context.js';
const id=new URLSearchParams(location.search).get('journey');
function report(){const s=window.forestAction?.snapshot();if(!s||!['clear','dead'].includes(s.status)||!id)return;parent.postMessage({type:'lord-journey-result',id,status:s.status,creation:s.journey.creation,uses:s.journey.uses},location.origin);}
const retry=document.getElementById('retry');retry.addEventListener('click',e=>{e.stopImmediatePropagation();e.preventDefault();report();},true);
const intro=document.getElementById('intro');intro.querySelector('h1').innerHTML='道を、空けてもらおう。<span>JOURNEY / ENCOUNTER</span>';intro.querySelector('p').textContent=context.creation?'主はまだ物体を作れる。後ろから王の剣で援護する。':'物体生成は、もう渡した。小さくなった主が魔法弾で援護する。';
document.getElementById('restart').textContent='この戦闘をやり直す';
if(parent===window||!id||context.id!==id){document.getElementById('fatal').hidden=false;document.getElementById('fatal').textContent='旅の画面から戦闘を始めてください。';}
