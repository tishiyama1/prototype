import * as THREE from 'three';
import {clamp} from './config.js';
const mat = (color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.82,flatShading:true,...extra});
const palette={skin:mat('#e6ba84'),coat:mat('#427c8f'),cloth:mat('#223e46'),leather:mat('#503b2e'),hair:mat('#37332d'),metal:mat('#dce8dd',{metalness:.6,roughness:.35}),gold:mat('#d6ad58',{metalness:.4}),goblin:mat('#84a15a'),dark:mat('#294338'),eye:mat('#ffdd73',{emissive:'#79501b'}),scarf:mat('#d77052')};
const geo={head:new THREE.IcosahedronGeometry(.25,1),box:new THREE.BoxGeometry(1,1,1),limb:new THREE.CylinderGeometry(.08,.065,.42,5),cone:new THREE.ConeGeometry(.18,.38,5)};
function part(g,m,s,x=0,y=0,z=0){const o=new THREE.Mesh(g,m);o.scale.set(...s);o.position.set(x,y,z);o.castShadow=true;return o;}
export class CharacterView {
  constructor(scene,enemy=false) {
    this.root=new THREE.Group();this.body=new THREE.Group();this.root.add(this.body);scene.add(this.root);this.enemy=enemy;
    const m=palette;
    this.body.add(part(geo.box,enemy?m.dark:m.coat,[.38,.48,.24],0,.78));
    this.body.add(part(geo.box,m.leather,[.41,.07,.27],0,.58));
    const head=part(geo.head,enemy?m.goblin:m.skin,[1,1.12,.95],0,1.24);this.body.add(head);
    if(enemy) {
      for(const side of [-1,1]){const ear=part(geo.cone,m.goblin,[.75,1,.55],side*.31,1.28);ear.rotation.z=-side*1.1;this.body.add(ear);}
      this.body.add(part(geo.box,m.leather,[.29,.07,.29],0,1.43));
    } else {
      this.body.add(part(geo.head,m.hair,[1.06,.64,1.06],0,1.39,-.015));
      this.body.add(part(geo.box,m.scarf,[.35,.1,.28],0,1.02));
      this.scarf=part(geo.box,m.scarf,[.17,.5,.035],-.18,.84,-.16);this.scarf.rotation.z=-.4;this.body.add(this.scarf);
      this.body.add(part(geo.box,m.leather,[.24,.31,.16],-.1,.83,-.21));
    }
    // Character faces local +X. Eyes and nose make direction readable from the side.
    for(const z of [-.13,.13])this.body.add(part(geo.box,enemy?m.eye:m.hair,[.035,.05,.06],.225,1.28,z));
    this.body.add(part(geo.box,enemy?m.goblin:m.skin,[.1,.075,.1],.24,1.19));
    this.legs=[];this.arms=[];
    for(const side of [-1,1]) {
      const leg=new THREE.Group();leg.position.set(side*.13,.52,0);leg.add(part(geo.limb,enemy?m.dark:m.cloth,[1,1,1],0,-.21));leg.add(part(geo.box,m.leather,[.18,.13,.24],.035,-.45));this.body.add(leg);this.legs.push(leg);
      const arm=new THREE.Group();arm.position.set(0,.94,side*.21);arm.add(part(geo.limb,enemy?m.goblin:m.coat,[.9,.85,.9],0,-.17));arm.add(part(geo.head,enemy?m.goblin:m.skin,[.3,.3,.3],0,-.33));this.body.add(arm);this.arms.push(arm);
    }
    this.weapon=new THREE.Group();this.weapon.position.set(.05,-.33,.03);this.arms[1].add(this.weapon);
    this.weapon.add(part(geo.box,m.leather,[.08,.23,.08],0,.03));
    this.weapon.add(part(geo.box,m.gold,[.32,.065,.10],0,.16));
    this.weapon.add(part(geo.box,m.metal,[enemy ? .14:.10,enemy ? .55:.78,enemy ? .13:.045],0,enemy ? .45:.59));
    const tip=part(geo.cone,m.metal,[.35,.45,.18],0,enemy?.76:.99);this.weapon.add(tip);
    const ringGeo=new THREE.RingGeometry(.29,.36,32);const ringMat=new THREE.MeshBasicMaterial({color:enemy?'#db8868':'#bde4c4',transparent:true,opacity:.65,side:THREE.DoubleSide,depthWrite:false});
    this.ring=new THREE.Mesh(ringGeo,ringMat);this.ring.rotation.x=-Math.PI/2;this.ring.position.y=.025;this.root.add(this.ring);
    if(enemy){this.hp=new THREE.Mesh(geo.box,new THREE.MeshBasicMaterial({color:'#e6c271'}));this.hp.position.set(0,1.8,0);this.hp.scale.set(.65,.065,.04);this.root.add(this.hp);}
  }
  destroy(){this.root.removeFromParent();this.ring.geometry.dispose();this.ring.material.dispose();if(this.hp)this.hp.material.dispose();}


