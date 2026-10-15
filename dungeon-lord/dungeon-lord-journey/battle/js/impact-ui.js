import {normalizeImpactMode} from './impact-spec.js';
export class ImpactUI{
 constructor(root=document.getElementById('impact-controls')){
  this.root=root;this.mode=normalizeImpactMode(new URLSearchParams(location.search).get('impact'));
  root.addEventListener('pointerdown',e=>e.stopPropagation());
  for(const b of root.querySelectorAll('[data-impact]'))b.addEventListener('click',()=>this.set(b.dataset.impact));
  this.set(this.mode);
 }
 set(mode){this.mode=normalizeImpactMode(mode);for(const b of this.root.querySelectorAll('[data-impact]')){const selected=b.dataset.impact===this.mode;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));}}
}
