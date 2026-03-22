import { useNavigate } from 'react-router-dom';
import { ArrowRight, Upload, BarChart3, TrendingUp, Shield, Target, Brain,
  CheckCircle, Award, BookOpen, ClipboardList, Users } from 'lucide-react';


/* ── Always dark — landing page is permanently dark ───────────────────── */
const dark = true;

const IMG = {
  hero:     '/office_bg.png',
  stats:    '/analytics_bg.png',
  matrix:   '/workspace_bg.png',
  steps:    '/career_bg.png',
};

/* Always-dark overlays so text readability never suffers                    */
/* Light mode = blue-navy tint (slightly lighter), Dark mode = near-black    */
const OV = {
  heroD:    'linear-gradient(140deg,rgba(4,9,20,0.84),rgba(10,22,60,0.74))',
  heroL:    'linear-gradient(140deg,rgba(8,20,60,0.78),rgba(20,45,110,0.68))',
  statsD:   'rgba(4,9,20,0.82)',
  statsL:   'rgba(10,25,75,0.76)',
  matrixD:  'rgba(4,9,20,0.86)',
  matrixL:  'rgba(8,22,70,0.80)',
  stepsD:   'rgba(4,9,20,0.78)',
  stepsL:   'rgba(12,30,80,0.72)',
};

const STEPS = [
  { icon: Upload,     n:'01', title:'Upload Resume',       desc:'System reads your resume and auto-detects your QE skills',            color:'#3B82F6' },
  { icon: BarChart3,  n:'02', title:'Rate Your Skills',    desc:'Fill any remaining skill gaps across 7 professional categories',       color:'#8B5CF6' },
  { icon: Shield,     n:'03', title:'Manager Validates',   desc:'Your manager reviews and officially validates your skill ratings',     color:'#10B981' },
  { icon: TrendingUp, n:'04', title:'Get Your Report',     desc:'Receive a personalized growth roadmap and complete capability report', color:'#F59E0B' },
];



const BENEFITS = [
  { icon:ClipboardList, c:'#3B82F6', t:'Know Where You Stand',          d:'Get a clear picture of your QE skills across all domains — structured and accurate.' },
  { icon:Target,        c:'#8B5CF6', t:'Close Skill Gaps Faster',        d:'Instantly see missing skills and receive prioritised recommendations to close them.' },
  { icon:Award,         c:'#10B981', t:'Manager-Endorsed Credentials',   d:'Ratings validated by your manager — giving you officially verified proof of expertise.' },
  { icon:TrendingUp,    c:'#F59E0B', t:'Unlock Better Opportunities',    d:'A complete skill profile helps you get matched to the right projects and career roles.' },
  { icon:BookOpen,      c:'#EC4899', t:'Personalised Learning Roadmap',  d:'Get a growth plan with specific actions tailored to your career goals.' },
  { icon:Users,         c:'#06B6D4', t:'Contribute to Team Visibility',  d:'Help leadership plan smarter with accurate QE capability data across the team.' },
];

const CATS = [
  {n:'🔧 Tool',         k:6, c:'#3B82F6'},{n:'💻 Technology', k:6, c:'#8B5CF6'},
  {n:'📱 Application',  k:5, c:'#10B981'},{n:'🏦 Domain',     k:5, c:'#F59E0B'},
  {n:'🧪 Testing Type', k:4, c:'#EF4444'},{n:'⚙️ DevOps',    k:4, c:'#06B6D4'},
  {n:'🤖 AI Skills',    k:2, c:'#EC4899'},
];

