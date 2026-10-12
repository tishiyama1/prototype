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
export function sampleImpact(plan,age,width,height){
 if(!plan||age<0||age>=plan.duration)return [];
 const t=clamp(age/plan.duration),fade=t>.52?(1-t)/.48:1,rects=[];
 const x=width*.5,y=height*.5,s=plan.scale;
 const rect=(px,py,w,h,color,alpha=1)=>rects.push({x:Math.round(px),y:Math.round(py),w:Math.max(1,Math.round(w)),h:Math.max(1,Math.round(h)),color,alpha:clamp(alpha*fade)});
 const line=(x1,y1,x2,y2,thick,color,alpha=1)=>{
  const count=Math.max(1,Math.ceil(Math.max(Math.abs(x2-x1),Math.abs(y2-y1))));
  for(let i=0;i<=count;i++){const a=i/count;rect(x1+(x2-x1)*a-thick/2,y1+(y2-y1)*a-thick/2,thick,thick,color,alpha);}
 };
 let particleX=x,particleY=y;
 if(plan.kind==='sweep'){
  const head=clamp(t*3.6),tail=clamp((t-.40)*2.7),span=width*1.10;
  const px=a=>-width*.05+span*a,py=a=>height*(.80-.60*a);
  // Both endpoints extend past the viewport. At the peak, the entire diagonal
  // is visible; the tail then follows the tip off the opposite edge.
  for(let i=plan.trails-1;i>=0;i--)line(px(tail),py(tail)+i*3*s,px(head),py(head)+i*3*s,i===0?Math.max(3,height*.025)*s:Math.max(1,height*.006),plan.colors[Math.min(i,2)],i?.50:1);
  particleX=px(head);particleY=py(head);
 }else if(plan.kind==='pierce'){
  const head=clamp(t*4.2),tail=clamp((t-.36)*3),tip=-width*.06+width*1.12*head;
  line(-width*.06+width*1.12*tail,y,tip,y,Math.max(2,height*.016)*s,plan.colors[0]);
  line(tip-width*.07,y-height*.04*s,tip,y,2*s,plan.colors[1]);line(tip-width*.07,y+height*.04*s,tip,y,2*s,plan.colors[1]);
  for(let i=0;i<plan.trails+1;i++)rect(width*(.02+.21*i)+width*.18*t,y+(i%2?1:-1)*height*(.035+i*.025)*s,width*(.17+i*.035),Math.max(1,height*.005),plan.colors[1],.8);
  particleX=tip;
 }else{
  // Heavy impact: a short solid core, expanding broken diamond and thick rays.
  const core=Math.max(5,height*.07)*s;
  if(t<.38)rect(x-core/2,y-core/2,core,core,plan.colors[0],1-t*.9);
  const growth=.08+.92*Math.pow(t,.55),rx=width*.53*s*growth,ry=height*.52*s*growth,rays=plan.mode==='over'?16:8;
  for(let i=0;i<rays;i++){const a=i*Math.PI*2/rays;
   line(x+Math.cos(a)*rx*.25,y+Math.sin(a)*ry*.25,x+Math.cos(a)*rx,y+Math.sin(a)*ry,Math.max(2,height*.026*s*(1-t)),plan.colors[i%3],.95);
  }
  for(let i=0;i<4;i++){const a=i*Math.PI/2,b=a+Math.PI/2;line(x+Math.cos(a)*rx*.64,y+Math.sin(a)*ry*.64,x+Math.cos(b)*rx*.64,y+Math.sin(b)*ry*.64,Math.max(1,height*.007),plan.colors[1],.7);}
 }
 for(let i=0;i<plan.fragments;i++){
  const a=i*2.399963+(plan.kind==='pierce'?.2:0),growth=.05+t*(.55+(i%4)*.13);
  const size=(i%3===0?2:1)*Math.max(1,height*.012)*s;
  const rx=width*(plan.kind==='shock'?.42:.065)*s*growth,ry=height*(plan.kind==='shock'?.45:.08)*s*growth;
  rect(particleX+Math.cos(a)*rx,particleY+Math.sin(a)*ry+(plan.kind==='shock'?t*t*height*.05:0),size,size,plan.colors[i%3],.8);
 }
 return rects;
}
