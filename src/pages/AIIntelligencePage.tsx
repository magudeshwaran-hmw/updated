/**
 * AIIntelligencePage.tsx — /employee/ai
 * Overhauled for extreme clarity, detailed insights, and elite aesthetics.
 * Enhanced for both Light and Dark modes.
 * Features: Phased AI Generated Roadmap and AI Career Coach.
 */
import { Map, TrendingUp, Search, MessageSquare, Send, Bot, RefreshCw, X, Award, Briefcase, Zap, ShieldCheck, Brain, Star, ChevronRight, Target, Info, Sparkles, ExternalLink, Globe, UserCheck, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/lib/AppContext';
import { useDark, mkTheme } from '@/lib/themeContext';
import { callLLM, checkLLMStatus } from '@/lib/llm';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  BarController, Tooltip, Legend, PointElement, LineElement, Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { toast } from 'sonner';

ChartJS.register(CategoryScale, LinearScale, BarElement, BarController, Tooltip, Legend, PointElement, LineElement, Filler);

// ─────────────────────────────────────────────────
// TAB 1 — CAREER COACH
// ─────────────────────────────────────────────────
function CareerCoachTab({ data, T }: { data: any, T: any }) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'bot'; text: string }>>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const botRef = useRef<HTMLDivElement>(null);

  const systemCtx = `You are the Zensar QI AI Coach/Mentor for ${data.user?.Name || 'Employee'}.
Skills: ${(data?.expertSkills || []).join(', ')}.
Overall Score: ${data?.overallScore || 0}/100.
Certifications: ${(data?.certifications || []).map((c:any)=>c.CertName || c.Name).join(', ')}.
Education: ${(data?.education || []).map((e:any)=>e.Degree || e.degree).join(', ')}.
IMPORTANT: Your response must be in JSON format: {"response": "your message here"}`;

  useEffect(() => {
    setMessages([{ role:'bot', text: `Hello ${data.user?.Name?.split(' ')[0]}! 👋 I'm your QI AI Coach. I've analyzed your expertise in ${data.expertSkills?.[0] || 'Quality Intelligence'} and your educational background. How can I guide your growth today?` }]);
  }, []);

  useEffect(() => { botRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages, typing]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const m = [...messages, { role:'user' as const, text }];
    setMessages(m); setInput(''); setTyping(true);
    try {
      const res = await callLLM(`${systemCtx}\n\nUser: ${text}\nCoach (JSON {"response": "..."}):`);
      if (res?.data?.response) {
        setMessages([...m, { role: 'bot', text: String(res.data.response) }]);
      } else if (res?.data && typeof res.data === 'string') {
        setMessages([...m, { role: 'bot', text: res.data }]);
      } else throw new Error();
    } catch {
      setMessages([...m, { role: 'bot', text: '⚠️ Career Coach is temporarily offline. Please ensure Ollama is running locally.' }]);
    }
    setTyping(false);
  };

  const renderMessage = (text: string) => {
     const parts = text.split(/(\*\*.*?\*\*)/g);
     return parts.map((part, i) => {
       if (part.startsWith('**') && part.endsWith('**')) {
         return <strong key={i}>{part.slice(2, -2)}</strong>;
       }
       return <span key={i} style={{ whiteSpace: 'pre-line' }}>{part}</span>;
     });
  };

  return (
    <div style={{ animation: 'fadeUp 0.4s' }}>
      <div style={{ background: T.card, border: `1px solid ${T.bdr}`, borderRadius: 24, padding: 24, display: 'flex', flexDirection: 'column', gap: 16, height: 500, overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 8 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role==='user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ 
                maxWidth: '85%', padding: '14px 20px', borderRadius: 20, 
                background: m.role==='user' ? '#3B82F6' : (T.bg === '#050B18' ? 'rgba(255,255,255,0.05)' : '#f8fafc'), 
                color: m.role==='user' ? '#fff' : T.text, fontSize: 13.5, 
                border: m.role === 'bot' ? `1px solid ${T.bdr}` : 'none', lineHeight: 1.6 
              }}>
                {renderMessage(m.text)}
              </div>
            </div>
          ))}
          {typing && <div style={{ color: '#3B82F6', fontSize: 12, fontWeight: 700, marginLeft: 8 }}>AI Coach is thinking...</div>}
          <div ref={botRef} />
        </div>
        <div style={{ display: 'flex', gap: 10, paddingTop: 16, borderTop: `1px solid ${T.bdr}` }}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter' && send(input)} placeholder="Ask about growth, certs, or career path..." style={{ flex:1, padding:'14px 18px', borderRadius:14, background:T.bg, border:`1px solid ${T.bdr}`, color:T.text, outline:'none', fontSize: 14 }} />
          <button onClick={()=>send(input)} style={{ width: 44, height: 44, borderRadius: 12, background:'#3B82F6', border:'none', color:'#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor:'pointer' }}><Send size={18}/></button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// TAB 2 — LEARNING ROADMAP
// ─────────────────────────────────────────────────
function RoadmapTab({ data, T }: { data: any, T: any }) {
  const [steps, setSteps] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    generateRoadmap();
  }, []);

  const generateRoadmap = async () => {
    setLoading(true);
    setError(false);
    try {
      const expertSkills = (data.expertSkills || []).join(', ');
      const gapSkills = (data.gapSkills || []).map((g: any) => g.skill).join(', ');
      const education = (data.education || []).map((e: any) => e.Degree || e.degree).join(', ');
      const designation = data.user?.Designation || 'Quality Engineer';

      const prompt = `Generate a 3-Phase technical learning roadmap for ${data.user?.Name}, a ${designation} at Zensar.
Context:
- Background: ${education}
- Strong Skills: ${expertSkills}
- Skill Gaps to Bridge: ${gapSkills}

Format: Return a JSON object ONLY with a "steps" array containing 3 objects:
[{
  "title": "Phase title",
  "phase": "Phase 01: Stabilization",
  "text": "Detailed action plan reasoning",
  "items": [{"skill": "Skill Name"}],
  "time": "Est. duration",
  "color": "#HEX_COLOR (Orange/Blue/Green sequence)"
}]`;

      const res = await callLLM(prompt);
      if (res?.data?.steps) {
        setSteps(res.data.steps);
      } else {
         throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error(err);
      setError(true);
      // Fallback data if AI unavailable
      setSteps([
        { title: 'Foundation Stabilization', phase: 'Phase 01: Stabilization', icon: <Zap color="#F59E0B" />, text: 'Focus on elevating immediate gaps to professional proficiency.', items: (data.gapSkills || []).slice(0, 3), color: '#F59E0B', time: '3-4 Weeks' },
        { title: 'Advanced Mastery', phase: 'Phase 02: Mastery', icon: <Target color="#3B82F6" />, text: 'Bridging complex technical hurdles in modern QI architecture.', items: (data.gapSkills || []).slice(3, 6), color: '#3B82F6', time: '6-8 Weeks' },
        { title: 'Leadership & Innovation', phase: 'Phase 03: Elite QI', icon: <Award color="#10B981" />, text: 'Shifting towards strategic role leadership and certification elite status.', items: [{skill:'SDET Lead Mastery'}], color: '#10B981', time: '12+ Weeks' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ animation: 'fadeUp 0.4s' }}>
       {loading && (
         <div style={{ background: T.card, border: `1px solid ${T.bdr}`, borderRadius: 24, padding: 48, textAlign: 'center' }}>
            <Loader2 className="animate-spin" size={32} color="#3B82F6" style={{ margin: '0 auto 16px' }} />
            <div style={{ fontWeight: 800, fontSize: 16 }}>AI is synthesizing your roadmap...</div>
            <div style={{ fontSize: 13, color: T.sub, marginTop: 4 }}>Analyzing ${data.gapSkills?.length || 0} skill gaps against Zensar QI standards.</div>
         </div>
       )}

       {!loading && (
         <>
           {error && <div style={{ marginBottom: 16, padding: '10px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5', borderRadius: 12, fontSize: 12, fontWeight: 700 }}>⚠️ AI Service unavailable. Showing fallback generalized roadmap.</div>}
           
           <div style={{ display: 'flex', flexDirection: 'column', gap:0, background: T.card, border: `1px solid ${T.bdr}`, borderRadius: 24, overflow: 'hidden' }}>
              {steps.map((s, idx) => (
                 <div key={idx} style={{ padding: '24px 32px', borderBottom: idx === steps.length - 1 ? 'none' : `1px solid ${T.bdr}`, display: 'flex', gap: 24 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 44 }}>
                       <div style={{ width: 44, height: 44, borderRadius: 14, background: `${s.color || '#3B82F6'}15`, border: `1.5px solid ${s.color || '#3B82F6'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {idx === 0 ? <Zap color={s.color} /> : idx === 1 ? <Target color={s.color} /> : <Award color={s.color} />}
                       </div>
                       {idx < steps.length - 1 && <div style={{ width: 2, flex: 1, background: `linear-gradient(to bottom, ${s.color || '#3B82F6'}, transparent)`, margin: '8px 0' }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <div style={{ fontSize: 10, fontWeight: 800, color: s.color || '#3B82F6', letterSpacing: 1.5, textTransform: 'uppercase' }}>{s.phase} · {s.time}</div>
                          <div style={{ fontSize: 11, color: T.muted }}>Path: QI Specialist</div>
                       </div>
                       <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: T.text }}>{s.title}</h3>
                       <p style={{ fontSize: 13, color: T.sub, margin: '4px 0 16px', lineHeight: 1.5 }}>{s.text}</p>
                       
                       <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                          {(s.items || []).map((item: any, i:number) => (
                             <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 12, background: T.bg, border: `1px solid ${T.bdr}`, fontWeight: 700, fontSize: 13 }}>
                                {item.skill} <ChevronRight size={12} color={s.color || '#3B82F6'} /> <span style={{ color: s.color || '#3B82F6' }}>Target Lev. 3</span>
                             </div>
                          ))}
                       </div>

                       <div style={{ display: 'flex', gap: 12 }}>
                          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'rgba(59,130,246,0.1)', border: 'none', color: '#3B82F6', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                             <Globe size={13} /> Learning Hub
                          </button>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
         </>
       )}

       <div style={{ marginTop: 20, padding: 24, background: 'linear-gradient(135deg, #10B981, #3B82F6)', borderRadius: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: '#fff' }}>
             <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Brain size={18} /> Re-Calculate AI Roadmap
             </h4>
             <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: 13 }}>Update your Skill Matrix to generate a fresh career development plan.</p>
          </div>
          <button onClick={generateRoadmap} style={{ padding: '10px 20px', borderRadius: 10, background: '#fff', border: 'none', color: '#3B82F6', fontWeight: 800, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>Regenerate Plan</button>
       </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────
export default function AIIntelligencePage({ 
  isPopup: propIsPopup, 
  onTabChange: propOnTabChange 
}: { 
  isPopup?: boolean; 
  onTabChange?: (path: string) => void; 
}) {
  const { data, isLoading, isPopup: ctxIsPopup } = useApp();
  
  // Use props if provided, otherwise fall back to context
  const isPopup = propIsPopup !== undefined ? propIsPopup : ctxIsPopup;
  const onTabChange = propOnTabChange || (() => {});
  
  const { dark } = useDark();
  const T = mkTheme(dark);
  const [activeTab, setActiveTab] = useState('coach');

  if (isLoading) return <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.sub }}>Syncing Intelligence Profile...</div>;
  if (!data?.user) return <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.sub }}>Authentication Required</div>;

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, padding: '24px 16px 80px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        
        {/* Elite Profile Dashboard Header — Scaled Down */}
        <div style={{ background: T.card, border: `1px solid ${T.bdr}`, borderRadius: 24, padding: '24px 32px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
           <div style={{ position: 'absolute', top: 0, right: 0, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 99, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                 <Sparkles size={12} color="#3B82F6" />
                 <span style={{ fontSize: 10, fontWeight: 800, color: '#3B82F6' }}>SECURE AI ANALYSIS</span>
              </div>
           </div>
           
           <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
              <div style={{ width: 80, height: 80, borderRadius: 24, background: 'linear-gradient(135deg, #6B2D8B, #3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 900, color: '#fff' }}>{(data?.user?.Name || 'U')[0]}</div>
              <div style={{ flex: 1 }}>
                 <div style={{ fontSize: 11, fontWeight: 800, color: '#3B82F6', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>Quality Intelligence Insights</div>
                 <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>{data?.user?.Name || 'Qualitian Explorer'}</h1>
                 <p style={{ margin: '2px 0 0', fontSize: 13, color: T.sub, fontWeight: 500 }}>{data?.user?.Designation || 'Quality Engineer'} · {data?.user?.Department || 'QI'}</p>
                 
                 <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
                    <div>
                       <div style={{ fontSize: 20, fontWeight: 900 }}>{data?.overallScore || 0}%</div>
                       <div style={{ fontSize: 9, fontWeight: 700, color: T.muted }}>CAPABILITY</div>
                    </div>
                    <div>
                       <div style={{ fontSize: 20, fontWeight: 900, color: '#10B981' }}>{data?.expertCount || 0}</div>
                       <div style={{ fontSize: 9, fontWeight: 700, color: T.muted }}>EXPERTS</div>
                    </div>
                    <div>
                       <div style={{ fontSize: 20, fontWeight: 900, color: '#8B5CF6' }}>{(data.certifications || []).length}</div>
                       <div style={{ fontSize: 9, fontWeight: 700, color: T.muted }}>CERTS</div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Dynamic Nav Tabs — Styled for clarity */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, padding: 4, background: T.card, borderRadius: 16, width: 'fit-content', border: `1px solid ${T.bdr}` }}>
           {[
             { id: 'coach', label: 'AI Coach', icon: Bot },
             { id: 'map', label: 'Learning Roadmap', icon: Map },
             { id: 'gaps', label: 'Gap Analysis', icon: Target }
           ].map(t => (
             <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, border: 'none',
                  background: activeTab === t.id ? '#3B82F6' : 'transparent',
                  color: activeTab === t.id ? '#fff' : T.sub,
                  fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: '0.2s'
                }}
             >
                <t.icon size={16}/> {t.label}
             </button>
           ))}
        </div>

        {activeTab === 'coach' && <CareerCoachTab data={data} T={T} />}
        {activeTab === 'map' && <RoadmapTab data={data} T={T} />}
        {activeTab === 'gaps' && (
           <div style={{ animation: 'fadeUp 0.4s' }}>
              <div style={{ padding: 40, background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 32 }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <Target size={32} color="#fff" />
                    </div>
                    <div>
                       <div style={{ fontSize: 13, fontWeight: 800, color: '#EF4444', textTransform: 'uppercase' }}>Professional Void Audit</div>
                       <div style={{ fontWeight: 900, fontSize: 24, letterSpacing:-0.5 }}>Tenure Modernity Analysis</div>
                    </div>
                 </div>
                 <div style={{ display:'grid', gap:28 }}>
                    <div style={{ padding: 24, background: 'rgba(239,68,68,0.05)', borderRadius: 20 }}>
                       <div style={{ fontSize: 15, fontWeight: 900, color: '#EF4444', marginBottom: 12 }}>Cognitive Mismatch: Seniority Plateau</div>
                       <div style={{ fontSize: 14, lineHeight: 1.7, color: T.text }}>
                          {data.user?.YearsIT >= 15 ? 
                             `Observation: Despite ${data.user?.YearsIT} years of engineering expertise, there is a structural silence regarding 'Agentic AI Workflows'. This seniority requires immediate modernization to maintain managerial authority.` :
                             `Recommendation: With ${data.user?.YearsIT} years, focus on vertical depth in Banking/Insurance domains to transition from technologist to Domain Authority.`
                          }
                       </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap:'wrap', gap:10 }}>
                       {['Cloud Native Mastery', 'GenAI Security', 'LMM Orchestration', 'Agentic AI'].map(g => (
                          <div key={g} style={{ padding:'8px 16px', borderRadius:10, border:'1px solid #EF4444', color:'#EF4444', fontSize:11, fontWeight:900 }}>{g} MISSING</div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        )}

      </div>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
