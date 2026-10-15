import * as THREE from 'three';
// A tapered, fluted, curved growth segment. Shared geometry replaces primitive cylinders.
export function growthGeometry(detail=true){const g=new THREE.BufferGeometry(),p=[],uv=[],indices=[],rings=detail?7:4,sides=detail?12:8;
 for(let j=0;j<=rings;j++){const t=j/rings,y=t-.5,radius=(1-t*.36)*(1+Math.pow(1-t,5)*.28),bend=Math.sin(t*Math.PI)*.17;
  for(let k=0;k<=sides;k++){const a=k/sides*Math.PI*2,flute=1+.11*Math.sin(a*5+t*.7)+.06*Math.cos(a*3-t*2);p.push(Math.cos(a)*radius*flute+bend,y,Math.sin(a)*radius*flute);uv.push(k/sides,t);if(j<rings&&k<sides){const n=j*(sides+1)+k;indices.push(n,n+sides+1,n+1,n+1,n+sides+1,n+sides+2);}}
 }g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;}
export function weatheredRock(detail=1){const g=new THREE.SphereGeometry(1,detail?14:9,detail?9:6),p=g.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),ridge=1+.13*Math.sin(x*5+z*3)+.09*Math.cos(y*6-z*5)+.035*Math.sin(x*17+y*13);p.setXYZ(i,x*ridge,y*ridge*.85+.05*Math.sin(x*4),z*ridge);}
 g.computeVertexNormals();return g;}
export function leafPatchGeometry(){const g=new THREE.PlaneGeometry(2,2,3,3),p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);p.setZ(i,.16*Math.sin(x*2+y)*Math.cos(y*2));}g.computeVertexNormals();return g;}
