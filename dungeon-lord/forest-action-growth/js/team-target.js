import {TargetLock} from './target.js';
export class TeamTarget extends TargetLock{
 constructor(enemies){super();this.enemies=enemies;this.set(enemies[0]);}
 select(id){const e=this.enemies.find(e=>e.id===id&&e.hp>0);if(!e)return false;this.set(e);return true;}
 ensure(){if(!this.active)this.set(this.enemies.find(e=>e.hp>0)||null);return this.active;}
 cycle(){const alive=this.enemies.filter(e=>e.hp>0);if(!alive.length)return false;return this.select(alive[(alive.indexOf(this.target)+1)%alive.length].id);}
}
