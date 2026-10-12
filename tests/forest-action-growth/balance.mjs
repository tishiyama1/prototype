import {Game} from '../../forest-action-growth/js/game.js';
import {config} from '../../forest-action-growth/js/config.js';
import {distance} from '../../forest-action-growth/js/target.js';
import fs from 'node:fs';
const cases=[];config.cinema=false;
for(const stage of ['early','middle','late'])for(const strategy of ['idle','simple','observe']){const g=new Game();g.setStage(stage,true);let t=0;
 for(let i=0;i<180*120&&g.status==='playing';i++){let input={};if(strategy!=='idle'&&!g.guardian){const threat=g.enemies.filter(e=>e.hp>0).sort((a,b)=>(distance(a,g.lord)-(a.state==='windup'?2:0))-(distance(b,g.lord)-(b.state==='windup'?2:0)))[0];if(strategy==='observe'&&threat)g.selectEnemy(threat.id);const e=g.enemy,d=distance(g.player,e),opening=['recovery','stagger','hurt'].includes(e.state)&&e.remaining>.61;input={radial:d>2?1:d<1.2?-.5:0,orbit:strategy==='observe'?.35:0,move:opening||e.state==='guard'&&d<1.8?'heavy':d>2.8?'thrust':'slash',attack:d<4.5};if(strategy==='observe'&&e.state==='windup'&&e.remaining<.15&&g.player.cooldown<=0)input.dash={radial:0,orbit:1};}g.step(1/120,input);g.events=[];t+=1/120;}
 cases.push({stage,strategy,status:g.status,wallSimulation:+t.toFixed(2),battleTime:+g.elapsed.toFixed(2),heroHP:g.player.hp,lordHP:g.lord.hp,enemies:g.enemies.map(e=>e.hp),heroDamage:g.stats.heroDamage,lordDamage:g.stats.lordDamage,attacks:g.attacks,lordAttacks:g.stats.lordAttacks,sacrifices:g.stats.sacrifices});
}
config.cinema=true;fs.writeFileSync('tests/forest-action-growth/balance-results.json',JSON.stringify(cases,null,2));console.log(JSON.stringify(cases,null,2));
