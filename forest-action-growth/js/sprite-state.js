export const STATES=['idle','move','dash','evade','guard','wary','windup','attack','counter','recovery','hurt','stagger','dead','cinematic'];
export const FRAME_COUNT=6,FACE_COUNT=4,CELL=48,WIDTH=64,COLUMNS=12;
export function facing(yaw=0){const x=Math.cos(yaw),z=-Math.sin(yaw);return Math.abs(x)>Math.abs(z)?x>0?2:3:z>0?0:1;}
export function spriteFrame(a,time=0){const state=['approach','orbit','retreat'].includes(a.state)?'move':STATES.includes(a.state)?a.state:'idle';let n;
 if(state==='move')n=Math.floor((a.walk||0)*.95)%6;
 else if(state==='cinematic')n=Math.min(5,Math.floor((a.phase||0)*6));
 else if(['idle','wary','guard'].includes(state))n=Math.floor(time*3)%2;
 else n=Math.min(5,Math.floor((a.time||0)*12));
 return {state,frame:Math.max(0,n),face:facing(a.yaw),index:(STATES.indexOf(state)*4+facing(a.yaw))*6+Math.max(0,n)};
}
