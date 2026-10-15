import assert from 'node:assert/strict';
import {Game} from '../../forest-action/js/game.js';
import {config,resetConfig,FIXED_DT} from '../../forest-action/js/config.js';
import {distance} from '../../forest-action/js/target.js';
resetConfig();const game=new Game();game.reset();let ticks=0;
// Observer policy uses only visible state, range, and telegraph time. No HP/AI mutation.
while(game.status==='playing'&&ticks<120*180){
 ticks++;const e=game.enemy,p=game.player,d=distance(p,e);let input={};
 if(!game.cinematic){
  if(['recovery','stagger','hurt','guard'].includes(e.state)){
   const canHeavy=d<=1.78&&e.remaining>.61;
   const canSlash=d<=2.78&&e.state!=='guard'&&e.remaining>.21;
   if(canHeavy){input={move:'heavy',attack:true};}
   else if(canSlash)input={move:'slash',attack:true};
   else input={radial:1};
  }else if(e.state==='approach'&&d<2.65)input={move:'slash',attack:true};
  else if(e.state==='windup'){
   if(e.kind==='rush'&&d<4.65&&e.remaining>.4)input={move:'thrust',attack:true};
   else if(e.remaining<.28)input={dash:{radial:-.3,orbit:1},radial:-.3,orbit:1};
   else input={orbit:1,radial:-.2};
  }else if(e.state==='attack')input={radial:-1,orbit:1};
  else if(e.state==='orbit')input={radial:1,orbit:.5};
  else input={radial:d>2?1:0};
 }
 game.step(FIXED_DT,input);game.events.length=0;
}
console.log(JSON.stringify(game.snapshot(),null,2));assert.equal(game.status,'clear');assert.equal(game.enemy.hp,0);assert.ok(game.player.hp>0);assert.ok(game.attacks>=4);assert.equal(Object.values(game.counts).reduce((a,b)=>a+b),game.attacks);
console.log('PASS observer-policy complete duel, no state injection');
