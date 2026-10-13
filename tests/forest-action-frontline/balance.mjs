import {Game} from '../../forest-action-frontline/js/game.js';
import {config} from '../../forest-action-frontline/js/config.js';
import {distance} from '../../forest-action-frontline/js/target.js';
import fs from 'node:fs';
const results=[];config.cinema=false;
for(const stage of ['early','middle','late'])for(const strategy of ['idle','blind-slash','blind-heavy','observe']){const g=new Game();g.setStage(stage,true);let total=0;
 for(let i=0;i<180*120&&g.status==='playing';i++){let input={};if(strategy!=='idle'&&!g.guardian&&!g.fleeing){const e=g.front,d=distance(g.player,e),opening=['recovery','stagger','hurt'].includes(e.state)&&e.remaining>.61;if(strategy.startsWith('blind'))input={radial:d>1.25?1:0,move:strategy==='blind-heavy'?'heavy':'slash',attack:true};else {input={radial:d>1.6?1:d<1.15?-.5:0,orbit:.6,move:opening||e.state==='guard'&&d<1.8?'heavy':d>2.8?'thrust':'slash',attack:d<4.5};if((e.state==='windup'&&e.remaining<.15||g.projectiles.some(b=>b.team==='enemy'&&distance(g.player,b)<1.5))&&g.player.cooldown<=0)input.dash={radial:0,orbit:1};}}g.step(1/120,input);g.events=[];total+=1/120;}
 results.push({stage,strategy,status:g.status,battleTime:+g.elapsed.toFixed(2),heroHP:g.player.hp,lordHP:g.lord.hp,heroDamage:g.stats.heroDamage,lordDamage:g.stats.lordDamage,attacks:g.attacks,accuracy:+g.accuracy.toFixed(1),rearShots:g.stats.enemyShots,rearPulses:g.stats.rearPulses,counts:g.counts});
}
config.cinema=true;fs.writeFileSync('tests/forest-action-frontline/balance-results.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
