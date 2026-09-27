'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { ArrowRight, CakeSlice, Check, Flame, Heart, Mic, MicOff, Minus, Palette, Plus, RotateCcw, SlidersHorizontal, Sparkles, Trash2, Type, Wind, X } from 'lucide-react';
import type { Candle } from '../components/Cake';
const Cake = dynamic(()=>import('../components/Cake'),{ssr:false,loading:()=> <div className="cake-canvas loading">กำลังอบเค้กของคุณ…</div>});
const colors=['#e68ba5','#a4b9a5','#b5a0c9','#edc574','#8eb9cd'];
const initial:Candle[]=[];
export default function Home(){
  const [flavor,setFlavor]=useState('strawberry');const [color,setColor]=useState(colors[0]);const [candles,setCandles]=useState(initial);
  const [name,setName]=useState('');const [phase,setPhase]=useState<'decorate'|'wish'|'celebrate'>('decorate');
  const [tool,setTool]=useState<'name'|'flavor'|'color'|'candles'|'mic'>('flavor');
  const toolDialog=useRef<HTMLDialogElement>(null);
  const openTool=(next:typeof tool)=>{setTool(next);toolDialog.current?.showModal();};
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
  return <main className="compact-app">
    <div className="workspace compact-workspace">
      <section className="stage" aria-label="เค้กวันเกิด">
        <div className="stage-label"><span className="live-dot"/> YOUR BIRTHDAY CAKE</div>
        <span className="stage-star star-one">✧</span><span className="stage-star star-two">✦</span>
        {phase==='decorate'&&<button type="button" className="remove-candle" disabled={!candles.length} onClick={()=>setCandles([])} aria-label="ลบเทียนทั้งหมด"><Trash2 size={18}/> ลบเทียน</button>}
        <div className="cake-greeting"><span>{phase==='celebrate'?'make a wish come true':'happy birthday'}</span><h2>{name.trim() || 'คนพิเศษ'} <Heart size={20}/></h2><p className="cake-instruction">{phase==='decorate'?'แตะหน้าเค้กเพื่อปักเทียน แล้วกดถัดไป':phase==='wish'?'อธิษฐาน แล้วเป่าใกล้ไมค์ประมาณครึ่งวินาที':'สุขสันต์วันเกิด ขอให้ทุกความฝันเป็นจริง ♡'}</p></div>
        <Cake flavor={flavor} candles={candles} lit={phase!=='celebrate'} onPlace={place}/>
        <div className="stage-help"><RotateCcw size={14}/> ลากเพื่อหมุนดูเค้ก</div>
        <div className="stage-bottom"><span><Flame size={15}/>{candles.length} เล่มแห่งความหวัง</span><span className="dimension">INTERACTIVE 3D</span></div>
        {phase==='celebrate'&&<div className="confetti" aria-hidden="true">{Array.from({length:38},(_,i)=><i key={i} style={{left:((i*37)%100)+'%',background:colors[i%5],animationDelay:(i%8*.1)+'s',transform:'rotate('+i*19+'deg)'}}/>)}</div>}
      </section>
      <section className="action-dock" aria-label="เครื่องมือและขั้นตอนถัดไป">
        <div className="dock-heading"><span>{phase==='decorate'?'แต่งเค้กในแบบของคุณ':phase==='wish'?'ถึงเวลาอธิษฐาน':'คำอธิษฐานของคุณกำลังเดินทาง'}</span><span className="step-count">{['decorate','wish','celebrate'].indexOf(phase)+1} / 3</span></div>
        {phase==='decorate'?<div className="dock-controls">
          <div className="tool-buttons">
            <button className="tool-button" onClick={()=>openTool('name')} aria-haspopup="dialog" aria-controls="cake-tools"><Type size={20}/><span>ชื่อ</span></button>
            <button className="tool-button" onClick={()=>openTool('flavor')} aria-haspopup="dialog" aria-controls="cake-tools"><CakeSlice size={20}/><span>รสเค้ก</span></button>
            <button className="tool-button" onClick={()=>openTool('color')} aria-haspopup="dialog" aria-controls="cake-tools"><Palette size={20}/><span>สีเทียน</span></button>
            <button className="tool-button" onClick={()=>openTool('candles')} aria-haspopup="dialog" aria-controls="cake-tools"><Flame size={20}/><span>เทียน</span></button>
          </div>
          <div className="next-action"><button className="primary" disabled={!candles.length} onClick={()=>{setError('');setPhase('wish');}}>ถัดไป · อธิษฐาน <ArrowRight size={18}/></button>{!candles.length&&<small>ปักเทียนอย่างน้อย 1 เล่มเพื่อเริ่มอธิษฐาน</small>}</div>
        </div>:phase==='wish'?<>
          <div className="live-meter" role="status"><span>{mic?'กำลังฟัง… รอเงียบ ๆ 1 วินาที แล้วเป่าได้เลย':'พร้อมเมื่อไหร่ เปิดไมค์แล้วเป่าเทียนได้เลย'}</span><div className="meter"><div style={{width:level+'%'}}/></div></div>
          {error&&<p className="error" role="alert">{error}</p>}
          <div className="dock-controls wish-controls"><button className="tool-button" onClick={reset} aria-label="กลับไปแต่งเค้ก"><RotateCcw size={19}/><span>กลับ</span></button><button className="tool-button" onClick={()=>openTool('mic')} aria-haspopup="dialog" aria-controls="cake-tools"><SlidersHorizontal size={19}/><span>ปรับไมค์</span></button><button className="tool-button" onClick={celebrate}><Wind size={19}/><span>เป่าแทน</span></button><button className="primary" disabled={busy} onClick={()=>mic?stop():void startMic()}>{mic?<MicOff size={18}/>:<Mic size={18}/>} {busy?'กำลังเปิด…':mic?'หยุดไมค์':'เปิดไมค์ แล้วเป่า'}</button></div>
        </>:<div className="dock-controls celebration-controls"><span><Sparkles size={19}/> ขอให้เป็นปีที่ดีของคุณ</span><button className="primary" onClick={reset}><RotateCcw size={17}/> อธิษฐานอีกครั้ง</button></div>}
      </section>
    </div>
    <dialog id="cake-tools" ref={toolDialog} className="tool-dialog panel" aria-labelledby="tool-title" onClick={e=>{if(e.target===e.currentTarget)toolDialog.current?.close();}}>
      <div className="dialog-heading"><h2 id="tool-title">{({name:'เค้กนี้เป็นของใคร?',flavor:'เลือกรสเค้ก',color:'เลือกสีเทียน',candles:'เทียนวันเกิด',mic:'ปรับไมโครโฟน'})[tool]}</h2><button className="close-tool" onClick={()=>toolDialog.current?.close()} aria-label="ปิดเครื่องมือ"><X size={21}/></button></div>
      {tool==='name'?<><label className="field-label" htmlFor="name">ชื่อคนพิเศษ</label><input id="name" maxLength={30} value={name} onChange={e=>setName(e.target.value)} placeholder="ชื่อคนพิเศษ"/></>:tool==='flavor'?<div className="flavors">{[{id:'strawberry',label:'สตรอว์เบอร์รี',icon:'🍓'},{id:'vanilla',label:'วานิลลา',icon:'🌼'},{id:'chocolate',label:'ช็อกโกแลต',icon:'🍫'}].map(f=><button className={flavor===f.id?'selected':''} key={f.id} onClick={()=>setFlavor(f.id)} aria-pressed={flavor===f.id}><span>{f.icon}</span>{f.label}{flavor===f.id&&<i><Check size={10}/></i>}</button>)}</div>:tool==='color'?<><p className="panel-sub">เลือกสีแล้วแตะหน้าเค้กเพื่อปักเทียนเล่มใหม่</p><div className="swatches">{colors.map((c,i)=><button key={c} aria-label={['สีชมพู','สีเขียว','สีม่วง','สีเหลือง','สีฟ้า'][i]} aria-pressed={color===c} className={color===c?'chosen':''} style={{background:c}} onClick={()=>setColor(c)}>{color===c&&<Check size={18}/>}</button>)}</div></>:tool==='candles'?<><div className="candle-row"><div className="counter"><button aria-label="ลบเทียนล่าสุด" disabled={!candles.length} onClick={()=>setCandles(c=>c.slice(0,-1))}><Minus size={20}/></button><strong>{candles.length}</strong><button aria-label="เพิ่มเทียน" disabled={candles.length>=24} onClick={add}><Plus size={20}/></button></div><span>ปักได้สูงสุด 24 เล่ม<br/><small>หรือแตะบนหน้าเค้กได้เลย</small></span></div></>:<><p className="panel-sub">เพิ่มความไวหากเป่าแล้วเทียนยังไม่ดับ</p><label className="sensitivity">ความไวไมโครโฟน <span>{sensitivity}%</span><input aria-label="ความไวไมโครโฟน" type="range" min="10" max="90" value={sensitivity} onChange={e=>setSensitivity(Number(e.target.value))}/></label><p className="panel-sub">เสียงประมวลผลในเครื่อง ไม่บันทึกหรือส่งออก</p></>}
      <button className="primary" onClick={()=>toolDialog.current?.close()}><Check size={17}/> เสร็จแล้ว</button>
    </dialog>
  </main>;
}
