import {moves,config,clamp} from './config.js';
import {distance,yawTo,signedAngle,constrain,separate} from './target.js';
export const OUTCOMES=Object.freeze({hit:'命中',evaded:'回避された',guarded:'防御された',whiff:'空振り',interrupted:'攻撃を潰された',intercept:'迎撃成功'});
export function capture(player,enemy,moveId){
 const pick=a=>({x:a.x,z:a.z,hp:a.hp,yaw:a.yaw,state:a.state,time:a.time});
 return {player:pick(player),enemy:{...pick(enemy),duration:enemy.duration,remaining:enemy.remaining,kind:enemy.kind,velocity:{...enemy.velocity},aim:{...enemy.aim},orbitDirection:enemy.orbitDirection,attackRange:enemy.attackRange,innerRange:enemy.innerRange,attackDamage:enemy.kind==='heavy'?16:enemy.kind==='rush'?12:9},moveId,move:{...moves[moveId]},rules:{...config}};
}
// Pure and deterministic: no world mutation, frame timing, random rolls or input-reactive AI.
export function resolve(s){
 const p=s.player,e=s.enemy,m=s.move,r=s.rules,t=m.startup,d=distance(p,e),angle=Math.abs(signedAngle(yawTo(e,p),e.yaw))*180/Math.PI;
 const vulnerable=['hurt','stagger','recovery'].includes(e.state)&&e.remaining>=t;
 const front=angle<r.flankAngle;
 const travel=Math.min(t,e.remaining);
 let predicted={x:e.x+e.velocity.x*travel,z:e.z+e.velocity.z*travel};
 const attackSoon=e.state==='attack'||e.state==='windup'&&e.remaining<t;
 const attackDelay=e.state==='attack'?0:e.remaining;
 const dx=p.x-e.x,dz=p.z-e.z,along=dx*e.aim.x+dz*e.aim.z,side=Math.abs(dx*e.aim.z-dz*e.aim.x);
 const arrival=e.kind==='rush'?attackDelay+Math.max(0,along-1.1)/12:attackDelay;
 const danger=attackSoon&&(e.kind==='rush'?along>-.75&&side<.68: d<(e.attackRange||(e.kind==='heavy'?2.9:2.65))&&d>=(e.innerRange||0)&&angle<40);
 if(attackSoon&&e.kind==='rush'){const rushTime=clamp(t-attackDelay,0,.38);predicted={x:e.x+e.aim.x*12*rushTime,z:e.z+e.aim.z*12*rushTime};}
 constrain(predicted);
 const pd=distance(p,predicted),step=Math.min(m.step,Math.max(0,pd-m.range)),dir={x:(predicted.x-p.x)/(pd||1),z:(predicted.z-p.z)/(pd||1)};
 let pEnd=constrain({x:p.x+dir.x*step,z:p.z+dir.z*step}),eEnd={x:e.x,z:e.z};
 const contact=distance(pEnd,predicted),reach=contact<=m.range+.18&&contact>=(m.minRange||0);
 const relativeVelocity=e.velocity.x*(-dir.z)+e.velocity.z*dir.x;
 const lateral=Math.abs(relativeVelocity)*travel;
 let guardBroken=false;
 let outcome='hit',why='踏み込み後の間合いに捉えた',damage=m.damage,playerDamage=0;
 if(danger&&arrival+r.interceptGrace<t){outcome='interrupted';why=`敵の${e.kind==='rush'?'突進':'攻撃'}が先着（${arrival.toFixed(2)}秒 < 発生${t.toFixed(2)}秒）`;playerDamage=e.attackDamage;}
 else if(!reach){outcome='whiff';why=contact<(m.minRange||0)?`近すぎる：槍の有効距離${m.minRange.toFixed(1)}より内側`:`射程外：予測距離${pd.toFixed(1)} > 間合い${m.range.toFixed(1)}＋踏み込み${m.step.toFixed(1)}`;}
 else if((e.state==='orbit'||lateral>r.lateralTolerance)&&s.moveId==='thrust'&&lateral>r.lateralTolerance){outcome='evaded';why=`横移動${lateral.toFixed(2)}が突きの許容幅${r.lateralTolerance.toFixed(2)}を超える`;}
 else if(e.state==='guard'&&e.remaining>=t&&front){
  if(s.moveId==='heavy'&&distance(pEnd,predicted)<=m.range*r.guardBreak+1e-8){guardBroken=true;why='防御中の正面を、強打の有効間合いで崩した';}
  else {outcome='guarded';why='正面の防御が発生時まで持続する';}
 }
 else if(vulnerable){why=`敵が${e.state==='recovery'?'硬直':e.state==='stagger'?'体勢崩れ':'被弾'}中（残り${e.remaining.toFixed(2)}秒 ≥ 発生${t.toFixed(2)}秒）`;}
 else if(s.moveId==='heavy'&&front&&['wary','approach','orbit','retreat','guard','recovery','hurt','stagger'].includes(e.state)){
  outcome='evaded';why=e.state==='recovery'?'強打の発生前に敵の硬直が終わる':'警戒姿勢に対して強打の発生が遅い';
 }
 else if(e.state==='windup'||e.state==='attack'){
  if(front&&t<=arrival+r.interceptGrace){outcome='intercept';why=`発生${t.toFixed(2)}秒で敵の攻撃到達${arrival.toFixed(2)}秒に先行`;}
  else why='攻撃の側面を捉えた';
 }
 else if(e.state==='approach'&&s.moveId==='slash')why='接近の動きを素早い斬撃で捉えた';
 else if((e.state==='wary'||['hurt','stagger','recovery'].includes(e.state)&&e.remaining<t)&&front){outcome='guarded';why='警戒中の正面：軽い攻撃を受け止める';}
 if(!['hit','intercept'].includes(outcome))damage=0;
 const actualStep=distance(p,pEnd);
 if(outcome==='evaded'){
  // Existing lateral momentum determines dodge side; no input-triggered AI decision.
  const sideDir=e.orbitDirection||1;eEnd=constrain({x:predicted.x-dir.z*sideDir*1.05,z:predicted.z+dir.x*sideDir*1.05});
 }else if(outcome==='hit'||outcome==='intercept')eEnd=constrain({x:predicted.x+dir.x*(s.moveId==='heavy'?.6:.22),z:predicted.z+dir.z*(s.moveId==='heavy'?.6:.22)});
 else if(outcome==='interrupted'){pEnd=constrain({x:p.x-dir.x*.45,z:p.z-dir.z*.45});eEnd=constrain({x:p.x+dir.x*1.0,z:p.z+dir.z*1.0});}
 separate(pEnd,eEnd);
 return Object.freeze({outcome,reason:`${m.name}：${why}`,damage,playerDamage,step:actualStep,angle,distance:d,predictedDistance:pd,playerEnd:Object.freeze(pEnd),enemyEnd:Object.freeze(eEnd),moveId:s.moveId,move:Object.freeze({...m}),duration:m.duration,hit:['hit','intercept'].includes(outcome),snapshot:s,evidence:Object.freeze({reach,front,vulnerable,lateral,arrival,danger,guardBroken,contactDistance:distance(constrain({x:p.x+dir.x*step,z:p.z+dir.z*step}),predicted)})});
}
