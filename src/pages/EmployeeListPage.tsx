import { useState, useMemo } from 'react';
import { MOCK_EMPLOYEES } from '@/lib/mockData';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function EmployeeListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('All');
  const [domainFilter, setDomainFilter] = useState('All');

  const filtered = useMemo(() => {
    return MOCK_EMPLOYEES.filter(e => {
      if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.email.toLowerCase().includes(search.toLowerCase())) return false;
      if (skillFilter !== 'All' && e.primarySkill !== skillFilter) return false;
      if (domainFilter !== 'All' && e.primaryDomain !== domainFilter) return false;
      return true;
    });
  }, [search, skillFilter, domainFilter]);

  const primarySkills = [...new Set(MOCK_EMPLOYEES.map(e => e.primarySkill))];
  const domains = [...new Set(MOCK_EMPLOYEES.map(e => e.primaryDomain))];

  return (
    <div className="container py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Employees</h1>
          <p className="text-muted-foreground mt-1">{MOCK_EMPLOYEES.length} team members</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success('Export ready (mock)')}><Download size={14} /> Export</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select value={skillFilter} onChange={e => setSkillFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-input bg-card text-sm">
          <option value="All">All Skills</option>
          {primarySkills.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={domainFilter} onChange={e => setDomainFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-input bg-card text-sm">
          <option value="All">All Domains</option>
          {domains.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Employee cards */}
      <div className="grid gap-4">
        {filtered.map(emp => (
          <div key={emp.id} className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-elevated transition-shadow animate-scale-in">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-display font-bold">{emp.name.split(' ').map(n => n[0]).join('')}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold">{emp.name}</div>
              <div className="text-sm text-muted-foreground">{emp.designation} · {emp.department}</div>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-2 py-0.5 rounded text-xs bg-accent text-accent-foreground">{emp.primarySkill}</span>
                <span className="px-2 py-0.5 rounded text-xs bg-accent text-accent-foreground">{emp.primaryDomain}</span>
                <span className="px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">{emp.yearsIT}y IT · {emp.yearsZensar}y Zensar</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-lg font-display font-bold">{emp.overallCapability}%</div>
                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full gradient-primary" style={{ width: `${emp.overallCapability}%` }} />
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/employee/${emp.id}`)}>
                <Eye size={18} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
