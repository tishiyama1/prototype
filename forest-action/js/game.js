import {Player} from './player.js';
import {spawnEnemies} from './enemy.js';
import {resolveCombat} from './combat.js';
import {config,STAGE_END} from './config.js';
export class Game {
  constructor() {this.config=config;this.events=[];this.reset();this.status='ready';}
  reset(){this.player=new Player();this.enemies=spawnEnemies();this.kills=0;this.elapsed=0;this.hitstop=0;this.status='playing';this.events=[];}
  emit(type,data={}){this.events.push({type,...data});}
  step(dt,input) {
    if(this.status!=='playing')return;
    // elapsed is active play time, including hitstop; simulation timers all freeze together.
    this.elapsed+=dt;
    if(this.hitstop>0) {this.hitstop=Math.max(0,this.hitstop-dt);return;}
    const old=this.player.state, oldAttack=this.player.attack;
    this.player.update(dt,input);
    if(this.player.state==='attack' && oldAttack!==this.player.attack)this.emit('swing');
    if(old!=='dodge' && this.player.state==='dodge')this.emit('dodge');
    if(old!=='lane' && this.player.state==='lane')this.emit('lane');
    for(const e of this.enemies)e.update(dt,this.player);
    resolveCombat(this);
    if(this.player.hp===0 && this.player.time>.8){this.status='dead';this.emit('result');}
    if(this.player.hp>0 && this.player.x>=STAGE_END && this.kills===this.enemies.length){this.status='clear';this.emit('result');}
  }
  get score(){return Math.max(0,Math.round(this.kills*1000+Math.max(0,150-this.elapsed)*30-this.player.damageTaken*35));}
}