export default function LandingPage() {
  const navigate = useNavigate();

  /* Static dark theme tokens — landing page is always dark */
  const T = {
    text: '#ffffff', sub: 'rgba(255,255,255,0.55)', muted: 'rgba(255,255,255,0.35)',
    bg: '#050B18', card: 'rgba(255,255,255,0.07)', bdr: 'rgba(255,255,255,0.12)',
    input: 'rgba(255,255,255,0.06)', inputBdr: 'rgba(255,255,255,0.14)',
  };

  const card = (extra?: React.CSSProperties): React.CSSProperties => ({
    background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.92)',
    border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : 'rgba(99,102,241,0.22)'}`,
    borderRadius: 16, backdropFilter: 'blur(14px)',
    ...extra,
  });

  /* Text color on IMAGE sections (always white since overlay is dark) */
  const WT = '#ffffff';
  const WS = 'rgba(255,255,255,0.72)';

  return (
    <div style={{ fontFamily:"'Inter',sans-serif", minHeight:'100vh', background:T.bg, transition:'background 0.35s,color 0.35s' }}>

      {/* ══════════════════════════════ HERO ═══════════════════════════════ */}
      <div style={{ position:'relative', minHeight:'100vh', display:'flex', alignItems:'center', overflow:'hidden' }}>
        {/* Background photo */}
        <div style={{ position:'absolute', inset:0, backgroundImage:`url(${IMG.hero})`, backgroundSize:'cover', backgroundPosition:'center 30%', zIndex:0 }} />
        {/* Overlay — keeps text readable */}
        <div style={{ position:'absolute', inset:0, background: dark ? OV.heroD : OV.heroL, zIndex:1 }} />
        {/* Glows */}
        <div style={{ position:'absolute', inset:0, zIndex:2, pointerEvents:'none' }}>
          <div style={{ position:'absolute', top:'10%', left:'0', width:'40%', height:'60%', background:'radial-gradient(circle,rgba(59,130,246,0.26) 0%,transparent 65%)', animation:'fl1 9s ease-in-out infinite' }} />
          <div style={{ position:'absolute', bottom:'5%', right:'0', width:'36%', height:'50%', background:'radial-gradient(circle,rgba(139,92,246,0.22) 0%,transparent 65%)', animation:'fl2 12s ease-in-out infinite' }} />
        </div>

        <div style={{ position:'relative', zIndex:3, maxWidth:1100, margin:'0 auto', padding:'130px 28px 90px', width:'100%' }}>
          <div style={{ maxWidth:660 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 16px', borderRadius:999, background:'rgba(59,130,246,0.22)', border:'1px solid rgba(59,130,246,0.42)', marginBottom:28 }}>
              <div style={{ width:7, height:7, borderRadius:'50%', background:'#60A5FA', animation:'pulse 2s infinite' }} />
              <span style={{ fontSize:11, fontWeight:700, color:'#93C5FD', letterSpacing:'0.07em' }}>ZENSAR QUALITY ENGINEERING</span>
            </div>

            <h1 style={{ fontSize:'clamp(40px,6vw,78px)', fontWeight:800, lineHeight:1.05, color:WT, marginBottom:22, fontFamily:"'Space Grotesk',sans-serif" }}>
              Know Your Skills.<br />
              <span style={{ background:'linear-gradient(135deg,#60A5FA,#A78BFA,#F472B6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                Grow Your Career.
              </span>
            </h1>
            <p style={{ fontSize:18, color:WS, lineHeight:1.8, maxWidth:520, marginBottom:44 }}>
              Self-assess across <strong style={{ color:'#93C5FD', fontWeight:700 }}>32 Quality Engineering skills</strong> in 7 categories, get manager validation, and receive a personalized growth roadmap.
            </p>

            <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
              <button onClick={()=>navigate('/start')}
                style={{ display:'inline-flex', alignItems:'center', gap:10, padding:'16px 34px', borderRadius:13, background:'linear-gradient(135deg,#3B82F6,#8B5CF6)', color:WT, fontWeight:700, fontSize:16, border:'none', cursor:'pointer', boxShadow:'0 0 44px rgba(59,130,246,0.6)', transition:'all 0.25s' }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 10px 55px rgba(59,130,246,0.75)';}}
                onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 0 44px rgba(59,130,246,0.6)';}}>
                Start Assessment <ArrowRight size={18} />
              </button>
              <button
                onClick={()=>document.getElementById('how-it-works')?.scrollIntoView({behavior:'smooth'})}
                style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'16px 28px', borderRadius:13, background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.30)', color:WT, fontWeight:600, fontSize:16, cursor:'pointer', backdropFilter:'blur(8px)', transition:'all 0.25s' }}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.20)'}
                onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.12)'}>
                How it Works ↓
              </button>
            </div>
          </div>
        </div>
        <div style={{ position:'absolute', bottom:28, left:'50%', transform:'translateX(-50%)', color:WS, fontSize:12, animation:'bounce 2s infinite', zIndex:3 }}>↓ Scroll</div>
      </div>


      {/* ════════════════ ABOUT — workspace bg ═══════════════════════════════ */}
      <div style={{ position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:`url(${IMG.matrix})`, backgroundSize:'cover', backgroundPosition:'center 40%', zIndex:0 }} />
        <div style={{ position:'absolute', inset:0, background: dark ? OV.matrixD : OV.matrixL, zIndex:1 }} />
        <div style={{ position:'relative', zIndex:2, maxWidth:1100, margin:'0 auto', padding:'90px 28px' }}>
          <div style={{ textAlign:'center', marginBottom:52 }}>
            <div style={{ color:'#60A5FA', fontWeight:700, fontSize:11, letterSpacing:'0.13em', marginBottom:12 }}>ABOUT THE TOOL</div>
            <h2 style={{ fontSize:'clamp(28px,4vw,50px)', fontWeight:800, color:WT, fontFamily:"'Space Grotesk',sans-serif" }}>What is the Skill Matrix?</h2>
            <p style={{ color:WS, marginTop:12, fontSize:16, maxWidth:520, margin:'12px auto 0' }}>A structured QE capability assessment covering 32 skills across 7 categories.</p>
          </div>

          <div style={{ display:'flex', flexWrap:'wrap', gap:32, alignItems:'flex-start' }}>
            {/* Q&A cards */}
            <div style={{ flex:'1', minWidth:280, display:'flex', flexDirection:'column', gap:12 }}>
              {[
                { q:'WHAT IT IS',     a:"A structured self-assessment tool that maps every QE team member's proficiency across 32 skills in 7 professional categories." },
                { q:'WHAT IT COVERS', a:'Testing tools, programming languages, application types, domain knowledge, testing types, DevOps practices, and AI skills.' },
                { q:'HOW IT WORKS',   a:'Upload resume → System detects skills → You fill remaining gaps → Manager validates → Get your full report.' },
                { q:'DATA INTEGRITY', a:'AI-detected skills are locked and cannot be manually changed. Only unrated skills can be filled to ensure accuracy.' },
              ].map((item,i)=>(
                <div key={i} style={card({ padding:'18px 22px' })}>
                  <div style={{ fontSize:10, fontWeight:800, color:'#60A5FA', marginBottom:7, letterSpacing:'0.08em' }}>{item.q}</div>
                  <div style={{ fontSize:14, color: dark?'rgba(255,255,255,0.75)':'#1E3A5F', lineHeight:1.75 }}>{item.a}</div>
                </div>
              ))}
            </div>
            {/* Category grid */}
            <div style={{ flex:'1', minWidth:260, display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10, alignContent:'start' }}>
              {CATS.map(c=>(
                <div key={c.n} style={card({ padding:'16px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', borderColor:`${c.c}40` })}>
                  <span style={{ fontSize:13, fontWeight:600, color: dark?WT:'#1E3A5F' }}>{c.n}</span>
                  <span style={{ fontSize:15, fontWeight:800, color:c.c, minWidth:18, textAlign:'right' }}>{c.k}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════ HOW IT WORKS — career bg ═══════════════════════════ */}
      <div id="how-it-works" style={{ scrollMarginTop:70, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:`url(${IMG.steps})`, backgroundSize:'cover', backgroundPosition:'center 50%', zIndex:0 }} />
        <div style={{ position:'absolute', inset:0, background: dark ? OV.stepsD : OV.stepsL, zIndex:1 }} />
        <div style={{ position:'relative', zIndex:2, maxWidth:1100, margin:'0 auto', padding:'90px 28px' }}>
          <div style={{ textAlign:'center', marginBottom:64 }}>
            <div style={{ color:'#A78BFA', fontWeight:700, fontSize:11, letterSpacing:'0.13em', marginBottom:12 }}>HOW IT WORKS</div>
            <h2 style={{ fontSize:'clamp(28px,4vw,50px)', fontWeight:800, color:WT, fontFamily:"'Space Grotesk',sans-serif" }}>
              Four Steps to Your{' '}
              <span style={{ background:'linear-gradient(135deg,#60A5FA,#A78BFA)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Capability Map</span>
            </h2>
          </div>

          {/* Step cards — grid layout (no connector line that breaks on mobile) */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:18 }}>
            {STEPS.map((s,i)=>(
              <div key={i} style={card({ padding:'28px 22px', textAlign:'center', borderColor:`${s.color}40`, transition:'all 0.3s' })}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-6px)';e.currentTarget.style.boxShadow=`0 16px 44px ${s.color}38`;e.currentTarget.style.borderColor=`${s.color}88`;}}
                onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='none';e.currentTarget.style.borderColor=`${s.color}40`;}}>
                {/* Number badge */}
                <div style={{ width:32, height:32, borderRadius:'50%', background:`${s.color}30`, border:`1.5px solid ${s.color}`, display:'inline-flex', alignItems:'center', justifyContent:'center', marginBottom:16, fontSize:13, fontWeight:800, color:s.color }}>
                  {i+1}
                </div>
                <div style={{ width:68, height:68, borderRadius:'50%', margin:'0 auto 18px', background:`radial-gradient(circle,${s.color}40,${s.color}10)`, border:`2.5px solid ${s.color}`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 0 28px ${s.color}55` }}>
                  <s.icon size={32} color={s.color} />
                </div>
                <div style={{ fontSize:10, color:s.color, fontWeight:800, letterSpacing:'0.1em', marginBottom:8 }}>STEP {s.n}</div>
                <div style={{ fontSize:16, fontWeight:700, color:WT, marginBottom:8, fontFamily:"'Space Grotesk',sans-serif" }}>{s.title}</div>
                <div style={{ fontSize:13, color:WS, lineHeight:1.7 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════ BENEFITS — solid section (alternating) ═════════════ */}
      <div style={{ background: dark ? '#0A1628' : '#EEF4FF', padding:'90px 28px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:54 }}>
            <div style={{ color:'#34D399', fontWeight:700, fontSize:11, letterSpacing:'0.13em', marginBottom:12 }}>WHY IT MATTERS</div>
            <h2 style={{ fontSize:'clamp(28px,4vw,50px)', fontWeight:800, color:T.text, fontFamily:"'Space Grotesk',sans-serif", marginBottom:14 }}>
              What Every Employee Gains
            </h2>
            <p style={{ color:T.sub, fontSize:16, maxWidth:500, margin:'0 auto', lineHeight:1.7 }}>
              Filling your skill matrix directly impacts your visibility, growth, and career trajectory.
            </p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:18 }}>
            {BENEFITS.map((b,i)=>(
              <div key={i} style={{ padding:26, borderRadius:18, background: dark?'rgba(255,255,255,0.05)':'rgba(255,255,255,0.90)', border:`1px solid ${dark?'rgba(255,255,255,0.09)':b.c+'25'}`, backdropFilter:'blur(12px)', transition:'all 0.3s', cursor:'default' }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-5px)';e.currentTarget.style.borderColor=b.c+'55';e.currentTarget.style.boxShadow=`0 16px 44px ${b.c}22`;}}
                onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.borderColor=dark?'rgba(255,255,255,0.09)':b.c+'25';e.currentTarget.style.boxShadow='';}}>
                <div style={{ width:50, height:50, borderRadius:14, marginBottom:16, background:`${b.c}18`, border:`1px solid ${b.c}42`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <b.icon size={24} color={b.c} />
                </div>
                <h3 style={{ fontSize:16, fontWeight:700, color:T.text, marginBottom:9, fontFamily:"'Space Grotesk',sans-serif" }}>{b.t}</h3>
                <p style={{ fontSize:13, color:T.sub, lineHeight:1.8 }}>{b.d}</p>
                <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:14 }}>
                  <CheckCircle size={13} color={b.c} />
                  <span style={{ fontSize:11, color:b.c, fontWeight:600 }}>Verified benefit</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════ CTA — analytics bg ════════════════════════════════ */}
      <div style={{ position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:`url(${IMG.stats})`, backgroundSize:'cover', backgroundPosition:'center 70%', zIndex:0 }} />
        <div style={{ position:'absolute', inset:0, background: dark ? 'rgba(4,9,20,0.88)' : 'rgba(10,25,80,0.84)', zIndex:1 }} />
        <div style={{ position:'relative', zIndex:2, textAlign:'center', padding:'100px 28px', maxWidth:680, margin:'0 auto' }}>
          <h2 style={{ fontSize:'clamp(30px,4vw,54px)', fontWeight:800, color:WT, marginBottom:18, fontFamily:"'Space Grotesk',sans-serif" }}>
            Ready to Map Your Skills?
          </h2>
          <p style={{ color:WS, fontSize:17, lineHeight:1.8, maxWidth:460, margin:'0 auto 44px' }}>
            Join the Zensar QE team. Start your assessment today and get a complete picture of your strengths.
          </p>
          <button onClick={()=>navigate('/start')}
            style={{ display:'inline-flex', alignItems:'center', gap:12, padding:'18px 44px', borderRadius:14, background:'linear-gradient(135deg,#3B82F6,#8B5CF6)', color:WT, fontWeight:700, fontSize:17, border:'none', cursor:'pointer', boxShadow:'0 0 54px rgba(59,130,246,0.6)', transition:'all 0.3s' }}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 14px 64px rgba(59,130,246,0.75)';}}
            onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 0 54px rgba(59,130,246,0.6)';}}>
            Start My Assessment <ArrowRight size={20} />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: dark?'#020810':'#1E3A8A', padding:'22px 28px', textAlign:'center', borderTop:`1px solid ${dark?'rgba(255,255,255,0.05)':'rgba(255,255,255,0.12)'}` }}>
        <span style={{ color: dark?'rgba(255,255,255,0.28)':'rgba(255,255,255,0.65)', fontSize:13 }}>
          © 2025 Zensar Technologies · Quality Engineering Division
        </span>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@600;700;800&display=swap');
        @keyframes fl1{0%,100%{transform:translate(0,0)}50%{transform:translate(3%,5%)}}
        @keyframes fl2{0%,100%{transform:translate(0,0)}50%{transform:translate(-3%,-4%)}}
        @keyframes bounce{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(9px)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}}
      `}</style>
    </div>
  );
}
