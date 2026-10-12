import {impactPlan,sampleImpact,normalizeImpactMode} from './impact-spec.js';
export class CardImpact{
 constructor({mode=()=> 'normal',preview=false}={}){this.mode=mode;this.preview=preview;this.canvas=document.createElement('canvas');this.canvas.className='card-impact';this.canvas.setAttribute('aria-hidden','true');this.context=this.canvas.getContext('2d',{alpha:true});this.reset();}
 reset(){this.plan=null;this.started=null;this.age=0;this.drawn=0;this.triggered=false;this.result=null;this.assessment=null;this.canvas.hidden=true;}
 attach(row,anchor,result,assessment){this.reset();this.row=row;this.anchor=anchor;this.result=result;this.assessment=assessment;row.append(this.canvas);}
 eligible(){return !!impactPlan(this.result,this.assessment,this.mode(),this.preview);}
 update(c,clock){
  const mode=normalizeImpactMode(this.mode());
  if(c.impact&&!this.triggered){this.triggered=true;this.plan=impactPlan(this.result,this.assessment,mode,this.preview);this.started=clock;}
  // Switching OFF immediately hides the added overlay. Re-enabling during the
  // same attack never restarts it or produces a second hit cue.
  if(!this.plan||mode==='off'){this.canvas.hidden=true;this.drawn=0;return;}
  this.age=Math.max(0,clock-this.started);
  const bounds=this.row.getBoundingClientRect(),a=this.anchor.getBoundingClientRect(),grid=3;
  const width=Math.max(1,Math.ceil(bounds.width/grid)),height=Math.max(1,Math.ceil(bounds.height/grid));
  if(this.canvas.width!==width||this.canvas.height!==height){this.canvas.width=width;this.canvas.height=height;}
  this.context.imageSmoothingEnabled=false;this.context.clearRect(0,0,width,height);
  const rects=sampleImpact(this.plan,this.age,width,height,{x:(a.x-bounds.x+a.width*.5)/grid,y:(a.y-bounds.y+a.height*.48)/grid,width:a.width/grid});
  this.drawn=rects.length;this.canvas.hidden=!rects.length;
  for(const r of rects){this.context.globalAlpha=r.alpha;this.context.fillStyle=r.color;this.context.fillRect(r.x,r.y,r.w,r.h);}
  this.context.globalAlpha=1;
 }
 snapshot(){return {mode:normalizeImpactMode(this.mode()),triggered:this.triggered,active:!this.canvas.hidden,move:this.plan?.move||null,kind:this.plan?.kind||null,critical:this.plan?.critical||false,age:this.age,duration:this.plan?.duration||0,rectangles:this.drawn,pixels:{width:this.canvas.width,height:this.canvas.height},preview:this.preview};}
}