  update(a,worldTime) {
    this.root.position.set(a.x,0,a.z);this.body.rotation.set(0,a.yaw||0,0);
    this.body.position.set(0,0,0);this.body.scale.setScalar(this.enemy?.95:1.08);this.body.visible=true;
    this.root.visible=true;this.weapon.scale.set(1,1,1);
    const move=['move','approach','orbit','retreat','dash'].includes(a.state);
    const stride=move?Math.sin(a.walk)*.64:Math.sin(worldTime*2)*.025;
    for(let i=0;i<2;i++){this.legs[i].rotation.set(0,0,(i?1:-1)*stride);this.arms[i].rotation.set(0,0,(i?-1:1)*stride*.5);}
    this.body.position.y=move?Math.abs(Math.sin(a.walk))*.045:Math.sin(worldTime*2)*.018;
    this.weapon.rotation.set(0,0,-.32);this.ring.material.opacity=a.invincible?.35:.7;
    if(this.scarf)this.scarf.rotation.z=-.4+Math.sin(worldTime*4)*.09+(move?-.3:0);
    if(a.state==='cinematic'){
      const t=a.phase,wind=clamp((t-.10)/.22,0,1),strike=clamp((t-.34)/.20,0,1),follow=clamp((t-.54)/.16,0,1),release=clamp((t-.70)/.25,0,1);
      this.weapon.rotation.z=Math.PI*(1-release)-.32*release;
      if(a.moveId==='thrust'){
        this.arms[1].rotation.z=(.55+(Math.PI/2-.55)*strike)*(1-release);
        this.weapon.scale.y=1+strike*.55*(1-release);this.body.position.x=.20*strike*(1-release);this.body.rotation.z=-.13*strike;
      }else{
        if(a.moveId==='heavy'){
          this.arms[1].rotation.z=(2.7*wind-1.13*strike-.65*follow)*(1-release);
          this.body.position.x=.15*strike*(1-release);
        }else{
          this.arms[1].rotation.z=(.55+1.02*wind)*(1-release);
          this.arms[1].rotation.y=(-.85*wind+.85*strike+.75*follow)*(1-release);
        }
        this.arms[0].rotation.z=a.moveId==='heavy'?this.arms[1].rotation.z*.7:wind*.4;
        this.body.rotation.x=Math.sin(strike*Math.PI)*(a.moveId==='heavy'?.35:.22);
        this.body.rotation.z=-Math.sin(strike*Math.PI)*(a.moveId==='heavy'?.25:.12);
      }
      this.legs[0].rotation.z=-.45*Math.sin(strike*Math.PI);this.legs[1].rotation.z=.4*Math.sin(strike*Math.PI);
    }
    if(a.state==='dash'||a.state==='evade'){this.body.position.y=.04;this.body.rotation.z=-.35;this.arms[1].rotation.z=1.0;this.legs[0].rotation.z=-.8;this.legs[1].rotation.z=.8;this.ring.material.opacity=.25;}
    if(a.state==='guard'||a.state==='wary'){this.arms[1].rotation.z=a.state==='guard'?1.1:.6;this.weapon.rotation.z=Math.PI;this.arms[0].rotation.z=.6;this.legs[0].rotation.z=-.15;this.body.rotation.z=.10;}
    if(a.state==='windup'){this.arms[1].rotation.z=2.7;this.weapon.rotation.z=Math.PI;this.arms[0].rotation.z=1.2;this.body.rotation.z=-.2;}
    if(a.state==='attack'||a.state==='counter'){this.arms[1].rotation.z=1.55;this.weapon.rotation.z=Math.PI;this.body.position.x=.15;this.body.rotation.z=-.2;}
    if(a.state==='recovery'){this.arms[1].rotation.z=.5;this.body.rotation.z=.2;this.body.position.y=-.06;}
    if(a.state==='hurt'){this.body.rotation.z=.28*Math.sin(a.time*18);this.body.position.y=.02;this.arms[1].rotation.z=-.45;}
    if(a.state==='stagger'){this.body.rotation.z=.5;this.body.position.y=-.23;this.legs[0].rotation.z=.7;this.arms[1].rotation.z=-.7;}
    if(a.state==='dead'){this.body.rotation.z=-Math.min(1.55,a.time*4);this.body.position.y=-.18;this.ring.visible=false;}
    else this.ring.visible=true;
    this.ring.material.color.set(a.state==='windup'?'#ff7049':a.state==='guard'?'#a8caff':a.state==='recovery'||a.state==='stagger'?'#ffe283':this.enemy?'#d8aa73':'#d0ead9');
    this.ring.scale.setScalar(a.state==='windup'?1+Math.sin(worldTime*22)*.10:1);
    if(this.hp){this.hp.visible=a.hp>0&&a.hp<a.maxHP;this.hp.scale.x=.65*a.hp/a.maxHP;}
  }
}
