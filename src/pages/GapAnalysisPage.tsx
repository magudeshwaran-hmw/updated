import { useMemo, useState } from 'react';
import { SKILLS } from '@/lib/mockData';
import { SkillCategory } from '@/lib/types';
import { AlertTriangle, TrendingUp, CheckCircle2, Target } from 'lucide-react';
import { useDark, mkTheme } from '@/lib/themeContext';
import { useAuth } from '@/lib/authContext';
import { getEmployee } from '@/lib/localDB';

const CATEGORIES: SkillCategory[] = ['Tool', 'Technology', 'Application', 'Domain', 'TestingType', 'DevOps', 'AI'];
const CAT_COLOR: Record<string, string> = {
  Tool: '#3B82F6', Technology: '#8B5CF6', Application: '#10B981',
  Domain: '#F59E0B', TestingType: '#EF4444', DevOps: '#06B6D4', AI: '#EC4899',
};

export default function GapAnalysisPage() {
  const { dark } = useDark();
  const T = mkTheme(dark);
  const { employeeId } = useAuth();
  const emp = employeeId && employeeId !== 'new' ? getEmployee(employeeId) : null;
  const ratings = emp?.skills ?? [];

  const [filterCat, setFilterCat] = useState<SkillCategory | 'All'>('All');

  const analysis = useMemo(() => {
    return SKILLS
      .filter(s => filterCat === 'All' || s.category === filterCat)
      .map(skill => {
        const r = ratings.find(r => r.skillId === skill.id);
        const current = r?.selfRating ?? 0;
        const target = skill.category === 'AI' ? 2 : 3;
        const gap = target - current;
        return { skill, current, target, gap };
      });
  }, [filterCat, ratings]);

  const stats = useMemo(() => ({
    critical: analysis.filter(a => a.gap >= 2).length,
    moderate: analysis.filter(a => a.gap === 1).length,
    met:      analysis.filter(a => a.gap <= 0).length,
  }), [analysis]);

  const summaryCards = [
    { label: 'Critical Gaps', value: stats.critical, icon: AlertTriangle, color: '#EF4444', bg: 'rgba(239,68,68,0.12)', bdr: 'rgba(239,68,68,0.3)' },
    { label: 'Moderate Gaps', value: stats.moderate, icon: TrendingUp,    color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', bdr: 'rgba(245,158,11,0.3)' },
    { label: 'Met / Exceeded', value: stats.met,     icon: CheckCircle2,  color: '#10B981', bg: 'rgba(16,185,129,0.12)', bdr: 'rgba(16,185,129,0.3)' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: "'Inter',sans-serif", transition: 'background 0.3s' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '36px 20px 60px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={18} color="#fff" />
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: T.text, fontFamily: "'Space Grotesk',sans-serif" }}>Gap Analysis</h1>
          </div>
          <p style={{ color: T.sub, fontSize: '14px' }}>Identifies skill gaps between your current proficiency and target levels</p>
        </div>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          {summaryCards.map(s => (
            <div key={s.label} style={{ padding: '22px', borderRadius: '16px', background: s.bg, border: `1px solid ${s.bdr}`, display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: 46, height: 46, borderRadius: '12px', background: `${s.color}20`, border: `1px solid ${s.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={22} color={s.color} />
              </div>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: s.color, fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '12px', color: T.sub, marginTop: '3px' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Category filter */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
          {(['All', ...CATEGORIES] as const).map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)} style={{
              padding: '7px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
              border: `1px solid ${filterCat === cat ? (CAT_COLOR[cat] || '#3B82F6') : T.bdr}`,
              background: filterCat === cat ? `${CAT_COLOR[cat] || '#3B82F6'}20` : T.card,
              color: filterCat === cat ? (CAT_COLOR[cat] || '#3B82F6') : T.sub,
              cursor: 'pointer', transition: 'all 0.2s',
            }}>{cat}</button>
          ))}
        </div>

        {/* Gap bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {analysis.map(({ skill, current, target, gap }) => {
            const color = gap >= 2 ? '#EF4444' : gap === 1 ? '#F59E0B' : '#10B981';
            const catColor = CAT_COLOR[skill.category] || '#3B82F6';
            const pct = Math.round((current / target) * 100);
            return (
              <div key={skill.id} style={{
                padding: '16px 20px', borderRadius: '13px',
                background: T.card, border: `1px solid ${T.bdr}`,
                backdropFilter: 'blur(8px)', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = catColor + '50'; e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.98)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.bdr; e.currentTarget.style.background = T.card; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '14px', color: T.text }}>{skill.name}</span>
                    <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: 600, background: `${catColor}15`, color: catColor, border: `1px solid ${catColor}30` }}>{skill.category}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '13px', color: T.muted }}>{current}/{target}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color, padding: '2px 8px', borderRadius: '6px', background: `${color}15` }}>
                      {gap > 0 ? `Gap: ${gap}` : '✓ Met'}
                    </span>
                  </div>
                </div>
                <div style={{ position: 'relative', height: 8, borderRadius: 999, background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, borderRadius: 999, background: color, transition: 'width 0.8s ease', boxShadow: `0 0 8px ${color}50` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700;800&display=swap');`}</style>
    </div>
  );
}
