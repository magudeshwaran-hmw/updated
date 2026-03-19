import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_EMPLOYEES, SKILLS, MOCK_GROWTH_PLANS } from '@/lib/mockData';
import { PROFICIENCY_DESCRIPTIONS, ProficiencyLevel } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const emp = MOCK_EMPLOYEES.find(e => e.id === id);

  if (!emp) return <div className="container py-20 text-center text-muted-foreground">Employee not found</div>;

  const ratedSkills = emp.skills.filter(s => s.selfRating > 0);
  const growthPlans = MOCK_GROWTH_PLANS.filter(g => g.employeeId === emp.id);
  const getSkill = (skillId: string) => SKILLS.find(s => s.id === skillId);

  // Group skills by category
  const grouped: Record<string, typeof ratedSkills> = {};
  ratedSkills.forEach(sr => {
    const skill = getSkill(sr.skillId);
    if (skill) {
      if (!grouped[skill.category]) grouped[skill.category] = [];
      grouped[skill.category].push(sr);
    }
  });

  return (
    <div className="container py-8 animate-fade-in">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft size={16} /> Back
      </Button>

      {/* Header */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6 flex flex-col md:flex-row md:items-center gap-6">
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center flex-shrink-0">
          <span className="text-primary-foreground font-display font-bold text-2xl">{emp.name.split(' ').map(n => n[0]).join('')}</span>
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-display font-bold">{emp.name}</h1>
          <div className="text-muted-foreground">{emp.designation} · {emp.department}</div>
          <div className="flex flex-wrap gap-3 mt-3 text-sm">
            <span className="px-3 py-1 rounded-lg bg-accent text-accent-foreground font-medium">{emp.primarySkill}</span>
            <span className="px-3 py-1 rounded-lg bg-accent text-accent-foreground font-medium">{emp.primaryDomain}</span>
            <span className="px-3 py-1 rounded-lg bg-muted text-muted-foreground">{emp.yearsIT}y IT · {emp.yearsZensar}y Zensar</span>
          </div>
        </div>
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="hsl(var(--primary))" strokeWidth="3"
                strokeDasharray={`${emp.overallCapability} ${100 - emp.overallCapability}`} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-display font-bold text-lg">{emp.overallCapability}%</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">Capability Score</div>
        </div>
        <Button variant="outline" size="sm" onClick={() => toast.success('Export ready (mock)')}>
          <Download size={14} /> Export
        </Button>
      </div>

      {/* Skills by category */}
      <h2 className="text-xl font-display font-bold mb-4">Skills Assessment</h2>
      <div className="grid gap-4 mb-8">
        {Object.entries(grouped).map(([cat, skills]) => (
          <div key={cat} className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs gradient-primary text-primary-foreground">{cat}</span>
              {skills.length} skills
            </h3>
            <div className="grid gap-2">
              {skills.map(sr => {
                const skill = getSkill(sr.skillId)!;
                return (
                  <div key={sr.skillId} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                    <span className="flex-1 text-sm font-medium">{skill.name}</span>
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Self: </span>
                        <span className="font-semibold">L{sr.selfRating}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Mgr: </span>
                        <span className="font-semibold">{sr.managerRating !== null ? `L${sr.managerRating}` : '—'}</span>
                      </div>
                      {sr.validated ? (
                        <CheckCircle size={16} className="text-success" />
                      ) : (
                        <Clock size={16} className="text-warning" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Growth plans */}
      {growthPlans.length > 0 && (
        <>
          <h2 className="text-xl font-display font-bold mb-4">Growth Plans</h2>
          <div className="space-y-3">
            {growthPlans.map(plan => (
              <div key={plan.id} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{getSkill(plan.skillId)?.name}</span>
                  <span className="text-sm text-muted-foreground">L{plan.currentLevel} → L{plan.targetLevel}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full gradient-primary" style={{ width: `${plan.progress}%` }} />
                </div>
                <div className="text-xs text-muted-foreground mt-1">{plan.progress}% · {plan.status} · Due: {plan.targetDate}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
