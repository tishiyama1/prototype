export class AudioEngine {
  constructor(){this.enabled=true;this.clock=0;}
  async unlock(){try {if(!this.context){this.context=new(window.AudioContext||window.webkitAudioContext)();this.master=this.context.createGain();this.master.gain.value=this.enabled ? .23:0;this.master.connect(this.context.destination);this.createWind();}await this.context.resume();}catch{}}
  createWind(){const c=this.context,buffer=c.createBuffer(1,c.sampleRate*3,c.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;this.noiseBuffer=buffer;const wind=c.createBufferSource();wind.buffer=buffer;wind.loop=true;const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=260;const g=c.createGain();g.gain.value=.10;wind.connect(f).connect(g).connect(this.master);wind.start();}
  toggle(){this.enabled=!this.enabled;if(this.master)this.master.gain.setTargetAtTime(this.enabled ? .23:0,this.context.currentTime,.04);return this.enabled;}
  suspend(){if(this.context)this.context.suspend().catch(()=>{});}
  tone(from,to,duration,volume=.25,type='triangle') {
    if(!this.context||this.context.state!=='running'||!this.enabled)return;
    const c=this.context,t=c.currentTime,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(from,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,to),t+duration);g.gain.setValueAtTime(volume,t);g.gain.exponentialRampToValueAtTime(.001,t+duration);o.connect(g).connect(this.master);o.start(t);o.stop(t+duration);
  }
  noise(duration=.10){if(!this.context||this.context.state!=='running'||!this.enabled)return;const c=this.context,t=c.currentTime,n=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter();n.buffer=this.noiseBuffer;f.type='highpass';f.frequency.value=1500;g.gain.setValueAtTime(.22,t);g.gain.exponentialRampToValueAtTime(.001,t+duration);n.connect(f).connect(g).connect(this.master);n.start(t);n.stop(t+duration);}
  play(type,finish=false){if(type==='swing'){this.noise(.12);}if(type==='hit'){this.tone(finish?140:210,50,.13,finish ? .6:.4,'triangle');this.noise(.065);}if(type==='hurt')this.tone(95,35,.23,.5,'sawtooth');if(type==='dodge')this.noise(.18);if(type==='lane')this.tone(520,700,.09,.08,'sine');}
  update(dt){this.clock+=dt;if(this.clock>7){this.clock=0;this.tone(1400,2000,.11,.045,'sine');}}
}
