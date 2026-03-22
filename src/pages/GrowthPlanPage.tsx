import { useState } from 'react';
import { SKILLS } from '@/lib/mockData';
import { GrowthPlan } from '@/lib/types';
import { Target, Clock, CheckCircle2, ArrowRight, TrendingUp } from 'lucide-react';
import { useDark, mkTheme } from '@/lib/themeContext';
import { useAuth } from '@/lib/authContext';
import { getGrowthPlans } from '@/lib/localDB';

type FilterType = 'all' | 'in-progress' | 'not-started' | 'completed';

const STATUS_COLOR: Record<string, string> = {
  'in-progress': '#3B82F6',
  'not-started': '#6B7280',
  'completed':   '#10B981',
};

export default function GrowthPlanPage() {
  const { dark } = useDark();
  const T = mkTheme(dark);
  const { employeeId } = useAuth();

  const [filter, setFilter] = useState<FilterType>('all');
  const allPlans = getGrowthPlans(employeeId || 'emp1');
  const plans = allPlans.filter(p => filter === 'all' || p.status === filter);

  const getSkillName = (id: string) => SKILLS.find(s => s.id === id)?.name || id;
  const getSkillCat  = (id: string) => SKILLS.find(s => s.id === id)?.category || '';

  const counts = {
    all:          allPlans.length,
    'in-progress':allPlans.filter(p => p.status === 'in-progress').length,
    'not-started':allPlans.filter(p => p.status === 'not-started').length,
    completed:    allPlans.filter(p => p.status === 'completed').length,
  } as const;

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: "'Inter',sans-serif", transition: 'background 0.3s' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '36px 20px 60px' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg,#8B5CF6,#EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} color="#fff" />
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: T.text, fontFamily: "'Space Grotesk',sans-serif" }}>Growth Plan</h1>
          </div>
          <p style={{ color: T.sub, fontSize: '14px' }}>Track your skill development milestones and progress</p>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {(['all', 'in-progress', 'not-started', 'completed'] as FilterType[]).map(f => {
            const isActive = filter === f;
            const color = f === 'all' ? '#3B82F6' : STATUS_COLOR[f];
            return (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                border: `1px solid ${isActive ? color : T.bdr}`,
                background: isActive ? `${color}20` : T.card,
                color: isActive ? color : T.sub,
                cursor: 'pointer', transition: 'all 0.2s',
              }}>
                {f === 'all' ? 'All Plans' : f.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                <span style={{ marginLeft: '6px', padding: '1px 6px', borderRadius: '10px', background: isActive ? `${color}30` : 'rgba(255,255,255,0.06)', fontSize: '11px', color: isActive ? color : T.muted }}>
                  {counts[f]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Plans */}
        {plans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: T.muted }}>
            <Target size={48} style={{ margin: '0 auto 16px' }} />
            <div style={{ fontSize: '16px', fontWeight: 600 }}>No growth plans yet</div>
            <div style={{ fontSize: '13px', marginTop: '6px' }}>Complete your skill matrix to generate growth plans</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {plans.map(plan => {
              const color  = STATUS_COLOR[plan.status] || '#6B7280';
              const skillName = getSkillName(plan.skillId);
              const cat    = getSkillCat(plan.skillId);
              const doneActions = Math.ceil(plan.actions.length * plan.progress / 100);

              return (
                <div key={plan.id} style={{
                  padding: '24px', borderRadius: '16px',
                  background: T.card, border: `1px solid ${T.bdr}`,
                  backdropFilter: 'blur(10px)', transition: 'all 0.25s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = color + '50'; e.currentTarget.style.boxShadow = `0 8px 24px ${color}12`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.bdr; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  {/* Top row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: T.text, fontFamily: "'Space Grotesk',sans-serif" }}>{skillName}</h3>
                        {cat && <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '999px', background: 'rgba(59,130,246,0.12)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.25)' }}>{cat}</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: `${color}18`, color, border: `1px solid ${color}35` }}>
                          {plan.status.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: T.muted }}>
                          <Clock size={12} /> {plan.targetDate}
                        </span>
                      </div>
                    </div>
                    {/* Level badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ padding: '6px 12px', borderRadius: '8px', background: T.card, border: `1px solid ${T.bdr}`, fontWeight: 700, fontSize: '13px', color: T.sub }}>L{plan.currentLevel}</div>
                      <ArrowRight size={14} color={T.muted} />
                      <div style={{ padding: '6px 12px', borderRadius: '8px', background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)', fontWeight: 700, fontSize: '13px', color: '#fff' }}>L{plan.targetLevel}</div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', color: T.muted }}>Progress</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color }}>  {plan.progress}%</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 999, background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)' }}>
                      <div style={{ height: '100%', width: `${plan.progress}%`, borderRadius: 999, background: `linear-gradient(90deg,${color},${color}cc)`, boxShadow: `0 0 8px ${color}50`, transition: 'width 0.8s ease' }} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: T.muted, marginBottom: '8px', letterSpacing: '0.05em' }}>ACTION ITEMS</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {plan.actions.map((action, i) => {
                        const done = i < doneActions;
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                            <CheckCircle2 size={14} color={done ? '#10B981' : T.muted} style={{ flexShrink: 0, marginTop: 2 }} />
                            <span style={{ fontSize: '13px', color: done ? T.muted : T.text, textDecoration: done ? 'line-through' : 'none', lineHeight: 1.5 }}>{action}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700;800&display=swap');`}</style>
    </div>
  );
}
