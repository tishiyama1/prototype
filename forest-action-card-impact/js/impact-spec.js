// Presentation only: no combat, game, damage or random dependencies.
export const IMPACTS=Object.freeze({
 slash:Object.freeze({name:'斬撃',kind:'sweep',duration:.22,colors:Object.freeze(['#fff8d8','#d4ecce','#68a9a1']),fragments:6}),
 thrust:Object.freeze({name:'突き',kind:'pierce',duration:.22,colors:Object.freeze(['#f1ffff','#96d9e5','#4f8bba']),fragments:5}),
 heavy:Object.freeze({name:'強打',kind:'shock',duration:.28,colors:Object.freeze(['#fff3d1','#efb66a','#aa6848']),fragments:12})
});
export const normalizeImpactMode=mode=>['off','normal','over'].includes(mode)?mode:'normal';
export function impactPlan(result,assessment,mode='normal',preview=false){
 mode=normalizeImpactMode(mode);const spec=IMPACTS[result?.moveId];
 if(!spec||mode==='off'||!result.hit||!['hit','intercept'].includes(result.outcome))return null;
 const critical=assessment?.outcome?.critical===true;
 // Ordinary slash/thrust hits stay quiet. Successful heavy attacks and counters
 // are the existing prominent results. CRITICAL is preview/future data only.
 if(!preview&&result.moveId!=='heavy'&&result.outcome!=='intercept'&&!critical)return null;
 return Object.freeze({move:result.moveId,kind:spec.kind,duration:spec.duration,critical,mode,
  scale:(mode==='over'?1.35:1)*(critical?1.18:1),
  fragments:spec.fragments*(mode==='over'?3:1)*(critical?2:1),
  trails:mode==='over'?4:2,colors:critical?Object.freeze(['#ffffea','#f8d873','#c59a4d']):spec.colors});
}
const clamp=n=>Math.max(0,Math.min(1,n));
// Integer rectangles are rasterized by the renderer. No blurred sprites or
// anti-aliased vector strokes; every edge follows the effect's pixel grid.
export function sampleImpact(plan,age,width,height,anchor){
 if(!plan||age<0||age>=plan.duration)return [];
 const t=clamp(age/plan.duration),fade=t>.52?(1-t)/.48:1,rects=[];
 const x=anchor.x,y=anchor.y,s=plan.scale,r=Math.max(8,Math.min(anchor.width*.70,height*.46))*s;
 const rect=(px,py,w,h,color,alpha=1)=>rects.push({x:Math.round(px),y:Math.round(py),w:Math.max(1,Math.round(w)),h:Math.max(1,Math.round(h)),color,alpha:clamp(alpha*fade)});
 const line=(x1,y1,x2,y2,thick,color,alpha=1)=>{
  const count=Math.max(1,Math.ceil(Math.max(Math.abs(x2-x1),Math.abs(y2-y1))));
  for(let i=0;i<=count;i++){const a=i/count;rect(x1+(x2-x1)*a-thick/2,y1+(y2-y1)*a-thick/2,thick,thick,color,alpha);}
 };
 if(plan.kind==='sweep'){
  const head=Math.min(1,t*2.8),tail=Math.max(0,head-.64),span=r*2;
  for(let i=plan.trails-1;i>=0;i--)line(x-r+span*tail,y+r*.38-span*.38*tail+i*2,x-r+span*head,y+r*.38-span*.38*head+i*2,i===0?3*s:1,plan.colors[Math.min(i,2)],i? .55:1);
 }else if(plan.kind==='pierce'){
  const head=Math.min(1,t*3.4),tail=Math.max(0,head-.72);
  line(x-r+r*2*tail,y,x-r+r*2*head,y,2*s,plan.colors[0]);
  const tip=x-r+r*2*head;line(tip-r*.20,y-r*.12,tip,y,2,plan.colors[1]);line(tip-r*.20,y+r*.12,tip,y,2,plan.colors[1]);
  for(let i=0;i<plan.trails+1;i++)rect(x-r*.9+r*.35*t,y+(i%2?1:-1)*(4+i*3),r*(.25+i*.07),1,plan.colors[1],.8);
 }else{
  // Heavy impact: a short solid core, expanding broken diamond and thick rays.
  if(t<.38)rect(x-3*s,y-3*s,6*s,6*s,plan.colors[0],1-t*.9);
  const radius=r*(.12+.85*Math.pow(t,.55));
  for(let i=0;i<8;i++){const a=i*Math.PI/4,inner=radius*.38,outer=radius;
   line(x+Math.cos(a)*inner,y+Math.sin(a)*inner,x+Math.cos(a)*outer,y+Math.sin(a)*outer,Math.max(1,3*s*(1-t)),plan.colors[i%3],.95);
  }
  const d=radius*.64;
  for(let i=0;i<4;i++){const a=i*Math.PI/2,b=a+Math.PI/2;line(x+Math.cos(a)*d,y+Math.sin(a)*d,x+Math.cos(b)*d,y+Math.sin(b)*d,1,plan.colors[1],.7);}
 }
 for(let i=0;i<plan.fragments;i++){
  const a=i*2.399963+(plan.kind==='pierce'?.2:0),radius=r*(.15+t*(.55+(i%4)*.13));
  const size=(i%3===0?2:1)*(plan.kind==='shock'?s:1);
  rect(x+Math.cos(a)*radius,y+Math.sin(a)*radius+(plan.kind==='shock'?t*t*5:0),size,size,plan.colors[i%3],.8);
 }
 return rects;
}
