// Renderer-only options. Never imported by combat, movement or enemy AI.
export const VISUAL_DEFAULTS=Object.freeze({resolution:'medium',pixel:true,fog:true,shadows:true,environment:true});
export const visual={...VISUAL_DEFAULTS};
export const HEIGHTS=Object.freeze({low:144,medium:216,high:324});
export function renderSize(width,height,dpr,resolution){
 const w=Math.max(1,Math.round(width*dpr)),h=Math.max(1,Math.round(height*dpr));
 const scale=Math.max(1,Math.round(h/(HEIGHTS[resolution]||HEIGHTS.medium)));
 return {width:Math.ceil(w/scale),height:Math.ceil(h/scale),scale,displayWidth:w,displayHeight:h};
}
export function resetVisual(){Object.assign(visual,VISUAL_DEFAULTS);}
