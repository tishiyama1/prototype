const KEY = { KeyA:'left', ArrowLeft:'left', KeyD:'right', ArrowRight:'right', KeyW:'back', KeyS:'front', KeyJ:'attack', KeyK:'dodge' };
export class Input {
  constructor(root) {
    this.held = new Map(); this.edges = new Set(); this.enabled = false;
    this.abort = new AbortController(); const opts = { signal:this.abort.signal };
    window.addEventListener('keydown', e => {
      const action = KEY[e.code]; if (!action || /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
      e.preventDefault(); if (this.enabled && !e.repeat) this.press('key:'+e.code,action);
    },opts);
    window.addEventListener('keyup',e => { if(KEY[e.code]) {e.preventDefault();this.release('key:'+e.code);} },opts);
    window.addEventListener('blur',()=>this.clear(),opts);
    document.addEventListener('visibilitychange',()=>this.clear(),opts);
    for (const button of root.querySelectorAll('[data-action]')) {
      button.addEventListener('pointerdown',e=> {
        e.preventDefault(); if (!this.enabled) return;
        button.setPointerCapture(e.pointerId); this.press('pointer:'+e.pointerId,button.dataset.action);
      },opts);
      button.addEventListener('pointermove',e=> {
        if (!this.held.has('pointer:'+e.pointerId)) return;
        const b=button.getBoundingClientRect();
        if(e.clientX<b.left || e.clientX>b.right || e.clientY<b.top || e.clientY>b.bottom) this.release('pointer:'+e.pointerId);
      },opts);
      for (const event of ['pointerup','pointercancel','lostpointercapture']) button.addEventListener(event,e=>this.release('pointer:'+e.pointerId),opts);
      button.addEventListener('contextmenu', e=>e.preventDefault(),opts);
    }
    this.root = root;
  }
  press(id,action) { if(this.held.has(id))return; this.held.set(id,action); this.edges.add(action); this.paint(); }
  release(id) { this.held.delete(id); this.paint(); }
  paint() { if(!this.root)return; for(const b of this.root.querySelectorAll('[data-action]')) b.classList.toggle('pressed',[...this.held.values()].includes(b.dataset.action)); }
  clear() { this.held.clear();this.edges.clear();this.paint(); }
  sample() {
    const v=[...this.held.values()]; const result={left:v.includes('left'),right:v.includes('right')};
    for(const a of ['attack','dodge','back','front'])result[a]=this.edges.has(a);
    this.edges.clear();return result;
  }
  destroy() { this.abort.abort(); this.clear(); }
}
