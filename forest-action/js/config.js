export const FIXED_DT=1/120;
export const ARENA=Object.freeze({x:11.5,z:7.2,margin:.55});
export const DEFAULTS=Object.freeze({speed:3.8,orbitSpeed:3.4,dashDistance:3.1,invincibility:.18,dashCooldown:.9,
 pitch:53,zoom:1,attackZoom:1.9,cameraSpeed:10,cinemaSpeed:1,cinema:true,
 flankAngle:65,lateralTolerance:.48,guardBreak:1.0,interceptGrace:.035});
export const config={...DEFAULTS};
export const MOVE_DEFAULTS=Object.freeze({
 slash:Object.freeze({name:'斬撃',damage:10,startup:.20,range:1.5,step:1.2,duration:.70,recovery:.40}),
 thrust:Object.freeze({name:'突き',damage:15,startup:.35,range:2.2,step:2.5,duration:.82,recovery:.55}),
 heavy:Object.freeze({name:'強打',damage:30,startup:.60,range:1.3,step:.5,duration:.98,recovery:.70})
});
export const moves=Object.fromEntries(Object.entries(MOVE_DEFAULTS).map(([k,v])=>[k,{...v}]));
export function resetConfig(){Object.assign(config,DEFAULTS);for(const k in moves)Object.assign(moves[k],MOVE_DEFAULTS[k]);}
export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
export const lerp=(a,b,t)=>a+(b-a)*t;
