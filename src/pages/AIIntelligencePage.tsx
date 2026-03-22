import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@/lib/authContext';
import { getEmployee } from '@/lib/localDB';
import { SKILLS } from '@/lib/mockData';
import { useDark, mkTheme } from '@/lib/themeContext';
import { checkOllamaStatus, ollamaChatWithContext } from '@/lib/ollamaAI';
import {
  computeSkillPriorities, computeBenchmarks, recommendCertifications,
  generate90DayPlan, generateCareerInsight, WeekPlan,
} from '@/lib/aiIntelligence';
import {
  Brain, TrendingUp, Target, Award, MessageCircle, FileText,
  Calendar, ChevronRight, Loader2, RefreshCw, Copy, Check,
  Zap, Shield, Star, AlertTriangle, CheckCircle2, Send, X, Bot,
  ExternalLink, BarChart3, Flame
} from 'lucide-react';
import { toast } from 'sonner';

const CAT_COLOR: Record<string, string> = {
  Tool: '#3B82F6', Technology: '#8B5CF6', Application: '#10B981',
  Domain: '#F59E0B', TestingType: '#EF4444', DevOps: '#06B6D4', AI: '#EC4899',
};
const TABS = [
  { id: 'insight',   label: '🧠 Career Insight',   icon: Brain },
  { id: 'plan',      label: '🗓️ 90-Day Plan',       icon: Calendar },
  { id: 'priority',  label: '⚡ Skill Priority',    icon: Zap },
  { id: 'benchmark', label: '📊 Benchmarking',      icon: BarChart3 },
  { id: 'certs',     label: '🏅 Certifications',    icon: Award },
  { id: 'resume',    label: '📄 Resume Gen',        icon: FileText },
];

export default function AIIntelligencePage() {
  const { employeeId, name } = useAuth();
  const emp = employeeId && employeeId !== 'new' ? getEmployee(employeeId) : null;
  const ratings = emp?.skills ?? [];
  const { dark } = useDark();
  const T = mkTheme(dark);
  const [tab, setTab] = useState('insight');
  const [chatOpen, setChatOpen] = useState(false);

  const T2 = { ...T, accent: '#3B82F6', purple: '#8B5CF6', green: '#10B981', yellow: '#F59E0B', red: '#EF4444' };

  const card: React.CSSProperties = {
    background: T.card, border: `1px solid ${T.bdr}`, borderRadius: 16, padding: '22px',
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: "'Inter',sans-serif", transition: 'background 0.3s' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px 100px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={22} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: T.text, fontFamily: "'Space Grotesk',sans-serif", margin: 0 }}>AI Intelligence Hub</h1>
              <p style={{ color: T.sub, fontSize: 13, margin: 0 }}>Personalized career insights powered by your skill data</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              border: `1px solid ${tab === t.id ? '#3B82F6' : T.bdr}`,
              background: tab === t.id ? 'linear-gradient(135deg,#3B82F6,#8B5CF6)' : T.card,
              color: tab === t.id ? '#fff' : T.sub,
              cursor: 'pointer', transition: 'all 0.2s',
            }}>{t.label}</button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === 'insight'   && <CareerInsightTab   ratings={ratings} name={name || emp?.name || 'You'} dark={dark} T={T2} card={card} />}
        {tab === 'plan'      && <GrowthPlanTab      ratings={ratings} dark={dark} T={T2} card={card} />}
        {tab === 'priority'  && <SkillPriorityTab   ratings={ratings} dark={dark} T={T2} card={card} />}
        {tab === 'benchmark' && <BenchmarkTab       ratings={ratings} dark={dark} T={T2} card={card} />}
        {tab === 'certs'     && <CertificationsTab  ratings={ratings} dark={dark} T={T2} card={card} />}
        {tab === 'resume'    && <ResumeGenTab       emp={emp} ratings={ratings} dark={dark} T={T2} card={card} />}
      </div>

      {/* Floating Chat Coach */}
      <ChatCoach open={chatOpen} onToggle={() => setChatOpen(o => !o)} ratings={ratings} name={name || emp?.name || 'User'} dark={dark} T={T2} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700;800&display=swap');
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}

