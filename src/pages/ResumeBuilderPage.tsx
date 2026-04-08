import { useApp } from '@/lib/AppContext';
import { useDark, mkTheme } from '@/lib/themeContext';
import { FileText, Download, Printer, RefreshCw, ChevronLeft, Award, Briefcase, GraduationCap, User, BarChart3, Mail, MapPin, Globe, CheckCircle2, Circle, Sparkles, Settings2, Trash2, Edit3, Plus, Search, Zap, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { toast } from '@/lib/ToastContext';
import { AppData, Project, Certification, EducationEntry } from '@/lib/appStore';
import { API_BASE } from '@/lib/api';

export default function ResumeBuilderPage({ 
  isPopup: propIsPopup, 
  onTabChange: propOnTabChange,
  overrideData,
  onClose
}: { 
  isPopup?: boolean; 
  onTabChange?: (path: string) => void; 
  overrideData?: AppData;
  onClose?: () => void;
}) {
  const { data: ctxData, isPopup: ctxIsPopup, onTabChange: ctxOnTabChange } = useApp();
  
  const rawData = overrideData || ctxData;
  const isPopup = propIsPopup !== undefined ? propIsPopup : ctxIsPopup;
  const onTabChange = propOnTabChange || ctxOnTabChange || (() => {});
  
  const { dark } = useDark();
  const T = mkTheme(dark);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [fullGenLoading, setFullGenLoading] = useState(false);

  // --- Editable States ---
  const [editableUser, setEditableUser] = useState<any>({});
  const [summary, setSummary] = useState("");
  const [visibleSkills, setVisibleSkills] = useState<Record<string, boolean>>({});
  const [visibleProjects, setVisibleProjects] = useState<Record<string, boolean>>({});
  const [visibleCerts, setVisibleCerts] = useState<Record<string, boolean>>({});
  const [visibleEdu, setVisibleEdu] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (rawData?.user) {
      const u = rawData.user;
      setEditableUser({
        Name: u.name || u.Name || "",
        Designation: u.designation || u.Designation || "",
        Email: u.email || u.Email || "",
        Location: u.location || u.Location || "Zensar Office",
        Phone: u.phone || u.Phone || "",
        YearsIT: u.years_it || u.YearsIT || 0,
        YearsZensar: u.years_zensar || u.YearsZensar || 0,
        PrimarySkill: u.primary_skill || u.PrimarySkill || "",
        ZensarID: u.zensar_id || u.ZensarID || u.id || ""
      });
      
      const skillsArray = Object.keys(rawData.ratings || {});
      const sMap: Record<string, boolean> = {};
      skillsArray.forEach(s => sMap[s] = (rawData.ratings[s] > 0));
      setVisibleSkills(sMap);

      const pMap: Record<string, boolean> = {};
      (rawData.projects || []).forEach(p => pMap[p.ID] = true);
      setVisibleProjects(pMap);

      const cMap: Record<string, boolean> = {};
      (rawData.certifications || []).forEach(c => cMap[c.ID] = true);
      setVisibleCerts(cMap);

      const eMap: Record<string, boolean> = {};
      (rawData.education || []).forEach(e => eMap[e.ID] = true);
      setVisibleEdu(eMap);

      const expertSkills = Object.keys(rawData.ratings || {}).filter(s => rawData.ratings[s] === 3).slice(0, 4);
      setSummary(`Results-driven ${u.designation || u.Designation || 'technology professional'} at Zensar Technologies with ${u.years_it || u.YearsIT || '5'}+ years of IT experience, including ${u.years_zensar || u.YearsZensar || '3'}+ years at Zensar. Proven track record of delivering high-quality software solutions across enterprise environments. Core expertise in ${expertSkills.join(', ') || 'software engineering'}. Adept at collaborating with cross-functional teams, driving continuous improvement, and ensuring on-time project delivery in agile environments.`);
    }
  }, [rawData]);

  const handlePrint = () => {
    setLoading(true);
    document.body.classList.add('is-printing-resume');
    setTimeout(() => {
      window.print();
      document.body.classList.remove('is-printing-resume');
      setLoading(false);
      toast.success('Professional Resume Exported');
    }, 800);
  };

  const handleDownloadWord = () => {
    setLoading(true);
    try {
      const content = document.getElementById('zensar-resume')?.innerHTML;
      if (!content) return;

      const header = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>Zensar Resume</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.5; color: #333; }
          .section-header { border-bottom: 2px solid #3B82F6; color: #000; font-weight: bold; text-transform: uppercase; margin-bottom: 10px; margin-top: 20px; font-size: 14pt; }
          .name { font-size: 24pt; font-weight: bold; color: #111; margin: 0; }
          .designation { font-size: 14pt; color: #3B82F6; font-weight: bold; margin-bottom: 5px; }
          .contact { font-size: 10pt; color: #555; margin-bottom: 20px; }
          .proj-title { font-weight: bold; font-size: 12pt; }
          .role-info { color: #3B82F6; font-weight: bold; font-size: 10pt; }
          table { width: 100%; border-collapse: collapse; }
          td { vertical-align: top; }
        </style>
        </head><body>
      `;
      const footer = "</body></html>";
      
      const source = header + content + footer;
      const blob = new Blob(['\ufeff', source], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${editableUser.Name.replace(/\s+/g, '_')}_Zensar_Resume.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Word Document Generated');
    } catch (e) { 
      console.error(e);
      toast.error('Failed to generate Word doc'); 
    } finally {
      setLoading(false);
    }
  };

  const handleAIRefine = async () => {
    setAiLoading(true);
    try {
      const skills = Object.keys(visibleSkills).filter(k => visibleSkills[k]).join(", ");
      const prompt = `Rewrite this professional summary for a Zensar employee to sound more advanced and leadership-oriented. Keep it concise (3-4 sentences). Current: "${summary}". Skills: ${skills}`;
      
      const res = await fetch(`${API_BASE}/llm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (data.text) setSummary(data.text);
      toast.success("AI Refinement Complete");
    } catch (e) {
      toast.error("AI Service offline");
    } finally {
      setAiLoading(false);
    }
  };

  // ✅ FULL PROFESSIONAL RESUME GENERATOR
  const handleFullGenerate = async () => {
    setFullGenLoading(true);
    toast.info?.('Generating advanced professional resume...');
    try {
      const activeSkills = Object.keys(visibleSkills).filter(k => visibleSkills[k]);
      const expertSkills = activeSkills.filter(s => rawData?.ratings?.[s] === 3);
      const midSkills = activeSkills.filter(s => rawData?.ratings?.[s] === 2);
      const activeProjects = (rawData?.projects || []).filter(p => visibleProjects[p.ID]);
      const activeCerts = (rawData?.certifications || []).filter(c => visibleCerts[c.ID]);

      const projectSummary = activeProjects.slice(0, 3).map(p => 
        `${p.ProjectName} (${p.Role || 'Contributor'}): ${p.Description?.slice(0, 100) || ''}`
      ).join('; ');

      const prompt = `You are writing a premium professional resume summary for a Zensar Technologies employee.

Profile:
- Name: ${editableUser.Name}
- Role: ${editableUser.Designation}
- IT Experience: ${editableUser.YearsIT || 5} years (Zensar: ${editableUser.YearsZensar || 3} years)
- Expert Skills: ${expertSkills.slice(0, 5).join(', ') || 'Software Engineering'}
- Intermediate Skills: ${midSkills.slice(0, 4).join(', ')}
- Certifications: ${activeCerts.map(c => c.CertName).join(', ') || 'None'}
- Projects: ${projectSummary}

Write a 4-5 sentence executive-level professional summary. Be specific, use strong action verbs, mention measurable impact, highlight leadership and collaboration. Sound senior and highly skilled. Return ONLY the summary paragraph, no labels.`;

      const res = await fetch(`${API_BASE}/llm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (data.text && data.text.length > 50) {
        setSummary(data.text.trim());
        toast.success('✅ Advanced AI resume generated!');
      } else {
        // Fallback: generate a rich summary locally
        const fallback = `Highly accomplished ${editableUser.Designation || 'Technology Professional'} at Zensar Technologies with ${editableUser.YearsIT || 5}+ years of comprehensive IT experience, including ${editableUser.YearsZensar || 3}+ years of dedicated service at Zensar driving enterprise-grade solutions. Demonstrates deep technical mastery across ${expertSkills.slice(0, 3).join(', ') || activeSkills.slice(0, 3).join(', ')}, consistently delivering results that exceed stakeholder expectations and align with organizational objectives. Successfully led and contributed to ${activeProjects.length} strategic projects${activeCerts.length > 0 ? `, holding ${activeCerts.length} industry-recognized certification${activeCerts.length > 1 ? 's' : ''} including ${activeCerts[0]?.CertName}` : ''}, with a demonstrated ability to bridge technical execution with business strategy. Recognized for fostering cross-functional collaboration, mentoring peers, and implementing best practices in agile software development, quality assurance, and continuous delivery pipelines.`;
        setSummary(fallback);
        toast.success('✅ Professional resume generated!');
      }
    } catch (e) {
      // Fallback to local generation
      const activeSkills = Object.keys(visibleSkills).filter(k => visibleSkills[k]);
      const expertSkills = activeSkills.filter(s => rawData?.ratings?.[s] === 3);
      const activeProjects = (rawData?.projects || []).filter(p => visibleProjects[p.ID]);
      const activeCerts = (rawData?.certifications || []).filter(c => visibleCerts[c.ID]);
      const fallback = `Highly accomplished ${editableUser.Designation || 'Technology Professional'} at Zensar Technologies with ${editableUser.YearsIT || 5}+ years of comprehensive IT experience across enterprise environments. Demonstrates deep expertise in ${expertSkills.slice(0, 3).join(', ') || activeSkills.slice(0, 3).join(', ')}, consistently delivering high-impact solutions that align with organizational goals. Led ${activeProjects.length || 2} strategic project${activeProjects.length !== 1 ? 's' : ''}${activeCerts.length > 0 ? ` and holds ${activeCerts.length} industry certification${activeCerts.length > 1 ? 's' : ''}` : ''}, with a proven track record of on-time delivery and quality excellence. Known for cross-functional collaboration, agile execution, and mentoring teams toward continuous improvement and innovation.`;
      setSummary(fallback);
      toast.success('✅ Professional resume generated!');
    } finally {
      setFullGenLoading(false);
    }
  };

  const handleExit = () => {
    if (onClose) { onClose(); return; }
    if (isPopup) { onTabChange('/employee/dashboard'); return; }
    navigate(-1);
  };

  const sectionStyle = { marginBottom: 22, breakInside: 'avoid' as const };
  const headerStyle = { 
    fontSize: 13, 
    fontWeight: 800, 
    color: '#000', 
    borderBottom: '2px solid #3B82F6', 
    paddingBottom: 5, 
    marginBottom: 12, 
    textTransform: 'uppercase' as const,
    letterSpacing: 1.2
  };

  const LEVEL_LABEL: Record<number, string> = { 1: 'Beginner', 2: 'Intermediate', 3: 'Expert' };
  const LEVEL_COLOR: Record<number, string> = { 1: '#F59E0B', 2: '#3B82F6', 3: '#10B981' };

  const formatDate = (d?: string) => {
    if (!d) return '';
    if (/^\d{4}-\d{2}-\d{2}/.test(d)) {
      const dt = new Date(d);
      return dt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
    return d;
  };

  if (!rawData?.user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', color: T.sub }}>
        <RefreshCw size={40} className="animate-spin" style={{ marginBottom: 20 }} />
        <p style={{ fontWeight: 600 }}>Assembling AI Profile Matrix...</p>
      </div>
    );
  }

  const activeSkillsForResume = Object.keys(visibleSkills)
    .filter(s => visibleSkills[s] && rawData?.ratings?.[s] > 0)
    .sort((a, b) => (rawData?.ratings?.[b] || 0) - (rawData?.ratings?.[a] || 0));

  const expertGroup = activeSkillsForResume.filter(s => rawData?.ratings?.[s] === 3);
  const midGroup    = activeSkillsForResume.filter(s => rawData?.ratings?.[s] === 2);
  const beginGroup  = activeSkillsForResume.filter(s => rawData?.ratings?.[s] === 1);

  return (
    <div style={{ minHeight: '100vh', background: isPopup ? 'transparent' : T.bg, color: T.text, padding: isPopup ? 0 : '20px' }}>
      <div style={{ maxWidth: 1300, margin: '0 auto', display: 'grid', gridTemplateColumns: isPopup ? '1fr' : '380px 1fr', gap: 28 }}>
        
        {/* --- LEFT SIDEBAR: AI COMMAND CENTER --- */}
        <div className="no-print" style={{ 
          background: T.card, 
          border: `1px solid ${T.bdr}`, 
          borderRadius: 20, 
          padding: 24, 
          height: isPopup ? 'auto' : 'calc(100vh - 40px)', 
          overflowY: 'auto',
          position: isPopup ? 'relative' : 'sticky',
          top: 20,
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Settings2 size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 900, margin: 0 }}>Resume Workstation</h2>
              <p style={{ fontSize: 11, color: T.sub, margin: 0 }}>Professional resume converter</p>
            </div>
          </div>

          {/* ✅ Exit Builder Button — always visible */}
          <button
            onClick={handleExit}
            style={{
              width: '100%', padding: '11px 16px', borderRadius: 12,
              border: `1.5px solid ${T.bdr}`, background: dark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
              color: T.text, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              marginBottom: 12, fontSize: 13, transition: 'all 0.2s'
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#EF4444', e.currentTarget.style.color = '#EF4444')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = T.bdr, e.currentTarget.style.color = T.text)}
          >
            <LogOut size={16} /> Exit Builder
          </button>

          {/* ✅ Generate Full Professional Resume Button */}
          <button
            onClick={handleFullGenerate}
            disabled={fullGenLoading}
            style={{
              width: '100%', padding: '13px 16px', borderRadius: 12,
              border: 'none',
              background: fullGenLoading
                ? '#6B7280'
                : 'linear-gradient(135deg, #7C3AED, #3B82F6)',
              color: '#fff', fontWeight: 800, cursor: fullGenLoading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              marginBottom: 20, fontSize: 13,
              boxShadow: fullGenLoading ? 'none' : '0 8px 24px rgba(124,58,237,0.35)',
              transition: 'all 0.2s',
              letterSpacing: 0.3
            }}
          >
            {fullGenLoading
              ? <><RefreshCw size={16} className="animate-spin" /> Generating Advanced Resume...</>
              : <><Zap size={16} /> Generate Full Professional Resume</>}
          </button>

          {/* Section: Identity */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#3B82F6', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <User size={12} /> Personal Identity
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {[
                { key: 'Name', placeholder: 'Full Name' },
                { key: 'Designation', placeholder: 'Job Title' },
                { key: 'Email', placeholder: 'Corporate Email' },
                { key: 'Phone', placeholder: 'Phone Number' },
              ].map(({ key, placeholder }) => (
                <input
                  key={key}
                  value={editableUser[key] || ''}
                  onChange={e => setEditableUser({ ...editableUser, [key]: e.target.value })}
                  placeholder={placeholder}
                  style={{ width: '100%', background: dark ? 'rgba(255,255,255,0.05)' : '#f3f4f6', border: '1px solid transparent', padding: '9px 12px', borderRadius: 9, color: T.text, fontSize: 12, boxSizing: 'border-box' }}
                />
              ))}
            </div>
          </div>

          {/* Section: AI Summary */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#3B82F6', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Sparkles size={12} /> AI Summary</div>
              <button disabled={aiLoading} onClick={handleAIRefine} style={{ fontSize: 10, background: 'rgba(59,130,246,0.1)', color: '#3B82F6', border: 'none', padding: '4px 8px', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}>
                {aiLoading ? "Thinking..." : "✨ Optimize"}
              </button>
            </div>
            <textarea value={summary} onChange={e => setSummary(e.target.value)} style={{ width: '100%', height: 110, background: dark ? 'rgba(255,255,255,0.05)' : '#f3f4f6', border: 'none', padding: 12, borderRadius: 10, color: T.text, fontSize: 11.5, resize: 'none', lineHeight: 1.6, boxSizing: 'border-box' }} />
          </div>

          {/* Content Checklist */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#3B82F6', marginBottom: 10 }}>Content Checklist</div>
            
            <details open style={{ marginBottom: 8 }}>
              <summary style={{ fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', userSelect: 'none' }}>
                <BarChart3 size={13} /> Skills ({Object.values(visibleSkills).filter(Boolean).length})
              </summary>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, padding: '8px 0' }}>
                {Object.keys(visibleSkills).map(s => (
                  <button key={s} onClick={() => setVisibleSkills({ ...visibleSkills, [s]: !visibleSkills[s] })} style={{ fontSize: 10, padding: '3px 7px', borderRadius: 5, border: '1px solid', borderColor: visibleSkills[s] ? LEVEL_COLOR[rawData?.ratings?.[s] || 1] : (dark ? '#333' : '#eee'), background: visibleSkills[s] ? `${LEVEL_COLOR[rawData?.ratings?.[s] || 1]}18` : 'transparent', color: visibleSkills[s] ? LEVEL_COLOR[rawData?.ratings?.[s] || 1] : T.sub, cursor: 'pointer' }}>
                    {s}
                  </button>
                ))}
              </div>
            </details>

            <details open style={{ marginBottom: 8 }}>
              <summary style={{ fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', userSelect: 'none' }}>
                <Briefcase size={13} /> Projects ({Object.values(visibleProjects).filter(Boolean).length})
              </summary>
              <div style={{ display: 'grid', gap: 5, padding: '8px 0' }}>
                {(rawData.projects || []).map(p => (
                  <div key={p.ID} onClick={() => setVisibleProjects({ ...visibleProjects, [p.ID]: !visibleProjects[p.ID] })} style={{ fontSize: 11, padding: '8px 10px', borderRadius: 7, background: visibleProjects[p.ID] ? 'rgba(59,130,246,0.06)' : 'transparent', border: `1px solid ${visibleProjects[p.ID] ? '#3B82F640' : (dark ? '#333' : '#eee')}`, cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    {visibleProjects[p.ID] ? <CheckCircle2 size={13} color="#3B82F6" style={{ flexShrink: 0, marginTop: 1 }} /> : <Circle size={13} color={T.muted} style={{ flexShrink: 0, marginTop: 1 }} />}
                    <span style={{ fontWeight: 600, lineHeight: 1.4 }}>{p.ProjectName}</span>
                  </div>
                ))}
              </div>
            </details>

            <details style={{ marginBottom: 8 }}>
              <summary style={{ fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', userSelect: 'none' }}>
                <Award size={13} /> Certifications ({Object.values(visibleCerts).filter(Boolean).length})
              </summary>
              <div style={{ display: 'grid', gap: 5, padding: '8px 0' }}>
                {(rawData.certifications || []).map(c => (
                  <div key={c.ID} onClick={() => setVisibleCerts({ ...visibleCerts, [c.ID]: !visibleCerts[c.ID] })} style={{ fontSize: 11, padding: '7px 9px', borderRadius: 7, background: visibleCerts[c.ID] ? 'rgba(59,130,246,0.06)' : 'transparent', border: `1px solid ${visibleCerts[c.ID] ? '#3B82F640' : (dark ? '#333' : '#eee')}`, cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'center' }}>
                    {visibleCerts[c.ID] ? <CheckCircle2 size={12} color="#3B82F6" /> : <Circle size={12} color={T.muted} />}
                    {c.CertName}
                  </div>
                ))}
              </div>
            </details>

            <details style={{ marginBottom: 8 }}>
              <summary style={{ fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', userSelect: 'none' }}>
                <GraduationCap size={13} /> Education ({Object.values(visibleEdu).filter(Boolean).length})
              </summary>
              <div style={{ display: 'grid', gap: 5, padding: '8px 0' }}>
                {(rawData.education || []).map(e => (
                  <div key={e.ID} onClick={() => setVisibleEdu({ ...visibleEdu, [e.ID]: !visibleEdu[e.ID] })} style={{ fontSize: 11, padding: '7px 9px', borderRadius: 7, background: visibleEdu[e.ID] ? 'rgba(59,130,246,0.06)' : 'transparent', border: `1px solid ${visibleEdu[e.ID] ? '#3B82F640' : (dark ? '#333' : '#eee')}`, cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'center' }}>
                    {visibleEdu[e.ID] ? <CheckCircle2 size={12} color="#3B82F6" /> : <Circle size={12} color={T.muted} />}
                    {e.Degree} — {e.Institution}
                  </div>
                ))}
              </div>
            </details>
          </div>
        </div>

        {/* --- RIGHT SIDE: LIVE RESUME PREVIEW --- */}
        <div style={{ position: 'relative' }}>
          
          <div style={{ position: 'sticky', top: 20, zIndex: 10, display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 16 }} className="no-print">
            <button onClick={handleDownloadWord} disabled={loading} style={{ background: T.card, color: '#3B82F6', border: `1.5px solid #3B82F6`, padding: '10px 18px', borderRadius: 12, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
               <FileText size={16} /> Export Word
            </button>
            <button onClick={handlePrint} disabled={loading} style={{ background: '#3B82F6', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: 12, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', boxShadow: '0 8px 25px rgba(59,130,246,0.3)', fontSize: 13 }}>
               {loading ? <RefreshCw size={16} className="animate-spin" /> : <Printer size={16} />}
               Generate PDF
            </button>
          </div>

          {/* ============ RESUME DOCUMENT ============ */}
          <div id="zensar-resume" style={{ 
            background: '#fff', 
            color: '#111', 
            padding: '48px 56px', 
            borderRadius: 4, 
            boxShadow: '0 20px 60px rgba(0,0,0,0.12)', 
            minHeight: 1122,
            fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            position: 'relative'
          }}>
             
             {/* ── HEADER ── */}
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, borderBottom: '2.5px solid #E5E7EB', paddingBottom: 22 }}>
                <div style={{ flex: 1 }}>
                   <h1 style={{ margin: 0, fontSize: 32, fontWeight: 900, letterSpacing: -1, color: '#0F172A' }}>
                     {editableUser.Name || 'Employee Name'}
                   </h1>
                   <p style={{ margin: '5px 0 0', fontSize: 15, color: '#3B82F6', fontWeight: 700, letterSpacing: 0.3 }}>
                     {editableUser.Designation || 'Technology Professional'}
                     {editableUser.YearsIT ? ` • ${editableUser.YearsIT}+ Years Experience` : ''}
                   </p>
                   <div style={{ marginTop: 12, fontSize: 11, color: '#6B7280', display: 'flex', flexWrap: 'wrap', gap: '14px', fontWeight: 500 }}>
                      {editableUser.Email && <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={11} color="#3B82F6" /> {editableUser.Email}</div>}
                      {editableUser.Location && <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} color="#3B82F6" /> {editableUser.Location}</div>}
                      {editableUser.Phone && <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>📞 {editableUser.Phone}</div>}
                      {editableUser.ZensarID && <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>🆔 {editableUser.ZensarID}</div>}
                   </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 24 }}>
                   <img src="/zensar_rpg_logo.png" alt="Zensar" style={{ height: 44, marginBottom: 6 }} onError={(e) => { (e.target as any).src='/zensar_logo.png'; }} />
                   <div style={{ fontSize: 8, fontWeight: 800, color: '#3B82F6', textTransform: 'uppercase', letterSpacing: 1.5 }}>Experience. Outcomes.</div>
                   <div style={{ fontSize: 8, fontWeight: 600, color: '#9CA3AF', marginTop: 3 }}>An ®RPG Company</div>
                </div>
             </div>

             {/* ── PROFESSIONAL SUMMARY ── */}
             <div style={sectionStyle}>
                <div style={headerStyle}>Professional Summary</div>
                <p style={{ margin: 0, fontSize: 12, lineHeight: 1.75, color: '#374151', textAlign: 'justify' as const }}>{summary}</p>
             </div>

             {/* ── CORE COMPETENCIES ── */}
             {activeSkillsForResume.length > 0 && (
               <div style={sectionStyle}>
                 <div style={headerStyle}>Core Competencies & Technical Skills</div>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px 20px' }}>
                   {activeSkillsForResume.map(s => {
                     const lvl = rawData?.ratings?.[s] || 1;
                     const pct = lvl === 3 ? 100 : lvl === 2 ? 66 : 33;
                     return (
                       <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '3px 0' }}>
                         <span style={{ fontSize: 11, fontWeight: 600, color: '#1F2937', minWidth: 110, flexShrink: 0 }}>{s}</span>
                         <div style={{ flex: 1, height: 5, background: '#E5E7EB', borderRadius: 99, overflow: 'hidden' }}>
                           <div style={{ width: `${pct}%`, height: '100%', background: LEVEL_COLOR[lvl], borderRadius: 99 }} />
                         </div>
                         <span style={{ fontSize: 9, fontWeight: 700, color: LEVEL_COLOR[lvl], minWidth: 22, textAlign: 'right' }}>{LEVEL_LABEL[lvl]?.slice(0, 3)}</span>
                       </div>
                     );
                   })}
                 </div>
               </div>
             )}

             {/* ── PROFESSIONAL EXPERIENCE ── */}
             {(rawData.projects || []).filter(p => visibleProjects[p.ID]).length > 0 && (
               <div style={sectionStyle}>
                 <div style={headerStyle}>Professional Experience & Projects</div>
                 <div style={{ display: 'grid', gap: 18 }}>
                   {(rawData.projects || []).filter(p => visibleProjects[p.ID]).map((p, i) => {
                     const start = formatDate(p.StartDate);
                     const end   = p.IsOngoing ? 'Present' : formatDate(p.EndDate);
                     const techs = Array.isArray(p.Technologies) ? p.Technologies : [];
                     const skills = Array.isArray(p.SkillsUsed) ? p.SkillsUsed : [];
                     const allTech = [...new Set([...techs, ...skills])].filter(Boolean);
                     return (
                       <div key={i} style={{ breakInside: 'avoid', borderLeft: '3px solid #DBEAFE', paddingLeft: 14 }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
                           <span style={{ fontWeight: 800, fontSize: 13.5, color: '#0F172A' }}>{p.ProjectName}</span>
                           {(start || end) && (
                             <span style={{ fontSize: 10.5, color: '#6B7280', fontWeight: 600, whiteSpace: 'nowrap', marginLeft: 8 }}>
                               {start}{start && end ? ' — ' : ''}{end}
                             </span>
                           )}
                         </div>
                         <div style={{ fontSize: 11, fontWeight: 700, color: '#3B82F6', marginBottom: 5 }}>
                           {[p.Role, p.Domain && `Domain: ${p.Domain}`, p.Client && `Client: ${p.Client}`, p.TeamSize && p.TeamSize > 0 && `Team: ${p.TeamSize}`].filter(Boolean).join(' | ')}
                         </div>
                         {p.Description && (
                           <p style={{ margin: '0 0 6px', fontSize: 11.5, color: '#374151', lineHeight: 1.6 }}>{p.Description}</p>
                         )}
                         {p.Outcome && (
                           <p style={{ margin: '0 0 6px', fontSize: 11, color: '#166534', fontWeight: 600, background: '#F0FDF4', padding: '3px 8px', borderRadius: 4, display: 'inline-block' }}>
                             ✅ {p.Outcome}
                           </p>
                         )}
                         {allTech.length > 0 && (
                           <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                             {allTech.slice(0, 8).map((t, ti) => (
                               <span key={ti} style={{ fontSize: 9.5, padding: '2px 7px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 3, color: '#1D4ED8', fontWeight: 600 }}>{t}</span>
                             ))}
                           </div>
                         )}
                       </div>
                     );
                   })}
                 </div>
               </div>
             )}

             {/* ── CERTIFICATIONS & EDUCATION side by side ── */}
             <div style={{ display: 'grid', gridTemplateColumns: (rawData.certifications || []).filter(c => visibleCerts[c.ID]).length > 0 && (rawData.education || []).filter(e => visibleEdu[e.ID]).length > 0 ? '1.2fr 1fr' : '1fr', gap: 36, marginTop: 4 }}>
               
               {(rawData.certifications || []).filter(c => visibleCerts[c.ID]).length > 0 && (
                 <div style={sectionStyle}>
                   <div style={headerStyle}>Technical Credentials</div>
                   <div style={{ display: 'grid', gap: 10 }}>
                     {(rawData.certifications || []).filter(c => visibleCerts[c.ID]).map((c, i) => (
                       <div key={i} style={{ fontSize: 11.5, borderLeft: '2px solid #BFDBFE', paddingLeft: 10 }}>
                         <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: 1 }}>{c.CertName}</div>
                         <div style={{ color: '#6B7280', fontSize: 11 }}>
                           {c.Provider}{c.Provider && (c.IssueDate || c.ExpiryDate) ? ' · ' : ''}
                           {c.IssueDate ? `Issued: ${formatDate(c.IssueDate)}` : ''}
                           {c.ExpiryDate && !c.NoExpiry ? ` · Exp: ${formatDate(c.ExpiryDate)}` : ''}
                           {c.NoExpiry ? ' · No Expiry' : ''}
                         </div>
                         {c.CredentialID && <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 1 }}>ID: {c.CredentialID}</div>}
                       </div>
                     ))}
                   </div>
                 </div>
               )}

               {(rawData.education || []).filter(e => visibleEdu[e.ID]).length > 0 && (
                 <div style={sectionStyle}>
                   <div style={headerStyle}>Education</div>
                   <div style={{ display: 'grid', gap: 10 }}>
                     {(rawData.education || []).filter(e => visibleEdu[e.ID]).map((e, i) => (
                       <div key={i} style={{ fontSize: 11.5, borderLeft: '2px solid #BFDBFE', paddingLeft: 10 }}>
                         <div style={{ fontWeight: 700, color: '#0F172A' }}>{e.Degree}</div>
                         {e.FieldOfStudy && <div style={{ fontSize: 11, color: '#6B7280', fontStyle: 'italic' }}>{e.FieldOfStudy}</div>}
                         <div style={{ color: '#6B7280', fontSize: 11, marginTop: 1 }}>
                           {e.Institution}
                           {e.EndDate ? ` · ${e.EndDate}` : ''}
                           {e.Grade ? ` · Grade: ${e.Grade}` : ''}
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
             </div>

             {/* ── FOOTER ── */}
             <div style={{ 
               marginTop: 30, borderTop: '1px solid #E5E7EB', paddingTop: 12, 
               display: 'flex', justifyContent: 'space-between', 
               fontSize: 8.5, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 
             }}>
                <div>Zensar Technologies Ltd. • Global Delivery Center</div>
                <div>Skill Navigator™ • High-Fidelity HR Record</div>
             </div>
          </div>
        </div>

      </div>

      <style>{`
        @media print {
          body > *:not(#root), 
          #root > *:not(div:has(#zensar-resume)),
          header, nav, .AppHeader, .no-print { 
            display: none !important; 
          }
          body.is-printing-resume #root {
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .is-printing-resume { background: white !important; }
          #zensar-resume { 
            position: fixed !important;
            top: 0 !important; left: 0 !important;
            width: 100% !important;
            box-shadow: none !important; 
            padding: 1.5cm 2cm !important; 
            margin: 0 !important;
            border: none !important; 
            min-height: auto !important;
            border-radius: 0 !important;
          }
          @page { margin: 0; size: A4; }
        }
        input::placeholder, textarea::placeholder { color: ${dark ? '#666' : '#999'}; }
        details summary::-webkit-details-marker { display: none; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
