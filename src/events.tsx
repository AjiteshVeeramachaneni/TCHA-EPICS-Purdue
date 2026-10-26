import { useState, useRef, useEffect } from 'react'

import { C } from './event-data'
import { useMuseumContent } from './content'
export { C, EVENTS } from './event-data'
import type { EventMeta } from './event-data'

function ChapterIntro({ id, onComplete }: { id: number; onComplete: () => void }) {
  const { events: EVENTS, introductions: EVENT_INTROS } = useMuseumContent()
  const meta = EVENTS[id - 1]
  const data = EVENT_INTROS[id - 1]
  return (
    <div className="flex flex-col gap-5 pb-2">
      {/* Atmospheric chapter heading */}
      <div className="relative text-center py-10 rounded-2xl overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${meta.accent}0A 0%, rgba(31,46,61,0.02) 100%)`, border: `1px solid ${meta.accent}22` }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Lora,Georgia,serif', fontSize: 130, fontWeight: 700, color: `${meta.accent}07`,
          pointerEvents: 'none', userSelect: 'none', lineHeight: 1 }}>
          {id}
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="text-5xl mb-4">{meta.icon}</div>
          <div className="inline-flex px-3 py-1.5 rounded-full mb-3"
            style={{ background: `${meta.accent}1A`, border: `1px solid ${meta.accent}44` }}>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: meta.accent }}>{meta.year}</span>
          </div>
          <h2 className="font-serif font-bold text-3xl leading-tight px-4" style={{ color: C.ink }}>{meta.title}</h2>
        </div>
      </div>

      {/* Summary */}
      <p className="text-base leading-relaxed" style={{ color: C.ink, opacity: 0.87 }}>{data.summary}</p>

      <p className="text-xs" style={{ color: C.gold }}>Source: {data.source}</p>

      {/* Key figures */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: C.goldL }}>Key Figures in This Event</p>
        <div className="flex flex-col gap-2">
          {data.figures.map(f => (
            <div key={f.name} className="flex items-center gap-3 rounded-xl p-3"
              style={{ background: 'rgba(31,46,61,0.04)', border: '1px solid rgba(31,46,61,0.09)' }}>
              <span className="text-3xl">{f.emoji}</span>
              <div>
                <p className="font-bold text-sm" style={{ color: C.ink }}>{f.name}</p>
                <p className="text-xs" style={{ color: C.ink, opacity: 0.52 }}>{f.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Begin button */}
      <button onClick={onComplete}
        className="w-full py-4 rounded-2xl font-bold text-base mt-1 transition-all duration-200"
        style={{ background: meta.accent, color: C.parch,
          boxShadow: `0 0 30px ${meta.accent}2A` }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = '' }}>
        Begin Activity →
      </button>
    </div>
  )
}

/* ─── SHARED COMPONENTS ─── */

interface StageProps { onComplete: () => void }

function CtxBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5 mb-5" style={{ background: 'rgba(31,46,61,0.055)', border: '1px solid rgba(31,46,61,0.11)' }}>
      <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: C.goldL }}>Background</p>
      <div className="text-sm leading-relaxed space-y-2" style={{ color: C.ink, opacity: 0.85 }}>{children}</div>
    </div>
  )
}

function FactCards({ cards }: { cards: { icon: string; title: string; body: string }[] }) {
  const [flipped, setFlipped] = useState<Set<number>>(new Set())
  return (
    <div className="space-y-3">
      {cards.map((c, i) => (
        <div key={i} onClick={() => setFlipped(s => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n })}
          className="rounded-2xl p-4 cursor-pointer transition-all duration-300"
          style={{ background: flipped.has(i) ? 'rgba(196,146,58,0.1)' : 'rgba(31,46,61,0.05)', border: `1px solid ${flipped.has(i) ? C.gold : 'rgba(31,46,61,0.1)'}` }}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{c.icon}</span>
            <div className="flex-1">
              <p className="font-semibold text-sm" style={{ color: flipped.has(i) ? C.goldL : C.parch }}>{c.title}</p>
              {flipped.has(i) && <p className="text-sm mt-1 leading-relaxed" style={{ color: C.ink, opacity: 0.8 }}>{c.body}</p>}
            </div>
            <span className="text-lg" style={{ color: 'rgba(31,46,61,0.3)' }}>{flipped.has(i) ? '▲' : '▼'}</span>
          </div>
        </div>
      ))}
      {flipped.size < cards.length && <p className="text-center text-xs" style={{ color: C.ink, opacity: 0.4 }}>Tap each card to reveal</p>}
    </div>
  )
}

function ChoiceBtn({ label, selected, correct, onClick, disabled }: { label: string; selected: boolean; correct: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-full py-3 px-4 rounded-xl font-semibold text-left transition-all duration-200 text-sm"
      style={{ background: selected ? (correct ? C.forest : C.brick) : C.navyL, color: C.parch,
        border: `2px solid ${selected ? (correct ? C.forestL : C.brickL) : 'transparent'}`,
        opacity: disabled && !selected ? 0.45 : 1 }}>
      {label} {selected && (correct ? ' ✓' : ' ✗')}
    </button>
  )
}

function GoodAnswer({ text }: { text: string }) {
  return <p className="text-sm mt-2 font-semibold" style={{ color: C.goldL }}>🎉 {text}</p>
}
function BadAnswer({ text }: { text: string }) {
  return <p className="text-sm mt-2" style={{ color: C.brickL }}>💡 {text}</p>
}

const STARS = [[8,12],[15,35],[22,8],[32,18],[42,30],[55,5],[62,22],[70,14],[80,38],[88,8],[93,25],[5,48],[20,55],[38,52],[68,46],[90,42],[12,70],[30,65],[60,68],[82,72]]

/* ═══════════════ EVENT 1: ECLIPSE ═══════════════ */

function E1S1({ onComplete }: StageProps) {
  const [slider, setSlider] = useState(0)
  const [eclipsed, setEclipsed] = useState(false)
  const [choice, setChoice] = useState<string | null>(null)
  const dist = Math.abs(slider - 50)
  const isEclipse = dist < 8

  const go = (v: number) => { setSlider(v); if (Math.abs(v - 50) < 8) setEclipsed(true) }
  const pick = (yr: string) => { if (choice) return; setChoice(yr); if (yr === '1806') setTimeout(onComplete, 1300) }

  return (
    <div className="flex flex-col items-center gap-5">
      <CtxBox>
        <p>In 1806, a Shawnee leader named <strong style={{ color: C.goldL }}>Tenskwatawa</strong> — "The Prophet" — claimed he received special powers from the Great Spirit. He was gathering thousands of followers at a village in Indiana called Prophet's Town.</p>
        <p>Governor <strong style={{ color: C.goldL }}>William Henry Harrison</strong> did not believe him. Harrison sent Tenskwatawa a public challenge: <em style={{ color: C.parchD }}>"If you truly have power from the Great Spirit, make the sun go dark at noon!"</em></p>
        <p>What happened next stunned everyone. <strong>Slide the moon to find out!</strong></p>
      </CtxBox>

      <div className="relative rounded-2xl overflow-hidden flex items-center justify-center"
        style={{ width: '100%', maxWidth: 360, height: 185,
          background: isEclipse ? 'radial-gradient(ellipse, #000520, #000212)' : 'radial-gradient(ellipse at 50% 80%, #1a4a8a, #0a1e3a)',
          transition: 'background 1.2s ease' }}>
        {STARS.map(([x,y], i) => (
          <div key={i} className="absolute rounded-full"
            style={{ width: i%4===0?3:2, height: i%4===0?3:2, left:`${x}%`, top:`${y}%`, background:'white',
              opacity: isEclipse ? 0.75 : 0, transition: 'opacity 1.5s ease' }} />
        ))}
        {isEclipse && <div className="absolute rounded-full animate-pulse" style={{ width:110,height:110,background:'radial-gradient(circle, transparent 38%, rgba(220,180,50,0.22) 55%, transparent 72%)' }} />}
        <div style={{ width:76,height:76,position:'relative' }}>
          <div style={{ position:'absolute',inset:0,borderRadius:'50%',
            background: isEclipse ? '#111a28' : 'radial-gradient(circle, #FFF5A0 0%, #FFD000 40%, #FF8C00 80%)',
            boxShadow: isEclipse ? 'none' : '0 0 45px rgba(255,180,0,0.7)',
            transition:'all 1.3s ease',zIndex:1 }} />
          <div style={{ position:'absolute',inset:0,borderRadius:'50%',
            background:'linear-gradient(135deg,#1a1a2e 60%,#2a2a44)',
            transform:`translateX(${(slider-50)*2.5}px)`,
            transition:'transform 0.04s linear',zIndex:2 }} />
        </div>
        {isEclipse && <div className="absolute bottom-3 text-sm font-bold animate-pulse" style={{color:C.gold}}>✨ ECLIPSE! ✨</div>}
      </div>

      <div className="w-full max-w-xs">
        <p className="text-center text-xs mb-2" style={{color:C.ink,opacity:0.5}}>← Slide the moon across the sun →</p>
        <input type="range" min={0} max={100} value={slider} onChange={e=>go(Number(e.target.value))} className="w-full" />
      </div>

      {eclipsed && (
        <div className="w-full max-w-sm rounded-2xl p-4" style={{background:'rgba(31,46,61,0.05)',border:'1px solid rgba(31,46,61,0.12)'}}>
          <p className="font-semibold text-sm mb-3" style={{color:C.ink}}>You caused an eclipse! Now — what year did Tenskwatawa actually predict this?</p>
          <div className="grid grid-cols-2 gap-2">
            {['1804','1806','1808','1812'].map(yr => (
              <button key={yr} onClick={()=>pick(yr)} disabled={!!choice}
                className="py-2.5 rounded-xl font-bold text-base transition-all duration-200"
                style={{background:choice===yr?(yr==='1806'?C.forest:C.brick):C.navyL,color:C.parch,
                  border:`2px solid ${choice===yr?(yr==='1806'?C.forestL:C.brickL):'transparent'}`,
                  opacity:choice&&choice!==yr?0.4:1}}>
                {yr} {choice===yr&&(yr==='1806'?'✓':'✗')}
              </button>
            ))}
          </div>
          {choice&&choice!=='1806'&&<BadAnswer text="Not quite! The eclipse happened in 1806. Try again." />}
          {choice==='1806'&&<GoodAnswer text="Correct! June 16, 1806 — and it actually happened!" />}
        </div>
      )}
      {!eclipsed && <p className="text-xs text-center" style={{color:C.ink,opacity:0.35}}>First, slide the moon all the way to the center of the sun…</p>}
    </div>
  )
}

function E1S2({ onComplete }: StageProps) {
  const [choice, setChoice] = useState<string|null>(null)
  const pick = (k: string) => { if (choice) return; setChoice(k); if (k==='b') setTimeout(onComplete,1300) }
  return (
    <div className="flex flex-col gap-4">
      <CtxBox>
        <p>The eclipse of June 16, 1806 was a real astronomical event. When the sun actually went dark, many people were amazed. Word spread across Native communities throughout Indiana, Ohio, and beyond.</p>
        <p>Whether Tenskwatawa predicted it through vision or learned about it in advance through travelers, <strong style={{color:C.goldL}}>the result was the same</strong>: his influence exploded overnight.</p>
      </CtxBox>
      <p className="font-semibold text-sm" style={{color:C.ink}}>What happened to Tenskwatawa AFTER the eclipse?</p>
      <div className="flex flex-col gap-2">
        {[
          {k:'a',label:"People laughed and stopped following him"},
          {k:'b',label:"Thousands of new followers joined him at Prophet's Town"},
          {k:'c',label:"Harrison arrested him immediately"},
          {k:'d',label:"Nothing changed — people ignored the eclipse"},
        ].map(o=>(
          <ChoiceBtn key={o.k} label={o.label} selected={choice===o.k} correct={o.k==='b'} onClick={()=>pick(o.k)} />
        ))}
      </div>
      {choice==='b'&&<GoodAnswer text="Exactly right! Prophet's Town grew to over 1,000 followers from many Native nations." />}
      {choice&&choice!=='b'&&<BadAnswer text="Think about what a successful 'miracle' would do to someone's reputation…" />}
    </div>
  )
}

function E1S3({ onComplete }: StageProps) {
  const [seen, setSeen] = useState(new Set<number>())
  const cards = [
    {icon:'🔭',title:'Was the eclipse real?',body:"Yes — it was a real solar eclipse. Some historians believe Tenskwatawa may have learned about it from Shaker missionaries or other travelers who had almanacs. We can't know for certain, but the eclipse itself was not faked."},
    {icon:'🏘️',title:"Prophet's Town grows",body:"After the eclipse, Prophet's Town at the junction of the Tippecanoe and Wabash rivers swelled to over 1,000 people — Shawnee, Delaware, Potawatomi, Kickapoo, and others. It became the largest Native settlement in Indiana."},
    {icon:'📖',title:"Tenskwatawa's message",body:"The Prophet taught that Native people should return to traditional ways and reject European goods — no metal tools, no alcohol, no clothing made by white traders. He believed this would restore the power that Native nations had lost."},
  ]
  const click = (i:number) => { setSeen(s=>{const n=new Set(s);n.add(i);return n}); if (seen.size===2) setTimeout(onComplete,500) }
  useEffect(()=>{ if(seen.size===3) onComplete() },[seen])
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm" style={{color:C.ink,opacity:0.7}}>Tap each card to learn more about this moment in history.</p>
      <FactCards cards={cards} />
      {seen.size===3&&<GoodAnswer text="You've uncovered all three facts. On to the next event!" />}
    </div>
  )
}

/* ═══════════════ EVENT 2: VINCENNES ═══════════════ */

