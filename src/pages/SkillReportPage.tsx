import { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertCircle, Lightbulb, Loader2, BarChart3, CheckCircle2, Star, RefreshCw } from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { getEmployee, computeCompletion, getIncompleteSkills } from '@/lib/localDB';
import { generateSkillReport } from '@/lib/ollamaAI';
import { checkOllamaStatus } from '@/lib/ollamaAI';
import { SKILLS } from '@/lib/mockData';
import { useDark, mkTheme } from '@/lib/themeContext';
import { apiSaveSkills, apiSubmit, isServerAvailable } from '@/lib/api';
import { toast } from 'sonner';

const CAT_COLOR: Record<string, string> = {
  Tool: '#3B82F6', Technology: '#8B5CF6', Application: '#10B981',
  Domain: '#F59E0B', TestingType: '#EF4444', DevOps: '#06B6D4', AI: '#EC4899',
};
const LVL_COLOR: Record<number, string> = { 0: '#4B5563', 1: '#D97706', 2: '#2563EB', 3: '#059669' };
const LVL_LABEL: Record<number, string> = { 0: 'Not Rated', 1: 'Beginner', 2: 'Intermediate', 3: 'Expert' };

interface Report {
  strengths: string[];
  gaps: string[];
  suggestions: string[];
  summary: string;
}

const REPORT_CACHE_KEY = (id: string) => `skill_nav_report_${id}`;

