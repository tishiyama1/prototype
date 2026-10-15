// Pure visual settings: no game, input, damage or AI dependencies.
export const MODES=Object.freeze(['off','normal','over']);
export const PROFILES=Object.freeze({
 forest:Object.freeze({normal:Object.freeze({light:.12,wave:.14,shadow:.045,drift:.10,leaves:6,leafSize:.23,speed:.48,grass:.045,dust:8,dustSize:2.0,dustOpacity:.30}),over:Object.freeze({light:.30,wave:.52,shadow:.16,drift:.65,leaves:24,leafSize:.40,speed:1.6,grass:.24,dust:40,dustSize:4.0,dustOpacity:.48})}),
 cave:Object.freeze({normal:Object.freeze({light:.19,wave:.28,shadow:.04,drift:.07,leaves:0,leafSize:0,speed:.12,grass:0,dust:14,dustSize:1.8,dustOpacity:.34}),over:Object.freeze({light:.38,wave:.55,shadow:.13,drift:.45,leaves:0,leafSize:0,speed:.45,grass:0,dust:56,dustSize:3.6,dustOpacity:.55})})
});
export function normalizeMode(mode){return MODES.includes(String(mode).toLowerCase())?String(mode).toLowerCase():'normal';}
export function settings(scene,mode='normal',gain=1){mode=normalizeMode(mode);gain=Number.isFinite(Number(gain))?Math.max(0,Math.min(1.5,Number(gain))):1;const p=PROFILES[scene]?.[mode==='over'?'over':'normal'];if(!p)throw Error('unknown environment scene');return {...p,mode,gain,enabled:mode!=='off'&&gain>0};}
export function wave(t,scene){return scene==='forest'?Math.sin(t*.8)*.65+Math.sin(t*1.31+.5)*.35:Math.sin(t*2.3)*.45+Math.sin(t*3.7+1.1)*.30+Math.sin(t*.93)*.25;}
