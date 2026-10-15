import {config,clamp} from './config.js';
// Durations are captured at command time, independent of move startup and AI time.
export function createTimeline(){
 const mode=config.cardMode;
 const scale=mode==='fast'?.42:mode==='detail'?5:1;
 const durations=[config.declareTime,config.revealTime,config.resultTime,config.actionTime,config.returnTime].map((n,i)=>Math.max(.02,n*(i===3?1:scale)));
 const ends=[];durations.reduce((t,n)=>{ends.push(t+n);return t+n;},0);
 return Object.freeze({mode,durations:Object.freeze(durations),ends:Object.freeze(ends),total:ends[4]});
}
export function phase(c){
 const t=c.time,plan=c.timeline,ends=plan.ends;
 const index=Math.min(4,ends.findIndex(n=>t<n)<0?4:ends.findIndex(n=>t<n));
 const start=index?ends[index-1]:0;
 return {index,name:['declare','reveal','result','action','return'][index],progress:clamp((t-start)/plan.durations[index],0,1),action:clamp((t-ends[2])/plan.durations[3],0,1),reveal:clamp((t-ends[0])/plan.durations[1],0,1)};
}
