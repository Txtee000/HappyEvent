'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
export type Candle = { id: number; x: number; z: number; color: string };
export default function Cake({flavor, candles, lit, onPlace}: {flavor: string; candles: Candle[]; lit: boolean; onPlace: (x: number,z: number)=>void}) {
  const host = useRef<HTMLDivElement>(null);
  const state = useRef({flavor,candles,lit,onPlace});
  const update = useRef<(()=>void) | null>(null);
  useEffect(()=>{state.current={flavor,candles,lit,onPlace}; update.current?.();},[flavor,candles,lit,onPlace]);
  useEffect(()=>{
    const el=host.current!;
    let renderer: THREE.WebGLRenderer;
    try { renderer=new THREE.WebGLRenderer({antialias:true,alpha:true}); } catch { el.textContent='อุปกรณ์นี้ไม่รองรับ 3D (WebGL) กรุณาลองเบราว์เซอร์อื่น'; return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap; renderer.setClearColor(0,0); el.appendChild(renderer.domElement);
    const scene=new THREE.Scene(); const camera=new THREE.PerspectiveCamera(35,1,.1,100); camera.position.set(5,4.8,7.5);
    const controls=new OrbitControls(camera,renderer.domElement); controls.target.set(0,1,0); controls.enablePan=false; controls.enableZoom=false; controls.minPolarAngle=.35; controls.maxPolarAngle=1.38; controls.enableDamping=true;
    scene.add(new THREE.AmbientLight(0xffffff,2)); const light=new THREE.DirectionalLight(0xfff1df,4); light.position.set(-3,7,5); light.castShadow=true; light.shadow.mapSize.set(1024,1024); scene.add(light);
    const rim=new THREE.DirectionalLight(0xffb7cf,2); rim.position.set(4,3,-3); scene.add(rim);
    const group=new THREE.Group(); scene.add(group);
    const mat=(color:string)=>new THREE.MeshStandardMaterial({color,roughness:.65});
    const mesh=(geometry:THREE.BufferGeometry, material:THREE.Material,x:number,y:number,z:number,parent:THREE.Group=group)=>{const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
    mesh(new THREE.CylinderGeometry(2.3,2.3,.12,96),mat('#faf3e8'),0,.1,0);
    mesh(new THREE.CylinderGeometry(2.1,2.2,.09,96),mat('#dbcab9'),0,.03,0);
    const body=mesh(new THREE.CylinderGeometry(1.75,1.75,1.2,96),mat('#edb3bf'),0,.76,0);
    const filling=mesh(new THREE.CylinderGeometry(1.758,1.758,.07,96),mat('#fff2df'),0,.75,0);
    const top=mesh(new THREE.CylinderGeometry(1.77,1.77,.15,96),mat('#fff1e5'),0,1.4,0);
    const frosting=mat('#fff1e5');
    for(let i=0;i<32;i++){const a=i/32*Math.PI*2;const h=.12+(Math.sin(i*2.7)+1)*.085;mesh(new THREE.CapsuleGeometry(.115,h,6,12),frosting,Math.cos(a)*1.68,1.32-h/2,Math.sin(a)*1.68);}
    for(let i=0;i<25;i++){const a=i/25*Math.PI*2;const cream=mesh(new THREE.SphereGeometry(.13,12,12),frosting,Math.cos(a)*1.53,1.53,Math.sin(a)*1.53);cream.scale.set(1,1.15,1);}
    const sprinkleColors=['#e7829a','#f0c370','#a0bcb0','#fffaf0'];
    for(let i=0;i<65;i++){const a=i*2.39996;const r=Math.sqrt((i+.5)/65)*1.4;const s=mesh(new THREE.CapsuleGeometry(.018,.065,3,5),mat(sprinkleColors[i%4]),Math.cos(a)*r,1.485,Math.sin(a)*r);s.rotation.set(Math.PI/2,0,a);}
    const candleGroup=new THREE.Group();group.add(candleGroup);const flames:THREE.Mesh[]=[];
    update.current=()=>{
      (body.material as THREE.MeshStandardMaterial).color.set(state.current.flavor==='chocolate'?'#865745':state.current.flavor==='vanilla'?'#ebd3ab':'#e7a6b7');
      (filling.material as THREE.MeshStandardMaterial).color.set(state.current.flavor==='chocolate'?'#bc937b':'#fff2df');
      candleGroup.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());}});candleGroup.clear();flames.length=0;
      state.current.candles.forEach(c=>{
        mesh(new THREE.CylinderGeometry(.052,.052,.65,16),mat(c.color),c.x,1.8,c.z,candleGroup);
        for(let j=0;j<5;j++){const stripe=mesh(new THREE.TorusGeometry(.053,.009,5,16),mat('#fff8ee'),c.x,1.55+j*.12,c.z,candleGroup);stripe.rotation.x=Math.PI/2;}
        mesh(new THREE.CylinderGeometry(.008,.008,.09,8),mat('#5d403a'),c.x,2.155,c.z,candleGroup);
        if(state.current.lit){const f=mesh(new THREE.SphereGeometry(.065,12,12),new THREE.MeshBasicMaterial({color:'#ffb34d'}),c.x,2.27,c.z,candleGroup);f.scale.set(.8,1.8,.8);flames.push(f);const core=mesh(new THREE.SphereGeometry(.035,8,8),new THREE.MeshBasicMaterial({color:'#fff5bf'}),c.x,2.24,c.z,candleGroup);core.scale.y=1.6;}
      });
    };update.current();
    const shadow=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.1})); shadow.rotation.x=-Math.PI/2;shadow.position.y=-.03;shadow.receiveShadow=true;scene.add(shadow);
    const resize=()=>{const w=el.clientWidth,h=el.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();};const observer=new ResizeObserver(resize);observer.observe(el);resize();
    let startX=0,startY=0; const down=(e:PointerEvent)=>{startX=e.clientX;startY=e.clientY;};
    const up=(e:PointerEvent)=>{if(Math.hypot(e.clientX-startX,e.clientY-startY)>7)return;const rect=el.getBoundingClientRect();const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);const hit=ray.intersectObject(top)[0];if(hit && hit.face && hit.face.normal.y>.9 && Math.hypot(hit.point.x,hit.point.z)<1.4)state.current.onPlace(hit.point.x,hit.point.z);};
    renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointerup',up);
    let frame=0;const animate=(time:number)=>{frame=requestAnimationFrame(animate);flames.forEach((f,i)=>{f.scale.y=1.8+Math.sin(time*.008+i)*.2;f.rotation.z=Math.sin(time*.005+i)*.1;});controls.update();renderer.render(scene,camera);};frame=requestAnimationFrame(animate);
    return()=>{cancelAnimationFrame(frame);observer.disconnect();controls.dispose();renderer.domElement.removeEventListener('pointerdown',down);renderer.domElement.removeEventListener('pointerup',up);scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());}});renderer.dispose();renderer.domElement.remove();update.current=null;};
  },[]);
  return <div ref={host} className="cake-canvas" aria-label="เค้กสามมิติ ลากเพื่อหมุน แตะบนหน้าเค้กเพื่อปักเทียน" />;
}
