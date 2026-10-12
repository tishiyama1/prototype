import * as THREE from 'three';
export const seeded=(seed)=>()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
function texture(canvas){const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=2;return t;}
export function earthTexture(){
 const size=512,c=document.createElement('canvas');c.width=c.height=size;const ctx=c.getContext('2d'),r=seeded(9771),img=ctx.createImageData(size,size);
 const soil=[135,124,96],green=[78,103,73];
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const wx=(x/size-.5)*66,wz=(y/size-.5)*48,center=-.26*wx+.65*Math.sin(wx*.13),width=2.9+.85*Math.exp(-wx*wx/95)+.6*Math.sin(wx*.27);
  const grain=Math.sin(wx*1.8+wz*.4)*Math.cos(wz*1.2)+Math.sin(wx*.45-wz*.7)*.6;
  const side=Math.abs(wz-center)-width+grain*.32,blend=THREE.MathUtils.smoothstep(side,-1.6,1.7),variation=(r()-.5)*5+grain*2;
  const i=(y*size+x)*4;for(let k=0;k<3;k++)img.data[i+k]=soil[k]*(1-blend)+green[k]*blend+variation;img.data[i+3]=255;
 }
 ctx.putImageData(img,0,0);
 // Quiet leaf litter collects beside the foot-worn route, not behind the combat silhouettes.
 for(let i=0;i<1400;i++){const wx=(r()-.5)*54,center=-.26*wx+.65*Math.sin(wx*.13),side=r()<.5?-1:1,wz=center+side*(2.9+.85*Math.exp(-wx*wx/95)+.6*Math.sin(wx*.27)+r()*1.6);ctx.globalAlpha=.16+r()*.18;ctx.fillStyle=['#aa9567','#746a46','#b5a274'][i%3];ctx.beginPath();ctx.ellipse((wx/66+.5)*size,(wz/48+.5)*size,.6+r()*1.4,.4+r()*.7,r()*6.28,0,6.28);ctx.fill();}ctx.globalAlpha=1;
 // Low-contrast moss stains: organic islands rather than a repeating battle-board pattern.
 for(let i=0;i<90;i++){const x=r()*size,y=r()*size,wx=(x/size-.5)*66,wz=(y/size-.5)*48;if(Math.abs(wx)<6&&Math.abs(wz)<3.5)continue;const g=ctx.createRadialGradient(x,y,1,x,y,10+r()*15);g.addColorStop(0,'#71846570');g.addColorStop(1,'#71846500');ctx.fillStyle=g;ctx.fillRect(x-26,y-26,52,52);}
 for(let i=0;i<4800;i++){const x=r()*size,y=r()*size,wx=(x/size-.5)*66,wz=(y/size-.5)*48;if(Math.abs(wx)<6&&Math.abs(wz)<3.5&&i%6)continue;ctx.globalAlpha=.10+r()*.15;ctx.fillStyle=i%4?'#5f664f':'#d1bd92';ctx.fillRect(x,y,.8+r()*1.2,.7+r());}ctx.globalAlpha=1;return texture(c);
}
export function barkTexture(){const c=document.createElement('canvas');c.width=64;c.height=128;const x=c.getContext('2d'),r=seeded(229);x.fillStyle='#b6aa94';x.fillRect(0,0,64,128);for(let i=0;i<130;i++){const u=r()*64,v=r()*128;x.strokeStyle=i%3?'#70635459':'#dbcaac59';x.lineWidth=.6+r()*1.5;x.beginPath();x.moveTo(u,v);x.bezierCurveTo(u+2,v+9,u-2,v+18,u+1,v+30);x.stroke();}return texture(c);}
export function stoneTexture(){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),r=seeded(545);x.fillStyle='#c3c0af';x.fillRect(0,0,128,128);for(let i=0;i<1000;i++){x.fillStyle=i%3?'#676f6730':'#d6d0bb40';x.fillRect(r()*128,r()*128,1+r()*4,1+r()*2);}return texture(c);}
export function softLight(){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,2,32,32,32);g.addColorStop(0,'#fff9e2');g.addColorStop(.35,'#fff2cf99');g.addColorStop(1,'#fff2cf00');x.fillStyle=g;x.fillRect(0,0,64,64);return texture(c);}
export function leafTexture(){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d'),r=seeded(737);for(let i=0;i<145;i++){const a=r()*6.28,d=Math.sqrt(r())*.88,cx=128+Math.cos(a)*d*115,cy=128+Math.sin(a)*d*115,w=7+r()*10,h=3+r()*5;x.save();x.translate(cx,cy);x.rotate(a+r());x.fillStyle=['#779363','#91a270','#4f7455','#b4b37b'][i%4];x.beginPath();x.moveTo(-w,0);x.bezierCurveTo(-w*.4,-h,w*.6,-h,w,0);x.bezierCurveTo(w*.3,h,-w*.5,h,-w,0);x.fill();x.strokeStyle='#425b4366';x.lineWidth=1;x.beginPath();x.moveTo(-w,0);x.lineTo(w*.8,0);x.stroke();x.restore();}return texture(c);}
export function barkRelief(){const c=document.createElement('canvas');c.width=128;c.height=256;const x=c.getContext('2d');x.fillStyle='#888888';x.fillRect(0,0,128,256);for(let i=0;i<36;i++){const u=i*3.9;x.strokeStyle=i%3?'#585858':'#c0c0c0';x.lineWidth=i%3?1.4:2;x.beginPath();x.moveTo(u,0);x.bezierCurveTo(u+3,60,u-2,150,u+1,256);x.stroke();}return texture(c);}
export function earthRelief(){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d'),r=seeded(332);x.fillStyle='#888';x.fillRect(0,0,256,256);for(let i=0;i<16000;i++){x.fillStyle=i%2?'#999999':'#747474';x.fillRect(r()*256,r()*256,1+r()*2,1+r());}return texture(c);}
export function logEndTexture(){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.fillStyle='#a18b65';x.fillRect(0,0,128,128);for(let i=5;i<64;i+=5){x.strokeStyle=i%10?'#786b4c':'#c1aa7a';x.lineWidth=1.2;x.beginPath();x.ellipse(64,64,i,i*.94,.12,0,Math.PI*2);x.stroke();}for(const a of [.2,2.7,4.8]){x.strokeStyle='#655540';x.beginPath();x.moveTo(64+Math.cos(a)*32,64+Math.sin(a)*32);x.lineTo(64+Math.cos(a)*66,64+Math.sin(a)*66);x.stroke();}return texture(c);}
export function mossTexture(){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),r=seeded(738);x.fillStyle='#bcc5ab';x.fillRect(0,0,128,128);for(let i=0;i<2400;i++){x.fillStyle=i%3?'#8f9f8240':'#d3d9bc80';x.fillRect(r()*128,r()*128,.5+r()*2,.5+r()*2);}return texture(c);}