const VINCENNES_CHARS = [
  {name:'Tecumseh',clues:["He was Tenskwatawa's older brother","He led Shawnee resistance against land treaties","He arrived at Vincennes with about 300 warriors in August 1810"],options:['Tecumseh','William Henry Harrison','Shabonee'],emoji:'🦅'},
  {name:'William Henry Harrison',clues:["He was the Governor of Indiana Territory","He made the Fort Wayne Treaty of 1809 — buying 3 million acres","He met Tecumseh at his own home, Grouseland, in Vincennes"],options:['Tecumseh','William Henry Harrison','John Tipton'],emoji:'🎖️'},
  {name:'Tenskwatawa',clues:["He was known as 'The Prophet'","He stayed at Prophet's Town while his brother went to Vincennes","He was Tecumseh's younger brother who claimed visions from the Great Spirit"],options:['Shabonee','Tenskwatawa','Chief Winamac'],emoji:'🔮'},
  {name:'Shabonee',clues:["He was a Potawatomi leader and warrior","He was an ally and close companion of Tecumseh","He would later play a key role during the actual battle"],options:['Tecumseh','Black Hawk','Shabonee'],emoji:'⚡'},
]

function E2S1({ onComplete }: StageProps) {
  const [cur,setCur]=useState(0)
  const [sel,setSel]=useState<string|null>(null)
  const [score,setScore]=useState(0)
  const [done,setDone]=useState(false)
  const char=VINCENNES_CHARS[cur]
  const pick=(n:string)=>{
    if(sel)return; setSel(n)
    if(n===char.name)setScore(s=>s+1)
    setTimeout(()=>{ if(cur<VINCENNES_CHARS.length-1){setCur(c=>c+1);setSel(null)}else setDone(true) },1700)
  }
  if(done)return(
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="text-5xl">{score>=3?'🏆':score>=2?'⭐':'📚'}</div>
      <p className="font-serif font-bold text-2xl" style={{color:C.gold}}>{score}/4 Correct!</p>
      <p className="text-center text-sm max-w-xs" style={{color:C.ink,opacity:0.8}}>{score>=3?'You know all four key figures at Vincennes!':'These are important people to know — great effort!'}</p>
      {score>=2
        ?<button onClick={onComplete} className="px-6 py-3 rounded-xl font-bold" style={{background:C.forest,color:C.parch}}>Continue →</button>
        :<button onClick={()=>{setCur(0);setSel(null);setScore(0);setDone(false)}} className="px-6 py-3 rounded-xl font-bold" style={{background:C.brick,color:C.parch}}>Try Again</button>}
    </div>
  )
  return(
    <div className="flex flex-col items-center gap-5">
      <CtxBox>
        <p>In August 1810, <strong style={{color:C.goldL}}>Tecumseh</strong> arrived at Vincennes, Indiana with about 300 warriors. He was furious about the Fort Wayne Treaty of 1809, which had sold about 3 million acres of Native land to the United States for only 2 cents per acre.</p>
        <p>Tecumseh's argument was powerful: <em>"No single tribe can sell land. The land belongs to all Native nations together."</em> The meeting nearly turned violent. Can you identify the key players?</p>
      </CtxBox>
      <div className="flex gap-2 justify-center mb-1">
        {VINCENNES_CHARS.map((_,i)=>(
          <div key={i} className="h-2 rounded-full transition-all duration-300"
            style={{width:i<cur?24:i===cur?28:8, background:i<cur?C.forest:i===cur?C.gold:'rgba(31,46,61,0.2)'}} />
        ))}
      </div>
      <div className="w-18 h-18 rounded-full flex items-center justify-center text-4xl border-2 border-dashed" style={{width:72,height:72,borderColor:C.gold,background:C.navyL}}>❓</div>
      <div className="w-full max-w-sm rounded-2xl p-4" style={{background:'rgba(31,46,61,0.05)',border:'1px solid rgba(31,46,61,0.12)'}}>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{color:C.goldL}}>Clues</p>
        <ul className="space-y-1.5">{char.clues.map((c,i)=><li key={i} className="flex gap-2 text-sm" style={{color:C.ink}}><span style={{color:C.gold}}>›</span>{c}</li>)}</ul>
      </div>
      <p className="font-semibold text-sm" style={{color:C.ink}}>Who is this person?</p>
      <div className="flex flex-col gap-2 w-full max-w-xs">
        {char.options.map(o=>(
          <button key={o} onClick={()=>pick(o)}
            className="py-3 px-4 rounded-xl font-semibold text-left text-sm transition-all duration-200"
            style={{background:sel===o?(o===char.name?C.forest:C.brick):C.navyL,color:C.parch,
              opacity:sel&&sel!==o?0.4:1,border:`2px solid ${sel===o?(o===char.name?C.forestL:C.brickL):'transparent'}`}}>
            {o}{sel===o&&(o===char.name?' ✓':' ✗')}
          </button>
        ))}
      </div>
    </div>
  )
}

const DEMANDS = [
  {blank:'Fort Wayne',clue:'The 1809 treaty that sold 3 million acres',display:'Fort Wayne Treaty'},
  {blank:'all nations',clue:'Tecumseh\'s argument that land belongs to everyone',display:'all nations together'},
  {blank:'no more',clue:'Tecumseh\'s demand about future sales',display:'no more land sales'},
]

function E2S2({ onComplete }: StageProps) {
  const [answers,setAnswers]=useState<(string|null)[]>([null,null,null])
  const [checked,setChecked]=useState(false)
  const choices=[['Fort Wayne Treaty','Greenville Treaty','Paris Treaty'],['only the Shawnee','all nations together','the United States'],['more land sales','no more land sales','smaller payments']]
  const correct=['Fort Wayne Treaty','all nations together','no more land sales']
  const check=()=>{
    setChecked(true)
    if(answers.every((a,i)=>a===correct[i]))setTimeout(onComplete,1400)
  }
  return(
    <div className="flex flex-col gap-4">
      <CtxBox>
        <p>Tecumseh came with three clear demands. He spoke powerfully for over an hour. Even Harrison, who opposed him, later said Tecumseh was <em style={{color:C.parchD}}>"one of those uncommon geniuses which spring up occasionally to produce revolutions."</em></p>
        <p>Can you figure out what Tecumseh was demanding?</p>
      </CtxBox>
      <p className="text-sm font-semibold" style={{color:C.ink}}>Complete Tecumseh's demands by choosing the right words:</p>
      {DEMANDS.map((d,i)=>(
        <div key={i} className="rounded-2xl p-4" style={{background:'rgba(31,46,61,0.04)',border:'1px solid rgba(31,46,61,0.1)'}}>
          <p className="text-xs mb-2" style={{color:C.ink,opacity:0.55}}>💡 Clue: {d.clue}</p>
          <p className="text-sm mb-2" style={{color:C.ink}}>Demand {i+1}: Cancel the <strong style={{color:checked?(answers[i]===correct[i]?C.forestL:C.brickL):C.goldL}}>{answers[i]??'___'}</strong> {i===0?'immediately.':(i===1?'without consent from _____.':'Make _____ from this point on.')}</p>
          <div className="flex flex-wrap gap-2">
            {choices[i].map(c=>(
              <button key={c} onClick={()=>setAnswers(a=>{const n=[...a];n[i]=c;return n})} disabled={checked}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{background:answers[i]===c?(checked?(c===correct[i]?C.forest:C.brick):C.steel):C.navyL,
                  color:C.parch,border:`1px solid ${answers[i]===c?'rgba(255,255,255,0.2)':'rgba(31,46,61,0.12)'}`}}>
                {c}
              </button>
            ))}
          </div>
        </div>
      ))}
      <button onClick={check} disabled={answers.includes(null)||checked}
        className="w-full py-3 rounded-xl font-bold"
        style={{background:answers.includes(null)||checked?'rgba(31,46,61,0.08)':C.forest,
          color:answers.includes(null)||checked?'rgba(31,46,61,0.3)':C.parch}}>
        Check My Answers
      </button>
      {checked&&answers.every((a,i)=>a===correct[i])&&<GoodAnswer text="Perfect! You captured all three of Tecumseh's demands." />}
      {checked&&!answers.every((a,i)=>a===correct[i])&&<BadAnswer text="Some answers need adjusting. Review the clues above." />}
    </div>
  )
}

function E2S3({ onComplete }: StageProps) {
  const [step,setStep]=useState(0)
  const steps=[
    {label:'Day 1',text:"Tecumseh's warriors arrive armed and tense. Harrison greets them formally at Grouseland.",icon:'🏠'},
    {label:'Day 2',text:"Tecumseh speaks for hours about Native land rights. Harrison refuses to cancel the Fort Wayne Treaty.",icon:'🗣️'},
    {label:'Day 3',text:"Tempers flare. Warriors reach for weapons. A near-violent confrontation is barely avoided.",icon:'⚠️'},
    {label:'Result',text:"Both sides leave unchanged. Nothing is resolved — but war is now closer than ever.",icon:'❌'},
  ]
  useEffect(()=>{ if(step===steps.length) onComplete() },[step])
  return(
    <div className="flex flex-col gap-4">
      <CtxBox>
        <p>After days of tense debate, how did the meeting at Vincennes actually end? Walk through the final moments below.</p>
      </CtxBox>
      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-px" style={{background:'rgba(31,46,61,0.1)'}} />
        <div className="space-y-3 pl-14">
          {steps.map((s,i)=>(
            <div key={i} className="relative rounded-2xl p-4 transition-all duration-400"
              style={{background:i<=step?'rgba(31,46,61,0.06)':'rgba(31,46,61,0.02)',
                border:`1px solid ${i<=step?'rgba(31,46,61,0.15)':'rgba(31,46,61,0.05)'}`,
                opacity:i<=step?1:0.35}}>
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-lg"
                style={{background:i<=step?C.navyL:'rgba(31,46,61,0.05)',border:`2px solid ${i<=step?C.gold:'rgba(31,46,61,0.1)'}`}}>
                {i<=step?s.icon:'○'}
              </div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:C.goldL}}>{s.label}</p>
              <p className="text-sm" style={{color:C.ink,opacity:0.85}}>{s.text}</p>
            </div>
          ))}
        </div>
      </div>
      {step<steps.length&&(
        <button onClick={()=>setStep(s=>s+1)} className="w-full py-3 rounded-xl font-bold"
          style={{background:C.steel,color:C.parch}}>
          {step===0?'Begin the Meeting →':step<steps.length-1?'Next Day →':'See the Result →'}
        </button>
      )}
      {step===steps.length&&<GoodAnswer text="The standoff at Vincennes changed nothing — and guaranteed that war would come." />}
    </div>
  )
}

/* ═══════════════ EVENT 3: MARCH TO THE RIDGE ═══════════════ */

const WAYPOINTS = [
  {id:1,x:110,y:295,label:'Vincennes',date:'Oct 29',info:"Harrison's army — about 1,000 soldiers — leaves Vincennes, the territorial capital of Indiana."},
  {id:2,x:145,y:225,label:'Fort Harrison',date:'Oct 28',info:"The army builds Fort Harrison on the Wabash River. This becomes their supply base before pressing north."},
  {id:3,x:182,y:155,label:'Wabash Crossing',date:'Nov 1',info:"The army crosses the Wabash at an unexpected spot. This unconventional crossing gives them a surprise advantage."},
  {id:4,x:215,y:90,label:'The Ridge',date:'Nov 6',info:"Harrison's officers choose a campsite on a ridge about one mile from Prophet's Town. This will be the battlefield."},
  {id:5,x:250,y:35,label:"Prophet's Town",date:'Nov 7',info:"Tenskwatawa's village — home to over 1,000 Native people from many nations. The battle will erupt before dawn."},
]

