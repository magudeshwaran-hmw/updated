import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/authContext';
import { useDark, mkTheme } from '@/lib/themeContext';
import { UserRole } from '@/lib/types';
import { Users, Shield, Brain, ArrowRight } from 'lucide-react';
import { getAllEmployees } from '@/lib/localDB';

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('emp1');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { dark } = useDark();
  const T = mkTheme(dark);
  const employees = getAllEmployees();

  const handleLogin = () => {
    if (!selectedRole) return;
    if (selectedRole === 'employee') {
      const emp = employees.find(e => e.id === selectedEmployee);
      login(selectedRole, selectedEmployee, emp?.name || 'Employee');
      navigate('/employee/resume');
    } else {
      login('admin', undefined, 'Admin User');
      navigate('/admin');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: dark
        ? 'radial-gradient(ellipse at 50% 30%, rgba(30,60,140,0.35) 0%, #050B18 60%)'
        : 'radial-gradient(ellipse at 50% 30%, rgba(59,130,246,0.12) 0%, #EEF4FF 60%)',
      padding: '24px', fontFamily: "'Inter', sans-serif",
      position: 'relative', overflow: 'hidden', transition: 'background 0.35s',
    }}>
      {/* Decorative blobs */}
      <div style={{ position: 'absolute', top: '20%', left: '10%', width: 360, height: 360, background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '15%', right: '8%', width: 280, height: 280, background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '38px' }}>
          <div style={{ width: 68, height: 68, borderRadius: '20px', margin: '0 auto 16px', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 44px rgba(59,130,246,0.45)' }}>
            <Brain size={34} color="#fff" />
          </div>
          <h1 style={{ fontSize: '30px', fontWeight: 800, color: T.text, fontFamily: "'Space Grotesk', sans-serif", marginBottom: '8px' }}>
            Welcome Back
          </h1>
          <p style={{ color: T.sub, fontSize: '15px' }}>Select your role to continue</p>
        </div>

        {/* Role cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '22px' }}>
          {([
            { role: 'employee' as UserRole, icon: Users,  title: 'Employee',        desc: 'Self-assess skills, upload resume, track growth', color: '#3B82F6' },
            { role: 'admin'    as UserRole, icon: Shield, title: 'Admin / Manager', desc: 'Validate ratings, view dashboards, manage team',    color: '#8B5CF6' },
          ]).map(item => {
            const sel = selectedRole === item.role;
            return (
              <button key={item.role} onClick={() => setSelectedRole(item.role)} style={{
                display: 'flex', alignItems: 'center', gap: '16px', padding: '20px',
                borderRadius: '16px',
                border: `2px solid ${sel ? item.color : T.bdr}`,
                background: sel ? `${item.color}18` : T.card,
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                boxShadow: sel ? `0 0 22px ${item.color}35` : 'none',
              }}>
                <div style={{ width: 52, height: 52, borderRadius: '14px', flexShrink: 0, background: sel ? `${item.color}28` : T.input, border: `1px solid ${sel ? item.color : T.bdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <item.icon size={24} color={sel ? item.color : T.muted} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '16px', color: T.text, marginBottom: '4px' }}>{item.title}</div>
                  <div style={{ fontSize: '13px', color: T.sub, lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Employee picker */}
        {selectedRole === 'employee' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', color: T.sub, fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              Select Employee Profile
            </label>
            <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: T.input, border: `1px solid ${T.inputBdr}`, color: T.text, fontSize: '14px', fontWeight: 500, cursor: 'pointer', outline: 'none' }}>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id} style={{ background: dark ? '#0A1628' : '#fff', color: dark ? '#fff' : '#0F172A' }}>
                  {emp.name} — {emp.designation}
                </option>
              ))}
              <option value="new" style={{ background: dark ? '#0A1628' : '#fff', color: dark ? '#fff' : '#0F172A' }}>+ New Employee</option>
            </select>
          </div>
        )}

        {/* Continue button */}
        <button onClick={handleLogin} disabled={!selectedRole} style={{
          width: '100%', padding: '16px', borderRadius: '14px',
          background: selectedRole ? 'linear-gradient(135deg, #3B82F6, #8B5CF6)' : T.card,
          border: `1px solid ${selectedRole ? 'transparent' : T.bdr}`,
          color: selectedRole ? '#fff' : T.muted,
          fontWeight: 700, fontSize: '16px',
          cursor: selectedRole ? 'pointer' : 'not-allowed',
          boxShadow: selectedRole ? '0 0 32px rgba(59,130,246,0.45)' : 'none',
          transition: 'all 0.3s',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
        }}
          onMouseEnter={e => { if (selectedRole) e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
        >
          Continue <ArrowRight size={18} />
        </button>
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700;800&display=swap');`}</style>
    </div>
  );
}
