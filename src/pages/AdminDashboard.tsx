import { useMemo, useState } from 'react';
import { MOCK_EMPLOYEES, SKILLS } from '@/lib/mockData';
import { useNavigate } from 'react-router-dom';
import { Users, TrendingUp, AlertTriangle, Award, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [deptFilter, setDeptFilter] = useState('All');
  const employees = MOCK_EMPLOYEES;

  const stats = useMemo(() => {
    const avgCapability = Math.round(employees.reduce((s, e) => s + e.overallCapability, 0) / employees.length);
    const skillCoverage = new Set(employees.flatMap(e => e.skills.filter(s => s.selfRating > 0).map(s => s.skillId))).size;
    const gapCount = employees.reduce((s, e) => s + e.skills.filter(sk => sk.selfRating > 0 && sk.selfRating < 2).length, 0);
    return { avgCapability, skillCoverage, gapCount, total: employees.length };
  }, [employees]);

  // Pure CSS chart data
  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    employees.forEach(e => {
      e.skills.filter(s => s.selfRating > 0).forEach(sr => {
        const skill = SKILLS.find(s => s.id === sr.skillId);
        if (skill) cats[skill.category] = (cats[skill.category] || 0) + 1;
      });
    });
    const max = Math.max(...Object.values(cats), 1);
    return Object.entries(cats).map(([name, count]) => ({ name, count, pct: (count / max) * 100 }));
  }, [employees]);

  const levelDist = useMemo(() => {
    const levels = [0, 0, 0, 0];
    employees.forEach(e => e.skills.forEach(s => { if (s.selfRating > 0) levels[s.selfRating]++; }));
    const total = levels.reduce((a, b) => a + b, 0) || 1;
    return levels.map((count, i) => ({ level: i, count, pct: (count / total) * 100 }));
  }, [employees]);

  const capabilityRanking = useMemo(() =>
    [...employees].sort((a, b) => b.overallCapability - a.overallCapability), [employees]);

  const handleExport = (type: string) => toast.success(`${type} export ready (mock). In production, this downloads a file.`);

  return (
    <div className="container py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Team capability overview & analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('PDF')}><Download size={14} /> PDF</Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('CSV')}><Download size={14} /> CSV</Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('Excel')}><Download size={14} /> Excel</Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Team Size', value: stats.total, icon: Users, gradient: 'gradient-primary' },
          { label: 'Avg Capability', value: `${stats.avgCapability}%`, icon: TrendingUp, gradient: 'gradient-secondary' },
          { label: 'Skills Covered', value: `${stats.skillCoverage}/32`, icon: Award, gradient: 'gradient-primary' },
          { label: 'Skill Gaps', value: stats.gapCount, icon: AlertTriangle, gradient: 'gradient-secondary' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${s.gradient} flex items-center justify-center`}>
                <s.icon size={20} className="text-primary-foreground" />
              </div>
            </div>
            <div className="text-2xl font-display font-bold">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Chart 1: Category distribution */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-display font-semibold mb-4">Skills by Category</h3>
          <div className="space-y-3">
            {categoryData.map((d, i) => (
              <div key={d.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{d.name}</span>
                  <span className="font-semibold">{d.count}</span>
                </div>
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${d.pct}%`,
                      background: `hsl(var(--chart-${(i % 5) + 1}))`,
                      animationDelay: `${i * 100}ms`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Level distribution donut (pure CSS) */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-display font-semibold mb-4">Proficiency Distribution</h3>
          <div className="flex items-center gap-6">
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                {levelDist.filter(d => d.pct > 0).reduce((acc, d, i) => {
                  const offset = acc.length > 0 ? acc[acc.length - 1].end : 0;
                  const dash = (d.pct / 100) * 100;
                  const colors = ['hsl(var(--muted-foreground))', 'hsl(var(--warning))', 'hsl(var(--chart-1))', 'hsl(var(--success))'];
                  acc.push({
                    end: offset + dash,
                    el: (
                      <circle
                        key={i}
                        cx="18" cy="18" r="15.915"
                        fill="none"
                        stroke={colors[d.level]}
                        strokeWidth="3.5"
                        strokeDasharray={`${dash} ${100 - dash}`}
                        strokeDashoffset={-offset}
                      />
                    ),
                  });
                  return acc;
                }, [] as { end: number; el: React.ReactNode }[]).map(a => a.el)}
              </svg>
            </div>
            <div className="space-y-2">
              {levelDist.filter(d => d.count > 0).map(d => (
                <div key={d.level} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{
                    background: ['hsl(var(--muted-foreground))', 'hsl(var(--warning))', 'hsl(var(--chart-1))', 'hsl(var(--success))'][d.level]
                  }} />
                  <span>Level {d.level}: {d.count} ({Math.round(d.pct)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 3: Team capability ranking */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-display font-semibold mb-4">Capability Ranking</h3>
          <div className="space-y-3">
            {capabilityRanking.map((emp, i) => (
              <div key={emp.id} className="flex items-center gap-3 cursor-pointer hover:bg-accent/50 rounded-lg p-2 -mx-2 transition-colors" onClick={() => navigate(`/admin/employee/${emp.id}`)}>
                <span className="w-6 h-6 rounded-full gradient-primary text-primary-foreground text-xs flex items-center justify-center font-bold">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{emp.name}</div>
                  <div className="text-xs text-muted-foreground">{emp.designation}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">{emp.overallCapability}%</div>
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full gradient-primary" style={{ width: `${emp.overallCapability}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 4: Domain coverage */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-display font-semibold mb-4">Domain Coverage</h3>
          <div className="grid grid-cols-2 gap-3">
            {['Banking', 'Healthcare', 'E-Commerce', 'Insurance', 'Telecom'].map((domain, i) => {
              const count = employees.filter(e => e.primaryDomain === domain).length;
              return (
                <div key={domain} className="bg-muted/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-display font-bold" style={{ color: `hsl(var(--chart-${(i % 5) + 1}))` }}>{count}</div>
                  <div className="text-xs text-muted-foreground mt-1">{domain}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 5: Validation status */}
        <div className="bg-card border border-border rounded-xl p-6 lg:col-span-2">
          <h3 className="font-display font-semibold mb-4">Validation Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {employees.slice(0, 3).map(emp => {
              const total = emp.skills.filter(s => s.selfRating > 0).length;
              const validated = emp.skills.filter(s => s.validated).length;
              const pct = total > 0 ? Math.round((validated / total) * 100) : 0;
              return (
                <div key={emp.id} className="bg-muted/30 rounded-lg p-4">
                  <div className="font-medium text-sm mb-2">{emp.name}</div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-success" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-medium">{pct}%</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{validated}/{total} skills validated</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