function E3S1({ onComplete }: StageProps) {
  const [clicked,setClicked]=useState<number[]>([])
  const [info,setInfo]=useState<typeof WAYPOINTS[0]|null>(null)
  const [wrong,setWrong]=useState<number|null>(null)
  const tap=(id:number)=>{
    const next=clicked.length+1
    if(id===next){
      const wp=WAYPOINTS.find(w=>w.id===id)!
      setInfo(wp); const nc=[...clicked,id]; setClicked(nc)
      if(nc.length===WAYPOINTS.length)setTimeout(onComplete,2000)
    }else{setWrong(id);setTimeout(()=>setWrong(null),600)}
  }
  return(
    <div className="flex flex-col items-center gap-4">
      <CtxBox>
        <p>On October 29, 1811, General Harrison led an army of about 1,000 soldiers north from Vincennes toward Prophet's Town. The march took over a week through difficult terrain.</p>
        <p><strong style={{color:C.goldL}}>Click the waypoints in order</strong> — starting at Vincennes — to follow the army's path to the battlefield.</p>
      </CtxBox>
      <div style={{width:'100%',maxWidth:320,height:340,position:'relative'}}>
        <svg width="320" height="340" style={{position:'absolute',top:0,left:0}}>
          <polyline points={WAYPOINTS.map(w=>`${w.x},${w.y}`).join(' ')} fill="none" stroke="rgba(196,146,58,0.2)" strokeWidth="2" strokeDasharray="6 4"/>
          {clicked.length>1&&<polyline points={WAYPOINTS.slice(0,clicked.length).map(w=>`${w.x},${w.y}`).join(' ')} fill="none" stroke={C.forest} strokeWidth="3"/>}
          {WAYPOINTS.map(wp=>{
            const done=clicked.includes(wp.id); const isNext=wp.id===clicked.length+1; const isWrong=wrong===wp.id
            return(
              <g key={wp.id} onClick={()=>tap(wp.id)} style={{cursor:'pointer'}}>
                <circle cx={wp.x} cy={wp.y} r={isNext?19:14}
                  fill={done?C.forest:isWrong?C.brick:isNext?C.steel:C.navyL}
                  stroke={done?C.forestL:isNext?C.steelL:'rgba(31,46,61,0.2)'} strokeWidth={isNext?3:2}
                  style={{filter:isNext?'drop-shadow(0 0 8px rgba(74,111,165,0.7))':'none',transition:'all 0.2s'}}/>
                <text x={wp.x} y={wp.y} textAnchor="middle" dominantBaseline="middle" fill={C.parch} fontSize={done?12:11} fontWeight="bold">
                  {done?'✓':wp.id}
                </text>
                <text x={wp.x+(wp.x>180?18:-18)} y={wp.y} textAnchor={wp.x>180?'start':'end'}
                  dominantBaseline="middle" fill={done?C.goldL:isNext?C.parch:'rgba(31,46,61,0.4)'} fontSize={11}>
                  {wp.label}
                </text>
                <text x={wp.x+(wp.x>180?18:-18)} y={wp.y+14} textAnchor={wp.x>180?'start':'end'}
                  dominantBaseline="middle" fill="rgba(31,46,61,0.35)" fontSize={10}>
                  {wp.date}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
      <div className="w-full max-w-xs">
        <div className="h-2 rounded-full" style={{background:'rgba(31,46,61,0.1)'}}>
          <div className="h-2 rounded-full transition-all duration-500" style={{width:`${(clicked.length/5)*100}%`,background:`linear-gradient(90deg,${C.forest},${C.gold})`}}/>
        </div>
        <p className="text-xs mt-1 text-center" style={{color:C.ink,opacity:0.45}}>{clicked.length} of 5 stops reached</p>
      </div>
      {info&&(
        <div className="w-full max-w-sm rounded-2xl p-3" style={{background:`rgba(47,75,60,0.3)`,border:`1px solid ${C.forest}`}}>
          <p className="text-xs font-bold mb-1" style={{color:C.goldL}}>📍 {info.label} · {info.date}</p>
          <p className="text-sm" style={{color:C.ink}}>{info.info}</p>
        </div>
      )}
    </div>
  )
}

function E3S2({ onComplete }: StageProps) {
  const items=[
    {id:'powder',label:'🔫 Gunpowder & Muskets',correct:true,reason:'Essential — soldiers needed ammunition for the coming battle.'},
    {id:'food',label:'🍞 Food Rations (30 days)',correct:true,reason:'The march was 150 miles through wilderness. Food was critical.'},
    {id:'axes',label:'🪓 Axes & Building Tools',correct:true,reason:'The army built Fort Harrison along the way — tools were essential.'},
    {id:'medicine',label:'💊 Medicine & Bandages',correct:true,reason:'Necessary for soldiers injured on the march or in battle.'},
    {id:'cannon',label:'🏋️ Heavy Artillery Cannon',correct:false,reason:'Too heavy for the forest paths. Harrison left heavy cannon behind.'},
    {id:'silk',label:'🎀 Silk Uniforms & Dress Clothes',correct:false,reason:'Completely impractical for a frontier march through wilderness.'},
    {id:'cider',label:'🍺 Barrels of Hard Cider',correct:false,reason:'Harrison was strict about alcohol. Soldiers were not permitted to drink on the march.'},
    {id:'tents',label:'⛺ Tents & Blankets',correct:true,reason:'Nights in November Indiana were freezing. Shelter was necessary.'},
  ]
  const [selected,setSelected]=useState<Set<string>>(new Set())
  const [checked,setChecked]=useState(false)
  const toggle=(id:string)=>{ if(checked)return; setSelected(s=>{const n=new Set(s);n.has(id)?n.delete(id):n.add(id);return n}) }
  const check=()=>{
    setChecked(true)
    const correct=items.filter(i=>i.correct).map(i=>i.id)
    if(correct.every(c=>selected.has(c))&&[...selected].every(s=>items.find(i=>i.id===s)?.correct))setTimeout(onComplete,1500)
    else setTimeout(onComplete,3000)
  }
  return(
    <div className="flex flex-col gap-4">
      <CtxBox>
        <p>Before leaving Vincennes, Harrison had to decide what to bring on the 150-mile march. Every choice mattered — too little and soldiers would suffer; too much and the army would move too slowly.</p>
        <p><strong style={{color:C.goldL}}>Select</strong> the items Harrison should bring. Leave out anything that would slow the army or cause problems.</p>
      </CtxBox>
      <div className="grid grid-cols-1 gap-2">
        {items.map(item=>{
          const sel=selected.has(item.id)
          const showResult=checked
          const isCorrect=item.correct
          return(
            <button key={item.id} onClick={()=>toggle(item.id)}
              className="py-3 px-4 rounded-xl text-left transition-all duration-200"
              style={{background:showResult?(sel&&isCorrect?'rgba(47,75,60,0.4)':sel&&!isCorrect?'rgba(139,58,43,0.3)':!sel&&isCorrect?'rgba(139,58,43,0.15)':'rgba(31,46,61,0.03)'):sel?C.navyL:'rgba(31,46,61,0.04)',
                border:`2px solid ${showResult?(sel&&isCorrect?C.forest:sel&&!isCorrect?C.brick:!sel&&isCorrect?C.brickL:'rgba(31,46,61,0.06)'):sel?'rgba(31,46,61,0.3)':'rgba(31,46,61,0.08)'}`,
                color:C.parch}}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{item.label}</span>
                {sel&&!showResult&&<span style={{color:C.goldL}}>✓</span>}
                {showResult&&sel&&isCorrect&&<span style={{color:C.forestL}}>✓ Correct</span>}
                {showResult&&sel&&!isCorrect&&<span style={{color:C.brickL}}>✗ Leave this!</span>}
                {showResult&&!sel&&isCorrect&&<span style={{color:C.brickL}}>✗ Should pack!</span>}
              </div>
              {showResult&&<p className="text-xs mt-1" style={{color:C.ink,opacity:0.65}}>{item.reason}</p>}
            </button>
          )
        })}
      </div>
      <button onClick={check} disabled={selected.size===0||checked}
        className="w-full py-3 rounded-xl font-bold"
        style={{background:selected.size===0||checked?'rgba(31,46,61,0.08)':C.forest,color:selected.size===0||checked?'rgba(31,46,61,0.3)':C.parch}}>
        Review My Choices
      </button>
    </div>
  )
}

function E3S3({ onComplete }: StageProps) {
  const [guess,setGuess]=useState(7)
  const [submitted,setSubmitted]=useState(false)
  const accuracy=Math.abs(guess-10)
  const handleSubmit=()=>{ setSubmitted(true); setTimeout(onComplete,2200) }
  return(
    <div className="flex flex-col gap-5">
      <CtxBox>
        <p>The army left Vincennes on October 28 and reached Prophet's Town on November 6 — a march of about 9 days. They traveled roughly 150 miles through forests, river crossings, and muddy trails.</p>
        <p>The final 8 miles — from their camp to the ridge near Prophet's Town — took only one day. But <strong style={{color:C.goldL}}>they would not rest for long.</strong></p>
      </CtxBox>
      <p className="font-semibold text-sm" style={{color:C.ink}}>How many days do you think the full march took?</p>
      <div className="text-center py-2">
        <div className="text-5xl font-serif font-bold" style={{color:C.gold}}>{guess}</div>
        <div className="text-xs mt-1" style={{color:C.parch,opacity:0.5}}>days</div>
      </div>
      <input type="range" min={3} max={20} value={guess} onChange={e=>setGuess(Number(e.target.value))} className="w-full" disabled={submitted}/>
      <div className="flex justify-between text-xs" style={{color:C.parch,opacity:0.4}}><span>3 days</span><span>20 days</span></div>
      {!submitted&&<button onClick={handleSubmit} className="w-full py-3 rounded-xl font-bold" style={{background:C.steel,color:C.parch}}>Submit My Guess!</button>}
      {submitted&&(
        <div className="rounded-2xl p-4" style={{background:`rgba(196,146,58,0.1)`,border:`1px solid ${C.gold}`}}>
          <p className="font-bold mb-1" style={{color:C.goldL}}>The answer: about 9–10 days</p>
          <p className="text-sm" style={{color:C.ink}}>{accuracy===0?'Exactly right!':`You guessed ${guess} — ${accuracy<=2?'very close!':'the actual march was about 9–10 days.'}`} They arrived at the ridge on November 6. The attack came just one day later — at 4:15 in the morning.</p>
        </div>
      )}
    </div>
  )
}

/* ═══════════════ EVENT 4: THE ATTACK ═══════════════ */

const ATTACK_BLANKS=[
  {answer:'4:15',hint:'The early morning hour'},
  {answer:'sentinel',hint:'A soldier standing watch at night'},
  {answer:"Barton's",hint:'The first company attacked'},
  {answer:'Geiger',hint:'Another officer whose company was hit'},
]
const ATTACK_BANK=['4:15','sentinel',"Barton's",'Geiger','midnight','scout','Harrison','Spencer']

function E4S1({ onComplete }: StageProps) {
  const [filled,setFilled]=useState<(string|null)[]>([null,null,null,null])
  const [checked,setChecked]=useState(false)
  const next=filled.findIndex(f=>f===null)
  const pick=(w:string)=>{ if(checked||next===-1||filled.includes(w))return; const n=[...filled];n[next]=w;setFilled(n) }
  const clear=(i:number)=>{ if(checked)return; const n=[...filled];n[i]=null;setFilled(n) }
  const check=()=>{
    setChecked(true)
    if(filled.every((f,i)=>f===ATTACK_BLANKS[i].answer))setTimeout(onComplete,1600)
  }
  const allCorrect=checked&&filled.every((f,i)=>f===ATTACK_BLANKS[i].answer)
  return(
    <div className="flex flex-col gap-4">
      <CtxBox>
        <p>The night of November 6–7, 1811 was cold and dark. Harrison's army camped on a ridge, just one mile from Prophet's Town. Tenskwatawa had sent warriors out under cover of darkness.</p>
        <p>At exactly <strong style={{color:C.goldL}}>4:15 in the morning</strong>, a single shot fired — and the battle exploded. The attack fell first on the north side of the camp, where two companies were sleeping.</p>
        <p>Use the word bank to fill in the story of the first minutes of battle.</p>
      </CtxBox>
      <div className="rounded-2xl p-5 text-sm leading-loose" style={{background:'rgba(31,46,61,0.04)',border:'1px solid rgba(31,46,61,0.1)',color:C.parch}}>
        <span>At </span>
        {[0,1,2,3].map(i=>{
          const val=filled[i]; const correct=checked?val===ATTACK_BLANKS[i].answer:null
          return(
            <span key={i}>
              <span onClick={()=>clear(i)} title={ATTACK_BLANKS[i].hint}
                className="inline-block cursor-pointer font-bold transition-all duration-200"
                style={{minWidth:80,padding:'2px 8px',margin:'0 3px',borderRadius:6,textAlign:'center',
                  background:val?(correct===true?C.forest:correct===false?C.brick:C.steel):'rgba(31,46,61,0.08)',
                  color:val?C.parch:'rgba(31,46,61,0.3)',border:`1px dashed ${val?'transparent':'rgba(31,46,61,0.2)'}`}}>
                {val??`___`}
              </span>
              {i===0&&" a.m., a "}
              {i===1&&" fired the first shot. The attack fell first on "}
              {i===2&&"'s company — and also on "}
              {i===3&&"'s company — on the north side of the camp, in the cold and dark."}
            </span>
          )
        })}
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{color:C.goldL}}>Word Bank <span style={{color:'rgba(31,46,61,0.4)',fontWeight:400,textTransform:'none',letterSpacing:0}}>— click a blank first, then choose a word</span></p>
        <div className="flex flex-wrap gap-2">
          {ATTACK_BANK.map(w=>{
            const used=filled.includes(w)
            return(<button key={w} onClick={()=>pick(w)} className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
              style={{background:used?'rgba(31,46,61,0.04)':C.navyL,color:used?'rgba(31,46,61,0.25)':C.parch,
                border:`1px solid ${used?'rgba(31,46,61,0.06)':'rgba(31,46,61,0.18)'}`,cursor:used?'default':'pointer'}}>
              {w}
            </button>)
          })}
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={()=>{setFilled([null,null,null,null]);setChecked(false)}} className="flex-1 py-2.5 rounded-xl font-semibold text-sm" style={{background:'rgba(31,46,61,0.06)',color:C.parch}}>Clear All</button>
        <button onClick={check} disabled={filled.includes(null)||checked} className="flex-1 py-2.5 rounded-xl font-bold"
          style={{background:filled.includes(null)||checked?'rgba(31,46,61,0.08)':C.forest,color:filled.includes(null)||checked?'rgba(31,46,61,0.3)':C.parch}}>Check Answers</button>
      </div>
      {allCorrect&&<GoodAnswer text="Correct! The battle erupted in the pre-dawn cold." />}
      {checked&&!allCorrect&&<BadAnswer text="A few blanks need fixing. Clear and try again!" />}
    </div>
  )
}

const COMPANIES=[
  {id:'barton',x:70,y:60,label:"Barton's Co.",color:C.brick,info:"Barton's company on the north side was hit first. They bore the brunt of the initial attack in the dark."},
  {id:'geiger',x:220,y:65,label:"Geiger's Co.",color:C.brickL,info:"Geiger's company was also attacked almost simultaneously on the north side of the perimeter."},
  {id:'harrison',x:150,y:140,label:"Harrison (Center)",color:C.gold,info:"Harrison rallied his troops from the center. Though warriors were specifically sent to kill him, he had changed horses that night."},
  {id:'daviess',x:60,y:185,label:"Daviess Dragoons",color:C.steel,info:"Major Daviess led the dragoon cavalry. He would later be sent to clear warriors from the brush — fatally."},
  {id:'spencer',x:240,y:185,label:"Spencer's Rifles",color:C.forestL,info:"Spencer's Yellow Jacket riflemen defended the east side. Spencer himself was mortally wounded in the fighting."},
]

function E4S2({ onComplete }: StageProps) {
  const [seen,setSeen]=useState(new Set<string>())
  const [active,setActive]=useState<typeof COMPANIES[0]|null>(null)
  const click=(c:typeof COMPANIES[0])=>{ setSeen(s=>{const n=new Set(s);n.add(c.id);return n}); setActive(c) }
  useEffect(()=>{ if(seen.size===COMPANIES.length)setTimeout(onComplete,800) },[seen])
  return(
    <div className="flex flex-col items-center gap-4">
      <CtxBox>
        <p>When the attack erupted at 4:15 a.m., Harrison's camp was shaped like a rough triangle on the ridge. Different companies held different sides. Tap each unit to learn what happened to them.</p>
      </CtxBox>
      <div style={{position:'relative',width:'100%',maxWidth:320,height:260}}>
        <svg width="320" height="260" style={{position:'absolute',top:0,left:0}}>
          <polygon points="150,10 295,240 5,240" fill="none" stroke="rgba(31,46,61,0.12)" strokeWidth="1.5" strokeDasharray="5 4"/>
          <text x="150" y="270" textAnchor="middle" fill="rgba(31,46,61,0.25)" fontSize={10}>Camp Ridge — Battlefield Shape</text>
          {[{x:5,y:245,label:'NORTH'},{x:285,y:245,label:'SOUTH'},{x:140,y:8,label:'↑ NORTH'}].map((l,i)=>(
            <text key={i} x={l.x} y={l.y} fill="rgba(31,46,61,0.2)" fontSize={9}>{l.label}</text>
          ))}
        </svg>
        {COMPANIES.map(c=>{
          const isSeen=seen.has(c.id)
          return(
            <button key={c.id} onClick={()=>click(c)}
              style={{position:'absolute',left:c.x-40,top:c.y-16,width:80,padding:'4px 6px',
                borderRadius:8,background:isSeen?`${c.color}44`:C.navyL,
                border:`2px solid ${isSeen?c.color:'rgba(31,46,61,0.15)'}`,
                color:isSeen?c.color:C.parch,fontSize:11,fontWeight:600,
                cursor:'pointer',transition:'all 0.2s',
                boxShadow:isSeen?`0 0 8px ${c.color}44`:'none'}}>
              {c.label}{isSeen?' ✓':''}
            </button>
          )
        })}
      </div>
      <p className="text-xs text-center" style={{color:C.ink,opacity:0.4}}>Tap each unit · {seen.size}/{COMPANIES.length} discovered</p>
      {active&&(
        <div className="w-full max-w-sm rounded-2xl p-4" style={{background:`${active.color}18`,border:`1px solid ${active.color}44`}}>
          <p className="text-xs font-bold mb-1" style={{color:active.color}}>⚔️ {active.label}</p>
          <p className="text-sm" style={{color:C.ink}}>{active.info}</p>
        </div>
      )}
    </div>
  )
}

function E4S3({ onComplete }: StageProps) {
  const events=[
    {text:"Harrison's army camps on the ridge, one mile from Prophet's Town"},
    {text:"Tenskwatawa performs a ceremony and sends warriors out under cover of darkness"},
    {text:"A sentinel fires the first shot at 4:15 a.m. — the battle begins"},
    {text:"Daviess leads a cavalry charge against warriors in the brush"},
    {text:"Dawn breaks. The fighting slows. Harrison's army holds the ridge"},
  ]
  const [order,setOrder]=useState([2,0,4,1,3])
  const [checked,setChecked]=useState(false)
  const [moved,setMoved]=useState<number|null>(null)
  const moveUp=(i:number)=>{ if(i===0)return; const n=[...order];[n[i-1],n[i]]=[n[i],n[i-1]];setOrder(n) }
  const moveDown=(i:number)=>{ if(i===order.length-1)return; const n=[...order];[n[i],n[i+1]]=[n[i+1],n[i]];setOrder(n) }
  const correct=[0,1,2,3,4]
  const check=()=>{ setChecked(true); if(order.every((v,i)=>v===correct[i]))setTimeout(onComplete,1400) }
  return(
    <div className="flex flex-col gap-4">
      <CtxBox>
        <p>The battle on November 7, 1811 unfolded in just a few chaotic hours before dawn. Can you put the key events in the correct order?</p>
        <p><strong style={{color:C.goldL}}>Use the arrows</strong> to move each event up or down until the order is correct.</p>
      </CtxBox>
      <div className="space-y-2">
        {order.map((idx,i)=>{
          const correct2=checked&&idx===i
          const wrong2=checked&&idx!==i
          return(
            <div key={idx} className="flex items-center gap-2">
              <div className="flex flex-col gap-1">
                <button onClick={()=>moveUp(i)} disabled={i===0||checked} className="w-6 h-5 rounded text-xs font-bold transition-all"
                  style={{background:i===0||checked?'rgba(31,46,61,0.05)':'rgba(31,46,61,0.1)',color:'rgba(31,46,61,0.5)'}}>▲</button>
                <button onClick={()=>moveDown(i)} disabled={i===order.length-1||checked} className="w-6 h-5 rounded text-xs font-bold"
                  style={{background:i===order.length-1||checked?'rgba(31,46,61,0.05)':'rgba(31,46,61,0.1)',color:'rgba(31,46,61,0.5)'}}>▼</button>
              </div>
              <div className="flex-1 rounded-xl px-3 py-2.5 transition-all duration-300"
                style={{background:correct2?'rgba(47,75,60,0.35)':wrong2?'rgba(139,58,43,0.25)':C.navyL,
                  border:`1px solid ${correct2?C.forest:wrong2?C.brick:'rgba(31,46,61,0.1)'}`,fontSize:12,color:C.parch}}>
                <span className="font-bold mr-2" style={{color:C.goldL,opacity:0.7}}>{i+1}.</span>
                {events[idx].text}
                {correct2&&<span style={{color:C.forestL}}> ✓</span>}
              </div>
            </div>
          )
        })}
      </div>
      <button onClick={check} disabled={checked} className="w-full py-3 rounded-xl font-bold"
        style={{background:checked?'rgba(31,46,61,0.08)':C.forest,color:checked?'rgba(31,46,61,0.3)':C.parch}}>
        Check My Order
      </button>
      {checked&&order.every((v,i)=>v===i)&&<GoodAnswer text="Perfect order! The battle lasted about 2 hours before Harrison secured the ridge." />}
      {checked&&!order.every((v,i)=>v===i)&&<BadAnswer text="A few events are out of order. Think about what must happen first…" />}
    </div>
  )
}

/* ═══════════════ EVENT 5: SHABONEE'S RAID ═══════════════ */

function E5S1({ onComplete }: StageProps) {
  const [view,setView]=useState<'shabonee'|'harrison'>('shabonee')
  const [seen,setSeen]=useState(new Set(['shabonee']))
  const [choice,setChoice]=useState<string|null>(null)
  const toggle=(v:'shabonee'|'harrison')=>{ setView(v); setSeen(s=>new Set([...s,v])) }
  const pick=(k:string)=>{ if(choice)return; setChoice(k); if(k==='horse')setTimeout(onComplete,1400) }
  return(
    <div className="flex flex-col gap-4">
      <CtxBox>
        <p>Before the main battle started, <strong style={{color:C.goldL}}>Shabonee</strong> — a Potawatomi warrior — and other warriors were given a special mission: find General Harrison and kill him before the fighting started.</p>
        <p>Warriors knew Harrison's usual white horse. They knew his tent. They moved through the dark camp silently. But something went wrong for them — and right for Harrison.</p>
        <p>Read both accounts below, then answer the question.</p>
      </CtxBox>
      <div className="flex rounded-xl overflow-hidden" style={{border:'1px solid rgba(31,46,61,0.12)'}}>
        {(['shabonee','harrison'] as const).map(v=>(
          <button key={v} onClick={()=>toggle(v)} className="flex-1 py-2 text-sm font-semibold transition-all"
            style={{background:view===v?C.steel:'transparent',color:view===v?C.parch:'rgba(31,46,61,0.45)'}}>
            {v==='shabonee'?'🪶 Shabonee':'📜 Harrison'}
            {!seen.has(v)&&<span className="ml-1" style={{color:C.gold}}>●</span>}
          </button>
        ))}
      </div>
      <div className="rounded-2xl p-5 min-h-36" key={view} style={{background:'rgba(31,46,61,0.04)',border:`1px solid ${view==='shabonee'?C.steel:C.gold}`}}>
        {view==='shabonee'?(
          <>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{color:C.steelL}}>Shabonee (Potawatomi leader, present at the battle)</p>
            <p className="text-sm leading-relaxed" style={{color:C.ink}}>Warriors were assigned to locate and kill General Harrison before the main battle began. They knew which horse he normally rode — a distinctive <strong style={{color:C.goldL}}>white horse</strong> — and which part of the camp was his. Warriors moved quietly through the sleeping soldiers in the dark, searching for the white horse and its rider.</p>
            <p className="text-sm leading-relaxed mt-2" style={{color:C.ink}}>They found the white horse. They found its rider. <strong style={{color:C.goldL}}>But it was not Harrison.</strong> He had switched horses that night. The rider on the white horse was a different officer — and he was killed instead.</p>
          </>
        ):(
          <>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{color:C.goldL}}>Harrison's Official Military Report (1811)</p>
            <p className="text-sm leading-relaxed" style={{color:C.ink}}>Harrison reported that the attack came "from all quarters simultaneously." He described the general assault on the camp and rallied his troops from horseback. He credited his officers and soldiers for holding the perimeter against the attackers.</p>
            <p className="text-sm leading-relaxed mt-2" style={{color:C.ink}}><strong style={{color:C.goldL}}>Harrison made no mention</strong> of a specific plan by warriors to target and kill him before the battle. In his report, the assault was described as a general surprise attack — not a targeted assassination attempt.</p>
          </>
        )}
      </div>
      {seen.size===2&&(
        <div>
          <p className="font-semibold text-sm mb-3" style={{color:C.ink}}>Why did the warriors fail to kill Harrison?</p>
          <div className="flex flex-col gap-2">
            {[
              {k:'escaped',label:'He escaped through a secret tunnel'},
              {k:'horse',label:'He had switched away from his usual white horse that night'},
              {k:'guards',label:'His personal guards stopped the warriors'},
              {k:'knew',label:'Tenskwatawa warned Harrison about the plan'},
            ].map(o=>(
              <ChoiceBtn key={o.k} label={o.label} selected={choice===o.k} correct={o.k==='horse'} onClick={()=>pick(o.k)} />
            ))}
          </div>
          {choice==='horse'&&<GoodAnswer text="Exactly! A simple change of horse saved Harrison's life that night." />}
          {choice&&choice!=='horse'&&<BadAnswer text="Think about what Shabonee specifically mentioned — the white horse." />}
        </div>
      )}
      {seen.size<2&&<p className="text-center text-xs" style={{color:C.ink,opacity:0.4}}>Read both accounts to unlock the question →</p>}
    </div>
  )
}

function E5S2({ onComplete }: StageProps) {
  const diffs=[
    {id:'plot',text:"Shabonee says there was a pre-battle plot to kill Harrison. Harrison's report doesn't mention it.",found:false},
    {id:'horse',text:"Shabonee says the white horse was the key mistake. Harrison's report doesn't mention the horse at all.",found:false},
    {id:'general',text:"Harrison describes it as a general surprise attack from all directions. Shabonee describes specific targeted actions.",found:false},
  ]
  const [found,setFound]=useState(new Set<string>())
  const click=(id:string)=>{ setFound(s=>{const n=new Set(s);n.add(id);return n}) }
  useEffect(()=>{ if(found.size===diffs.length)setTimeout(onComplete,800) },[found])
  return(
    <div className="flex flex-col gap-4">
      <CtxBox>
        <p>You just read two versions of the same event. Historians often have to compare accounts like these to figure out what really happened.</p>
        <p>Tap each difference you spot between Shabonee's account and Harrison's report:</p>
      </CtxBox>
      <div className="space-y-3">
        {diffs.map(d=>(
          <button key={d.id} onClick={()=>click(d.id)} className="w-full text-left rounded-2xl p-4 transition-all duration-300"
            style={{background:found.has(d.id)?'rgba(74,111,165,0.15)':C.navyL,
              border:`2px solid ${found.has(d.id)?C.steel:'rgba(31,46,61,0.1)'}`,color:C.parch}}>
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">{found.has(d.id)?'🔎':'❓'}</span>
              <p className="text-sm leading-relaxed">{found.has(d.id)?d.text:'Click to reveal this difference…'}</p>
            </div>
          </button>
        ))}
      </div>
      <p className="text-xs text-center" style={{color:C.ink,opacity:0.4}}>{found.size}/{diffs.length} differences found</p>
      {found.size===3&&<GoodAnswer text="All three key differences found! Great historical detective work." />}
    </div>
  )
}

function E5S3({ onComplete }: StageProps) {
  const [choice,setChoice]=useState<string|null>(null)
  const pick=(k:string)=>{ if(choice)return; setChoice(k); setTimeout(onComplete,1400) }
  return(
    <div className="flex flex-col gap-4">
      <CtxBox>
        <p>When historians study events like this, they always ask: <em>"Why might someone leave something out of their report?"</em></p>
        <p>Harrison was a military officer writing an official report. Shabonee was telling his story many years later. Both accounts are valuable — but <strong style={{color:C.goldL}}>neither is the complete picture.</strong></p>
      </CtxBox>
      <p className="font-semibold text-sm" style={{color:C.ink}}>Why do you think Harrison didn't mention the plot to kill him in his official report?</p>
      <div className="flex flex-col gap-2">
        {[
          {k:'a',label:"He didn't know about it"},
          {k:'b',label:"Admitting he was a target might make his army seem vulnerable"},
          {k:'c',label:"He forgot about it"},
          {k:'d',label:"It never actually happened"},
        ].map(o=>(
          <ChoiceBtn key={o.k} label={o.label} selected={choice===o.k} correct={o.k==='b'} onClick={()=>pick(o.k)} />
        ))}
      </div>
      {choice==='b'&&<GoodAnswer text="Good thinking! Official reports are often written to show strength, not vulnerability." />}
      {choice&&choice!=='b'&&<BadAnswer text="Consider why a military leader might carefully choose what to include in an official report." />}
    </div>
  )
}

/* ═══════════════ EVENT 6: DAVIESS ═══════════════ */

function E6S1({ onComplete }: StageProps) {
  const [choice,setChoice]=useState<string|null>(null)
  const [revealed,setRevealed]=useState(false)
  const pick=(k:string)=>{ if(choice)return; setChoice(k); setTimeout(()=>setRevealed(true),700) }
  useEffect(()=>{ if(revealed)setTimeout(onComplete,3000) },[revealed])
  return(
    <div className="flex flex-col gap-4">
      <CtxBox>
        <p>During the battle, Native warriors took cover in the thick brush surrounding the ridge. From hiding, they could fire at Harrison's soldiers without being easy targets.</p>
        <p><strong style={{color:C.goldL}}>Major Joseph Daviess</strong>, a lawyer from Kentucky who volunteered for the campaign, was sent to drive them out. He asked Harrison for a large force. Harrison gave him a small one.</p>
      </CtxBox>
      <p className="font-semibold text-sm" style={{color:C.ink}}>You are Major Daviess. You have a small group of cavalry. Warriors are in heavy brush, firing at your men. What would you do?</p>
      <div className="flex flex-col gap-2">
        {[
          {k:'wait',label:'⏳ Wait and ask Harrison for more troops before attacking',icon:'⏳'},
          {k:'charge',label:'⚔️ Lead a direct cavalry charge into the brush right now',icon:'⚔️'},
          {k:'surround',label:'🔍 Split into two groups to surround them from both sides',icon:'🔍'},
        ].map(o=>(
          <button key={o.k} onClick={()=>pick(o.k)} className="flex items-center gap-3 py-3 px-4 rounded-xl font-semibold text-left text-sm transition-all"
            style={{background:choice===o.k?C.steel:C.navyL,color:C.parch,border:`2px solid ${choice===o.k?C.steelL:'transparent'}`}}>
            <span className="text-xl">{o.icon}</span><span>{o.label}</span>
          </button>
        ))}
      </div>
      {revealed&&(
        <div className="rounded-2xl p-5 space-y-3" style={{background:'rgba(139,58,43,0.12)',border:`1px solid ${C.brick}`}}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{color:C.brickL}}>⚔️ What Actually Happened</p>
          <p className="text-sm leading-relaxed" style={{color:C.ink}}>Major Daviess chose to charge — twice. His first charge was driven back. He asked Harrison to try again with the same small force. He charged a second time. He was <strong style={{color:C.brickL}}>shot and mortally wounded</strong>, falling from his horse. He died from his injuries after the battle.</p>
          {choice==='charge'&&<p className="text-sm font-semibold" style={{color:C.goldL}}>That's exactly what he did — his bravery was real, but the numbers weren't in his favor.</p>}
          {choice==='wait'&&<p className="text-sm font-semibold" style={{color:C.goldL}}>That would have been the safer choice. Daviess did not wait. His bravery cost him his life.</p>}
          {choice==='surround'&&<p className="text-sm font-semibold" style={{color:C.goldL}}>A smart tactical idea — but Daviess charged directly. It didn't go well.</p>}
        </div>
      )}
    </div>
  )
}

function E6S2({ onComplete }: StageProps) {
  const [step,setStep]=useState(-1)
  const chain=[
    {label:'The Decision',text:"Daviess led a direct cavalry charge into the brush where warriors were hiding. He was sent with fewer men than he asked for.",icon:'⚔️',color:C.brick},
    {label:'The Consequence',text:"In the charge, Daviess was struck by gunfire. He fell from his horse and was carried from the field. He died from his wounds within days.",icon:'💔',color:C.brickL},
    {label:'The Recognition',text:"Harrison praised Daviess in his official report as one of the most capable and brave officers of the campaign.",icon:'📜',color:C.goldL},
    {label:'The Legacy',text:"Today, Daviess County, Indiana — where Vincennes is located — is named in his honor. He is remembered as a hero of the battle.",icon:'🏛️',color:C.forest},
  ]
  useEffect(()=>{ if(step===chain.length-1)setTimeout(onComplete,800) },[step])
  return(
    <div className="flex flex-col gap-4">
      <CtxBox><p>Every decision has consequences. Follow the chain of events from Daviess's charge to his lasting legacy.</p></CtxBox>
      <div className="space-y-3">
        {chain.map((c,i)=>(
          <div key={i} className="rounded-2xl p-4 transition-all duration-500"
            style={{background:i<=step?`${c.color}18`:C.navyL,border:`2px solid ${i<=step?c.color:'rgba(31,46,61,0.08)'}`,opacity:i<=step?1:0.35}}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{i<=step?c.icon:'○'}</span>
              <p className="text-xs font-bold uppercase tracking-widest" style={{color:i<=step?c.color:'rgba(31,46,61,0.3)'}}>{c.label}</p>
            </div>
            {i<=step&&<p className="text-sm" style={{color:C.ink}}>{c.text}</p>}
          </div>
        ))}
      </div>
      {step<chain.length-1&&(
        <button onClick={()=>setStep(s=>s+1)} className="w-full py-3 rounded-xl font-bold" style={{background:C.steel,color:C.parch}}>
          {step===-1?'Start the Chain →':'Next →'}
        </button>
      )}
    </div>
  )
}

function E6S3({ onComplete }: StageProps) {
  const tf=[
    {text:"Daviess County, Indiana is named after Major Daviess.",answer:true},
    {text:"Major Daviess survived the battle and went home to Kentucky.",answer:false,explain:"He died from his wounds after the battle."},
    {text:"Daviess led the dragoon cavalry unit.",answer:true},
    {text:"Harrison criticized Daviess in his official report.",answer:false,explain:"Harrison praised him as one of the most capable officers."},
  ]
  const [answers,setAnswers]=useState<(boolean|null)[]>([null,null,null,null])
  const [checked,setChecked]=useState(false)
  const pick=(i:number,v:boolean)=>{ if(checked)return; setAnswers(a=>{const n=[...a];n[i]=v;return n}) }
  const check=()=>{ setChecked(true); if(answers.every((a,i)=>a===tf[i].answer))setTimeout(onComplete,1400) }
  return(
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold" style={{color:C.ink}}>True or False? Answer all four, then check.</p>
      {tf.map((q,i)=>(
        <div key={i} className="rounded-2xl p-4" style={{background:'rgba(31,46,61,0.04)',border:`1px solid ${checked?(answers[i]===q.answer?C.forest:C.brick):'rgba(31,46,61,0.1)'}`}}>
          <p className="text-sm mb-2" style={{color:C.ink}}>{q.text}</p>
          <div className="flex gap-2">
            {[true,false].map(v=>(
              <button key={String(v)} onClick={()=>pick(i,v)} disabled={checked}
                className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
                style={{background:answers[i]===v?(checked?(v===q.answer?C.forest:C.brick):C.steel):'rgba(31,46,61,0.08)',
                  color:C.parch,border:`1px solid ${answers[i]===v?'rgba(255,255,255,0.2)':'transparent'}`}}>
                {v?'True':'False'}
              </button>
            ))}
          </div>
          {checked&&answers[i]!==q.answer&&q.explain&&<p className="text-xs mt-2" style={{color:C.brickL}}>💡 {q.explain}</p>}
        </div>
      ))}
      <button onClick={check} disabled={answers.includes(null)||checked} className="w-full py-3 rounded-xl font-bold"
        style={{background:answers.includes(null)||checked?'rgba(31,46,61,0.08)':C.forest,color:answers.includes(null)||checked?'rgba(31,46,61,0.3)':C.parch}}>
        Check My Answers
      </button>
      {checked&&answers.every((a,i)=>a===tf[i].answer)&&<GoodAnswer text="All correct! Daviess is still remembered as a hero in Indiana." />}
    </div>
  )
}

/* ═══════════════ EVENT 7: BURYING THE DEAD ═══════════════ */

function E7S1({ onComplete }: StageProps) {
  const [guess,setGuess]=useState(30)
  const [submitted,setSubmitted]=useState(false)
  const actual=62
  const diff=Math.abs(guess-actual)
  const handleSubmit=()=>{ setSubmitted(true); setTimeout(onComplete,2500) }
  return(
    <div className="flex flex-col gap-4">
      <CtxBox>
        <p>The Battle of Tippecanoe was short — about two hours — but deadly. When dawn broke on November 7, 1811, Harrison's army counted their losses.</p>
        <p>Historians have recorded that <strong style={{color:C.goldL}}>62 American soldiers</strong> were killed or mortally wounded, and about 126 more were injured. Estimates for Native casualties are harder to confirm — warriors removed their dead during and after the battle.</p>
        <p>Before we reveal the number, try to guess how many American soldiers were killed.</p>
      </CtxBox>
      <p className="font-semibold text-sm" style={{color:C.ink}}>How many American soldiers were killed or mortally wounded?</p>
      <div className="text-center py-3">
        <div className="text-5xl font-serif font-bold" style={{color:C.gold}}>{guess}</div>
        <div className="text-xs mt-1" style={{color:C.ink,opacity:0.5}}>soldiers</div>
      </div>
      <input type="range" min={5} max={150} value={guess} onChange={e=>setGuess(Number(e.target.value))} className="w-full" disabled={submitted}/>
      <div className="flex justify-between text-xs" style={{color:C.ink,opacity:0.55}}><span>5</span><span>150</span></div>
      {!submitted&&<button onClick={handleSubmit} className="w-full py-3 rounded-xl font-bold" style={{background:C.steel,color:C.parch}}>Submit My Guess</button>}
      {submitted&&(
        <div className="rounded-2xl p-4" style={{background:'rgba(139,58,43,0.12)',border:`1px solid ${C.brick}`}}>
          <p className="font-bold mb-1" style={{color:C.goldL}}>The actual count: 62 killed or mortally wounded</p>
          <p className="text-sm" style={{color:C.ink}}>{diff===0?'Exactly right — incredible!':diff<=10?`You guessed ${guess} — very close!`:`You guessed ${guess}. The true number was 62 killed, plus 126 more wounded.`} Of 1,000 soldiers, nearly 1 in 5 was a casualty. That's a very costly battle.</p>
        </div>
      )}
    </div>
  )
}

const GRAVE_ITEMS=[
  {id:1,type:'disguise',label:'Mound A',info:"Soldiers built a campfire over this grave to hide the freshly turned earth."},
  {id:2,type:'grave',label:'Mound B',info:"Left as a marked grave. Warriors found and honored it when they returned."},
  {id:3,type:'disguise',label:'Mound C',info:"Covered with ash and charcoal to look like an old fire ring."},
  {id:4,type:'disguise',label:'Mound D',info:"Disguised as a campfire. The deception was undone by returning warriors within days."},
  {id:5,type:'grave',label:'Mound E',info:"Marked clearly. Warriors identified it and held a ceremony."},
  {id:6,type:'disguise',label:'Mound F',info:"Another disguise — Harrison's men worked to hide as many graves as possible before departing."},
]

function E7S2({ onComplete }: StageProps) {
  const [revealed,setRevealed]=useState(new Set<number>())
  const [choice,setChoice]=useState<string|null>(null)
  const all=revealed.size===GRAVE_ITEMS.length
  const rev=(id:number)=>setRevealed(s=>{const n=new Set(s);n.add(id);return n})
  const pick=(k:string)=>{ if(choice)return; setChoice(k); if(k==='honor')setTimeout(onComplete,1400) }
  return(
    <div className="flex flex-col gap-4">
      <CtxBox>
        <p>After the battle, Harrison ordered his men to bury the dead and then <strong style={{color:C.goldL}}>disguise the graves</strong> by building campfires over them. He didn't want warriors to know how many soldiers had died.</p>
        <p>But Native warriors returned to the battlefield within days. Tap each mound to reveal what it really was.</p>
      </CtxBox>
      <div className="grid grid-cols-3 gap-3">
        {GRAVE_ITEMS.map(g=>{
          const isRev=revealed.has(g.id)
          return(
            <div key={g.id} onClick={()=>!isRev&&rev(g.id)}
              className="rounded-xl overflow-hidden transition-all duration-400"
              style={{height:88,cursor:isRev?'default':'pointer',
                background:isRev?(g.type==='disguise'?'rgba(139,58,43,0.3)':'rgba(47,75,60,0.35)'):C.navyL,
                border:`2px solid ${isRev?(g.type==='disguise'?C.brick:C.forest):'rgba(31,46,61,0.1)'}`}}>
              <div className="h-full flex flex-col items-center justify-center p-2 text-center gap-1">
                {!isRev?(<><div className="text-2xl">⛰️</div><p className="text-xs" style={{color:'rgba(31,46,61,0.4)'}}>Tap</p></>):(
                  <><div className="text-xl">{g.type==='disguise'?'🔥':'✝️'}</div>
                  <p className="text-xs font-bold" style={{color:g.type==='disguise'?C.brickL:C.goldL}}>{g.type==='disguise'?'Disguise':'Grave'}</p></>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex justify-between text-xs" style={{color:C.ink,opacity:0.6}}>
        <span>🔥 Disguises: {GRAVE_ITEMS.filter(g=>g.type==='disguise'&&revealed.has(g.id)).length}/4</span>
        <span>✝️ Graves: {GRAVE_ITEMS.filter(g=>g.type==='grave'&&revealed.has(g.id)).length}/2</span>
      </div>
      {all&&(
        <div>
          <p className="font-semibold text-sm mb-3" style={{color:C.ink}}>Why did Native warriors return to the battlefield?</p>
          <div className="flex flex-col gap-2">
            {[
              {k:'weapons',label:'To collect weapons left behind'},
              {k:'honor',label:'To undo the disguises and properly honor their fallen warriors'},
              {k:'attack',label:'To launch another attack on Harrison'},
            ].map(o=>(
              <ChoiceBtn key={o.k} label={o.label} selected={choice===o.k} correct={o.k==='honor'} onClick={()=>pick(o.k)} />
            ))}
          </div>
          {choice==='honor'&&<GoodAnswer text="Yes. The warriors returned to find and honor their dead. Harrison's deception didn't last." />}
          {choice&&choice!=='honor'&&<BadAnswer text="Think about why the graves themselves would matter." />}
        </div>
      )}
    </div>
  )
}

function E7S3({ onComplete }: StageProps) {
  const [step,setStep]=useState<number|null>(null)
  const views=[
    {label:"Harrison's View",icon:'🎖️',color:C.steel,text:`Harrison returned to Vincennes and declared a victory. He wrote: "The result has been complete." He believed the battle had broken Native resistance. Back home, newspapers called him a hero.`},
    {label:"Native Nations' View",icon:'🪶',color:C.gold,text:`For Native nations, the battle was devastating — but it was not the end. Prophet's Town was burned by Harrison's troops. Families lost their homes, their food stores, and their community. Many survivors scattered to other villages.`},
    {label:"Tecumseh's View",icon:'⚔️',color:C.brick,text:`Tecumseh was away recruiting allies when the battle happened. When he returned to the burned ruins of Prophet's Town, he was furious. His great plan for a unified Native alliance had been shattered in one night.`},
    {label:"History's View",icon:'📖',color:C.forestL,text:`Historians today see Tippecanoe as the beginning of greater conflict — not an end. The battle inflamed tensions that led directly to the War of 1812. Harrison used the victory to launch a successful presidential campaign 29 years later.`},
  ]
  const [seen,setSeen]=useState(new Set<number>())
  const click=(i:number)=>{ setStep(i); setSeen(s=>{const n=new Set(s);n.add(i);return n}) }
  useEffect(()=>{ if(seen.size===views.length)setTimeout(onComplete,600) },[seen])
  return(
    <div className="flex flex-col gap-4">
      <CtxBox><p>The same battle looks very different depending on who you ask. Read each perspective and decide: was Tippecanoe a victory?</p></CtxBox>
      <div className="grid grid-cols-2 gap-3">
        {views.map((v,i)=>(
          <button key={i} onClick={()=>click(i)} className="p-4 rounded-2xl text-left transition-all duration-200"
            style={{background:seen.has(i)?`${v.color}18`:C.navyL,border:`2px solid ${seen.has(i)?v.color:'rgba(31,46,61,0.1)'}`,color:C.parch}}>
            <div className="text-2xl mb-1">{v.icon}</div>
            <p className="text-xs font-bold" style={{color:seen.has(i)?v.color:'rgba(31,46,61,0.7)'}}>{v.label}</p>
            {seen.has(i)&&<span className="text-xs" style={{color:C.forestL}}>✓ Read</span>}
          </button>
        ))}
      </div>
      {step!==null&&(
        <div className="rounded-2xl p-4" key={step} style={{background:`${views[step].color}12`,border:`1px solid ${views[step].color}44`}}>
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{color:views[step].color}}>{views[step].icon} {views[step].label}</p>
          <p className="text-sm leading-relaxed" style={{color:C.ink}}>{views[step].text}</p>
        </div>
      )}
      <p className="text-xs text-center" style={{color:C.ink,opacity:0.4}}>{seen.size}/{views.length} perspectives read</p>
      {seen.size===views.length&&<GoodAnswer text="All four perspectives read! History always looks different depending on where you're standing." />}
    </div>
  )
}

/* ═══════════════ EVENT 8: TECUMSEH CONFRONTS TENSKWATAWA ═══════════════ */

function E8S1({ onComplete }: StageProps) {
  const timeline=[
    {date:'Spring 1811',text:"Tecumseh leaves Prophet's Town to travel south and recruit more Native nations to his alliance."},
    {date:'Summer 1811',text:"While Tecumseh is away, Harrison's army marches toward Prophet's Town. Tenskwatawa must decide whether to fight."},
    {date:'Nov 1, 1811',text:"Tenskwatawa assures his followers: 'The Great Spirit will make the enemy's powder useless. We cannot be harmed.'"},
    {date:'Nov 7, 1811',text:"The Battle of Tippecanoe. The powder was NOT useless. The battle is a disaster for the Native defenders."},
    {date:'Nov 8, 1811',text:"Harrison's troops burn Prophet's Town. Hundreds of families are left without food or shelter as winter approaches."},
    {date:'Jan 1812',text:"Tecumseh returns. He finds the ruins. He finds his brother. He is furious."},
  ]
  const [cur,setCur]=useState(0)
  const adv=()=>{ if(cur<timeline.length-1)setCur(c=>c+1); else setTimeout(onComplete,500) }
  return(
    <div className="flex flex-col gap-4">
      <CtxBox>
        <p>When the Battle of Tippecanoe happened, <strong style={{color:C.goldL}}>Tecumseh was hundreds of miles away</strong> in the south, trying to recruit Creek and Cherokee nations to his alliance. He had told Tenskwatawa clearly: <em>"Do not fight until I return."</em></p>
        <p>Tenskwatawa did not wait. Follow the events while Tecumseh was gone.</p>
      </CtxBox>
      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-px" style={{background:'rgba(31,46,61,0.08)'}}/>
        <div className="space-y-3 pl-14">
          {timeline.slice(0,cur+1).map((t,i)=>(
            <div key={i} className="relative rounded-2xl p-4" style={{background:'rgba(31,46,61,0.05)',border:'1px solid rgba(31,46,61,0.12)'}}>
              <div className="absolute -left-8 top-4 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{background:i===cur?C.brick:C.forest,color:C.parch}}>{i+1}</div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:C.goldL}}>{t.date}</p>
              <p className="text-sm" style={{color:C.ink}}>{t.text}</p>
            </div>
          ))}
        </div>
      </div>
      <button onClick={adv} className="w-full py-3 rounded-xl font-bold" style={{background:cur<timeline.length-1?C.steel:C.forest,color:C.parch}}>
        {cur<timeline.length-1?`Next: ${timeline[cur+1].date} →`:'Tecumseh Returns →'}
      </button>
    </div>
  )
}

const WHO_SAID=[
  {text:'"You must not attack while I am away. Wait for my return!"',speaker:'Tecumseh',hint:'He gave this order before traveling south to recruit allies.'},
  {text:'"The Great Spirit has given me power to make the enemy\'s weapons useless!"',speaker:'Tenskwatawa',hint:'"The Prophet" told warriors this before the battle.'},
  {text:'"The Master of Life watches over us. We cannot be harmed!"',speaker:'Tenskwatawa',hint:'He rallied warriors before the attack at 4 a.m.'},
  {text:'"You have destroyed everything I worked for!"',speaker:'Tecumseh',hint:'He said this when he returned and confronted his brother in January 1812.'},
]

function E8S2({ onComplete }: StageProps) {
  const [cur,setCur]=useState(0)
  const [sel,setSel]=useState<string|null>(null)
  const [score,setScore]=useState(0)
  const [done,setDone]=useState(false)
  const q=WHO_SAID[cur]
  const pick=(sp:string)=>{ if(sel)return; setSel(sp); if(sp===q.speaker)setScore(s=>s+1)
    setTimeout(()=>{ if(cur<WHO_SAID.length-1){setCur(c=>c+1);setSel(null)}else setDone(true) },1800) }
  if(done)return(
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="text-5xl">{score>=3?'🏆':score>=2?'⭐':'📚'}</div>
      <p className="font-serif font-bold text-2xl" style={{color:C.gold}}>{score}/4</p>
      <p className="text-sm text-center max-w-xs" style={{color:C.ink,opacity:0.8}}>
        {score>=3?'You know these two brothers well!':'Tecumseh was the military strategist. Tenskwatawa was the spiritual leader — and their disagreement tore their alliance apart.'}
      </p>
      {score>=2?<button onClick={onComplete} className="px-6 py-3 rounded-xl font-bold" style={{background:C.forest,color:C.parch}}>Continue →</button>
        :<button onClick={()=>{setCur(0);setSel(null);setScore(0);setDone(false)}} className="px-6 py-3 rounded-xl font-bold" style={{background:C.brick,color:C.parch}}>Try Again</button>}
    </div>
  )
  return(
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 justify-center mb-1">
        {WHO_SAID.map((_,i)=><div key={i} className="h-2 rounded-full transition-all" style={{width:i<cur?24:i===cur?28:8,background:i<cur?C.forest:i===cur?C.gold:'rgba(31,46,61,0.2)'}}/>)}
      </div>
      <div className="rounded-2xl p-5" style={{background:'rgba(31,46,61,0.04)',border:'1px solid rgba(31,46,61,0.12)'}}>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{color:C.goldL}}>Quote {cur+1} of 4</p>
        <p className="font-serif text-lg italic leading-relaxed" style={{color:C.ink}}>"{q.text}"</p>
      </div>
      <p className="text-sm text-center" style={{color:C.ink,opacity:0.6}}>💡 {q.hint}</p>
      <div className="grid grid-cols-2 gap-3">
        {['Tecumseh','Tenskwatawa'].map(sp=>(
          <button key={sp} onClick={()=>pick(sp)}
            className="py-4 rounded-xl font-bold text-sm transition-all duration-200"
            style={{background:sel===sp?(sp===q.speaker?C.forest:C.brick):C.navyL,color:C.parch,
              opacity:sel&&sel!==sp?0.4:1,border:`2px solid ${sel===sp?(sp===q.speaker?C.forestL:C.brickL):'rgba(31,46,61,0.12)'}`}}>
            {sp==='Tecumseh'?'🦅 Tecumseh':'🔮 Tenskwatawa'}
            {sel===sp&&(sp===q.speaker?' ✓':' ✗')}
          </button>
        ))}
      </div>
    </div>
  )
}

function E8S3({ onComplete }: StageProps) {
  const paths=[
    {name:'Tecumseh',icon:'🦅',color:C.steel,events:[
      {year:'1812',text:'Joins the British in the War of 1812, hoping to reclaim Native lands through a new alliance.'},
      {year:'Oct 1813',text:'Leads warriors at the Battle of the Thames in Ontario, Canada.'},
      {year:'1813',text:'Killed in battle at the Thames. His dream of a unified Native confederation dies with him.'},
    ]},
    {name:'Tenskwatawa',icon:'🔮',color:C.gold,events:[
      {year:'1812',text:'His followers abandon him. His reputation as a prophet is destroyed after his predictions failed at Tippecanoe.'},
      {year:'1820s',text:'Lives in Canada, largely forgotten and without influence.'},
      {year:'1836',text:'Returns to Kansas with the Shawnee people. Dies in 1836. He is painted by George Catlin in his final years.'},
    ]},
  ]
  const [seen,setSeen]=useState(new Set<string>())
  useEffect(()=>{ if(seen.size===6)setTimeout(onComplete,800) },[seen])
  return(
    <div className="flex flex-col gap-4">
      <CtxBox><p>After the battle, the two brothers went very different directions. Click each event to follow their paths after Tippecanoe.</p></CtxBox>
      {paths.map(p=>(
        <div key={p.name} className="rounded-2xl p-4" style={{background:`${p.color}0D`,border:`1px solid ${p.color}33`}}>
          <p className="font-bold text-sm mb-3" style={{color:p.color}}>{p.icon} {p.name}</p>
          <div className="space-y-2">
            {p.events.map((e,i)=>{
              const key=`${p.name}-${i}`;const isSeen=seen.has(key)
              return(
                <button key={i} onClick={()=>setSeen(s=>{const n=new Set(s);n.add(key);return n})}
                  className="w-full text-left rounded-xl p-3 transition-all"
                  style={{background:isSeen?`${p.color}15`:C.navyL,border:`1px solid ${isSeen?p.color:'rgba(31,46,61,0.08)'}`,color:C.parch}}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded" style={{background:`${p.color}33`,color:p.color}}>{e.year}</span>
                    {isSeen?<p className="text-xs leading-relaxed">{e.text}</p>:<p className="text-xs" style={{color:'rgba(31,46,61,0.4)'}}>Tap to reveal…</p>}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ))}
      <p className="text-xs text-center" style={{color:C.ink,opacity:0.4}}>{seen.size}/6 events revealed</p>
    </div>
  )
}

/* ═══════════════ EVENT 9: WHIG RALLY ═══════════════ */

function E9S1({ onComplete }: StageProps) {
  const facts=[
    {q:'How many people came to the rally?',a:'~30,000',choices:['~5,000','~30,000','~300','~100,000'],correct:'~30,000',explain:"About 30,000 people traveled from across Indiana and beyond — enormous for 1840."},
    {q:'How long was the parade procession?',a:'One mile',choices:['One block','Half a mile','One mile','Five miles'],correct:'One mile',explain:"The procession stretched a full mile — floats, bands, horses, and thousands of people on foot."},
    {q:'How many years had passed since the Battle of Tippecanoe?',a:'29 years',choices:['10 years','29 years','5 years','50 years'],correct:'29 years',explain:"The battle happened in 1811. The rally was in 1840 — 29 years later."},
  ]
  const [cur,setCur]=useState(0)
  const [sel,setSel]=useState<string|null>(null)
  const [score,setScore]=useState(0)
  const [done,setDone]=useState(false)
  const q=facts[cur]
  const pick=(c:string)=>{ if(sel)return; setSel(c); if(c===q.correct)setScore(s=>s+1)
    setTimeout(()=>{ if(cur<facts.length-1){setCur(c2=>c2+1);setSel(null)}else setDone(true) },1900) }
  if(done)return(
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="text-5xl">{score===3?'🏆':'⭐'}</div>
      <p className="font-serif font-bold text-2xl" style={{color:C.gold}}>{score}/3 Correct!</p>
      <p className="text-sm text-center max-w-xs" style={{color:C.ink,opacity:0.8}}>The 1840 Whig Rally was one of the largest political events in American history up to that point!</p>
      <button onClick={onComplete} className="px-6 py-3 rounded-xl font-bold" style={{background:C.forest,color:C.parch}}>Continue →</button>
    </div>
  )
  return(
    <div className="flex flex-col gap-4">
      <CtxBox>
        <p>It was May 29–30, 1840. Nearly <strong style={{color:C.goldL}}>thirty years</strong> after the Battle of Tippecanoe, people returned to the same ground — not for war, but for a massive political celebration.</p>
        <p>William Henry Harrison was running for President. The Whig Party was holding the biggest campaign rally the country had ever seen. Let's find out just how big it was.</p>
      </CtxBox>
      <div className="flex gap-2 justify-center">
        {facts.map((_,i)=><div key={i} className="h-2 rounded-full transition-all" style={{width:i<cur?24:i===cur?28:8,background:i<cur?C.forest:i===cur?C.gold:'rgba(31,46,61,0.2)'}}/>)}
      </div>
      <div className="rounded-2xl p-4" style={{background:'rgba(196,146,58,0.08)',border:`1px solid ${C.gold}44`}}>
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{color:C.goldL}}>Quick Quiz · {cur+1} of 3</p>
        <p className="font-semibold text-sm" style={{color:C.ink}}>{q.q}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {q.choices.map(c=>(
          <button key={c} onClick={()=>pick(c)} className="py-3 px-3 rounded-xl font-bold text-sm transition-all"
            style={{background:sel===c?(c===q.correct?C.forest:C.brick):C.navyL,color:C.parch,
              opacity:sel&&sel!==c?0.4:1,border:`2px solid ${sel===c?(c===q.correct?C.forestL:C.brickL):'transparent'}`}}>
            {c}{sel===c&&(c===q.correct?' ✓':' ✗')}
          </button>
        ))}
      </div>
      {sel===q.correct&&<GoodAnswer text={q.explain}/>}
      {sel&&sel!==q.correct&&<BadAnswer text={`The answer was ${q.correct}. ${q.explain}`}/>}
    </div>
  )
}

const RALLY_ITEMS=[
  {id:'canoe',emoji:'🛶',label:'Tipping Canoe Float',match:'A huge float carrying young women representing all 26 states in the Union'},
  {id:'cabin',emoji:'🏚️',label:'Log Cabin',match:"Symbol of Harrison's frontier life — the Whigs called him a 'log cabin and hard cider' candidate"},
  {id:'cider',emoji:'🍺',label:'Hard Cider',match:'The drink served freely at the rally — positioned as the working man\'s beverage'},
  {id:'slogan',emoji:'🎵',label:'"Tippecanoe and Tyler Too"',match:'The famous campaign song — "Tyler" was Harrison\'s vice presidential running mate'},
  {id:'flag',emoji:'🏳️',label:"Spencer's Battle Flag",match:'The actual bullet-riddled flag from the 1811 battle, carried in the procession'},
]

function E9S2({ onComplete }: StageProps) {
  const [selL,setSelL]=useState<string|null>(null)
  const [matched,setMatched]=useState<Record<string,string>>({})
  const [wrong,setWrong]=useState<string|null>(null)
  const shuffled=useRef([...RALLY_ITEMS].sort(()=>Math.random()-0.5))
  const tapL=(id:string)=>{ if(matched[id])return; setSelL(id===selL?null:id) }
  const tapR=(match:string)=>{
    if(!selL)return
    const item=RALLY_ITEMS.find(i=>i.id===selL)!
    if(item.match===match){
      const nm={...matched,[selL]:match}; setMatched(nm); setSelL(null)
      if(Object.keys(nm).length===RALLY_ITEMS.length)setTimeout(onComplete,1500)
    }else{ setWrong(selL); setTimeout(()=>{setWrong(null);setSelL(null)},700) }
  }
  return(
    <div className="flex flex-col gap-4">
      <CtxBox>
        <p>The Whig Rally was filled with symbols and spectacle. Every item meant something. Match each rally symbol to what it stood for.</p>
        <p>Click a symbol on the left, then click its matching description on the right.</p>
      </CtxBox>
      {selL&&<p className="text-xs text-center font-semibold" style={{color:C.gold}}>Now click the matching description on the right →</p>}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          {RALLY_ITEMS.map(item=>{
            const isM=!!matched[item.id]; const isSel=selL===item.id; const isW=wrong===item.id
            return(
              <button key={item.id} onClick={()=>tapL(item.id)} className={`py-3 px-3 rounded-xl text-left transition-all duration-200 ${isW?'animate-shake':''}`}
                style={{background:isM?'rgba(47,75,60,0.35)':isSel?C.steel:C.navyL,color:isM?C.forestL:isSel?C.parch:C.parch,
                  border:`2px solid ${isM?C.forest:isSel?C.steelL:'rgba(31,46,61,0.1)'}`,fontSize:12,opacity:isM?0.6:1}}>
                <span className="mr-1">{item.emoji}</span>{item.label}{isM&&' ✓'}
              </button>
            )
          })}
        </div>
        <div className="flex flex-col gap-2">
          {shuffled.current.map(item=>{
            const isM=Object.values(matched).includes(item.match)
            return(
              <button key={item.match} onClick={()=>tapR(item.match)}
                className="py-3 px-3 rounded-xl text-left transition-all duration-200"
                style={{background:isM?'rgba(47,75,60,0.35)':selL?C.navyL:'rgba(31,46,61,0.03)',
                  color:C.parch,opacity:isM?0.5:1,fontSize:11,lineHeight:1.4,
                  border:`2px solid ${isM?C.forest:selL?'rgba(31,46,61,0.2)':'rgba(31,46,61,0.07)'}`,
                  cursor:selL&&!isM?'pointer':'default'}}>
                {item.match}{isM&&<span className="block text-xs mt-0.5" style={{color:C.forestL}}>✓ Matched</span>}
              </button>
            )
          })}
        </div>
      </div>
      <p className="text-xs text-center" style={{color:C.ink,opacity:0.4}}>{Object.keys(matched).length}/{RALLY_ITEMS.length} matched</p>
      {Object.keys(matched).length===RALLY_ITEMS.length&&<GoodAnswer text="All matched! The Whig Party turned Tippecanoe into the biggest campaign symbol in American politics." />}
    </div>
  )
}

function E9S3({ onComplete }: StageProps) {
  const [filled,setFilled]=useState('')
  const [submitted,setSubmitted]=useState(false)
  const [choice,setChoice]=useState<string|null>(null)
  const isCorrect=filled.toLowerCase().trim()==='tippecanoe'
  const submit=()=>{ if(!filled.trim())return; setSubmitted(true); if(isCorrect)setTimeout(()=>{},200) }
  const pick=(k:string)=>{ if(choice)return; setChoice(k); if(k==='win')setTimeout(onComplete,1400) }
  return(
    <div className="flex flex-col gap-4">
      <CtxBox>
        <p>The catchiest moment of the whole rally was a <strong style={{color:C.goldL}}>campaign song</strong> that became famous across America. It was written by Alexander Ross and had a simple, memorable title. People sang it everywhere.</p>
        <p>The song used Harrison's nickname from the 1811 battle — and connected it to his vice presidential running mate, John Tyler.</p>
      </CtxBox>
      <div className="rounded-2xl p-5" style={{background:'rgba(196,146,58,0.08)',border:`1px solid ${C.gold}44`}}>
        <p className="text-center font-serif text-3xl font-bold mb-3" style={{color:C.ink}}>
          "_____ and Tyler Too!"
        </p>
        <p className="text-xs text-center mb-4" style={{color:C.ink,opacity:0.55}}>Fill in the blank with Harrison's famous nickname</p>
        <div className="flex gap-2">
          <input type="text" value={filled} onChange={e=>setFilled(e.target.value)} disabled={submitted}
            placeholder="Type the word here…"
            className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold"
            style={{background:'rgba(31,46,61,0.08)',border:`1px solid ${submitted?(isCorrect?C.forest:C.brick):'rgba(31,46,61,0.2)'}`,color:C.ink,outline:'none'}}
            onKeyDown={e=>{ if(e.key==='Enter')submit() }}/>
          <button onClick={submit} disabled={submitted||!filled.trim()} className="px-4 py-2.5 rounded-xl font-bold text-sm"
            style={{background:filled.trim()&&!submitted?C.gold:'rgba(31,46,61,0.08)',color:filled.trim()&&!submitted?C.charcoal:'rgba(31,46,61,0.3)'}}>
            Go!
          </button>
        </div>
        {submitted&&isCorrect&&<GoodAnswer text={`"Tippecanoe and Tyler Too!" — the song became one of the most famous in American political history.`}/>}
        {submitted&&!isCorrect&&<BadAnswer text="Hint: It's the name of the 1811 battle — and it's right in the title of this museum!"/>}
      </div>
      {(submitted&&isCorrect)||(choice)?(
        <div>
          <p className="font-semibold text-sm mb-3" style={{color:C.ink}}>Did the slogan help Harrison win the election?</p>
          <div className="flex flex-col gap-2">
            {[
              {k:'win',label:'Yes — Harrison won the 1840 presidential election'},
              {k:'lose',label:'No — he lost to the current president'},
              {k:'tie',label:'The election ended in a tie'},
            ].map(o=>(
              <ChoiceBtn key={o.k} label={o.label} selected={choice===o.k} correct={o.k==='win'} onClick={()=>pick(o.k)}/>
            ))}
          </div>
          {choice==='win'&&<GoodAnswer text="He won! Harrison became the 9th President — though he died just 31 days after his inauguration." />}
          {choice&&choice!=='win'&&<BadAnswer text="He actually won — largely thanks to the fame of Tippecanoe." />}
        </div>
      ):null}
      {submitted&&!isCorrect&&(
        <button onClick={()=>{setFilled('');setSubmitted(false)}} className="w-full py-2.5 rounded-xl font-semibold text-sm" style={{background:'rgba(31,46,61,0.08)',color:C.ink}}>Try Again</button>
      )}
    </div>
  )
}

/* ═══════════════ EVENT 10: THE FLAG ═══════════════ */

const HOTSPOTS=[
  {id:1,x:22,y:28,label:'The Battle Date',info:'This flag was first carried into combat at the Battle of Tippecanoe on November 7, 1811 — 29 years before it appeared at the rally.'},
  {id:2,x:68,y:18,label:"Spencer's Company",info:"Captain Spencer's Yellow Jacket Company carried this flag into battle. Captain Spencer himself was mortally wounded fighting under it."},
  {id:3,x:82,y:55,label:'The Bullet Holes',info:'The flag still bore the bullet holes from 1811. Each tear in the fabric was a physical reminder of the lives lost in the battle.'},
  {id:4,x:28,y:72,label:'Judge Polke',info:'Judge William Polke presented the flag at the Whig Rally, connecting the memory of 1811 directly to the 1840 election campaign.'},
  {id:5,x:65,y:78,label:'James Brooks',info:"New York delegate James Brooks received the flag with tears in his eyes. His speech called the flag 'a relic of one of the most glorious victories ever achieved on American soil.'"},
]

function E10S1({ onComplete }: StageProps) {
  const [disc,setDisc]=useState(new Set<number>())
  const [active,setActive]=useState<typeof HOTSPOTS[0]|null>(null)
  const tap=(spot:typeof HOTSPOTS[0])=>{ setDisc(s=>{const n=new Set(s);n.add(spot.id);return n}); setActive(spot) }
  useEffect(()=>{ if(disc.size===HOTSPOTS.length)setTimeout(onComplete,2000) },[disc])
  return(
    <div className="flex flex-col items-center gap-4">
      <CtxBox>
        <p>On May 30, 1840 — the second day of the Whig Rally — something extraordinary happened. A real artifact from the 1811 Battle of Tippecanoe was brought out and presented to the crowd.</p>
        <p>It was <strong style={{color:C.goldL}}>Spencer's battle flag</strong> — still bearing bullet holes from the fight nearly 30 years earlier. <strong>Tap the glowing circles</strong> to discover every part of its story.</p>
      </CtxBox>
      <div className="relative rounded-2xl overflow-hidden mx-auto" style={{width:'100%',maxWidth:360,height:210,
        background:'linear-gradient(135deg,#8B3A2B 0%,#6B2C1F 30%,#8B3A2B 50%,#6B2C1F 70%,#8B3A2B 100%)'}}>
        {[20,40,60,80,100,120,140,160,180,200].map(y=>(
          <div key={y} style={{position:'absolute',left:0,right:0,top:y,height:1,background:'rgba(0,0,0,0.12)'}}/>
        ))}
        <div className="absolute" style={{left:8,top:8,width:85,height:65,background:'rgba(31,46,61,0.75)',borderRadius:4}}>
          {Array.from({length:12}).map((_,i)=>(
            <div key={i} style={{position:'absolute',color:C.parch,fontSize:9,left:`${(i%4)*21+5}px`,top:`${Math.floor(i/4)*18+7}px`}}>★</div>
          ))}
        </div>
        <div style={{position:'absolute',right:0,top:0,width:'65%',height:'100%',
          background:'repeating-linear-gradient(180deg,#8B3A2B 0px,#8B3A2B 17px,#F3ECDD 17px,#F3ECDD 34px)'}}/>
        {[[52,42],[118,78],[198,32],[258,108],[175,152],[88,128],[300,55],[40,155]].map(([x,y],i)=>(
          <div key={i} style={{position:'absolute',left:x,top:y,width:5+i%3,height:5+i%3,borderRadius:'50%',background:'rgba(0,0,0,0.65)'}}/>
        ))}
        <div style={{position:'absolute',right:0,top:0,bottom:0,width:14,background:'linear-gradient(90deg,transparent,rgba(20,30,40,0.4))',
          clipPath:'polygon(0 0,100% 5%,80% 20%,100% 35%,70% 50%,100% 65%,80% 80%,100% 95%,0 100%)'}}/>
        {HOTSPOTS.map(spot=>{
          const d=disc.has(spot.id)
          return(
            <button key={spot.id} onClick={()=>tap(spot)}
              style={{position:'absolute',width:30,height:30,borderRadius:'50%',
                left:`${spot.x}%`,top:`${spot.y}%`,transform:'translate(-50%,-50%)',
                background:d?'rgba(47,75,60,0.9)':'rgba(196,146,58,0.85)',color:C.parch,
                border:`2px solid ${d?C.forest:C.gold}`,fontSize:13,fontWeight:700,cursor:'pointer',
                boxShadow:d?`0 0 0 3px ${C.forest}`:' 0 0 0 3px rgba(196,146,58,0.5), 0 0 14px rgba(196,146,58,0.4)',
                animation:d?'none':'pulse-gold 2s infinite',transition:'all 0.3s'}}>
              {d?'✓':'?'}
            </button>
          )
        })}
      </div>
      <div className="flex gap-1.5 justify-center">
        {HOTSPOTS.map(s=>(
          <div key={s.id} className="h-2 w-8 rounded-full transition-all" style={{background:disc.has(s.id)?C.forest:'rgba(31,46,61,0.12)'}}/>
        ))}
      </div>
      {active&&(
        <div className="w-full max-w-sm rounded-2xl p-4" key={active.id} style={{background:'rgba(196,146,58,0.07)',border:`1px solid ${C.gold}44`}}>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:C.goldL}}>{active.label}</p>
          <p className="text-sm leading-relaxed" style={{color:C.ink}}>{active.info}</p>
        </div>
      )}
      <p className="text-xs text-center" style={{color:C.ink,opacity:0.4}}>{disc.size}/{HOTSPOTS.length} stories discovered</p>
    </div>
  )
}

function E10S2({ onComplete }: StageProps) {
  const connections=[
    {left:'Battle of Tippecanoe (1811)',right:"Harrison's campaign slogan (1840)",color:C.steel},
    {left:"Spencer's Yellow Jacket Company",right:'The bullet-riddled flag at the rally',color:C.brick},
    {left:"Tenskwatawa's failed prophecy",right:"Harrison's presidential nickname",color:C.gold},
    {left:'62 American soldiers killed',right:"'Tippecanoe and Tyler Too'",color:C.forest},
  ]
  const [matched,setMatched]=useState<Set<number>>(new Set())
  const [selIdx,setSelIdx]=useState<number|null>(null)
  const tapLeft=(i:number)=>{ if(matched.has(i))return; setSelIdx(i===selIdx?null:i) }
  const tapRight=(i:number)=>{ if(!selIdx!==null&&selIdx===i){setMatched(s=>{const n=new Set(s);n.add(i);return n});setSelIdx(null)} }
  // Simplified: just click pairs sequentially
  const [step,setStep]=useState(0)
  const adv=()=>{ if(step<connections.length){setStep(s=>s+1)}else setTimeout(onComplete,500) }
  useEffect(()=>{ if(step===connections.length)setTimeout(onComplete,800) },[step])
  return(
    <div className="flex flex-col gap-4">
      <CtxBox>
        <p>The flag presentation on May 30, 1840 did something powerful: it <strong style={{color:C.goldL}}>connected two different moments in history</strong> with a single physical object. Reveal each connection below.</p>
      </CtxBox>
      <div className="space-y-3">
        {connections.map((c,i)=>(
          <div key={i} className="rounded-2xl p-4 transition-all duration-400"
            style={{background:i<step?`${c.color}12`:C.navyL,border:`2px solid ${i<step?c.color:'rgba(31,46,61,0.08)'}`,opacity:i<=step?1:0.35}}>
            {i<step?(
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-semibold px-3 py-1.5 rounded-lg" style={{background:`${c.color}22`,color:c.color}}>{c.left}</span>
                <span style={{color:'rgba(31,46,61,0.4)'}}>↔</span>
                <span className="text-sm font-semibold px-3 py-1.5 rounded-lg" style={{background:`${c.color}22`,color:c.color}}>{c.right}</span>
              </div>
            ):(
              <p className="text-sm" style={{color:'rgba(31,46,61,0.4)'}}>Connection {i+1} — Reveal below</p>
            )}
          </div>
        ))}
      </div>
      {step<connections.length?(
        <button onClick={adv} className="w-full py-3 rounded-xl font-bold" style={{background:C.steel,color:C.parch}}>
          {step===0?'Reveal First Connection →':'Next Connection →'}
        </button>
      ):(
        <GoodAnswer text="All four connections revealed. One flag, bridging nearly 30 years of history." />
      )}
    </div>
  )
}

function E10S3({ onComplete }: StageProps) {
  const facts=[
    "Tenskwatawa predicted the solar eclipse of June 16, 1806 — gaining thousands of followers.",
    "Tecumseh arrived at Vincennes in August 1810 with 300 warriors demanding the Fort Wayne Treaty be canceled.",
    "The Battle of Tippecanoe began at exactly 4:15 a.m. on November 7, 1811.",
    "Harrison was saved because he switched away from his usual white horse the night of the battle.",
    "The Great Whig Rally of 1840 drew about 30,000 people — and Harrison won the presidency.",
  ]
  const [revealed,setRevealed]=useState(new Set<number>())
  useEffect(()=>{ if(revealed.size===facts.length)setTimeout(onComplete,1200) },[revealed])
  return(
    <div className="flex flex-col gap-5">
      <CtxBox>
        <p>You've traveled through 10 events — from 1806 to 1840. Before you finish, tap each fact to confirm what you've learned from this journey.</p>
      </CtxBox>
      <div className="space-y-3">
        {facts.map((f,i)=>(
          <button key={i} onClick={()=>setRevealed(s=>{const n=new Set(s);n.add(i);return n})}
            className="w-full text-left rounded-2xl p-4 transition-all duration-300"
            style={{background:revealed.has(i)?'rgba(74,111,165,0.15)':C.navyL,border:`2px solid ${revealed.has(i)?C.steel:'rgba(31,46,61,0.1)'}`,color:C.parch}}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold mt-0.5"
                style={{background:revealed.has(i)?C.steel:C.navyL,border:`2px solid ${revealed.has(i)?C.steelL:'rgba(31,46,61,0.2)'}`,color:revealed.has(i)?C.parch:'rgba(31,46,61,0.4)'}}>
                {revealed.has(i)?'✓':(i+1)}
              </div>
              <p className="text-sm leading-relaxed" style={{opacity:revealed.has(i)?1:0.45}}>{f}</p>
            </div>
          </button>
        ))}
      </div>
      <p className="text-xs text-center" style={{color:C.ink,opacity:0.4}}>{revealed.size}/{facts.length} confirmed</p>
      {revealed.size===facts.length&&(
        <div className="rounded-2xl p-6 text-center" style={{background:'rgba(196,146,58,0.1)',border:`1px solid ${C.gold}`}}>
          <div className="text-4xl mb-2">🏛️</div>
          <p className="font-serif font-bold text-xl mb-1" style={{color:C.gold}}>History Complete!</p>
          <p className="text-sm" style={{color:C.ink,opacity:0.8}}>You've explored the full story — from 1806 to 1840. Thank you for learning with the Tippecanoe County Historical Association.</p>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════ EVENT SHELL ═══════════════════════════ */

interface EventShellProps {
  meta: EventMeta
  stage: number
  totalStages: number
  stagesDone: boolean[]
  children: React.ReactNode
  onNext: () => void
  onPrev: () => void
  isLastStage: boolean
  isLastEvent: boolean
}

export function EventShell({ meta, stage, totalStages, stagesDone, children, onNext, onPrev, isLastStage, isLastEvent }: EventShellProps) {
  const canNext = stagesDone[stage]
  return (
    <div className="event-light" style={{ maxWidth: 560, margin: '0 auto', padding: '0 0 100px' }}>
      {/* Event header */}
      <div className="px-5 pt-8 pb-5">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded" style={{ background: `${meta.accent}22`, color: meta.accent }}>
            Event {meta.id} of 10
          </span>
          <span className="text-xs" style={{ color: C.ink, opacity: 0.6 }}>{meta.year}</span>
        </div>
        <h1 className="font-serif font-bold text-3xl leading-tight" style={{ color: C.ink }}>
          <span className="mr-3">{meta.icon}</span>{meta.title}
        </h1>
        {/* Stage progress */}
        <div className="flex items-center gap-3 mt-4">
          {meta.stages.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: i < stage ? C.forest : i === stage ? meta.accent : C.navyL,
                    color: i <= stage ? C.parch : 'rgba(31,46,61,0.3)',
                    border: `2px solid ${i < stage ? C.forestL : i === stage ? meta.accent : 'rgba(31,46,61,0.1)'}` }}>
                  {i < stage ? '✓' : i + 1}
                </div>
                <span className="text-xs hidden sm:block" style={{ color: i === stage ? C.ink : 'rgba(31,46,61,0.45)', fontWeight: i === stage ? 600 : 400 }}>{label}</span>
              </div>
              {i < totalStages - 1 && <div className="w-4 h-px flex-shrink-0" style={{ background: i < stage ? C.forestL : 'rgba(31,46,61,0.1)' }} />}
            </div>
          ))}
        </div>
        <div className="mt-2 h-0.5 rounded-full" style={{ background: 'rgba(31,46,61,0.06)' }}>
          <div className="h-0.5 rounded-full transition-all duration-700" style={{ width: `${((stage + (canNext ? 1 : 0)) / totalStages) * 100}%`, background: meta.accent }} />
        </div>
      </div>

      {/* Accent strip */}
      <div style={{ height: 2, background: meta.accent, opacity: 0.6, margin: '0 20px', borderRadius: 1 }} />

      {/* Content */}
      <div className="px-5 pt-5">{children}</div>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-5 pt-3 z-30"
        style={{ background: 'linear-gradient(to top, rgba(255,255,255,0.98) 70%, transparent)' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }} className="flex gap-3">
          {stage > 0 && (
            <button onClick={onPrev} className="px-4 py-3 rounded-xl font-semibold text-sm"
              style={{ background: C.surface, color: C.ink, border: '1px solid rgba(31,46,61,0.18)' }}>
              ← Back
            </button>
          )}
          <button onClick={onNext} disabled={!canNext}
            className="flex-1 py-3 rounded-xl font-bold text-base transition-all duration-200"
            style={{ background: canNext ? meta.accent : 'rgba(31,46,61,0.08)',
              color: canNext ? C.parch : 'rgba(31,46,61,0.4)',
              cursor: canNext ? 'pointer' : 'default' }}>
            {!canNext ? '⟳ Complete the activity above' : isLastStage ? (isLastEvent ? '🏛️ Finish the Journey!' : `Complete Event ${meta.id} →`) : `Next: ${meta.stages[stage + 1]} →`}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════ EVENT WRAPPER FACTORY ═══════════════════════════ */

function makeEvent(id: number, gameStages: React.FC<StageProps>[]) {
  const IntroStage = ({ onComplete }: StageProps) => <ChapterIntro id={id} onComplete={onComplete} />
  const allStages = [IntroStage, ...gameStages]
  return function EventN({ onComplete }: { onComplete: () => void }) {
    const { events: EVENTS } = useMuseumContent()
    const meta = EVENTS[id - 1]
    const [stage, setStage] = useState(0)
    const [done, setDone] = useState<boolean[]>(allStages.map(() => false))
    const markDone = (i: number) => setDone(d => { const n = [...d]; n[i] = true; return n })
    const Stage = allStages[stage]
    return (
      <EventShell meta={meta} stage={stage} totalStages={allStages.length} stagesDone={done}
        onNext={() => stage < allStages.length - 1 ? setStage(s => s + 1) : onComplete()}
        onPrev={() => setStage(s => s - 1)} isLastStage={stage === allStages.length - 1} isLastEvent={id === 10}>
        <Stage key={stage} onComplete={() => markDone(stage)} />
      </EventShell>
    )
  }
}

/* ═══════════════════════════ FINAL EXPORTS ═══════════════════════════ */

const Event1 = makeEvent(1, [E1S1, E1S2, E1S3])
const Event2 = makeEvent(2, [E2S1, E2S2, E2S3])
const Event3 = makeEvent(3, [E3S1, E3S2, E3S3])
const Event4 = makeEvent(4, [E4S1, E4S2, E4S3])
const Event5 = makeEvent(5, [E5S1, E5S2, E5S3])
const Event6 = makeEvent(6, [E6S1, E6S2, E6S3])
const Event7 = makeEvent(7, [E7S1, E7S2, E7S3])
const Event8 = makeEvent(8, [E8S1, E8S2, E8S3])
const Event9 = makeEvent(9, [E9S1, E9S2, E9S3])
const Event10 = makeEvent(10, [E10S1, E10S2, E10S3])

const EVENT_COMPONENTS = [Event1, Event2, Event3, Event4, Event5, Event6, Event7, Event8, Event9, Event10]

export function EventDisplay({ eventId, onComplete }: { eventId: number; onComplete: () => void }) {
  const Comp = EVENT_COMPONENTS[eventId - 1]
  return <Comp key={eventId} onComplete={onComplete} />
}
