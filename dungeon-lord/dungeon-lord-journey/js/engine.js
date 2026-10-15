import {REGIONS,JOBS,WEAPONS,CLOTHES,RUMORS,EVENTS} from './data.js';
export const SAVE_KEY='dungeon-lord-journey:v1';
const clone=s=>JSON.parse(JSON.stringify(s)),own=(o,k)=>Object.hasOwn(o,k);
const cap=(n,max)=>Math.max(0,Math.min(max,n));
export function newGame(){return {schema:1,week:1,half:0,serial:0,location:'outskirts',mode:'prologue',money:30,food:6,hygiene:70,regions:Object.fromEntries(Object.keys(REGIONS).map(id=>[id,{discovered:id==='outskirts',visits:id==='outskirts'?1:0,version:0,seen:0}])),completed:['gate-denied'],history:[],nights:[],flags:{},world:{giftTo:null,small:false,villageLevel:0,mineLevel:0},lord:{creation:true,height:3},gift:null,jobs:['carry','escort','farm','harvest','mining','ore-carry'],items:{},weapons:{sword:{mastery:0,skills:{slash:0,thrust:0,heavy:0}}},equipment:{weapon:'sword',coat:'coat',boots:'boots'},ownedClothes:['boots','work-boots'],journal:[{id:'gate',week:1,text:RUMORS.gate}],pending:null,checkpoint:null,lastResult:null};}
export function availableJobs(s,id){return s.jobs.filter(j=>JOBS[j]?.region===id&&s.regions[id].discovered);}
export function rarity(x){return x>=16?2:x>=6?1:0;}
export function equipmentFit(s,terrain){const tags=[WEAPONS[s.equipment.weapon].tags,CLOTHES[s.equipment.coat].tags,CLOTHES[s.equipment.boots].tags];return tags.filter(t=>t.includes(terrain)).length/3;}
export function matches(s,when,a={}){
 if(when.location&&s.location!==when.location||when.kind&&a.kind!==when.kind||when.job&&a.job!==when.job)return false;
 if(when.completed&&!when.completed.every(id=>s.completed.includes(id)))return false;
 if(when.visits&&!Object.entries(when.visits).every(([id,n])=>s.regions[id]?.visits>=n))return false;
 if(when.weekMin&&s.week<when.weekMin)return false;
 if(when.ability==='creation'&&!s.lord.creation)return false;
 if(when.world&&!Object.entries(when.world).every(([key,value])=>s.world[key]===value))return false;
 if(when.giftAge!==undefined&&(!s.gift||s.week-s.gift.week<when.giftAge))return false;
 if(when.historyIncludes&&!s.history.some(h=>Object.entries(when.historyIncludes).every(([k,v])=>h[k]===v)))return false;
 if(when.historyTail){const tail=s.history.slice(-when.historyTail.length);if(tail.length!==when.historyTail.length||!tail.every((h,i)=>Object.entries(when.historyTail[i]).every(([k,v])=>h[k]===v)))return false;}
 return true;
}
function effect(s,e){switch(e.type){
 case 'region':s.regions[e.id].discovered=true;break;
 case 'job':if(!s.jobs.includes(e.id))s.jobs.push(e.id);break;
 case 'item':s.items[e.id]=(s.items[e.id]||0)+(e.count||1);break;
 case 'weapon':if(!s.weapons[e.id])s.weapons[e.id]={mastery:0,skills:{slash:0,thrust:0,heavy:0}};break;
 case 'rumor':if(!s.journal.some(r=>r.id===e.id))s.journal.push({id:e.id,week:s.week,text:RUMORS[e.id]});break;
 case 'flag':s.flags[e.key]=e.value;break;
 case 'world':s.world[e.key]=e.value;if(e.region)s.regions[e.region].version++;break;
 case 'gift':if(s.lord.creation&&!s.gift){s.lord.creation=false;s.lord.height=1.8;s.gift={to:e.to,week:s.week,serial:s.serial};s.world.giftTo=e.to;s.world.small=true;s.journal.push({id:'gift',week:s.week,text:`主が物体生成を${e.to==='farmer'?'農夫':'鉱夫'}に渡した。主は少し小さくなった。`});}break;
 default:throw Error('Unknown effect: '+e.type);
}}
function applyEvents(s,a,lines){for(const e of EVENTS)if(!s.completed.includes(e.id)&&matches(s,e.when,a)){for(const fx of e.effects)effect(s,fx);s.completed.push(e.id);lines.push(...e.lines);}}
export function beginAction(state,action){const s=clone(state);if(s.mode!=='map'||s.pending)throw Error('Action is already in progress');if(!REGIONS[action.target]||!s.regions[action.target].discovered)throw Error('Unknown destination');if(!['explore','work'].includes(action.kind))throw Error('Unknown action');if(action.kind==='work'&&!availableJobs(s,action.target).includes(action.job))throw Error('Unavailable job');
 s.checkpoint=clone(state);s.serial++;s.location=action.target;
 const prior=s.history.filter(h=>h.target===action.target&&h.kind===action.kind).length;
 let battles=action.kind==='work'?(JOBS[action.job].battles||0):action.target==='mine'?[1,2,0][prior%3]:action.target==='village'?[1,0,2][prior%3]:[0,1,1][prior%3];
 const lines=action.kind==='work'?[['語り',JOBS[action.job].text]]:[['語り',action.target==='mine'?'北の山へ向かった。坑道の灯りが、奥で揺れている。':action.target==='village'?'小川に沿って歩いた。畑の間を、細い道が続いている。':'門の外を、あてもなく歩いてみる。荷車が一台、こちらへ来る。']];
 if(battles)lines.push(['主',battles>1?'奥にも、もう一ついるね。':'何かいるね。']);
 s.pending={id:`journey-${s.serial}`,action:{...action},week:s.week,half:s.half,battles,index:0,reports:[],phase:'before',lines,cursor:0};s.mode='event';return s;
}
function completeAction(s){const p=s.pending,a=p.action,r=REGIONS[a.target],lines=[];s.regions[a.target].visits++;s.regions[a.target].seen=s.regions[a.target].version;s.history.push({...a,week:p.week,half:p.half,serial:s.serial});
 const job=a.kind==='work'?JOBS[a.job]:null,poor=(s.food===0?1:0)+(s.hygiene<20?1:0);let money=job?Math.max(1,job.money-poor):a.target==='mine'?5:2,food=job?job.food:r.food;
 if(a.target==='village'&&s.world.villageLevel>=1)food+=2;
 s.money+=money;s.food=cap(s.food+food-1,99);s.hygiene=cap(s.hygiene+(a.target==='outskirts'&&s.world.small?18:r.hygiene),100);
 if(a.kind==='explore'){const item=a.target==='mine'?'石の欠片':a.target==='village'?'野の花':'道端の小石';s.items[item]=(s.items[item]||0)+1;}
 if(a.job==='new-vein')s.items['青い鉱石']=(s.items['青い鉱石']||0)+1;
 if(p.reports.length){lines.push(['語り',`道が空いた。${p.reports.length}度の戦いで、小さな素材を拾った。`]);const gain=p.reports.reduce((sum,r)=>sum+['slash','thrust','heavy'].reduce((n,k)=>n+Math.min(3,r.uses[k]||0),0),0);if(gain)lines.push(['語り',`${WEAPONS[s.equipment.weapon].name}の熟練度が${gain}増えた。使った技も、少し手に馴染んだ。`]);}
 lines.push(['語り',`${money}G${food?`と食料${food}`:''}を手に入れた。道中で食料を1消費した。${poor?'休み休み進んだ分、報酬が少し減った。':''}`]);
 applyEvents(s,a,lines);
 const night=s.half===1;if(night){s.nights.push({week:s.week,location:s.location});lines.push(['語り',`${r.name}で夜を明かす。主は食事も睡眠もいらない。`],['主','見てるから、寝ていいよ。']);s.week++;s.half=0;applyEvents(s,{},lines);}else s.half=1;
 s.lastResult={money,food:food-1,night,action:{...a}};p.phase='after';p.lines=lines;p.cursor=0;s.mode='event';
}
export function advanceEvent(state){const s=clone(state);if(s.mode==='prologue'){s.mode='map';return s;}if(s.mode!=='event')throw Error('Not an event');const p=s.pending;if(p.cursor+1<p.lines.length){p.cursor++;return s;}
 if(p.phase==='before'){if(p.battles){s.mode='battle';return s;}completeAction(s);}else{s.mode='map';s.pending=null;s.checkpoint=null;}return s;
}
export function battleContext(s){if(s.mode!=='battle'||!s.pending)throw Error('Not in battle');const p=s.pending,w=s.weapons[s.equipment.weapon],terrain=REGIONS[s.location].terrain;return {id:`${p.id}-${p.index}`,scene:terrain==='mine'?'cave':'forest',creation:s.lord.creation,height:s.lord.height,weapon:s.equipment.weapon,weaponName:WEAPONS[s.equipment.weapon].name,weaponPower:WEAPONS[s.equipment.weapon].power,mastery:w.mastery,skills:{...w.skills},fit:equipmentFit(s,terrain),terrain,equipment:{...s.equipment}};}
export function resolveBattle(state,report){const s=clone(state),expected=battleContext(s);if(report.id!==expected.id||!['clear','dead'].includes(report.status))throw Error('Invalid battle result');if(report.creation!==s.lord.creation)throw Error('Mismatched battle capability');
 if(report.status==='dead'){s.mode='gameover';return s;}
 const uses=report.uses||{};if(!['slash','thrust','heavy'].every(k=>Number.isInteger(uses[k]||0)&&(uses[k]||0)>=0&&(uses[k]||0)<=10000))throw Error('Invalid mastery result');
 const w=s.weapons[s.equipment.weapon];for(const id of ['slash','thrust','heavy']){const n=Math.min(3,uses[id]||0);w.skills[id]+=n;w.mastery+=n;}
 s.items[s.location==='mine'?'鉱石の欠片':'獣の牙']=(s.items[s.location==='mine'?'鉱石の欠片':'獣の牙']||0)+1;
 s.pending.reports.push({id:report.id,uses:{...uses}});s.pending.index++;if(s.pending.index>=s.pending.battles)completeAction(s);return s;
}
export function retryDeparture(state){if(state.mode!=='gameover'||!state.checkpoint)throw Error('No departure to retry');return clone(state.checkpoint);}
export function equip(state,type,id){const s=clone(state);if(!['map','prologue'].includes(s.mode))throw Error('Cannot change equipment while traveling');if(type==='weapon'&&s.weapons[id])s.equipment.weapon=id;else if(type==='boots'&&s.ownedClothes.includes(id))s.equipment.boots=id;else throw Error('Unavailable equipment');return s;}
export function buyFood(state){const s=clone(state);if(s.mode!=='map'||s.location!=='outskirts'||!s.flags.trader||s.money<12)throw Error('Cannot buy food');s.money-=12;s.food=cap(s.food+3,99);return s;}
export function validate(s){
 if(!s||s.schema!==1||!REGIONS[s.location]||!['prologue','map','event','battle','gameover'].includes(s.mode))throw Error('Invalid save');
 for(const [key,max]of [['week',1000000],['half',1],['serial',1000000],['money',1000000000],['food',99],['hygiene',100]])if(!Number.isInteger(s[key])||s[key]<0||s[key]>max||key==='week'&&s[key]<1)throw Error('Invalid '+key);
 if(!s.regions||!Object.keys(REGIONS).every(id=>s.regions[id]&&typeof s.regions[id].discovered==='boolean'&&Number.isInteger(s.regions[id].visits)&&s.regions[id].visits>=0))throw Error('Invalid regions');
 if(!s.lord||typeof s.lord.creation!=='boolean'||s.lord.height!==(s.lord.creation?3:1.8)||!s.world||!s.weapons||!s.weapons[s.equipment?.weapon]||!CLOTHES[s.equipment?.boots]||!CLOTHES[s.equipment?.coat])throw Error('Invalid party');
 if(!Array.isArray(s.history)||!Array.isArray(s.completed)||!Array.isArray(s.journal)||!Array.isArray(s.jobs)||!s.jobs.every(j=>JOBS[j])||!s.items||!Array.isArray(s.nights)||!Array.isArray(s.ownedClothes)||!s.flags)throw Error('Invalid records');
 if(s.lord.creation?!!s.gift:s.gift?.to!==s.world.giftTo||!['farmer','miner'].includes(s.gift?.to))throw Error('Invalid gift');
 for(const [id,w]of Object.entries(s.weapons))if(!WEAPONS[id]||!Number.isInteger(w.mastery)||w.mastery<0||!w.skills||!['slash','thrust','heavy'].every(k=>Number.isInteger(w.skills[k])&&w.skills[k]>=0))throw Error('Invalid weapon');
 if(['event','battle','gameover'].includes(s.mode)){const p=s.pending;if(!p||!REGIONS[p.action?.target]||!['explore','work'].includes(p.action.kind)||!Number.isInteger(p.index)||!Number.isInteger(p.battles)||p.index<0||p.index>p.battles||!Array.isArray(p.lines)||!Number.isInteger(p.cursor)||p.cursor<0||p.cursor>=p.lines.length||!['before','after'].includes(p.phase)||!Array.isArray(p.reports)||!s.checkpoint)throw Error('Invalid pending action');if(s.mode==='battle'&&p.index>=p.battles)throw Error('Invalid encounter');validate(s.checkpoint);}else if(s.pending||s.checkpoint)throw Error('Unexpected pending action');return s;
}
export function save(s,storage=localStorage){validate(s);const json=JSON.stringify(s);storage.setItem(SAVE_KEY,json);return json;}
export function load(storage=localStorage){const raw=storage.getItem(SAVE_KEY);if(raw===null)return null;return validate(JSON.parse(raw));}
