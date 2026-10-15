// Presentation facts derived from the same, already resolved combat snapshot.
// This module never changes damage, positions or the resolution priority.
export const GRADES=Object.freeze({supreme:5,excellent:4,good:3,normal:2,bad:1,fatal:0});
export const TECHNIQUES=Object.freeze({
 slash:{icon:'M9 37Q12 12 40 10Q24 22 9 37Z M8 9L40 41',caption:'接近を断つ、素早い一閃',effect:'sweep'},
 thrust:{icon:'M24 6L32 18H27V40H21V18H16Z',caption:'距離を貫く、直線の一撃',effect:'beam'},
 heavy:{icon:'M13 12H35V24H13Z M21 24V40H27V24 M7 34L11 30M37 30L41 34',caption:'防御と大きな隙を砕く',effect:'shock'}
});
const factor=(grade,label,reason,detail)=>Object.freeze({grade,label,reason,detail});
export function assess(r){
 const s=r.snapshot,e=s.enemy,m=r.move,a=r.evidence;
 const ideal=Math.abs(r.distance-m.range)<=.18;
 const settled=Math.abs(a.contactDistance-m.range)<=.25&&r.step<=m.step*.8;
 const range=!a.reach?factor('fatal','射程外','踏み込んでも届かない',`予測距離 ${r.predictedDistance.toFixed(2)} / 間合い ${m.range.toFixed(2)}＋最大踏み込み ${m.step.toFixed(2)}`):
 factor(ideal?'supreme':settled?'excellent':'good',ideal?'絶好':settled?'良好':'圏内',ideal?'最適間合い':settled?'余裕ある踏み込み':'射程を確保',`指示時 ${r.distance.toFixed(2)} → 接触予測 ${a.contactDistance.toFixed(2)} / 最適 ${m.range.toFixed(2)} / 踏み込み ${r.step.toFixed(2)} / 敵の正面から ${r.angle.toFixed(1)}°`);
 let opening;
 if(r.outcome==='interrupted')opening=factor('fatal','反撃危険','敵の攻撃が先着',`到達 ${a.arrival.toFixed(2)}s / 技の発生 ${m.startup.toFixed(2)}s`);
 else if(a.vulnerable)opening=factor(e.state==='stagger'?'supreme':'excellent',e.state==='stagger'?'無防備':'大きな隙','発生まで隙が続く',`残り ${e.remaining.toFixed(2)}s ≥ 発生 ${m.startup.toFixed(2)}s`);
 else if(!a.front)opening=factor('good','側面の隙','正面の警戒を外す',`敵の正面から ${r.angle.toFixed(1)}° / 正面の境界 ${s.rules.flankAngle}°`);
 else if(e.state==='guard')opening=factor('bad','防御中','正面を警戒',`防御残り ${e.remaining.toFixed(2)}s / 発生 ${m.startup.toFixed(2)}s / ${a.front?'正面':'側面'}`);
 else if(e.state==='orbit')opening=factor('bad','回避姿勢','横へ移動中',`横移動予測 ${a.lateral.toFixed(2)} / 突きの許容幅 ${s.rules.lateralTolerance.toFixed(2)}`);
 else if(['windup','attack'].includes(e.state))opening=factor(r.outcome==='intercept'?'good':'normal',r.outcome==='intercept'?'小さな隙':'攻撃中','攻撃到達との競争',`敵の到達 ${a.arrival.toFixed(2)}s / 技の発生 ${m.startup.toFixed(2)}s`);
 else if(e.state==='approach')opening=factor('good','小さな隙','接近する敵',`状態残り ${e.remaining.toFixed(2)}s / 発生 ${m.startup.toFixed(2)}s`);
 else opening=factor('bad','警戒中','確かな隙はない',`敵の状態 ${e.state} / 残り ${e.remaining.toFixed(2)}s / 発生 ${m.startup.toFixed(2)}s`);
 let technique;
 if(r.outcome==='intercept')technique=factor('supreme','最適解','敵の攻撃を迎撃',r.reason);
 else if(a.guardBroken)technique=factor('supreme','最適解','強打で防御を崩す',r.reason);
 else if(r.outcome==='evaded'||r.outcome==='interrupted')technique=factor('fatal','悪手',r.outcome==='evaded'?'速度・軌道が合わない':'発生が間に合わない',r.reason);
 else if(r.outcome==='guarded')technique=factor('bad','不適','正面の防御に阻まれる',r.reason);
 else if(a.vulnerable&&r.moveId==='heavy'||e.state==='approach'&&r.moveId==='slash'&&r.hit)technique=factor('excellent','有効','敵の動きに適合',r.reason);
 else technique=factor('normal','標準','技の性能を評価',r.reason);
 const environment=factor('normal','中立','足場安定', '平坦な森のフィールド。環境による威力・命中補正はありません。外周は移動境界のみです。');
 const type=r.outcome==='hit'?(a.guardBroken?'BREAK':r.moveId==='heavy'?'STRONG HIT':'HIT'):{intercept:'COUNTER',guarded:'GUARD',whiff:'MISS',evaded:'EVADE',interrupted:'INTERRUPTED'}[r.outcome];
 return Object.freeze({attack:r.moveId,factors:Object.freeze({range,opening,technique,environment}),outcome:Object.freeze({type,critical:false,damage:r.damage,playerDamage:r.playerDamage,reason:r.reason}),context:Object.freeze({enemyState:e.state,distance:r.distance,angle:r.angle,startup:m.startup})});
}
