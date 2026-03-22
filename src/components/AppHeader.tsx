import { useAuth } from '@/lib/authContext';
import { useDark, mkTheme } from '@/lib/themeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Menu, X, Brain, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { computeCompletion, getEmployee } from '@/lib/localDB';

export default function AppHeader() {
  const { isLoggedIn, role, name, employeeId, logout } = useAuth();
  const { dark, toggleDark } = useDark();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const T = mkTheme(dark);

  const emp = employeeId && employeeId !== 'new' ? getEmployee(employeeId) : null;
  const completion = emp ? computeCompletion(emp.skills) : 0;

  const isSubmitted = emp?.submitted === true;

  const navItems = role === 'admin'
    ? [
        { label: 'Dashboard',   path: '/admin' },
        { label: 'Employees',   path: '/admin/employees' },
      ]
    : [
        ...(isSubmitted ? [] : [{ label: 'My Skills',     path: '/employee/skills' }]),
        { label: 'AI Report',     path: '/employee/report' },
        { label: 'Gap Analysis',  path: '/employee/gap-analysis' },
        { label: 'Growth Plan',   path: '/employee/growth-plan' },
        { label: '🧠 AI Hub',     path: '/employee/ai-hub' },
      ];

  const isActive = (p: string) => location.pathname === p;

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: dark
        ? 'rgba(5,11,24,0.92)'
        : 'rgba(255,255,255,0.94)',
      backdropFilter: 'blur(24px)',
      borderBottom: dark
        ? '1px solid rgba(255,255,255,0.10)'
        : '1px solid rgba(59,130,246,0.22)',
      boxShadow: dark
        ? '0 2px 24px rgba(0,0,0,0.6)'
        : '0 2px 20px rgba(59,130,246,0.12)',
      transition: 'background 0.3s',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', height: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>


        {/* Logo */}
        <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 14px rgba(59,130,246,0.4)' }}>
            <Brain size={17} color="#fff" />
          </div>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: '17px', color: T.text }}>SkillMatrix</span>
        </div>

        {/* Desktop nav */}
        {isLoggedIn && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2px' }} className="sk-hide-mobile">
            {navItems.map(item => (
              <button key={item.path} onClick={() => navigate(item.path)} style={{
                padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                background: isActive(item.path) ? 'rgba(59,130,246,0.15)' : 'transparent',
                color: isActive(item.path) ? '#60A5FA' : (dark ? 'rgba(255,255,255,0.65)' : '#2D3748'),
              }}
                onMouseEnter={e => { if (!isActive(item.path)) e.currentTarget.style.color = dark ? '#fff' : '#1E3A8A'; }}
                onMouseLeave={e => { if (!isActive(item.path)) e.currentTarget.style.color = dark ? 'rgba(255,255,255,0.65)' : '#2D3748'; }}
              >{item.label}</button>
            ))}
          </nav>
        )}

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Completion badge — employee only */}
          {isLoggedIn && role === 'employee' && (
            <div onClick={() => navigate('/employee/skills')} className="sk-hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '5px 12px', borderRadius: '20px', background: T.card, border: `1px solid ${T.bdr}`, cursor: 'pointer' }}>
              <div style={{ width: 36, height: 5, borderRadius: 999, background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                <div style={{ height: '100%', width: `${completion}%`, borderRadius: 999, background: 'linear-gradient(90deg,#3B82F6,#10B981)', transition: 'width 0.5s' }} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: T.sub }}>{completion}%</span>
            </div>
          )}

          {/* User name */}
          {isLoggedIn && <span className="sk-hide-mobile" style={{ fontSize: '12px', color: T.muted, fontWeight: 500 }}>{name}</span>}

          {/* 🌙/☀️ Global Theme Toggle */}
          <button onClick={toggleDark} title={dark ? 'Switch to Light' : 'Switch to Dark'} style={{
            width: 36, height: 36, borderRadius: '50%',
            background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
            border: `1px solid ${T.bdr}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s',
          }}>
            {dark ? <Sun size={16} color="#FCD34D" /> : <Moon size={16} color="#3B82F6" />}
          </button>

          {/* Login button (when not logged in) */}
          {!isLoggedIn && (
            <button onClick={() => navigate('/start')} style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 18px', borderRadius: '9px',
              background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)',
              color: '#fff', fontWeight: 700, fontSize: '13px', border: 'none',
              cursor: 'pointer', boxShadow: '0 0 16px rgba(59,130,246,0.4)',
              transition: 'all 0.2s',
            }}>
              Login →
            </button>
          )}

          {/* Logout */}
          {isLoggedIn && (
            <button onClick={() => { logout(); navigate('/'); }} style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '7px 13px', borderRadius: '8px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#FCA5A5', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
            >
              <LogOut size={13} />
              <span className="sk-hide-mobile">Logout</span>
            </button>
          )}

          {/* Mobile menu */}
          {isLoggedIn && (
            <button className="sk-show-mobile" onClick={() => setMobileOpen(v => !v)} style={{ background: 'none', border: 'none', color: T.sub, cursor: 'pointer', padding: '4px' }}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>

      </div>

      {/* Mobile drawer */}
      {mobileOpen && isLoggedIn && (
        <div style={{ background: dark ? 'rgba(5,11,24,0.98)' : 'rgba(240,244,255,0.98)', borderTop: `1px solid ${T.bdr}`, padding: '10px 20px 16px' }}>
          {navItems.map(item => (
            <button key={item.path} onClick={() => { navigate(item.path); setMobileOpen(false); }} style={{
              display: 'block', width: '100%', textAlign: 'left', padding: '11px 14px', borderRadius: '10px', marginBottom: '4px',
              background: isActive(item.path) ? 'rgba(59,130,246,0.15)' : 'transparent',
              color: isActive(item.path) ? '#60A5FA' : T.sub, border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 500,
            }}>{item.label}</button>
          ))}
        </div>
      )}

      <style>{`
        @media(max-width:768px){.sk-hide-mobile{display:none!important}}
        @media(min-width:769px){.sk-show-mobile{display:none!important}}
      `}</style>
    </header>
  );
}
