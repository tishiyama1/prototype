import assert from 'node:assert/strict';
import {Game} from '../../forest-action/js/game.js';
import {FIXED_DT} from '../../forest-action/js/config.js';
const g=new Game();g.reset();let attackTimer=0;
for(let i=0;i<120*180&&g.status==='playing';i++){
 const p=g.player,alive=g.enemies.filter(e=>e.hp>0),nearest=alive.sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0];
 let input={};
 if(nearest){const d=nearest.x-p.x;
  input.right=d>1.2;input.left=d< -1.2;
  if(p.lane!==nearest.lane){input.back=nearest.lane===1;input.front=nearest.lane===0;}
  if(Math.abs(d)<1.85){if(Math.sign(d)!==p.facing&&p.state!=='attack'){input.right=d>0;input.left=d<0;}
   attackTimer-=FIXED_DT;if(attackTimer<=0){input.attack=true;attackTimer=.15;}
  }
 }else input.right=true;
 g.step(FIXED_DT,input);g.events.length=0;
}
console.log({status:g.status,time:g.elapsed,hp:g.player.hp,kills:g.kills,score:g.score});
assert.equal(g.status,'clear');assert.equal(g.kills,7);assert(g.player.hp>0);
