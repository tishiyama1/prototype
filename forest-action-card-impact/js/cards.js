import {CardImpact} from './card-impact.js';
import {GRADES,TECHNIQUES} from './assessment.js';
import {phase} from './attack-phase.js';
import {clamp,smooth,config} from './config.js';
const names={range:'間合い',opening:'隙',technique:'技',environment:'環境'};
const paths={range:'M8 24H40M8 16V32M40 16V32M18 20L14 24L18 28M30 20L34 24L30 28',opening:'M24 6L38 16V30L24 42L10 30V16Z M24 14V26M24 32V34',technique:'M12 36L36 12M22 8L40 8L40 26M9 29L19 39',environment:'M8 38H40M24 8L10 28H18L12 34H36L30 28H38Z M24 34V40',slash:'M9 37Q12 12 40 10Q24 22 9 37Z M8 9L40 41',thrust:'M24 6L32 18H27V40H21V18H16Z',heavy:'M13 12H35V24H13Z M21 24V40H27V24 M7 34L11 30M37 30L41 34'};
const icon=k=>`<svg viewBox="0 0 48 48" aria-hidden="true"><path d="${TECHNIQUES[k]?.icon||paths[k]}"/></svg>`;
export class Cards {
 constructor(game,options={}){this.game=game;this.root=options.root||document.getElementById('card-phase');this.current=null;this.impact=new CardImpact(options);}
 clear(){this.impact.reset();this.current=null;this.root.hidden=true;this.root.replaceChildren();}
 update(){
  const c=this.game.cinematic;if(!c){if(this.current)this.clear();return;}
  if(c!==this.current){
   this.current=c;const a=c.assessment,tech=TECHNIQUES[a.attack];
   this.root.className=`card-phase move-${a.attack} effect-${tech.effect}`;this.root.dataset.mode=c.timeline.mode;this.root.hidden=false;
   this.root.innerHTML=`<div class="card-stage"><div class="declaration"><span class="tech-emblem">${icon(a.attack)}</span><div><small>TACTICAL JUDGMENT</small><h2>${c.result.move.name}</h2><p>${tech.caption}</p></div><i class="tech-stroke"></i></div><div class="factor-row">${Object.entries(a.factors).map(([key,f])=>`<article class="factor-card grade-${f.grade}" data-factor="${key}" data-grade="${f.grade}"><span class="card-corner top">✦</span><span class="factor-name">${names[key]}</span><span class="factor-icon">${icon(key)}</span><strong>${f.label}</strong><div class="grade-marks" aria-label="評価 ${GRADES[f.grade]} / 5">${Array.from({length:5},(_,i)=>`<i class="${i<GRADES[f.grade]?'lit':''}"></i>`).join('')}</div><p class="factor-reason">${f.reason}</p><p class="factor-detail">${f.detail}</p><span class="card-corner bottom">✦</span></article>`).join('')}</div><div class="judgment ${c.result.hit?'positive':'negative'}"><strong>${a.outcome.type}</strong><span>${a.outcome.damage?`DAMAGE ${a.outcome.damage}`:a.outcome.playerDamage?`被ダメージ ${a.outcome.playerDamage}`:'DAMAGE 0'}</span><p>${a.outcome.reason}</p></div><small class="skip-hint">タップ / Space で演出を短縮</small></div>`;
   this.row=this.root.querySelector('.factor-row');this.cards=[...this.root.querySelectorAll('.factor-card')];this.judgment=this.root.querySelector('.judgment');this.declaration=this.root.querySelector('.declaration');this.impact.attach(this.row,this.cards[2],c.result,a);
  }
  const f=phase(c);this.root.dataset.phase=f.name;this.root.style.setProperty('--effect',config.effectStrength);
  const exit=f.index===4?1-smooth(f.progress):1;
  const dim=f.index>=3?.18:.72;this.root.style.background=`rgba(5,18,16,${dim*exit})`;
  this.root.querySelector('.card-stage').style.opacity=exit;
  this.declaration.style.setProperty('--entry',smooth(clamp(c.time/c.timeline.durations[0],0,1)));
  this.cards.forEach((el,i)=>{const v=smooth(clamp((f.reveal-(c.timeline.mode==='fast'?0:i*.12))/.58,0,1));el.style.opacity=v;el.style.transform=`translateY(${(1-v)*28}px) rotateY(${(1-v)*65}deg) scale(${.90+.10*v})`;});
  const prominent=this.impact.eligible();this.root.classList.toggle('prominent-impact',prominent);this.row.style.opacity=f.index>=3?(prominent?.88:0):1;
  this.declaration.style.opacity=f.index>=3?0:1;
  this.judgment.style.opacity=f.index>=2?1:0;
  this.impact.update(c,this.game.presentationTime);
  this.judgment.style.transform=`translateY(${f.index>=2?0:8}px) scale(${f.index>=2?1:.92})`;
 }
}