// ─── ADDON 1: Career Insight ──────────────────────────────────────────────────
function CareerInsightTab({ ratings, name, dark, T, card }: any) {
  const [insight, setInsight] = useState(() => generateCareerInsight(ratings, name));
  const [aiSummary, setAiSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const readColor = insight.readinessScore >= 75 ? '#10B981' : insight.readinessScore >= 50 ? '#F59E0B' : '#EF4444';
  const readLabel = insight.readinessScore >= 75 ? 'Senior Ready' : insight.readinessScore >= 50 ? 'Mid-Level' : 'Junior Level';

  async function regenerate() {
    setLoading(true);
    const fresh = generateCareerInsight(ratings, name);
    setInsight(fresh);
    const status = await checkOllamaStatus();
    if (status.available && status.model) {
      const expert = SKILLS.filter(s => ratings.find((r: any) => r.skillId === s.id)?.selfRating === 3).map(s => s.name);
      const beginner = SKILLS.filter(s => ratings.find((r: any) => r.skillId === s.id)?.selfRating === 1).map(s => s.name);
      const prompt = `You are a QE career coach. In 3 sentences, give a personalized career insight for ${name} who has expert skills in: ${expert.join(', ')||'none yet'} and beginner skills in: ${beginner.slice(0,3).join(', ')||'none'}. Be specific, encouraging and actionable.`;
      try {
        const res = await ollamaChatWithContext(status.model, prompt, '');
        setAiSummary(res);
      } catch { setAiSummary(''); }
    }
    setLoading(false);
    toast.success('Analysis refreshed!');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeUp 0.4s ease-out' }}>
      {/* Senior Readiness */}
      <div style={{ ...card, background: 'linear-gradient(135deg,rgba(59,130,246,0.1),rgba(139,92,246,0.1))', border: '1px solid rgba(59,130,246,0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: T.text, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 4 }}>{insight.headline}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ padding: '3px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: `${readColor}20`, color: readColor, border: `1px solid ${readColor}40` }}>{readLabel}</span>
              <span style={{ fontSize: 13, color: T.sub }}>{insight.readinessScore}% Senior Readiness</span>
            </div>
          </div>
          <button onClick={regenerate} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', color: '#60A5FA', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={14} />}
            {loading ? 'Analyzing...' : 'Regenerate'}
          </button>
        </div>

        {/* Readiness bar */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12, color: T.muted }}>
            <span>Junior</span><span>Mid-Level</span><span>Senior</span>
          </div>
          <div style={{ height: 10, borderRadius: 999, background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)', position: 'relative' }}>
            <div style={{ height: '100%', width: `${insight.readinessScore}%`, borderRadius: 999, background: `linear-gradient(90deg,#EF4444,#F59E0B,#10B981)`, transition: 'width 1.2s ease', boxShadow: `0 0 12px ${readColor}50` }} />
            <div style={{ position: 'absolute', top: '50%', left: `${insight.readinessScore}%`, transform: 'translate(-50%,-50%)', width: 18, height: 18, borderRadius: '50%', background: readColor, border: '3px solid #fff', transition: 'left 1.2s ease' }} />
          </div>
        </div>

        {/* 3 insight cards */}
        {[
          { label: '🎯 Market Positioning', text: insight.positioning, color: '#3B82F6' },
          { label: '⚡ Competitive Edge',   text: insight.competitiveEdge, color: '#8B5CF6' },
          { label: '🚀 Next Milestone',     text: insight.nextMilestone, color: '#10B981' },
        ].map(item => (
          <div key={item.label} style={{ padding: '14px 18px', borderRadius: 12, background: `${item.color}0c`, border: `1px solid ${item.color}28`, marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: item.color, marginBottom: 5, letterSpacing: '0.06em' }}>{item.label}</div>
            <div style={{ fontSize: 13, color: T.sub, lineHeight: 1.7 }}>{item.text}</div>
          </div>
        ))}

        {aiSummary && (
          <div style={{ padding: '14px 18px', borderRadius: 12, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', marginTop: 4 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#A78BFA', marginBottom: 5 }}>🤖 AI COACH SAYS</div>
            <div style={{ fontSize: 13, color: T.sub, lineHeight: 1.7, fontStyle: 'italic' }}>{aiSummary}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ADDON 2: 90-Day Plan ─────────────────────────────────────────────────────
const PLAN_KEY = (id: string) => `skill_nav_90day_${id}`;

function GrowthPlanTab({ ratings, dark, T, card }: any) {
  const { employeeId } = useAuth();
  const [plan, setPlan] = useState<WeekPlan[]>(() => {
    try {
      const saved = localStorage.getItem(PLAN_KEY(employeeId || ''));
      return saved ? JSON.parse(saved) : generate90DayPlan(ratings);
    } catch { return generate90DayPlan(ratings); }
  });

  const save = (updated: WeekPlan[]) => {
    setPlan(updated);
    try { localStorage.setItem(PLAN_KEY(employeeId || ''), JSON.stringify(updated)); } catch { }
  };

  const toggle = (i: number) => {
    const updated = plan.map((w, idx) => idx === i ? { ...w, done: !w.done } : w);
    save(updated);
  };

  const done = plan.filter(w => w.done).length;
  const pct = plan.length > 0 ? Math.round((done / plan.length) * 100) : 0;

  if (plan.length === 0) return (
    <div style={{ ...card, textAlign: 'center', padding: '60px 20px', color: T.muted }}>
      <Target size={48} style={{ margin: '0 auto 16px' }} />
      <div style={{ fontSize: 16, fontWeight: 600 }}>Rate your skills first</div>
      <div style={{ fontSize: 13, marginTop: 6 }}>Complete your skill matrix to generate a personalized 90-day plan</div>
    </div>
  );

  return (
    <div style={{ animation: 'fadeUp 0.4s ease-out' }}>
      {/* Progress header */}
      <div style={{ ...card, marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 18, color: T.text, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 4 }}>90-Day QE Growth Roadmap</div>
          <div style={{ fontSize: 13, color: T.sub, marginBottom: 12 }}>Personalized week-by-week plan based on your skill gaps · {done}/{plan.length} weeks complete</div>
          <div style={{ height: 8, borderRadius: 999, background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' }}>
            <div style={{ height: '100%', width: `${pct}%`, borderRadius: 999, background: 'linear-gradient(90deg,#3B82F6,#10B981)', transition: 'width 0.8s', boxShadow: '0 0 10px rgba(59,130,246,0.4)' }} />
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: pct >= 70 ? '#10B981' : '#3B82F6', fontFamily: "'Space Grotesk',sans-serif" }}>{pct}%</div>
          <div style={{ fontSize: 11, color: T.muted }}>Complete</div>
        </div>
        <button onClick={() => save(generate90DayPlan(ratings))} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', color: '#A78BFA', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          <RefreshCw size={13} /> Regenerate Plan
        </button>
      </div>

      {/* Timeline */}
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 22, top: 0, bottom: 0, width: 2, background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)', borderRadius: 999, zIndex: 0 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {plan.map((week, i) => {
            const catColor = CAT_COLOR[week.category] || '#3B82F6';
            return (
              <div key={i} style={{ display: 'flex', gap: 16, position: 'relative', zIndex: 1 }}>
                {/* Timeline dot */}
                <div style={{ width: 46, height: 46, borderRadius: '50%', flexShrink: 0, background: week.done ? '#10B981' : `${catColor}20`, border: `2.5px solid ${week.done ? '#10B981' : catColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: week.done ? '#fff' : catColor, cursor: 'pointer', transition: 'all 0.25s' }}
                  onClick={() => toggle(i)}>
                  {week.done ? <CheckCircle2 size={18} color="#fff" /> : `W${week.week}`}
                </div>
                {/* Card */}
                <div style={{ flex: 1, padding: '14px 18px', borderRadius: 12, background: week.done ? 'rgba(16,185,129,0.06)' : T.card, border: `1px solid ${week.done ? 'rgba(16,185,129,0.3)' : T.bdr}`, opacity: week.done ? 0.75 : 1, transition: 'all 0.25s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                    <div>
                      <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, background: `${catColor}18`, color: catColor, marginRight: 8 }}>{week.category}</span>
                      <span style={{ fontWeight: 700, fontSize: 14, color: week.done ? T.muted : T.text, textDecoration: week.done ? 'line-through' : 'none' }}>{week.focusArea}</span>
                    </div>
                    <span style={{ fontSize: 11, color: T.muted }}>{week.resourceType}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 8 }}>
                    <div style={{ fontSize: 12, color: T.sub }}><strong style={{ color: T.text }}>Daily (30 min):</strong> {week.dailyTask}</div>
                    <div style={{ fontSize: 12, color: T.sub }}><strong style={{ color: T.text }}>Resource:</strong> {week.resource}</div>
                    <div style={{ fontSize: 12, color: T.sub }}><strong style={{ color: T.text }}>Mini-goal:</strong> {week.miniGoal}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── ADDON 3: Skill Priority & Trend ─────────────────────────────────────────
function SkillPriorityTab({ ratings, dark, T, card }: any) {
  const priorities = useMemo(() => computeSkillPriorities(ratings), [ratings]);
  const top3 = priorities.filter(s => s.gap > 0).slice(0, 3);

  return (
    <div style={{ animation: 'fadeUp 0.4s ease-out' }}>
      {/* Top 3 NOW */}
      <div style={{ ...card, marginBottom: 20, background: 'linear-gradient(135deg,rgba(239,68,68,0.06),rgba(245,158,11,0.06))', border: '1px solid rgba(239,68,68,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Flame size={20} color="#EF4444" />
          <span style={{ fontWeight: 800, fontSize: 16, color: T.text }}>Top 3 Skills to Learn RIGHT NOW</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
          {top3.map((s, i) => {
            const colors = ['#EF4444', '#F59E0B', '#3B82F6'];
            const c = colors[i];
            return (
              <div key={s.skillId} style={{ padding: '16px', borderRadius: 14, background: `${c}10`, border: `1px solid ${c}30` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: `${c}20`, border: `1px solid ${c}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: c }}>#{i + 1}</div>
                  <span style={{ fontWeight: 700, fontSize: 14, color: T.text }}>{s.name}</span>
                </div>
                <div style={{ fontSize: 11, color: T.muted, marginBottom: 8 }}>{s.category} · Level {s.currentLevel} → {Math.min(3, s.currentLevel + 1)}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6 }}>
                  <span style={{ color: T.muted }}>Priority Score</span>
                  <span style={{ fontWeight: 800, color: c }}>{s.priorityScore.toFixed(0)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6 }}>
                  <span style={{ color: T.muted }}>Market Demand</span>
                  <span style={{ fontWeight: 700, color: '#10B981' }}>{s.marketDemand}%</span>
                </div>
                <div style={{ height: 5, borderRadius: 999, background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' }}>
                  <div style={{ height: '100%', width: `${s.marketDemand}%`, borderRadius: 999, background: c }} />
                </div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>⏱ Time to Intermediate: {s.timeToIntermediate}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full table */}
      <div style={card}>
        <div style={{ fontWeight: 700, fontSize: 15, color: T.text, marginBottom: 16 }}>All Skills — Priority Ranking</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {priorities.slice(0, 15).map((s, i) => {
            const catColor = CAT_COLOR[s.category] || '#3B82F6';
            const pctDemand = s.marketDemand;
            const pctPriority = Math.min(100, s.priorityScore * 2);
            return (
              <div key={s.skillId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: i < 3 ? 'rgba(239,68,68,0.05)' : (dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'), border: `1px solid ${i < 3 ? 'rgba(239,68,68,0.2)' : T.bdr}` }}>
                <span style={{ width: 24, fontSize: 12, fontWeight: 700, color: i < 3 ? '#EF4444' : T.muted, textAlign: 'center' }}>#{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: T.text }}>{s.name}</span>
                    <span style={{ padding: '1px 7px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: `${catColor}18`, color: catColor }}>{s.category}</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 999, background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' }}>
                    <div style={{ height: '100%', width: `${pctDemand}%`, borderRadius: 999, background: catColor }} />
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: s.gap > 0 ? '#F59E0B' : '#10B981' }}>P:{s.priorityScore.toFixed(0)}</div>
                  <div style={{ fontSize: 10, color: T.muted }}>Demand:{s.marketDemand}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── ADDON 4: Peer Benchmarking ───────────────────────────────────────────────
function BenchmarkTab({ ratings, dark, T, card }: any) {
  const benchmarks = useMemo(() => computeBenchmarks(ratings), [ratings]);
  const aheadOf = benchmarks.filter(b => b.userAvg > b.avgQAAvg).map(b => b.category);
  const behind  = benchmarks.filter(b => b.gapToSenior > 0.5).map(b => b.category);

  return (
    <div style={{ animation: 'fadeUp 0.4s ease-out' }}>
      {/* Summary card */}
      <div style={{ ...card, background: 'linear-gradient(135deg,rgba(139,92,246,0.08),rgba(59,130,246,0.08))', border: '1px solid rgba(139,92,246,0.25)', marginBottom: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: T.text, marginBottom: 12 }}>📊 Your Profile vs Industry Benchmarks</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
          <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#34D399', marginBottom: 4 }}>✅ YOU ARE AHEAD IN</div>
            <div style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>{aheadOf.length > 0 ? aheadOf.join(', ') : 'Keep building your profile'}</div>
          </div>
          <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#F87171', marginBottom: 4 }}>⚠️ GAP TO SENIOR LEVEL</div>
            <div style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>{behind.length > 0 ? behind.slice(0,4).join(', ') : 'Excellent! Near senior level'}</div>
          </div>
        </div>
      </div>

      {/* Benchmark bars per category */}
      <div style={card}>
        <div style={{ fontWeight: 700, fontSize: 15, color: T.text, marginBottom: 16 }}>Category Comparison</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {benchmarks.map(b => {
            const catColor = CAT_COLOR[b.category] || '#3B82F6';
            return (
              <div key={b.category}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: T.text }}>{b.category}</span>
                  <span style={{ fontSize: 11, color: T.muted }}>Gap to Senior: <strong style={{ color: b.gapToSenior > 0 ? '#EF4444' : '#10B981' }}>{b.gapToSenior > 0 ? `${b.gapToSenior.toFixed(1)} levels` : '✓ Met'}</strong></span>
                </div>
                {/* Three bars */}
                {[
                  { label: 'You', val: b.userAvg, color: catColor, lvl: b.userAvg },
                  { label: 'Avg QA', val: b.avgQAAvg, color: '#6B7280', lvl: b.avgQAAvg },
                  { label: 'Senior QA', val: b.seniorQAAvg, color: '#F59E0B', lvl: b.seniorQAAvg },
                ].map((row) => (
                  <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                    <span style={{ width: 62, fontSize: 11, color: T.muted, textAlign: 'right', flexShrink: 0 }}>{row.label}</span>
                    <div style={{ flex: 1, height: 8, borderRadius: 999, background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' }}>
                      <div style={{ height: '100%', width: `${(row.val / 3) * 100}%`, borderRadius: 999, background: row.color, transition: 'width 1s' }} />
                    </div>
                    <span style={{ width: 26, fontSize: 12, fontWeight: 700, color: row.color }}>{row.lvl.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── ADDON 5: Certifications ──────────────────────────────────────────────────
function CertificationsTab({ ratings, dark, T, card }: any) {
  const recs = useMemo(() => recommendCertifications(ratings, 5), [ratings]);
  const diffColor: Record<string, string> = { Beginner: '#10B981', Intermediate: '#F59E0B', Advanced: '#EF4444' };

  return (
    <div style={{ animation: 'fadeUp 0.4s ease-out' }}>
      <div style={{ ...card, marginBottom: 20, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: T.text, marginBottom: 4 }}>🏅 Recommended Certifications</div>
        <div style={{ fontSize: 13, color: T.sub }}>Ranked by relevance to your skill gaps and market value</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {recs.map((cert, i) => (
          <div key={cert.id} style={{ ...card, border: `1px solid ${i === 0 ? 'rgba(245,158,11,0.4)' : T.bdr}`, position: 'relative', overflow: 'hidden' }}>
            {i === 0 && <div style={{ position: 'absolute', top: 0, right: 0, padding: '4px 12px', background: 'linear-gradient(135deg,#F59E0B,#D97706)', fontSize: 10, fontWeight: 800, color: '#fff', borderBottomLeftRadius: 10 }}>TOP PICK</div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: T.text, marginBottom: 4 }}>{cert.name}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: 'rgba(59,130,246,0.12)', color: '#60A5FA' }}>{cert.provider}</span>
                  <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: `${diffColor[cert.difficulty]}18`, color: diffColor[cert.difficulty] }}>{cert.difficulty}</span>
                  <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', color: T.muted }}>{cert.durationWeeks} weeks</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#F59E0B' }}>{cert.marketValue}%</div>
                <div style={{ fontSize: 10, color: T.muted }}>Market Value</div>
              </div>
            </div>
            <div style={{ fontSize: 13, color: T.sub, lineHeight: 1.6, marginBottom: 10 }}>{cert.description}</div>
            <div style={{ fontSize: 12, color: '#A78BFA', fontStyle: 'italic', marginBottom: 12 }}>💡 {cert.whyRecommended}</div>
            <a href={cert.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9, background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', color: '#60A5FA', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
              <ExternalLink size={12} /> View Certification →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ADDON 7: Resume Generator ────────────────────────────────────────────────
function ResumeGenTab({ emp, ratings, dark, T, card }: any) {
  const [copied, setCopied] = useState<string | null>(null);
  const expert = SKILLS.filter(s => ratings.find((r: any) => r.skillId === s.id)?.selfRating === 3);
  const intermediate = SKILLS.filter(s => ratings.find((r: any) => r.skillId === s.id)?.selfRating === 2);
  const cats = [...new Set(SKILLS.map(s => s.category))];

  const linkedInSummary = `Results-driven QE professional with expertise in ${expert.slice(0,3).map((s:any)=>s.name).join(', ')||'quality engineering'}. Proven track record in ${[...new Set([...expert,...intermediate].slice(0,4).map((s:any)=>s.category))].join(', ')} domains. ${expert.length > 0 ? `Recognized expert in ${expert[0].name} with hands-on delivery experience in Agile/DevOps environments.` : 'Building comprehensive QE skills across automation, testing, and DevOps.'} Committed to driving quality excellence and continuous improvement.`;

  const resumeSkills = cats.map(cat => {
    const catSkills = SKILLS.filter(s => s.category === cat);
    const ratedHere = catSkills.filter(s => (ratings.find((r:any)=>r.skillId===s.id)?.selfRating??0)>0);
    if (ratedHere.length === 0) return null;
    const levels: Record<number,string> = {3:'Expert',2:'Intermediate',1:'Beginner'};
    return `${cat}: ${ratedHere.map(s=>{const lvl=ratings.find((r:any)=>r.skillId===s.id)?.selfRating??0; return `${s.name}(${levels[lvl]})`;}).join(', ')}`;
  }).filter(Boolean).join('\n');

  const bio = `${emp?.name || 'QA Professional'} is a dedicated Quality Engineering specialist with ${emp?.yearsIT||'several'} years of IT experience. ${expert.length > 0 ? `Core strengths include ${expert.slice(0,3).map((s:any)=>s.name).join(', ')} with Expert-level proficiency.` : ''} ${intermediate.length > 0 ? `Proficient in ${intermediate.slice(0,3).map((s:any)=>s.name).join(', ')}.` : ''} Experienced across ${[...new Set(ratings.filter((r:any)=>r.selfRating>0).map((r:any)=>SKILLS.find(s=>s.id===r.skillId)?.category).filter(Boolean))].length} QE skill categories.`;

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => { setCopied(key); setTimeout(() => setCopied(null), 2000); });
    toast.success('Copied to clipboard!');
  };

  const Block = ({ title, content, id }: any) => (
    <div style={{ ...card, marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: T.text }}>{title}</div>
        <button onClick={() => copy(content, id)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8, background: copied === id ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.1)', border: `1px solid ${copied===id?'rgba(16,185,129,0.35)':'rgba(59,130,246,0.3)'}`, color: copied===id?'#34D399':'#60A5FA', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
          {copied === id ? <Check size={13} /> : <Copy size={13} />}
          {copied === id ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre style={{ fontSize: 13, color: T.sub, lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: "'Inter',sans-serif", margin: 0, padding: '14px', borderRadius: 10, background: dark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.03)', border: `1px solid ${T.bdr}` }}>{content}</pre>
    </div>
  );

  return (
    <div style={{ animation: 'fadeUp 0.4s ease-out' }}>
      <div style={{ ...card, marginBottom: 20, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: T.text, marginBottom: 4 }}>📄 Resume & LinkedIn Generator</div>
        <div style={{ fontSize: 13, color: T.sub }}>One-click generate professional content based on your skill profile</div>
      </div>
      <Block title="🔗 LinkedIn Summary" content={linkedInSummary} id="linkedin" />
      <Block title="📋 Resume Skills Section" content={resumeSkills} id="skills" />
      <Block title="👤 QA Engineer Bio" content={bio} id="bio" />
    </div>
  );
}

// ─── ADDON 6: AI Chat Coach ───────────────────────────────────────────────────
interface ChatMsg { role: 'user' | 'ai'; text: string; }

function ChatCoach({ open, onToggle, ratings, name, dark, T }: any) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    { role: 'ai', text: `Hi ${name}! 👋 I'm your AI QE Coach. Ask me anything about your skills, career path, or what to learn next!` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [ollamaOk, setOllamaOk] = useState<boolean | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && ollamaOk === null) {
      checkOllamaStatus().then(s => { setOllamaOk(s.available); setModel(s.model); });
    }
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs]);

  const quickQuestions = [
    "What should I learn this week?",
    "Am I ready for a senior QE role?",
    "Give me a Selenium interview question",
    "Which skill has highest market demand?",
  ];

  async function send(text?: string) {
    const q = text || input.trim();
    if (!q) return;
    setInput('');
    setMsgs(m => [...m, { role: 'user', text: q }]);
    setLoading(true);

    const expert  = SKILLS.filter(s => ratings.find((r:any) => r.skillId===s.id)?.selfRating===3).map(s=>s.name);
    const inter   = SKILLS.filter(s => ratings.find((r:any) => r.skillId===s.id)?.selfRating===2).map(s=>s.name);
    const beginner = SKILLS.filter(s => ratings.find((r:any) => r.skillId===s.id)?.selfRating===1).map(s=>s.name);
    const rated   = ratings.filter((r:any) => r.selfRating > 0).length;

    if (ollamaOk && model) {
      // Give the LLM a clear system context but let it handle any topic naturally
      const context = `You are a friendly AI QE career coach chatting with ${name}. Their skill profile: Expert in [${expert.join(', ')||'none yet'}], Intermediate in [${inter.slice(0,4).join(', ')||'none'}], Beginner in [${beginner.slice(0,4).join(', ')||'none'}]. Total skills rated: ${rated}/32. IMPORTANT: If the user is just greeting you or asking a simple personal question (like their name), respond naturally and briefly. Only give career/skill advice when they specifically ask for it.`;
      try {
        const res = await ollamaChatWithContext(model, q, context);
        setMsgs(m => [...m, { role: 'ai', text: res }]);
      } catch {
        setMsgs(m => [...m, { role: 'ai', text: getFallbackAnswer(q, name, expert, beginner, rated) }]);
      }
    } else {
      await new Promise(r => setTimeout(r, 400));
      setMsgs(m => [...m, { role: 'ai', text: getFallbackAnswer(q, name, expert, beginner, rated) }]);
    }
    setLoading(false);
  }

  function getFallbackAnswer(q: string, userName: string, expert: string[], beginner: string[], rated: number): string {
    const ql = q.toLowerCase().trim();

    // ── Greetings ─────────────────────────────────────────────────────────────
    const greetings = ['hi', 'hii', 'hiii', 'hello', 'hey', 'howdy', 'good morning', 'good afternoon', 'good evening', 'sup', 'yo'];
    if (greetings.some(g => ql === g || ql.startsWith(g + ' ') || ql === g + '!')) {
      return `Hey ${userName}! 😊 Great to chat with you. I'm your AI QE Coach — here to help with your career, skills, and learning path. What's on your mind?`;
    }

    // ── Name questions ─────────────────────────────────────────────────────────
    if (ql.includes('my name') || ql === 'who am i' || ql.includes('what am i called')) {
      return `Your name is **${userName}**! 😄 I have your full skill profile loaded and ready. Ask me anything about your QE career!`;
    }

    // ── How are you / small talk ───────────────────────────────────────────────
    if (ql.includes('how are you') || ql.includes('how r u') || ql === 'hru' || ql.includes("what's up") || ql.includes('whats up')) {
      return `I'm doing great, thanks for asking! 🤖 Ready to help you level up your QE career, ${userName}. What would you like to explore today?`;
    }

    // ── Thank you ──────────────────────────────────────────────────────────────
    if (ql.includes('thank') || ql.includes('thanks') || ql === 'ty' || ql === 'thx') {
      return `You're welcome, ${userName}! 😊 Feel free to ask anything else — I'm always here to help!`;
    }

    // ── "What can you do" ──────────────────────────────────────────────────────
    if (ql.includes('what can you do') || ql.includes('help me') || ql.includes('your features') || ql.includes('capabilities')) {
      return `I can help you with:\n• 📚 What to learn next based on your skill gaps\n• 🎯 Interview prep questions for any QE tool\n• 🚀 Career readiness for senior/lead roles\n• 📊 Which skills have the highest market demand\n• 🗓️ Building a learning plan\n\nJust ask me anything, ${userName}!`;
    }

    // ── Learn / week ───────────────────────────────────────────────────────────
    if (ql.includes('learn') || ql.includes('this week') || ql.includes('study') || ql.includes('focus')) {
      return beginner.length > 0
        ? `For this week, I'd recommend focusing on **${beginner[0]}** — it's at Beginner level and has strong market demand.\n\n📅 Plan: 30 min/day → by end of week you'll have solid enough footing to rate it Intermediate!\n\nWant a detailed daily schedule?`
        : `Great news — you have no Beginner skills! 🎉 This week, focus on getting one of your Intermediate skills to Expert. Pick the one used most in your current project.`;
    }

    // ── Senior readiness ───────────────────────────────────────────────────────
    if (ql.includes('senior') || ql.includes('ready') || ql.includes('promotion') || ql.includes('lead')) {
      return `Senior QE Engineers typically need:\n✅ Expert in Selenium / Python / API Testing\n✅ Strong DevOps (Docker, Jenkins, Azure)\n✅ At least 1-2 AI skills\n✅ 5+ Expert-level skills total\n\nYou currently have **${expert.length} Expert skills**. ${expert.length >= 5 ? "You're well-positioned for senior roles! 🚀" : `Aim for ${5 - expert.length} more Expert skills to reach senior level.`}`;
    }

    // ── Interview questions ────────────────────────────────────────────────────
    if (ql.includes('interview') || ql.includes('question') || ql.includes('mock')) {
      const questions = [
        `**Selenium:** "How do you handle flaky tests in your automation suite?"\n💡 Talk about retry logic, explicit waits, and stable locator strategies.`,
        `**API Testing:** "What's the difference between authentication and authorization in API testing?"\n💡 Auth = who you are (tokens/keys), Authz = what you can do (permissions).`,
        `**DevOps:** "How would you integrate automated tests into a CI/CD pipeline?"\n💡 Mention Jenkins/GitHub Actions, parallel test execution, and failure notifications.`,
        `**Python:** "How do you use pytest fixtures for test data setup?"\n💡 Explain scope (function/class/module/session) and fixture dependency injection.`,
      ];
      return questions[Math.floor(Math.random() * questions.length)];
    }

    // ── Market demand ──────────────────────────────────────────────────────────
    if (ql.includes('demand') || ql.includes('market') || ql.includes('trending') || ql.includes('hot skill') || ql.includes('salary')) {
      return `🔥 Top QE skills by market demand in 2025:\n\n1. AI Test Automation (95%) 🤖\n2. ChatGPT/Prompt Engineering (93%) 💬\n3. Python (92%) 🐍\n4. API Testing (91%) 🔌\n5. Docker (89%) 🐳\n6. Selenium (85%) 🌐\n\nAI skills command a **30–40% salary premium** — worth prioritizing!`;
    }

    // ── Start Ollama hint ──────────────────────────────────────────────────────
    if (ql.includes('ollama') || ql.includes('ai mode') || ql.includes('local ai')) {
      return `To enable full AI mode:\n\n1. Run: \`ollama serve\`\n2. In another terminal: \`set OLLAMA_ORIGINS=*\`\n3. Refresh this page\n\nOnce connected, I'll give you much deeper, personalized answers based on your exact skill profile!`;
    }

    // ── Default: short, helpful, not skill-dumping ────────────────────────────
    return `That's a great question! 🤔 I can answer best when you ask about your skills, career growth, or learning path.\n\nTry asking:\n• "What should I learn this week?"\n• "Am I ready for a senior role?"\n• "Give me a Python interview question"\n• "Which skills are most in demand?"`;
  }

  return (
    <>
      {/* Floating button */}
      <button onClick={onToggle} style={{
        position: 'fixed', bottom: 28, right: 28, width: 58, height: 58, borderRadius: '50%',
        background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 28px rgba(59,130,246,0.5)',
        zIndex: 1000, transition: 'transform 0.2s',
      }} onMouseEnter={e=>e.currentTarget.style.transform='scale(1.1)'} onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
        {open ? <X size={22} color="#fff" /> : <Bot size={24} color="#fff" />}
      </button>

      {/* Chat sidebar */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 96, right: 28, width: 360, height: 520,
          background: dark ? '#0D1629' : '#fff', border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
          borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column',
          zIndex: 999, overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ padding: '14px 18px', background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bot size={20} color="#fff" />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>AI QE Coach</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)' }}>{ollamaOk ? '🟢 Ollama connected' : '🟡 Smart fallback mode'}</div>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{ flex: 1, overflow: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '82%', padding: '10px 13px', borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: m.role === 'user' ? 'linear-gradient(135deg,#3B82F6,#8B5CF6)' : (dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
                  color: m.role === 'user' ? '#fff' : (dark ? '#E2E8F0' : '#1E293B'),
                  fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap',
                }}>{m.text}</div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: dark ? '#9CA3AF' : '#6B7280', fontSize: 13 }}>
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Thinking...
              </div>
            )}
          </div>

          {/* Quick questions */}
          {msgs.length <= 1 && (
            <div style={{ padding: '0 12px 8px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {quickQuestions.map(q => (
                <button key={q} onClick={() => send(q)} style={{ padding: '5px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(59,130,246,0.08)', border: `1px solid ${dark?'rgba(255,255,255,0.1)':'rgba(59,130,246,0.2)'}`, color: dark ? '#93C5FD' : '#2563EB', cursor: 'pointer' }}>{q}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`, display: 'flex', gap: 8 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Ask about your skills..." disabled={loading}
              style={{ flex: 1, padding: '10px 13px', borderRadius: 10, background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, color: dark ? '#E2E8F0' : '#1E293B', fontSize: 13, outline: 'none' }} />
            <button onClick={() => send()} disabled={!input.trim() || loading} style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: !input.trim() || loading ? 0.5 : 1 }}>
              <Send size={16} color="#fff" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