function loadCachedReport(empId: string): Report | null {
  try {
    const raw = localStorage.getItem(REPORT_CACHE_KEY(empId));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveReportCache(empId: string, report: Report) {
  try { localStorage.setItem(REPORT_CACHE_KEY(empId), JSON.stringify(report)); } catch { /* ignore */ }
}

export default function SkillReportPage() {
  const { employeeId, name } = useAuth();
  const emp = employeeId && employeeId !== 'new' ? getEmployee(employeeId) : null;
  const ratings = emp?.skills ?? [];
  const completion = computeCompletion(ratings);
  const incomplete = getIncompleteSkills(ratings);
  const isSubmitted = emp?.submitted === true;

  const [report, setReport]     = useState<Report | null>(() => {
    if (!employeeId) return null;
    const cached = loadCachedReport(employeeId);
    // Discard very short/generic reports so the new rich engine runs
    if (cached && cached.strengths?.length > 0 && cached.suggestions?.length >= 3) return cached;
    return null;
  });
  const [loading, setLoading]   = useState(!report); // skip loading if cached
  const [loadingMsg, setLoadingMsg] = useState('Generating your report...');
  const [aiUsed, setAiUsed]     = useState(false);

  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced]   = useState(false);

  const { dark } = useDark();
  const T = mkTheme(dark);

  // Sync locally-stored skills to the Excel backend
  async function syncToExcel() {
    if (!employeeId || !emp) return;
    setSyncing(true);
    try {
      const serverUp = await isServerAvailable();
      if (!serverUp) { toast.error('Backend server is not running.'); setSyncing(false); return; }
      const payload = (emp.skills ?? []).map(r => ({
        skillId:       r.skillId,
        skillName:     SKILLS.find(s => s.id === r.skillId)?.name     || r.skillId,
        category:      SKILLS.find(s => s.id === r.skillId)?.category || '',
        selfRating:    r.selfRating,
        managerRating: r.managerRating,
        validated:     r.validated,
      }));
      await apiSaveSkills(employeeId, payload);
      await apiSubmit(employeeId);
      setSynced(true);
      toast.success('✅ Skills synced to Excel successfully!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sync failed — is Excel still open?');
    } finally {
      setSyncing(false);
    }
  }

  useEffect(() => {
    // If we already have a cached report and employee is submitted, show it immediately
    if (report && isSubmitted) return;
    // Otherwise generate
    generateReport();
  }, []);

  async function generateReport() {
    setLoading(true);
    setLoadingMsg('🔍 Preparing smart analysis...');

    const status = await checkOllamaStatus();
    let generated: Report;

    if (status.available && status.model) {
      setAiUsed(true);
      setLoadingMsg('🧠 Generating AI analysis...');
      try {
        generated = await generateSkillReport(emp?.name || name || 'Employee', ratings, status.model);
      } catch {
        generated = fallbackReport();
      }
    } else {
      setLoadingMsg('📊 Generating smart report...');
      await new Promise(r => setTimeout(r, 800));
      generated = fallbackReport();
    }

    setReport(generated);
    // Cache the report so future visits (after logout/login) show it instantly
    if (employeeId) saveReportCache(employeeId, generated);
    setLoading(false);
  }

  function fallbackReport(): Report {
    const level3 = SKILLS.filter(s => ratings.find(r => r.skillId === s.id)?.selfRating === 3);
    const level0 = SKILLS.filter(s => !ratings.find(r => r.skillId === s.id)?.selfRating || ratings.find(r => r.skillId === s.id)?.selfRating === 0);
    return {
      strengths: level3.length > 0
        ? level3.slice(0, 3).map(s => `Strong expertise in ${s.name} — a key QE skill`)
        : ['Starting your QE journey with a fresh assessment', 'Ready to build a comprehensive skill profile', 'Focus on rating all 32 skills for a complete picture'],
      gaps: level0.slice(0, 3).map(s => `${s.name} (${s.category}) has not been assessed yet`),
      suggestions: [
        'Complete all 32 skills across 7 categories for a comprehensive profile',
        'Focus on AI testing skills (ChatGPT, AI Test Automation) as they are in highest demand',
        'Get manager validation on your key skills to add credibility to your profile',
        'Set a 90-day milestone: move 3 skills from Beginner to Intermediate level',
        "Explore Zensar's internal certification programs aligned with your gap areas",
      ],
      summary: `You have completed ${completion}% of your skill matrix with ${ratings.filter(r => r.selfRating > 0).length} of 32 skills rated. ${level3.length > 0 ? `Your strongest areas are ${level3.slice(0, 2).map(s => s.name).join(' and ')}.` : ''} Focus on closing the ${level0.length} unrated skills to get a complete picture of your QE capability.`,
    };
  }

  // Category breakdown
  const categories = [...new Set(SKILLS.map(s => s.category))];
  const catStats = categories.map(cat => {
    const catSkills = SKILLS.filter(s => s.category === cat);
    const rated = catSkills.filter(s => (ratings.find(r => r.skillId === s.id)?.selfRating ?? 0) > 0);
    const avgLevel = rated.length > 0
      ? rated.reduce((sum, s) => sum + (ratings.find(r => r.skillId === s.id)?.selfRating ?? 0), 0) / rated.length
      : 0;
    return { cat, total: catSkills.length, rated: rated.length, avgLevel: Math.round(avgLevel * 10) / 10 };
  });

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif", transition: 'background 0.3s' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '36px 20px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Brain size={20} color="#fff" />
              </div>
              <h1 style={{ fontSize: '26px', fontWeight: 800, color: T.text, fontFamily: "'Space Grotesk',sans-serif" }}>AI Skill Report</h1>
            </div>
            {/* Sync to Excel button — shown when not yet synced */}
            {!synced && (
              <button onClick={syncToExcel} disabled={syncing} style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                padding: '9px 18px', borderRadius: '9px',
                background: syncing ? 'rgba(59,130,246,0.1)' : 'rgba(16,185,129,0.12)',
                border: `1px solid ${syncing ? 'rgba(59,130,246,0.3)' : 'rgba(16,185,129,0.4)'}`,
                color: syncing ? '#60A5FA' : '#34D399',
                fontWeight: 700, fontSize: '13px', cursor: syncing ? 'not-allowed' : 'pointer',
              }}>
                <RefreshCw size={14} style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
                {syncing ? 'Syncing...' : 'Sync to Excel'}
              </button>
            )}
            {synced && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '9px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)', color: '#34D399', fontSize: '13px', fontWeight: 600 }}>
                <CheckCircle2 size={14} /> Synced to Excel
              </div>
            )}
          </div>
          <p style={{ color: T.sub, fontSize: '14px' }}>
            {aiUsed ? '🧠 AI-powered report' : '📊 Smart report generated'} · {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          {isSubmitted && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '20px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)', color: '#10B981', fontSize: '12px', fontWeight: 700, marginTop: '8px' }}>
              <CheckCircle2 size={13} /> Submitted
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <Loader2 size={48} color="#3B82F6" style={{ margin: '0 auto 20px', animation: 'spin 1s linear infinite' }} />
            <div style={{ fontSize: '18px', fontWeight: 600, color: T.text, marginBottom: '8px' }}>{loadingMsg}</div>
            <div style={{ color: T.sub, fontSize: '14px' }}>Analyzing your 32 skills across 7 categories...</div>
          </div>
        )}

        {!loading && report && (
          <>
            {/* ── Completion Score Card ─────────────────────── */}
            <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.12))', border: '1px solid rgba(59,130,246,0.25)', borderRadius: '20px', padding: '28px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '28px', alignItems: 'center' }}>
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{ width: 120, height: 120, borderRadius: '50%', background: `conic-gradient(#3B82F6 ${completion * 3.6}deg, rgba(255,255,255,0.07) 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                  <div style={{ width: 90, height: 90, borderRadius: '50%', background: dark ? '#050B18' : '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '26px', fontWeight: 800, color: T.text }}>{completion}%</span>
                    <span style={{ fontSize: '9px', color: T.muted }}>COMPLETE</span>
                  </div>
                </div>
                <div style={{ color: T.muted, fontSize: '12px' }}>{ratings.filter(r => r.selfRating > 0).length}/{SKILLS.length} skills rated</div>
              </div>
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ fontSize: '15px', color: T.text, lineHeight: 1.75, marginBottom: '14px' }}>{report.summary}</div>
                {incomplete.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
                    <AlertCircle size={14} color="#F87171" />
                    <span style={{ color: '#FCA5A5', fontSize: '12px', fontWeight: 500 }}>{incomplete.length} skills not yet rated</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Category Breakdown ─────────────────────────── */}
            <div style={{ background: T.card, border: `1px solid ${T.bdr}`, borderRadius: '18px', padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <BarChart3 size={18} color="#60A5FA" /><span style={{ fontWeight: 700, fontSize: '16px', color: T.text }}>Category Breakdown</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                {catStats.map(c => {
                  const pct = Math.round((c.rated / c.total) * 100);
                  const color = CAT_COLOR[c.cat] || '#3B82F6';
                  return (
                    <div key={c.cat} style={{ padding: '14px', borderRadius: '12px', background: `${color}0c`, border: `1px solid ${color}28` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: T.text }}>{c.cat}</span>
                        <span style={{ fontSize: '12px', fontWeight: 700, color }}>Avg {c.avgLevel}/3</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 999, background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)', marginBottom: '6px' }}>
                        <div style={{ height: '100%', width: `${pct}%`, borderRadius: 999, background: color, transition: 'width 1s' }} />
                      </div>
                      <div style={{ fontSize: '11px', color: T.muted }}>{c.rated}/{c.total} rated · {pct}%</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Strengths + Gaps ──────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              <div style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '18px', padding: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Star size={18} color="#34D399" fill="#34D399" />
                  <span style={{ fontWeight: 700, fontSize: '15px', color: T.text }}>Your Strengths</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {report.strengths.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <CheckCircle2 size={15} color="#10B981" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontSize: '13px', color: T.sub, lineHeight: 1.6 }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '18px', padding: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <AlertCircle size={18} color="#F87171" />
                  <span style={{ fontWeight: 700, fontSize: '15px', color: T.text }}>Skill Gaps</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {report.gaps.map((g, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444', flexShrink: 0, marginTop: 5 }} />
                      <span style={{ fontSize: '13px', color: T.sub, lineHeight: 1.6 }}>{g}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── AI Suggestions ────────────────────────────── */}
            <div style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '18px', padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <Lightbulb size={18} color="#A78BFA" />
                <span style={{ fontWeight: 700, fontSize: '15px', color: T.text }}>
                  {aiUsed ? '🧠 AI-Powered Growth Suggestions' : '💡 Growth Suggestions'}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                {report.suggestions.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '14px', borderRadius: '12px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#8B5CF6,#EC4899)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: '#fff' }}>{i + 1}</div>
                    <span style={{ fontSize: '13px', color: T.sub, lineHeight: 1.65 }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Full Skill Ratings Table ──────────────────── */}
            <div style={{ background: T.card, border: `1px solid ${T.bdr}`, borderRadius: '18px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <TrendingUp size={18} color="#60A5FA" />
                <span style={{ fontWeight: 700, fontSize: '15px', color: T.text }}>Full Skill Ratings</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                {SKILLS.map(s => {
                  const r = ratings.find(rt => rt.skillId === s.id);
                  const lvl = r?.selfRating ?? 0;
                  const color = CAT_COLOR[s.category] || '#3B82F6';
                  return (
                    <div key={s.id} style={{ padding: '10px 12px', borderRadius: '10px', background: `${LVL_COLOR[lvl]}0a`, border: `1px solid ${LVL_COLOR[lvl]}28`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: T.text }}>{s.name}</div>
                        <div style={{ fontSize: '10px', color }}>{s.category}</div>
                      </div>
                      <div style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, background: `${LVL_COLOR[lvl]}20`, color: LVL_COLOR[lvl] }}>{LVL_LABEL[lvl]}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700;800&display=swap');
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}
