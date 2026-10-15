import * as THREE from 'three';
import {STATES,CELL,WIDTH,COLUMNS,spriteFrame} from './sprite-state.js?v=journey1';
const cache=new Map();
// Every mark is an integer pixel. No 3D capture, scaling filter, or anti-aliased vector rasterization.
function painter(ctx){const dot=(x,y,c,w=1,h=1)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h);};const line=(x0,y0,x1,y1,c,w=1)=>{x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);let dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1,e=dx+dy;for(;;){dot(x0,y0,c,w,w);if(x0===x1&&y0===y1)break;const e2=e*2;if(e2>=dy){e+=dy;x0+=sx;}if(e2<=dx){e+=dx;y0+=sy;}}};const poly=(points,c)=>{const low=Math.floor(Math.min(...points.map(p=>p[1]))),high=Math.ceil(Math.max(...points.map(p=>p[1])));for(let y=low;y<high;y++){const crosses=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];if((a[1]<=y+.5&&b[1]>y+.5)||(b[1]<=y+.5&&a[1]>y+.5))crosses.push(a[0]+(y+.5-a[1])*(b[0]-a[0])/(b[1]-a[1]));}crosses.sort((a,b)=>a-b);for(let j=0;j+1<crosses.length;j+=2){const x=Math.ceil(crosses[j]-.5),end=Math.ceil(crosses[j+1]-.5);if(end>x)dot(x,y,c,end-x,1);}}};return {dot,line,poly};}
function draw(ctx,enemy,face,state,frame,move='slash'){
 ctx.translate((WIDTH-CELL)/2,0);
 const c=enemy?{edge:'#202a29',skin:'#a4b86b',shade:'#617c48',light:'#d1d994',coat:'#6c5667',fold:'#443748',shine:'#a7888c',hair:'#45533c',scarf:'#a9804f'}:{edge:'#20232d',skin:'#deb88a',shade:'#a5735c',light:'#f2d8a3',coat:'#438a9d',fold:'#285766',shine:'#85c5c7',hair:'#513e39',scarf:'#de764c'};
 const {dot,line,poly}=painter(ctx),back=face===1,side=face>=2,mirror=face===3;
 if(mirror){ctx.translate(CELL,0);ctx.scale(-1,1);}
 const moving=state==='move',stride=moving?[-2,-1,1,2,1,-1][frame]:0,bodyShift=state==='dash'||state==='evade'?3:state==='stagger'?-3:state==='hurt'?[-2,1,2,-1,0,0][frame]:0;
 if(state==='dead'){ctx.translate(38,40);ctx.rotate(-Math.PI/2);ctx.translate(-23,-43);}
 ctx.translate(bodyShift+(state==='cinematic'&&move==='thrust'&&frame>=2&&frame<5?2:0),moving&&frame%3===0?-1:state==='recovery'?1:0);
 // Boots, bent knees and a split coat keep the silhouette legible at small scale.
 poly([[18,31],[24,31],[23,41+stride],[17,43+stride],[16,40+stride]],c.edge);poly([[24,31],[29,31],[30,41-stride],[25,44-stride],[23,41-stride]],c.edge);
 dot(19,33,c.fold,3,6+Math.max(0,stride));dot(25,33,c.fold,3,7-Math.max(0,stride));dot(17,41+stride,'#7a624b',5,2);dot(25,42-stride,'#7a624b',6,2);dot(18,41+stride,'#b09a70',3);dot(26,42-stride,'#b09a70',3);
 poly([[18,21],[26,20],[30,25],[29,33],[25,35],[23,32],[19,35],[16,32],[16,25]],c.edge);
 poly([[19,22],[25,22],[28,26],[27,31],[24,33],[22,30],[18,32],[18,26]],c.coat);dot(19,23,c.shine,2,7);dot(23,25,c.fold,3,7);dot(18,30,'#b79a62',10,2);dot(22,30,'#f0d9a0',2,2);
 if(back){poly([[18,23],[26,23],[29,34],[25,37],[17,35]],c.fold);line(18,25,18,34,c.shine);dot(19,22,c.scarf,7,2);}else{dot(18,21,c.scarf,10,2);line(17,23,16+(state==='idle'?frame:0),30,c.scarf,2);dot(17,29,'#efad68');}
 // A hand-drawn head: hair planes, face highlights, and monster ears/fangs.
 if(enemy){poly([[16,13],[12,10],[14,16],[18,19]],c.edge);poly([[27,13],[33,10],[31,17],[27,19]],c.edge);line(14,12,17,15,c.shade,2);line(28,14,31,12,c.skin,2);}
 poly([[19,10],[25,10],[28,13],[28,20],[25,23],[19,22],[16,19],[16,13]],c.edge);
 poly([[19,12],[25,12],[27,15],[26,20],[23,22],[18,19],[18,14]],back?c.hair:c.skin);
 if(!back){dot(side?23:19,16,c.edge,side?2:2);if(!side)dot(24,16,c.edge,2);dot(side?27:22,17,c.light,side?2:1,2);dot(19,20,c.shade,5);if(enemy){dot(side?23:19,16,'#efbc69');dot(side?25:20,20,'#f4e6b7');dot(26,19,c.shade);}}
 if(!enemy){poly([[17,12],[18,9],[25,9],[28,12],[27,15],[24,12],[22,14],[20,12],[17,15]],c.hair);dot(19,10,'#806451',5);dot(18,12,'#a67f5b',2);}else{dot(18,12,'#927953',10,2);dot(21,12,'#cab77f',3);dot(18,14,c.shade,2);}
 // Arms and swords are animated directly in pixel space, independent of gameplay coordinates.
 let hx=29,hy=29,tipx=38,tipy=17;
 if(state==='guard'){hx=26;hy=25;tipx=19;tipy=12;}
 if(state==='windup'||state==='cinematic'&&frame<2){hx=29;hy=19;tipx=18;tipy=5;}
 if(state==='attack'||state==='counter'||state==='cinematic'&&frame>=2&&frame<5){hx=30;hy=26;tipx=state==='cinematic'&&move==='thrust'?54:44;tipy=state==='cinematic'&&move==='heavy'?34:25;}
 if(!side&&(state==='attack'||state==='counter'||state==='cinematic'&&frame>=2&&frame<5)){hx=26;hy=back?23:29;tipx=26;tipy=back?4:44;}
 if(state==='recovery'||state==='stagger'){hx=30;hy=33;tipx=37;tipy=42;}
 if(moving){hy+=stride;tipy+=stride;}
 line(27,23,hx,hy,c.edge,3);line(27,23,hx,hy,enemy?c.shade:c.coat,2);dot(hx,hy,c.edge,4,4);dot(hx+1,hy+1,c.skin,2,2);
 line(hx+1,hy,tipx,tipy,c.edge,3);line(hx+1,hy,tipx,tipy,'#96aeb6',2);line(hx+1,hy-1,tipx,tipy-1,'#f3e9c8');dot(hx-1,hy-1,'#d9b862',6,2);dot(tipx,tipy-1,'#fff4d6');
 line(17,24,16,30,c.edge,3);line(17,24,16,29,enemy?c.skin:c.coat,2);dot(16,30,c.skin,2,3);
 ctx.setTransform(1,0,0,1,0,0);
}
function drawSpecial(ctx,type,face,state,frame){
 const {dot,line,poly}=painter(ctx),lord=type==='dungeon-lord',back=face===1,side=face>=2;
 ctx.translate((WIDTH-CELL)/2,0);if(face===3){ctx.translate(CELL,0);ctx.scale(-1,1);}if(state==='dead'){ctx.translate(37,42);ctx.rotate(-Math.PI/2);ctx.translate(-24,-43);}
 const active=['attack','counter','cinematic'].includes(state),raised=state==='windup',stride=state==='move'?[0,2,1,0,-2,-1][frame]:0;
 ctx.translate(state==='hurt'?-2:state==='stagger'?-3:0,['idle','wary'].includes(state)&&frame===1?1:0);
 if(lord){
  const edge='#292035',body='#8962b8',shade='#593777',light='#b595d8',gold='#e5c66b';
  dot(12,25,edge,25,16);dot(13,26,shade,23,14);dot(15,14,edge,20,14);dot(16,15,body,18,13);dot(16,15,light,2,12);
  dot(13,10,gold,25,3);dot(16,12,gold,19,3);dot(19,7,gold,3,5);dot(28,7,gold,3,5);dot(14,10,'#fff0b0',20,1);
  if(!back){dot(side?28:20,19,'#ff6973',3,3);if(!side)dot(28,19,'#ff6973',3,3);dot(side?28:20,25,'#483065',side?5:11,3);}
  const hy=raised?21:state==='guard'?28:31;dot(9,hy,edge,6,11);dot(10,hy+1,body,4,9);dot(35,active?23:hy,edge,active?10:6,active?8:11);dot(36,active?24:hy+1,body,active?8:4,active?6:9);
  dot(14,39+stride,edge,8,5);dot(15,39+stride,shade,6,4);dot(28,39-stride,edge,8,5);dot(29,39-stride,shade,6,4);dot(16,29,light,2,5);if(active)dot(43,25,'#f2ddb0',2,3);
 }else{
  poly([[19,11],[28,11],[33,23],[31,39],[36,44],[12,44],[16,38],[14,23]],'#242432');poly([[20,13],[27,13],[30,25],[29,38],[33,42],[16,42],[19,33],[17,25]],'#536784');line(20,27,18,40,'#8092a5',2);line(27,27,28,39,'#35475d',3);
  if(!back){dot(side?24:20,17,'#d7c3a1',side?5:8,7);dot(side?27:21,19,'#252331',2);if(!side)dot(25,19,'#252331',2);dot(21,23,'#786653',6,2);}
  const sx=active?41:35,sy=raised?8:14;line(29,26,sx,28,'#202431',3);line(30,26,sx,27,'#b9ae91',2);line(sx,sy+5,sx,43,'#24232f',3);line(sx+1,sy+5,sx+1,43,'#9a7d59');poly([[sx-4,sy],[sx,sy-4],[sx+5,sy],[sx,sy+5]],'#282332');dot(sx-2,sy-2,'#b49fd5',5,5);dot(sx,sy-2,'#e5d7ff',2,2);dot(17,42+stride,'#262431',6,3);dot(27,42-stride,'#262431',6,3);
 }
 ctx.setTransform(1,0,0,1,0,0);
}
export function atlasFor(enemy=false,move='slash'){
 const key=`${enemy}-${move}`;if(cache.has(key))return cache.get(key);
 const rows=Math.ceil(STATES.length*4*6/COLUMNS),canvas=document.createElement('canvas');canvas.width=COLUMNS*WIDTH;canvas.height=rows*CELL;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.imageSmoothingEnabled=false;
 const cell=document.createElement('canvas');cell.width=WIDTH;cell.height=CELL;const cc=cell.getContext('2d',{willReadFrequently:true});
 for(let s=0;s<STATES.length;s++)for(let face=0;face<4;face++)for(let f=0;f<6;f++){cc.clearRect(0,0,WIDTH,CELL);if(['dungeon-lord','support'].includes(enemy))drawSpecial(cc,enemy,face,STATES[s],f);else draw(cc,enemy===true||enemy==='sword-fiend',face,STATES[s],f,move);const i=(s*4+face)*6+f;ctx.drawImage(cell,(i%COLUMNS)*WIDTH,Math.floor(i/COLUMNS)*CELL);}
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.magFilter=texture.minFilter=THREE.NearestFilter;texture.generateMipmaps=false;const result={texture,canvas,rows};cache.set(key,result);return result;
}
export function selectFrame(texture,rows,a,time){const f=spriteFrame(a,time);texture.repeat.set(1/COLUMNS,1/rows);texture.offset.set(f.index%COLUMNS/COLUMNS,1-(Math.floor(f.index/COLUMNS)+1)/rows);return f;}
