// Reproducible encounters and rewards. No story-state or random item generation.
export const MODES={overwhelming:{name:'圧倒的',attack:'kings-swords',power:85,interval:1.1,scale:2,detail:'王の剣。主に任せる爽快感を比較。'},standard:{name:'標準',attack:'magic-bolt',power:20,interval:2.5,scale:1.65,detail:'通常魔法弾。援護20〜30%を目標。'},weak:{name:'弱体化',attack:'magic-bolt',power:5,interval:3.3,scale:1.2,detail:'小さな魔法弾。援護5〜10%を目標。'}};
export const WEAPONS={
 dagger:{name:'短剣',damage:14,range:1.25,min:0,step:.25,startup:.12,recovery:.24,posture:.92,fit:['forest'],detail:'短射程・高速。回避直後の攻撃も得意。'},
 sword:{name:'長剣',damage:20,range:2,min:0,step:.35,startup:.30,recovery:.52,posture:.72,fit:['forest','cave'],detail:'標準的な間合い。攻守を切り替えやすい。'},
 greatsword:{name:'大剣',damage:31,range:2.1,min:0,step:.2,startup:.62,recovery:1.12,posture:.45,fit:['cave'],detail:'重く強い。足を止め、大きな隙を待つ。'},
 spear:{name:'槍',damage:24,range:3.65,min:1.65,step:.1,startup:.38,recovery:.62,posture:.68,fit:['forest'],detail:'長射程。懐に入られたら距離を取り直す。'}
};
export const ARMOR={cloak:{name:'旅の外套',fit:['forest'],detail:'森林向き。'},plate:{name:'鉱鉄の胸当て',fit:['cave'],detail:'被ダメージを20%軽減、移動は12%遅くなる。'}};
export const BOOTS={trail:{name:'踏み慣れた靴',fit:['forest'],detail:'森林向き。'},grip:{name:'鋲付きの靴',fit:['cave'],detail:'被弾後の崩れ・ノックバックを短縮。'}};
export const ENEMIES={
 swordsman:{name:'剣士',range:2.55,inner:0,speed:2.5,windup:.70,recovery:1.05,guard:.45,attack:'slash',hint:'斬撃を横にかわし、振り終わりを狙う。'},
 pikeman:{name:'槍兵',range:3.8,inner:1.55,speed:2.2,windup:.84,recovery:1.35,guard:.25,attack:'slash',hint:'槍の懐では攻撃が届かない。接近するか、突きの横へ。'},
 shield:{name:'盾兵',range:2.45,inner:0,speed:1.9,windup:.9,recovery:1.30,guard:1.6,attack:'heavy',hint:'正面を避ける。近い間合いの強打は盾を崩せる。'},
 beast:{name:'疾走する獣',range:1.4,inner:0,speed:4.1,windup:.65,recovery:1.30,guard:0,attack:'rush',hint:'突進の予兆から横に回避。直後に短い攻撃を返す。'},
 giant:{name:'大鉈の巨人',range:3.4,inner:0,speed:1.7,windup:1.20,recovery:2.05,guard:.2,attack:'heavy',hint:'大振りを離れてかわす。長い硬直に重い一撃。'}
};
export const STAGES=[
 ['木漏れ日の決闘','swordsman','forest',200,6.5,4.8,4],
 ['槍の間合い','pikeman','forest',210,6,5.2,5],
 ['駆け抜ける牙','beast','forest',210,5.8,5.6,5],
 ['盾の向こう','shield','forest',220,5.5,5.6,5],
 ['狭い採掘路','pikeman','cave',225,5.1,6.2,6],
 ['大鉈の空白','giant','cave',250,5.4,5.4,6],
 ['踏み込む獣','beast','forest',235,4.8,6.4,6],
 ['盾と速い弾','shield','cave',240,3.9,7.8,7],
 ['槍と二つの予兆','pikeman','forest',245,3.6,8.2,7],
 ['最後の大振り','giant','cave',275,3.3,8.6,8]
].map(([name,enemy,terrain,hp,rearInterval,rearSpeed,rearPower],i)=>({number:i+1,name,enemy,terrain,hp:Math.round(hp*1.12),rearInterval,rearSpeed,rearPower}));
const reward=(id,name,detail,kind,value)=>({id,name,detail,kind,value});
export const ITEMS={
 dagger:reward('dagger','短剣を持つ',WEAPONS.dagger.detail,'weapon','dagger'),sword:reward('sword','長剣を持つ',WEAPONS.sword.detail,'weapon','sword'),greatsword:reward('greatsword','大剣を持つ',WEAPONS.greatsword.detail,'weapon','greatsword'),spear:reward('spear','槍を持つ',WEAPONS.spear.detail,'weapon','spear'),
 lunge:reward('lunge','技：踏み込み斬り','射程外から1.7歩踏み込む。回避直後は不安定。','skill','lunge'),plate:reward('plate','鉱鉄の胸当て',ARMOR.plate.detail,'armor','plate'),grip:reward('grip','鋲付きの靴',BOOTS.grip.detail,'boots','grip'),upgrade:reward('upgrade','刃を研ぐ','現在の武器を強化。威力+12%。最大3回。','upgrade',1),heal:reward('heal','薬草包み','HPを40回復。これを選ばなくても毎戦12回復。','heal',40),balance:reward('balance','技：落ち着く足','攻撃後の構え直し-15%。大剣の重さを扱いやすく。','skill','balance')
};
export const REWARDS=[['dagger','spear','heal'],['greatsword','lunge','heal'],['plate','upgrade','heal'],['grip','sword','lunge'],['balance','dagger','heal'],['spear','upgrade','plate'],['grip','greatsword','heal'],['lunge','balance','upgrade'],['sword','heal','upgrade'],['upgrade','heal','balance']];
export const tier=n=>n>=30?2:n>=12?1:0;
export const rarity=n=>['普通','上質','希少'][tier(n)];
export function equipmentFit(r,terrain){return [WEAPONS[r.weapon],ARMOR[r.armor],BOOTS[r.boots]].filter(e=>e.fit.includes(terrain)).length/3;}
