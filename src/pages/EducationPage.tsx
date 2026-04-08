import { API_BASE } from '@/lib/api';
/**
 * EducationPage.tsx
 * Professional Academic Portfolio for Employees.
 */
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { useDark, mkTheme } from '@/lib/themeContext';
import { GraduationCap, MapPin, Calendar, Plus, Trash2, Edit2, Layout, BookOpen, Clock } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { toast } from '@/lib/ToastContext';

export default function EducationPage({ 
  isPopup: propIsPopup, 
  onTabChange: propOnTabChange 
}: { 
  isPopup?: boolean; 
  onTabChange?: (path: string) => void; 
}) {
  const { employeeId } = useAuth();
  const { dark } = useDark();
  const T = mkTheme(dark);
  const { data, isPopup: ctxIsPopup, isLoading, setGlobalLoading } = useApp();
  const isPopup = propIsPopup !== undefined ? propIsPopup : ctxIsPopup;
  const activeEmpId = isPopup ? (data?.user?.id || data?.user?.zensar_id || data?.user?.ZensarID || employeeId) : employeeId;

  const [eduList, setEduList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  const [formData, setFormData] = useState({
    degree: '',
    institution: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    description: ''
  });

  useEffect(() => {
    loadEducation();
  }, [activeEmpId]);

  const loadEducation = async () => {
    if (!activeEmpId) return;
    try {
      const res = await fetch(`${API_BASE}/education/${activeEmpId}`);
      const data = await res.json();
      setEduList(data.education || []);
    } catch (err) {
      toast.error('Network Error: Failed to sync academic records');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.degree || !formData.institution) {
      toast.error('Verification Error: Degree and Institution are mandatory');
      return;
    }

    try {
      // Fix date format: YYYY-MM -> YYYY-MM-DD for PostgreSQL
      const fixDate = (d: string) => d && d.length === 7 ? `${d}-01` : d;
      
      const res = await fetch(`${API_BASE}/education`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData, 
          startDate: fixDate(formData.startDate),
          endDate: fixDate(formData.endDate),
          employeeId: activeEmpId 
        })
      });

      if (res.ok) {
        toast.success('Academic Portfolio Updated');
        setIsAdding(false);
        setFormData({ degree: '', institution: '', fieldOfStudy: '', startDate: '', endDate: '', description: '' });
        loadEducation();
      }
    } catch (err) {
      toast.error('Sync Error: Failed to persist record');
    }
  };

  const handleDelete = async (id: any) => {
    if (!id) {
      toast.error('Error: Education ID is missing');
      return;
    }
    if (!window.confirm('Are you sure you want to remove this academic credential?')) return;
    try {
      const res = await fetch(`${API_BASE}/education/${id}`, { method: 'DELETE' });
      if (res.ok || res.status === 204) {
        toast.success('Credential Removed');
        loadEducation();
      } else {
        const errorText = await res.text().catch(() => 'Unknown error');
        toast.error(`Delete failed: ${res.status} ${errorText}`);
      }
    } catch (err: any) {
      toast.error('Delete Error: ' + (err.message || 'Network error'));
    }
  };

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.text }}>
       <Clock className="animate-spin" size={32} />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, padding: '40px 20px 100px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 12 }}>
              <GraduationCap size={40} color="#3B82F6" /> Academic <span style={{ color: '#3B82F6' }}>Heritage</span>
            </h1>
            <p style={{ margin: '8px 0 0', color: T.sub, fontSize: 14 }}>Manage your professional qualifications and academic journey.</p>
          </div>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, background: isAdding ? T.card : '#3B82F6', border: isAdding ? `1px solid ${T.bdr}` : 'none', color: isAdding ? T.text : '#fff', fontWeight: 700, cursor: 'pointer', transition: '0.2s' }}
          >
            {isAdding ? 'Cancel' : <><Plus size={18} /> Add Credential</>}
          </button>
        </div>

        {isAdding && (
          <div style={{ background: T.card, borderRadius: 24, padding: 32, border: `1px solid ${T.bdr}`, marginBottom: 32, animation: 'slideDown 0.3s' }}>
            <h3 style={{ margin: '0 0 24px', fontSize: 18, fontWeight: 800 }}>Record New Entry</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: T.muted, textTransform: 'uppercase', marginBottom: 8 }}>Degree / Certification Name</label>
                <input 
                  value={formData.degree} onChange={e => setFormData({...formData, degree: e.target.value})}
                  placeholder="e.g. Master of Computer Applications"
                  style={{ width: '100%', padding: '14px', borderRadius: 12, background: T.input, border: `1px solid ${T.inputBdr}`, color: T.text, outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: T.muted, textTransform: 'uppercase', marginBottom: 8 }}>Institution</label>
                <input 
                  value={formData.institution} onChange={e => setFormData({...formData, institution: e.target.value})}
                  placeholder="e.g. Stanford University"
                  style={{ width: '100%', padding: '14px', borderRadius: 12, background: T.input, border: `1px solid ${T.inputBdr}`, color: T.text, outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: T.muted, textTransform: 'uppercase', marginBottom: 8 }}>Field of Study</label>
                <input 
                  value={formData.fieldOfStudy} onChange={e => setFormData({...formData, fieldOfStudy: e.target.value})}
                  placeholder="e.g. Software Engineering"
                  style={{ width: '100%', padding: '14px', borderRadius: 12, background: T.input, border: `1px solid ${T.inputBdr}`, color: T.text, outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: T.muted, textTransform: 'uppercase', marginBottom: 8 }}>Graduation Year / Date</label>
                <input 
                  value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})}
                  placeholder="e.g. May 2024"
                  style={{ width: '100%', padding: '14px', borderRadius: 12, background: T.input, border: `1px solid ${T.inputBdr}`, color: T.text, outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button 
                  onClick={handleSave}
                  style={{ width: '100%', padding: '14px', borderRadius: 12, background: '#3B82F6', color: '#fff', border: 'none', fontWeight: 800, fontSize: 15, cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(59,130,246,0.3)' }}
                >
                  Verify & Persist Record
                </button>
              </div>
            </div>
          </div>
        )}

        {eduList.length === 0 && !isAdding && (
          <div style={{ textAlign: 'center', padding: '80px 40px', background: T.card, borderRadius: 32, border: `3px dashed ${T.bdr}` }}>
             <Layout size={64} color={T.muted} style={{ margin: '0 auto 24px' }} />
             <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>Academic Vault Empty</h2>
             <p style={{ color: T.sub, maxWidth: 400, margin: '0 auto' }}>Sync your educational background to complete your professional digital twin profiling.</p>
          </div>
        )}

        <div style={{ display: 'grid', gap: 20 }}>
          {eduList.map((edu, idx) => (
            <div key={edu.id || idx} style={{ background: T.card, borderRadius: 28, padding: 32, border: `1px solid ${T.bdr}`, display: 'flex', gap: 24, position: 'relative', overflow: 'hidden', animation: 'fadeInUp 0.4s ease-out' }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <BookOpen size={32} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>{edu.degree}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 6, fontSize: 14, color: '#3B82F6', fontWeight: 700 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={14} /> {edu.institution}</span>
                      <span style={{ height: 4, width: 4, borderRadius: '50%', background: T.muted }} />
                      {(() => {
                        const fmt = (d: string) => {
                          if (!d) return '';
                          if (d.includes('T')) return d.slice(0, 7); // ISO: 2026-03-31T18:30:00.000Z -> 2026-03
                          if (d.length === 10) return d.slice(0, 7); // YYYY-MM-DD -> YYYY-MM
                          return d;
                        };
                        return (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Calendar size={14} /> {fmt(edu.endDate)}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(edu.id)}
                    style={{ 
                      padding: 10, 
                      borderRadius: 12, 
                      background: 'rgba(239,68,68,0.1)', 
                      border: 'none', 
                      color: '#EF4444', 
                      cursor: 'pointer',
                      zIndex: 10,
                      position: 'relative',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(239,68,68,0.2)';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div style={{ marginTop: 16, padding: '16px', background: dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', borderRadius: 16, fontSize: 13, lineHeight: 1.6, color: T.sub }}>
                   Specialization in <span style={{ color: T.text, fontWeight: 800 }}>{edu.fieldOfStudy}</span>. 
                   Verified through Zensar Academic Verification protocols.
                </div>
              </div>
              <div style={{ position: 'absolute', right: -20, top: -20, width: 100, height: 100, background: 'rgba(59,130,246,0.03)', borderRadius: '50%' }} />
            </div>
          ))}
        </div>
      </div>
      
      <style>{`
        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
