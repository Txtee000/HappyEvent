'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { ArrowRight, CakeSlice, Check, ChevronRight, Flame, Heart, Mic, MicOff, Minus, Plus, RotateCcw, Sparkles, Volume2, Wind } from 'lucide-react';
import type { Candle } from '../components/Cake';
const Cake = dynamic(()=>import('../components/Cake'),{ssr:false,loading:()=> <div className="cake-canvas loading">กำลังอบเค้กของคุณ…</div>});
const colors=['#e68ba5','#a4b9a5','#b5a0c9','#edc574','#8eb9cd'];
const initial:Candle[]=[];
export default function Home(){
  const [flavor,setFlavor]=useState('strawberry');const [color,setColor]=useState(colors[0]);const [candles,setCandles]=useState(initial);
  const [name,setName]=useState('');const [phase,setPhase]=useState<'decorate'|'wish'|'celebrate'>('decorate');
  const [mic,setMic]=useState(false);const [busy,setBusy]=useState(false);const [level,setLevel]=useState(0);const [error,setError]=useState('');const [sensitivity,setSensitivity]=useState(55);
  const audio=useRef<AudioContext|null>(null);const stream=useRef<MediaStream|null>(null);const frame=useRef(0);const mounted=useRef(true);const threshold=useRef(sensitivity);threshold.current=sensitivity;
  const stop=useCallback(()=>{cancelAnimationFrame(frame.current);stream.current?.getTracks().forEach(t=>t.stop());stream.current=null;void audio.current?.close().catch(()=>{});audio.current=null;if(mounted.current){setMic(false);setLevel(0);}},[]);
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;stop();};},[stop]);
  useEffect(()=>{const hide=()=>{if(document.hidden)stop();};document.addEventListener('visibilitychange',hide);return()=>document.removeEventListener('visibilitychange',hide);},[stop]);
  const celebrate=useCallback(()=>{stop();setPhase('celebrate');},[stop]);
  const startMic=async()=>{
    if(busy)return;setError('');setBusy(true);
    try{
      if(!navigator.mediaDevices?.getUserMedia)throw new Error('เปิดเว็บผ่าน HTTPS เพื่อใช้ไมโครโฟน หรือใช้ปุ่มเป่าเทียนด้านล่าง');
      const context=new AudioContext();audio.current=context;await context.resume();
      const input=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
      if(!mounted.current || audio.current!==context){input.getTracks().forEach(t=>t.stop());return;}
      stream.current=input;const source=context.createMediaStreamSource(input);const analyser=context.createAnalyser();analyser.fftSize=1024;source.connect(analyser);const data=new Uint8Array(analyser.fftSize);setMic(true);
      const started=performance.now();let last=started,held=0,baseline=.015;
      const sample=(now:number)=>{analyser.getByteTimeDomainData(data);let sum=0;for(const v of data)sum+=((v-128)/128)**2;const rms=Math.sqrt(sum/data.length);const dt=Math.min(now-last,100);last=now;
        if(now-started<1000){baseline=baseline*.9+rms*.1;setLevel(Math.min(100,rms*400));}
        else{const gate=Math.max(.025,baseline*2.6,(100-threshold.current)*.0018);setLevel(Math.min(100,rms/gate*65));held=rms>gate?held+dt:Math.max(0,held-dt*2);if(held>450){celebrate();return;}}
        frame.current=requestAnimationFrame(sample);
      };frame.current=requestAnimationFrame(sample);
    }catch(e){stop();setError(e instanceof DOMException?(e.name==='NotAllowedError'?'ยังไม่ได้อนุญาตไมโครโฟน เปิดสิทธิ์ในเบราว์เซอร์แล้วลองอีกครั้ง':e.name==='NotFoundError'?'ไม่พบไมโครโฟน ลองใช้อุปกรณ์อื่นหรือปุ่มเป่าเทียน':'เปิดไมโครโฟนไม่ได้ กรุณาลองอีกครั้ง'):e instanceof Error?e.message:'เปิดไมโครโฟนไม่ได้');}finally{if(mounted.current)setBusy(false);}
  };
  const place=useCallback((x:number,z:number)=>{if(phase!=='decorate')return;setCandles(prev=>prev.length>=24 || prev.some(c=>Math.hypot(c.x-x,c.z-z)<.18)?prev:[...prev,{id:Date.now()+Math.random(),x,z,color}]);},[color,phase]);
  const add=()=>{for(let i=0;i<100;i++){const a=Math.random()*Math.PI*2,r=Math.sqrt(Math.random())*1.25,x=Math.cos(a)*r,z=Math.sin(a)*r;if(!candles.some(c=>Math.hypot(c.x-x,c.z-z)<.18)){place(x,z);break;}}};
  const reset=()=>{stop();setError('');setPhase('decorate');};
  return <main>
    <header><a className="brand" href="/"><span className="brand-icon"><CakeSlice size={21}/></span>make a wish<span className="brand-dot">✦</span></a><span className="header-note">a little cake. a big wish.</span><span className="made"><Heart size={13}/> made for your special day</span></header>
    <section className="intro"><span className="eyebrow"><Sparkles size={13}/> A LITTLE MOMENT OF MAGIC</span><h1>วันพิเศษของคุณ<br/>เริ่มต้นด้วย<span>คำอธิษฐาน</span></h1><p>เค้กหนึ่งก้อน เทียนเล่มเล็ก ๆ และความปรารถนาที่ยิ่งใหญ่<br className="mobile-break"/> สร้างเค้กของคุณ แล้วเป่าให้ความฝันเป็นจริง</p></section>
    <div className="workspace">
      <section className="stage"><div className="stage-label"><span className="live-dot"/> YOUR BIRTHDAY CAKE</div><span className="stage-star star-one">✧</span><span className="stage-star star-two">✦</span><span className="stage-star star-three">✧</span>
        <div className="cake-greeting"><span>happy birthday</span><h2>{name.trim() || 'คนพิเศษ' } <Heart size={20}/></h2></div>
        <Cake flavor={flavor} candles={candles} lit={phase!=='celebrate'} onPlace={place}/>
        <div className="stage-help"><RotateCcw size={14}/> ลากเพื่อหมุนดูเค้ก <span>·</span> {phase==='decorate'?'แตะหน้าเค้กเพื่อปักเทียน':'อธิษฐานให้เต็มหัวใจ'}</div>
        <div className="stage-bottom"><span><Flame size={15}/>{candles.length} เล่มแห่งความหวัง</span><span className="dimension">INTERACTIVE 3D</span></div>
        {phase==='celebrate'&&<div className="confetti" aria-hidden="true">{Array.from({length:38},(_,i)=><i key={i} style={{left:`${(i*37)%100}%`,background:colors[i%5],animationDelay:`${i%8*.1}s`,transform:`rotate(${i*19}deg)`}}/>)}</div>}
      </section>
      <aside className="panel">
        <div className="steps">{['แต่งเค้ก','อธิษฐาน','ฉลองกัน'].map((s,i)=><span key={s} className={i===(['decorate','wish','celebrate'].indexOf(phase))?'active':''}><b>{i===2&&phase==='celebrate'?<Check size={12}/>:i+1}</b>{s}{i<2&&<ChevronRight size={12}/>}</span>)}</div>
        {phase==='decorate'?<><h2>เค้กที่เป็นคุณ<span>♡</span></h2><p className="panel-sub">เติมความสุขทีละนิด ในแบบที่คุณชอบ</p><label className="field-label" htmlFor="name">เค้กนี้เป็นของใคร?</label><input id="name" maxLength={30} value={name} onChange={e=>setName(e.target.value)} placeholder="ชื่อคนพิเศษ"/><div className="field-label">เลือกรสชาติ <span>01</span></div><div className="flavors">{[{id:'strawberry',label:'สตรอว์เบอร์รี',icon:'🍓'},{id:'vanilla',label:'วานิลลา',icon:'🌼'},{id:'chocolate',label:'ช็อกโกแลต',icon:'🍫'}].map(f=><button className={flavor===f.id?'selected':''} key={f.id} onClick={()=>setFlavor(f.id)} aria-pressed={flavor===f.id}><span>{f.icon}</span>{f.label}{flavor===f.id&&<i><Check size={10}/></i>}</button>)}</div><div className="field-label">สีเทียนของคุณ <span>02</span></div><div className="swatches">{colors.map((c,i)=><button key={c} aria-label={['สีชมพู','สีเขียว','สีม่วง','สีเหลือง','สีฟ้า'][i]} aria-pressed={color===c} className={color===c?'chosen':''} style={{background:c}} onClick={()=>setColor(c)}>{color===c&&<Check size={16}/>}</button>)}<span>สีเล็ก ๆ ที่ทำให้ยิ้ม</span></div><div className="field-label">เทียนวันเกิด <span>03</span></div><div className="candle-row"><div className="counter"><button aria-label="ลบเทียนล่าสุด" disabled={!candles.length} onClick={()=>setCandles(c=>c.slice(0,-1))}><Minus size={16}/></button><strong>{candles.length}</strong><button aria-label="เพิ่มเทียน" disabled={candles.length>=24} onClick={add}><Plus size={16}/></button></div><span>ปักได้สูงสุด 24 เล่ม<br/><small>หรือแตะบนหน้าเค้กได้เลย</small></span></div><button className="primary" disabled={!candles.length} onClick={()=>{setError('');setPhase('wish');}}>พร้อมแล้ว มาอธิษฐานกัน <ArrowRight size={17}/></button><div className="small-note"><Heart size={12}/> ทุกคำอธิษฐาน มีความหมายเสมอ</div></>:phase==='wish'?<div className="wish"><div className="round-icon"><Wind size={29}/></div><h2>หลับตา อธิษฐาน…</h2><p>นึกถึงสิ่งดี ๆ ที่อยากให้เกิดขึ้น<br/>แล้วเป่าเบา ๆ ไปที่ไมโครโฟนมือถือ</p><div className="mic-box"><div className="mic-status"><Volume2 size={17}/><span>{mic?'กำลังฟัง… เป่าต่อเนื่องประมาณครึ่งวินาที':'เปิดไมโครโฟนเมื่อพร้อม'}</span><span className={mic?'listening-dot':''}/></div><div className="meter"><div style={{width:`${level}%`}}/></div><small>หลังเปิดไมค์ รอเงียบ ๆ 1 วินาทีเพื่อวัดเสียงรอบตัว</small></div><label className="sensitivity">ความไวไมโครโฟน <span>{sensitivity}%</span><input aria-label="ความไวไมโครโฟน" type="range" min="10" max="90" value={sensitivity} onChange={e=>setSensitivity(Number(e.target.value))}/></label>{error&&<p className="error" role="alert">{error}</p>}<button className="primary" disabled={busy} onClick={()=>mic?stop():void startMic()}>{mic?<MicOff size={17}/>:<Mic size={17}/>} {busy?'กำลังเปิดไมโครโฟน…':mic?'หยุดไมโครโฟน':'เปิดไมค์ แล้วเป่าเทียน'}</button><button className="text-button" onClick={celebrate}><Wind size={15}/> เป่าด้วยปุ่มแทน</button><button className="back-button" onClick={reset}>กลับไปแต่งเค้ก</button><div className="small-note">เสียงประมวลผลในเครื่อง ไม่บันทึกหรือส่งออก</div></div>:<div className="celebrate"><div className="round-icon"><Sparkles size={30}/></div><span className="eyebrow">YOUR WISH IS ON ITS WAY</span><h2>สุขสันต์วันเกิด<br/>{name.trim() || 'คนพิเศษ'}!</h2><p>ขอให้ปีนี้เต็มไปด้วยรอยยิ้ม<br/>ความรัก และความฝันที่เป็นจริง ♡</p><div className="wish-card">“ โลกนี้น่ารักขึ้น<br/>เพราะมีคุณอยู่ด้วย ”</div><button className="primary" onClick={reset}><RotateCcw size={16}/> อธิษฐานอีกครั้ง</button><div className="small-note">เก็บช่วงเวลานี้ไว้ในหัวใจ</div></div>}
      </aside>
    </div>
    <footer><span className="footer-spark">✧</span><span>ความสุขเล็ก ๆ ไม่ต้องรอให้ถึงวันเกิด</span><span>BAKED WITH LOVE, JUST FOR YOU</span></footer>
  </main>;
}
