// Stage changes only allied statistics. Enemy modules are shared, unchanged copies.
export const STAGES=Object.freeze({
 early:Object.freeze({name:'序盤',heroHP:70,heroPower:.65,lordHP:520,lordDefense:.5,lordScale:2,lordPower:48,lordAttack:'kings-swords',description:'主が道を切り開く · 物体生成能力'}),
 middle:Object.freeze({name:'中盤',heroHP:100,heroPower:1,lordHP:145,lordDefense:.8,lordScale:1,lordPower:13,lordAttack:'magic-bolt',description:'互いを支える · 物体生成能力を失った主'}),
 late:Object.freeze({name:'終盤',heroHP:145,heroPower:1.5,lordHP:38,lordDefense:1,lordScale:.62,lordPower:2,lordAttack:'magic-bolt',description:'人間が主力になる · 小さな主が最後まで援護する'}),
});
export const stageOf=id=>STAGES[id]?id:'early';
export const normalLordDamage=(raw,stage)=>Math.max(1,Math.round(raw*stage.lordDefense));
export const LORD_RULES=Object.freeze({range:5.5,minRange:4.4,maxRange:7.2,speed:2.7,windup:.55,recovery:1.05,orbit:.35,swordRadius:2.8,swordDelay:.52,boltSpeed:7.5,boltLife:2});
