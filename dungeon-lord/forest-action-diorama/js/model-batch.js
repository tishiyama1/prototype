import * as THREE from 'three';
// Merge only rigid meshes under an animation joint. Joint transforms and timing stay intact.
export function batchRigid(parent,skip=[],weapon=false){
 const parts=parent.children.filter(o=>o.isMesh&&!skip.includes(o));if(parts.length<2)return;
 const positions=[],normals=[],colors=[];
 for(const mesh of parts){mesh.updateMatrix();const g=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone();g.applyMatrix4(mesh.matrix);const p=g.getAttribute('position'),n=g.getAttribute('normal'),color=mesh.material.color;
  for(let i=0;i<p.count;i++){positions.push(p.getX(i),p.getY(i),p.getZ(i));normals.push(n.getX(i),n.getY(i),n.getZ(i));colors.push(color.r,color.g,color.b);}g.dispose();parent.remove(mesh);
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.computeBoundingSphere();
 const material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:weapon?.58:.9,metalness:weapon?.25:0,flatShading:true});const mesh=new THREE.Mesh(geometry,material);mesh.castShadow=true;parent.add(mesh);
}
