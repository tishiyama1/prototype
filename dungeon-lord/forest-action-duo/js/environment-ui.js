import {normalizeMode} from './environment-profile.js';
export class EnvironmentUI{
 constructor(fx,onChange=()=>{}){this.fx=fx;this.live=true;const params=new URLSearchParams(location.search);this.autoDemo=params.get('demo')==='1';this.mode=normalizeMode(params.get('env'));this.gain=1;this.root=document.getElementById('environment-controls');
  for(const b of this.root.querySelectorAll('[data-environment]'))b.addEventListener('click',()=>this.setMode(b.dataset.environment));
  this.root.addEventListener('pointerdown',e=>e.stopPropagation());
  document.getElementById('environment-freeze').addEventListener('click',()=>{this.live=!this.live;this.refresh();onChange();});
  document.getElementById('environment-gain').addEventListener('input',e=>{this.gain=Number(e.target.value)/100;this.apply();onChange();});
  document.getElementById('scene-environment').addEventListener('change',e=>this.setMode(e.target.checked?'normal':'off'));
  this.apply();
 }
 setMode(mode){this.mode=normalizeMode(mode);this.apply();}
 apply(){this.fx.setMode(this.mode,this.gain);this.refresh();}
 refresh(){for(const b of this.root.querySelectorAll('[data-environment]')){const selected=b.dataset.environment===this.mode;b.setAttribute('aria-pressed',String(selected));b.classList.toggle('selected',selected);}this.root.dataset.mode=this.mode;document.getElementById('scene-environment').checked=this.mode!=='off';document.getElementById('environment-gain').value=Math.round(this.gain*100);document.getElementById('environment-gain-value').textContent=Math.round(this.gain*100)+'%';document.getElementById('environment-freeze').textContent=this.live?'環境停止':'環境再生';document.getElementById('environment-state').textContent=this.live?'人物固定 · 環境再生':'人物固定 · 環境停止';}
 reset(){this.live=true;this.gain=1;this.setMode('normal');}
}
