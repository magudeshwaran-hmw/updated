import { useMemo, useState, useEffect } from 'react';
import { SKILLS } from '@/lib/mockData';
import { useNavigate } from 'react-router-dom';
import {
  Users, TrendingUp, AlertTriangle, Award, Download,
  BarChart3, CheckCircle2, Clock, Search, Eye, FileSpreadsheet, RefreshCw, Brain
} from 'lucide-react';
import { toast } from 'sonner';
import { useDark, mkTheme } from '@/lib/themeContext';
import { getAllEmployees, exportAllToExcel, exportEmployeeToExcel, computeCompletion, upsertEmployee, saveSkillRatings } from '@/lib/localDB';
import { apiGetAllEmployees, apiGetSkills, isServerAvailable } from '@/lib/api';
import type { ProficiencyLevel } from '@/lib/types';
import { generateCareerInsight, computeSkillPriorities, CERTIFICATIONS } from '@/lib/aiIntelligence';

const CAT_COLORS = ['#3B82F6','#8B5CF6','#10B981','#F59E0B','#EF4444','#06B6D4','#EC4899'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { dark } = useDark();
  const T = mkTheme(dark);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all'|'submitted'|'pending'>('all');
  const [sortBy, setSortBy]   = useState<'name'|'completion'|'submitted'>('completion');
  const [activeTab, setActiveTab] = useState<'overview'|'employees'|'skills'>('overview');
  const [refreshTick, setRefreshTick] = useState(0);
  const [syncing, setSyncing] = useState(false);

  // Sync all employees from backend on mount
  useEffect(() => {
    syncFromBackend();
  }, []);

  async function syncFromBackend(showToast = false) {
    setSyncing(true);
    try {
      const serverUp = await isServerAvailable();
      if (!serverUp) { setSyncing(false); return; }
      const backendEmps = await apiGetAllEmployees();
      for (const raw of backendEmps as any[]) {
        const empId = raw.ID || raw.id;
        if (!empId) continue;
        upsertEmployee({
          id:                empId,
          name:              raw.Name              || raw.name              || '',
          email:             raw.Email             || raw.email             || '',
          phone:             raw.Phone             || raw.phone             || '',
          designation:       raw.Designation       || raw.designation       || '',
          department:        raw.Department        || raw.department        || 'Quality Engineering',
          location:          raw.Location          || raw.location          || '',
          yearsIT:           Number(raw.YearsIT    ?? raw.yearsIT    ?? 0),
          yearsZensar:       Number(raw.YearsZensar?? raw.yearsZensar?? 0),
          primarySkill:      raw.PrimarySkill      || raw.primarySkill      || '',
          primaryDomain:     raw.PrimaryDomain     || raw.primaryDomain     || '',
          overallCapability: Number(raw.OverallCapability ?? raw.overallCapability ?? 0),
          submitted:         raw.Submitted === 'Yes' || raw.submitted === true,
          resumeUploaded:    raw.ResumeUploaded === 'Yes' || raw.resumeUploaded === true,
          skills: SKILLS.map(s => ({ skillId: s.id, selfRating: 0 as ProficiencyLevel, managerRating: null, validated: false })),
        });
        try {
          const skills = await apiGetSkills(empId);
          if (skills.length > 0) {
            saveSkillRatings(empId, skills.map(s => ({
              skillId:       s.skillId,
              selfRating:    s.selfRating as ProficiencyLevel,
              managerRating: s.managerRating as ProficiencyLevel | null,
              validated:     s.validated,
            })));
          }
        } catch { /* skip */ }
      }
      setRefreshTick(t => t + 1);
      if (showToast) toast.success(`✅ Synced ${backendEmps.length} employees from server`);
    } catch (err) {
      if (showToast) toast.error('Could not reach backend server');
    } finally {
      setSyncing(false);
    }
  }

  const employees = useMemo(() => getAllEmployees(), [refreshTick]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total      = employees.length;
    const submitted  = employees.filter(e => e.submitted).length;
    const avgComp    = total > 0 ? Math.round(employees.reduce((s,e) => s + computeCompletion(e.skills), 0) / total) : 0;
    const gapCount   = employees.reduce((s,e) => s + e.skills.filter(sk => sk.selfRating === 1).length, 0);
    const validated  = employees.reduce((s,e) => s + e.skills.filter(sk => sk.validated).length, 0);
    return { total, submitted, avgComp, gapCount, validated };
  }, [employees]);

  // ── Category heatmap ──────────────────────────────────────────────────────
  const catData = useMemo(() => {
    const cats = [...new Set(SKILLS.map(s => s.category))];
    return cats.map((cat, ci) => {
      const catSkills = SKILLS.filter(s => s.category === cat);
      let totalRatings = 0, ratingSum = 0;
      employees.forEach(e => catSkills.forEach(s => {
        const r = e.skills.find(r => r.skillId === s.id);
        if (r && r.selfRating > 0) { totalRatings++; ratingSum += r.selfRating; }
      }));
      const avgLevel = totalRatings > 0 ? ratingSum / totalRatings : 0;
      const coverage = employees.length > 0 ? totalRatings / (employees.length * catSkills.length) : 0;
      return { cat, avgLevel, coverage, color: CAT_COLORS[ci % CAT_COLORS.length], total: catSkills.length };
    });
  }, [employees]);

  // ── Level distribution ────────────────────────────────────────────────────
  const levelDist = useMemo(() => {
    const levels = [0, 0, 0, 0];
    employees.forEach(e => e.skills.forEach(s => { if (s.selfRating <= 3) levels[s.selfRating]++; }));
    const total = levels.reduce((a,b) => a+b, 0) || 1;
    const colors = ['#4B5563','#D97706','#2563EB','#059669'];
    const labels = ['Not Rated','Beginner','Intermediate','Expert'];
    return levels.map((count, i) => ({ level: i, count, pct: Math.round((count/total)*100), color: colors[i], label: labels[i] }));
  }, [employees]);

  // ── Filtered employee list ────────────────────────────────────────────────
  const filteredEmps = useMemo(() => {
    let list = employees.filter(e => {
      const q = search.toLowerCase().trim();
      if (q) {
        // Search across every meaningful field
        const profileMatch =
          e.name.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.designation.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q) ||
          e.primarySkill.toLowerCase().includes(q) ||
          e.primaryDomain.toLowerCase().includes(q);

        // Also search skill names (any skill rated ≥ 1)
        const skillMatch = SKILLS.some(sk =>
          sk.name.toLowerCase().includes(q) &&
          (e.skills.find(r => r.skillId === sk.id)?.selfRating ?? 0) > 0
        );

        // Also search skill categories
        const catMatch = SKILLS.some(sk =>
          sk.category.toLowerCase().includes(q) &&
          (e.skills.find(r => r.skillId === sk.id)?.selfRating ?? 0) > 0
        );

        if (!profileMatch && !skillMatch && !catMatch) return false;
      }
      if (filterStatus === 'submitted' && !e.submitted) return false;
      if (filterStatus === 'pending' && e.submitted) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'completion') return computeCompletion(b.skills) - computeCompletion(a.skills);
      if (sortBy === 'submitted') return (b.submitted ? 1 : 0) - (a.submitted ? 1 : 0);
      return 0;
    });
    return list;
  }, [employees, search, filterStatus, sortBy]);


  const handleExportAll = () => {
    exportAllToExcel();
    toast.success('📊 All employee data exported to Excel!');
  };
  const handleExportOne = (id: string, name: string) => {
    exportEmployeeToExcel(id);
    toast.success(`📊 ${name}'s report exported!`);
  };

  // Shared card style
  const card = (extra?: object) => ({
    background: T.card, border: `1px solid ${T.bdr}`,
    borderRadius: '16px', backdropFilter: 'blur(10px)',
    padding: '22px', ...extra,
  });

  const tabBtn = (tab: typeof activeTab) => ({
    padding: '9px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
    border: 'none', cursor: 'pointer', transition: 'all 0.2s',
    background: activeTab === tab ? 'linear-gradient(135deg,#3B82F6,#8B5CF6)' : T.card,
    color: activeTab === tab ? '#fff' : T.sub,
    border2: `1px solid ${T.bdr}`,
  } as React.CSSProperties);

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: "'Inter',sans-serif", transition: 'background 0.3s' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: T.text, fontFamily: "'Space Grotesk',sans-serif", marginBottom: '4px' }}>Admin Dashboard</h1>
            <p style={{ color: T.sub, fontSize: '14px' }}>Team capability overview, analytics &amp; reports</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={() => syncFromBackend(true)} disabled={syncing} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '10px 18px', borderRadius: '10px', background: syncing ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', color: '#60A5FA', fontWeight: 700, fontSize: '13px', cursor: syncing ? 'not-allowed' : 'pointer' }}>
              <RefreshCw size={14} style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
              {syncing ? 'Syncing...' : 'Refresh Data'}
            </button>
            <button onClick={handleExportAll} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '10px 20px', borderRadius: '10px', background: 'linear-gradient(135deg,#10B981,#059669)', border: 'none', color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 16px rgba(16,185,129,0.4)' }}>
              <FileSpreadsheet size={16} /> Export All to Excel
            </button>
          </div>
        </div>

        {/* ── KPI Stat Cards ─────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          {[
            { label: 'Team Size',        value: stats.total,     icon: Users,         color: '#3B82F6', sub: 'Total employees' },
            { label: 'Submitted',         value: stats.submitted, icon: CheckCircle2,  color: '#10B981', sub: `of ${stats.total} completed` },
            { label: 'Avg Completion',    value: `${stats.avgComp}%`, icon: TrendingUp, color: '#8B5CF6', sub: 'Skills rated avg' },
            { label: 'Beginner Skills',   value: stats.gapCount,  icon: AlertTriangle, color: '#F59E0B', sub: 'Need improvement' },
            { label: 'Validated Skills',  value: stats.validated, icon: Award,         color: '#EC4899', sub: 'Manager endorsed' },
          ].map(s => (
            <div key={s.label} style={{ ...card(), transition: 'all 0.2s', cursor: 'default' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = s.color+'55'; e.currentTarget.style.boxShadow = `0 8px 24px ${s.color}18`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.bdr; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ width: 40, height: 40, borderRadius: '12px', background: `${s.color}18`, border: `1px solid ${s.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon size={20} color={s.color} />
                </div>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: s.color, fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: T.text, marginTop: '6px' }}>{s.label}</div>
              <div style={{ fontSize: '11px', color: T.muted, marginTop: '2px' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── AI Team Intelligence ───────────────────────────────────────── */}
        {employees.length > 0 && (() => {
          // Compute per-employee readiness scores
          const readiness = employees.map(e => ({ name: e.name, score: generateCareerInsight(e.skills, e.name).readinessScore }));
          const avgReadiness = Math.round(readiness.reduce((s,r)=>s+r.score,0)/readiness.length);
          const seniorReady = readiness.filter(r=>r.score>=75).length;
          const midLevel    = readiness.filter(r=>r.score>=50&&r.score<75).length;
          const junior      = readiness.filter(r=>r.score<50).length;
          const topNeed     = employees.length>0 ? computeSkillPriorities(employees[0].skills).filter(s=>s.gap>0).slice(0,5) : [];
          const readColor   = avgReadiness>=75?'#10B981':avgReadiness>=50?'#F59E0B':'#EF4444';
          return (
            <div style={{ ...card(), marginBottom: 24, background: 'linear-gradient(135deg,rgba(59,130,246,0.05),rgba(139,92,246,0.05))', border: '1px solid rgba(59,130,246,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <div style={{ width: 36, height: 36, borderRadius: 11, background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Brain size={18} color="#fff" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: T.text, fontFamily: "'Space Grotesk',sans-serif" }}>AI Team Intelligence</div>
                  <div style={{ fontSize: 12, color: T.sub }}>Auto-generated from {employees.length} employee skill profiles</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14, marginBottom: 16 }}>
                {/* Avg readiness */}
                <div style={{ padding: '16px', borderRadius: 14, background: `${readColor}10`, border: `1px solid ${readColor}30`, textAlign: 'center' }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: readColor, fontFamily: "'Space Grotesk',sans-serif" }}>{avgReadiness}%</div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: T.text, marginBottom: 4 }}>Avg Senior Readiness</div>
                  <div style={{ height: 6, borderRadius: 999, background: dark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.07)' }}>
                    <div style={{ height:'100%', width:`${avgReadiness}%`, borderRadius: 999, background: `linear-gradient(90deg,#EF4444,#F59E0B,#10B981)` }} />
                  </div>
                </div>
                {/* Tier breakdown */}
                <div style={{ padding: '16px', borderRadius: 14, background: dark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)', border: `1px solid ${T.bdr}` }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: T.text, marginBottom: 10 }}>Readiness Tiers</div>
                  {[
                    { label: '🚀 Senior Ready (≥75%)',  count: seniorReady, color: '#10B981' },
                    { label: '📈 Mid-Level (50–74%)',    count: midLevel,    color: '#F59E0B' },
                    { label: '📚 Junior (<50%)',         count: junior,      color: '#EF4444' },
                  ].map(tier => (
                    <div key={tier.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, fontSize: 12, color: T.sub }}>
                      <span>{tier.label}</span>
                      <span style={{ fontWeight: 800, color: tier.color }}>{tier.count}</span>
                    </div>
                  ))}
                </div>
                {/* Top skill gap team-wide */}
                <div style={{ padding: '16px', borderRadius: 14, background: dark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)', border: `1px solid ${T.bdr}` }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: T.text, marginBottom: 10 }}>⚡ Team Skill Priorities</div>
                  {topNeed.slice(0,4).map((s,i) => (
                    <div key={s.skillId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 5, color: T.sub }}>
                      <span>#{i+1} {s.name}</span>
                      <span style={{ fontWeight: 700, color: '#F59E0B' }}>P:{s.priorityScore.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Per-employee readiness list */}
              <div style={{ fontWeight: 700, fontSize: 13, color: T.text, marginBottom: 8 }}>Individual Readiness Scores</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {readiness.sort((a,b)=>b.score-a.score).map(r => {
                  const c = r.score>=75?'#10B981':r.score>=50?'#F59E0B':'#EF4444';
                  return (
                    <div key={r.name} style={{ padding: '5px 12px', borderRadius: 20, background: `${c}12`, border: `1px solid ${c}30`, fontSize: 11, fontWeight: 600, color: c }}>
                      {r.name.split(' ')[0]} · {r.score}%
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* ── Tab Navigation ─────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {[['overview','Overview'],['employees','Employees'],['skills','Skill Heatmap']] .map(([t,l]) => (
            <button key={t} onClick={() => setActiveTab(t as typeof activeTab)} style={tabBtn(t as typeof activeTab)}>{l}</button>
          ))}
        </div>

        {/* ══════════════ OVERVIEW TAB ════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>

            {/* Proficiency Distribution */}
            <div style={card()}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <BarChart3 size={18} color="#60A5FA" />
                <span style={{ fontWeight: 700, fontSize: '15px', color: T.text }}>Proficiency Distribution</span>
              </div>
              {levelDist.filter(d => d.level > 0).map(d => (
                <div key={d.level} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '13px', color: T.text, fontWeight: 600 }}>Level {d.level} — {d.label}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: d.color }}>{d.count} ({d.pct}%)</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 999, background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' }}>
                    <div style={{ height: '100%', width: `${d.pct}%`, borderRadius: 999, background: d.color, transition: 'width 1s', boxShadow: `0 0 8px ${d.color}50` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Submission Status */}
            <div style={card()}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <CheckCircle2 size={18} color="#34D399" />
                <span style={{ fontWeight: 700, fontSize: '15px', color: T.text }}>Submission Status</span>
              </div>
              {/* Donut */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
                  <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke={dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'} strokeWidth="3.5" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10B981" strokeWidth="3.5"
                      strokeDasharray={`${(stats.submitted / (stats.total || 1)) * 100} ${100 - (stats.submitted / (stats.total || 1)) * 100}`}
                      strokeLinecap="round" />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '18px', fontWeight: 800, color: T.text }}>{Math.round((stats.submitted / (stats.total || 1)) * 100)}%</span>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', padding: '10px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
                    <CheckCircle2 size={16} color="#10B981" />
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#10B981' }}>{stats.submitted}</div>
                      <div style={{ fontSize: '11px', color: T.muted }}>Submitted</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', borderRadius: '10px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}>
                    <Clock size={16} color="#F59E0B" />
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#F59E0B' }}>{stats.total - stats.submitted}</div>
                      <div style={{ fontSize: '11px', color: T.muted }}>Pending</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Performers */}
            <div style={card()}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <Award size={18} color="#F59E0B" />
                <span style={{ fontWeight: 700, fontSize: '15px', color: T.text }}>Capability Ranking</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[...employees]
                  .sort((a,b) => computeCompletion(b.skills) - computeCompletion(a.skills))
                  .slice(0, 6)
                  .map((emp, i) => {
                    const pct = computeCompletion(emp.skills);
                    const colors = ['#F59E0B','#9CA3AF','#CD7F32'];
                    return (
                      <div key={emp.id} onClick={() => navigate(`/admin/employee/${emp.id}`)}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '10px', cursor: 'pointer', transition: 'background 0.2s', background: 'transparent' }}
                        onMouseEnter={e => e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.05)' : 'rgba(59,130,246,0.07)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: i < 3 ? `${colors[i]}25` : T.card, border: `1px solid ${i < 3 ? colors[i] : T.bdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: i < 3 ? colors[i] : T.muted, flexShrink: 0 }}>{i+1}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.name}</div>
                          <div style={{ fontSize: '11px', color: T.muted }}>{emp.designation}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: pct >= 70 ? '#10B981' : pct >= 40 ? '#F59E0B' : '#EF4444' }}>{pct}%</div>
                          <div style={{ width: 56, height: 4, borderRadius: 999, background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.1)', marginTop: 2 }}>
                            <div style={{ height: '100%', width: `${pct}%`, borderRadius: 999, background: pct>=70?'#10B981':pct>=40?'#F59E0B':'#EF4444' }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Category Coverage */}
            <div style={card()}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <BarChart3 size={18} color="#A78BFA" />
                <span style={{ fontWeight: 700, fontSize: '15px', color: T.text }}>Category Avg Level</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {catData.map(c => (
                  <div key={c.cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', color: T.text, fontWeight: 600 }}>{c.cat}</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: c.color }}>{c.avgLevel.toFixed(1)}/3 avg</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 999, background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' }}>
                      <div style={{ height: '100%', width: `${(c.avgLevel/3)*100}%`, borderRadius: 999, background: c.color, boxShadow: `0 0 8px ${c.color}50` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ EMPLOYEES TAB ═══════════════════════════════════ */}
        {activeTab === 'employees' && (
          <>
            {/* Filter / Search bar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '18px', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
                <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.muted }} />
                <input
                  type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name, email, skill name, category, department..."
                  style={{ width: '100%', paddingLeft: 36, paddingRight: 12, paddingTop: 10, paddingBottom: 10, borderRadius: 10, background: T.input, border: `1px solid ${T.inputBdr}`, color: T.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
                style={{ padding: '10px 14px', borderRadius: 10, background: T.input, border: `1px solid ${T.inputBdr}`, color: T.text, fontSize: 13, cursor: 'pointer' }}>
                <option value="all">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="pending">Pending</option>
              </select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
                style={{ padding: '10px 14px', borderRadius: 10, background: T.input, border: `1px solid ${T.inputBdr}`, color: T.text, fontSize: 13, cursor: 'pointer' }}>
                <option value="completion">Sort: Completion</option>
                <option value="name">Sort: Name</option>
                <option value="submitted">Sort: Submitted</option>
              </select>
              <div style={{ fontSize: 12, color: T.muted }}>{filteredEmps.length} employees</div>
            </div>

            {/* Employee table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredEmps.map(emp => {
                const pct = computeCompletion(emp.skills);
                const rated = emp.skills.filter(s => s.selfRating > 0).length;
                return (
                  <div key={emp.id} style={{ ...card({ padding: '16px 20px' }), display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#3B82F655'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(59,130,246,0.12)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = T.bdr; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    {/* Avatar */}
                    <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                      {emp.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '14px', color: T.text }}>{emp.name}</span>
                        {emp.submitted
                          ? <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: 'rgba(16,185,129,0.15)', color: '#34D399', border: '1px solid rgba(16,185,129,0.3)' }}>✓ Submitted</span>
                          : <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: 'rgba(245,158,11,0.15)', color: '#FCD34D', border: '1px solid rgba(245,158,11,0.3)' }}>⏳ Pending</span>
                        }
                      </div>
                      <div style={{ fontSize: '12px', color: T.muted, marginTop: '2px' }}>{emp.designation} · {emp.department}</div>
                      <div style={{ fontSize: '11px', color: T.muted, marginTop: '2px' }}>{emp.email} · {rated}/32 skills</div>
                    </div>
                    {/* Progress */}
                    <div style={{ minWidth: 120, textAlign: 'right' }}>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: pct>=70?'#10B981':pct>=40?'#F59E0B':'#EF4444', fontFamily:"'Space Grotesk',sans-serif" }}>{pct}%</div>
                      <div style={{ width: '100%', height: 5, borderRadius: 999, background: dark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.08)', marginTop: 4 }}>
                        <div style={{ height: '100%', width: `${pct}%`, borderRadius: 999, background: pct>=70?'#10B981':pct>=40?'#F59E0B':'#EF4444' }} />
                      </div>
                    </div>
                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => navigate(`/admin/employee/${emp.id}`)}
                        style={{ width: 36, height: 36, borderRadius: '9px', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', color: '#60A5FA', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                        title="View Details"
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.22)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,130,246,0.12)'}
                      >
                        <Eye size={15} />
                      </button>
                      <button onClick={() => handleExportOne(emp.id, emp.name)}
                        style={{ width: 36, height: 36, borderRadius: '9px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#34D399', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                        title="Export Excel"
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.22)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.12)'}
                      >
                        <Download size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
              {filteredEmps.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: T.muted }}>
                  <Users size={40} style={{ margin: '0 auto 12px' }} />
                  <div style={{ fontSize: '15px', fontWeight: 600 }}>No employees found</div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ══════════════ SKILL HEATMAP TAB ═══════════════════════════════ */}
        {activeTab === 'skills' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '28px' }}>
              {catData.map(c => (
                <div key={c.cat} style={{ ...card({ textAlign: 'center', padding: '20px 14px' }), borderColor: `${c.color}35` }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: c.color, fontFamily:"'Space Grotesk',sans-serif" }}>{c.avgLevel.toFixed(1)}</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: T.text, marginTop: 4 }}>{c.cat}</div>
                  <div style={{ fontSize: '11px', color: T.muted, marginTop: 2 }}>{c.total} skills</div>
                  <div style={{ height: 5, borderRadius: 999, background: dark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.08)', marginTop: 10 }}>
                    <div style={{ height:'100%', width:`${(c.avgLevel/3)*100}%`, borderRadius: 999, background: c.color }} />
                  </div>
                  <div style={{ fontSize: '11px', color: c.color, marginTop: 5, fontWeight: 600 }}>{Math.round(c.coverage*100)}% coverage</div>
                </div>
              ))}
            </div>

            {/* Top 10 skills by team average */}
            <div style={card({ marginBottom: 0 })}>
              <div style={{ fontWeight: 700, fontSize: '15px', color: T.text, marginBottom: '18px' }}>All Skills — Team Average Proficiency</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px' }}>
                {SKILLS.map(skill => {
                  const ratings = employees.map(e => e.skills.find(r => r.skillId === skill.id)?.selfRating ?? 0).filter(r => r > 0);
                  const avg = ratings.length > 0 ? ratings.reduce((a,b)=>a+b,0)/ratings.length : 0;
                  const color = avg >= 2.5 ? '#10B981' : avg >= 1.5 ? '#F59E0B' : avg > 0 ? '#EF4444' : T.muted;
                  return (
                    <div key={skill.id} style={{ padding: '10px 12px', borderRadius: '10px', background: dark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.03)', border: `1px solid ${T.bdr}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: T.text }}>{skill.name}</div>
                        <div style={{ fontSize: '10px', color: T.muted }}>{skill.category}</div>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color }}>{avg > 0 ? avg.toFixed(1) : '—'}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700;800&display=swap');
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}
