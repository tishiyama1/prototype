import * as THREE from 'three';
// Fixed seed, coherent patches, quiet center, natural edges.
export function groundTexture(){
 const size=256,canvas=document.createElement('canvas');canvas.width=canvas.height=size;const c=canvas.getContext('2d');
 const soil=['#7a7650','#858159','#8c855d','#746c48'],moss=['#52613e','#5a6b42','#627348'],grass=['#424f32','#4b5c37','#52633a'];
 let seed=919;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const u=(x-size/2)/51,v=(y-size/2)/46;
  const radius=Math.hypot(u,v),wave=Math.sin(x*.045)+Math.cos(y*.062)+Math.sin((x+y)*.028);
  const edge=1.1+.11*wave,colors=radius<edge?soil:radius<edge+.28?moss:grass;
  const n=rand();c.fillStyle=colors[Math.min(colors.length-1,Math.floor((n*.5+(wave+3)/12)*colors.length))];c.fillRect(x,y,1,1);
 }
 for(let i=0;i<55;i++){const x=rand()*size,y=rand()*size,u=(x-128)/51,v=(y-128)/46;if(Math.hypot(u,v)<.55)continue;c.fillStyle=moss[i%3];c.beginPath();c.ellipse(x,y,2+rand()*9,2+rand()*5,rand()*3,0,Math.PI*2);c.fill();}
 for(let i=0;i<390;i++){const x=rand()*size,y=rand()*size;c.fillStyle=i%7===0?'#b39b63':i%3?'#6a6949':'#8f8155';c.fillRect(x,y,1+Math.floor(rand()*2),1);}
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.magFilter=texture.minFilter=THREE.NearestFilter;texture.generateMipmaps=false;return texture;
}
export function barkTexture(){const canvas=document.createElement('canvas');canvas.width=16;canvas.height=32;const c=canvas.getContext('2d');c.fillStyle='#665640';c.fillRect(0,0,16,32);for(let x=0;x<16;x++){c.fillStyle=['#4c4735','#756249','#8b7352','#5c503b'][x%4];c.fillRect(x,0,x%3===0?2:1,32);for(let y=x%5;y<32;y+=9){c.fillStyle='#403f31';c.fillRect(x,y,1,2);}}const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;return t;}
