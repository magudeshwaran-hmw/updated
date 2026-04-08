import os

path = r'c:\Users\Magudesh\Desktop\zensar update\again final check\zensar-skillmatrix\src\pages\AdminDashboard.tsx'

with open(path, 'r', encoding='utf-8') as f:
    orig = f.read()

# 1. Full Manifest
manifest = """import { API_BASE } from '@/lib/api';
/**
 * AdminDashboard.tsx
 * Redesigned for Elite Aesthetic, supporting Light/Dark modes.
 */
import { useMemo, useState, useEffect, useRef } from 'react';
import { SKILLS } from '@/lib/mockData';
import { useNavigate } from 'react-router-dom';
import { generateCareerInsight, computeSkillPriorities, recommendCertifications } from '@/lib/aiIntelligence';
import { 
  Users, CheckCircle2, TrendingUp, Award, BarChart3, Search, 
  Eye, Edit2, Shield, RefreshCw, FileSpreadsheet, Plus, Settings, Trash2, Upload, X, Bot, Layout, LayoutDashboard, Grid, AlertTriangle, Download, Target, Sparkles, Map, Brain, Briefcase, Loader2, PenTool, GraduationCap, FileText, Zap, Globe, ExternalLink
} from 'lucide-react';
import { toast } from '@/lib/ToastContext';
import { useAuth } from '@/lib/authContext';
import { useDark, mkTheme } from '@/lib/themeContext';
import { exportAllToExcel } from '@/lib/localDB';
import { apiGetAllEmployees } from '@/lib/api';
import { useApp } from '@/lib/AppContext';
import { AppData, transformRawToAppData } from '@/lib/appStore';
import EmployeeDashboard from '@/pages/EmployeeDashboard';

import { callLLM } from '@/lib/llm';
import ZensarLoader from '@/components/ZensarLoader';

import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement,
  BarController, LineController, DoughnutController, Tooltip, Legend, Title
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement,
  BarController, LineController, DoughnutController, Tooltip, Legend, Title
);

export default function AdminDashboard() {
"""

# Anchor to start of component body
anchor = '  const { login } = useAuth();'
if anchor not in orig:
    # Fallback anchor
    anchor = '  const { setGlobalLoading } = useApp();'

body_idx = orig.find(anchor)
if body_idx == -1:
    print("CRITICAL ERROR: Cannot find component body anchor.")
    exit(1)

body = orig[body_idx:]

# Ensure 'navigate' is defined
if 'const navigate = useNavigate();' not in body:
    body = '  const navigate = useNavigate();\n' + body

# 2. Update Certification Popup for High Fidelity Parity
cert_old = '{modalTab === \'Certs\' && ('
cert_new_start = """{modalTab === 'Certs' && (
                    <div style={{ animation: 'fadeIn 0.2s', position: 'relative', minHeight: '100%' }}>
                       {subForm && (
                         <div style={{ position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                            <div onClick={() => setSubForm(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }} />
                            <div style={{ position: 'relative', background: T.card, border: `1px solid ${T.bdr}`, borderRadius: 32, width: '100%', maxWidth: 640, padding: 48, boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
                               <button onClick={() => setSubForm(null)} style={{ position: 'absolute', top: 24, right: 24, background: 'rgba(255,255,255,0.05)', border: 'none', color: T.sub, cursor: 'pointer', padding: 8, borderRadius: '50%' }}><X size={24}/></button>
                               <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 900 }}>{subForm.index !== undefined ? 'Modify Credential' : 'Register New Certification'}</h2>
                               <p style={{ color: T.sub, fontSize: 13, marginBottom: 32 }}>Administrative override for professional licensing records.</p>
                               
                               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
                                  <div style={{ gridColumn: 'span 2' }}>
                                     <label style={{ fontSize: 11, fontWeight: 900, color: T.muted, textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Certification Name</label>
                                     <input value={subForm.CertName} onChange={e => setSubForm({...subForm, CertName: e.target.value})} style={{ width: '100%', padding: '14px 18px', borderRadius: 14, background: T.input, border: `1px solid ${T.inputBdr}`, color: T.text, fontSize: 14, fontWeight: 600 }} placeholder="e.g. AWS Solutions Architect" />
                                  </div>
                                  <div>
                                     <label style={{ fontSize: 11, fontWeight: 900, color: T.muted, textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Provider</label>
                                     <input value={subForm.Provider} onChange={e => setSubForm({...subForm, Provider: e.target.value})} style={{ width: '100%', padding: '14px 18px', borderRadius: 14, background: T.input, border: `1px solid ${T.inputBdr}`, color: T.text, fontSize: 14, fontWeight: 600 }} placeholder="e.g. Amazon, Google, Microsoft" />
                                  </div>
                                  <div>
                                     <label style={{ fontSize: 11, fontWeight: 900, color: T.muted, textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Credential ID</label>
                                     <input value={subForm.CredentialID} onChange={e => setSubForm({...subForm, CredentialID: e.target.value})} style={{ width: '100%', padding: '14px 18px', borderRadius: 14, background: T.input, border: `1px solid ${T.inputBdr}`, color: T.text, fontSize: 14, fontWeight: 600 }} placeholder="Optional ID" />
                                  </div>
                                  <div>
                                     <label style={{ fontSize: 11, fontWeight: 900, color: T.muted, textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Issue Date</label>
                                     <input type="date" value={subForm.IssueDate} onChange={e => setSubForm({...subForm, IssueDate: e.target.value})} style={{ width: '100%', padding: '14px 18px', borderRadius: 14, background: T.input, border: `1px solid ${T.inputBdr}`, color: T.text, fontSize: 14, fontWeight: 600 }} />
                                  </div>
                                  <div>
                                     <label style={{ fontSize: 11, fontWeight: 900, color: T.muted, textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Expiry Date</label>
                                     <input type="date" disabled={subForm.NoExpiry} value={subForm.ExpiryDate} onChange={e => setSubForm({...subForm, ExpiryDate: e.target.value})} style={{ width: '100%', padding: '14px 18px', borderRadius: 14, background: T.input, border: `1px solid ${T.inputBdr}`, color: T.text, fontSize: 14, fontWeight: 600, opacity: subForm.NoExpiry ? 0.3 : 1 }} />
                                  </div>
                                  <label style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: T.sub }}>
                                     <input type="checkbox" checked={subForm.NoExpiry} onChange={e => setSubForm({...subForm, NoExpiry: e.target.checked})} />
                                     This credential does not expire
                                  </label>
                               </div>
                               
                               <div style={{ display: 'flex', gap: 16 }}>
                                  <button onClick={() => setSubForm(null)} style={{ flex: 1, padding: '16px', borderRadius: 16, background: 'rgba(255,255,255,0.05)', color: T.text, border: `1px solid ${T.bdr}`, fontWeight: 800, cursor: 'pointer' }}>Cancel</button>
                                  <button onClick={() => {
                                     if (!subForm.CertName) return toast.error('Certification identity required');
                                     const items = [...modalCerts];
                                     if (subForm.index !== undefined) items[subForm.index] = subForm;
                                     else items.push(subForm);
                                     setModalCerts(items);
                                     setSubForm(null);
                                  }} style={{ flex: 2, padding: '16px', borderRadius: 16, background: 'linear-gradient(135deg, #10B981, #3B82F6)', color: '#fff', border: 'none', fontWeight: 900, cursor: 'pointer', boxShadow: '0 10px 30px rgba(16,185,129,0.2)' }}>Synchronize Credential</button>
                               </div>
                            </div>
                         </div>
                       )}
"""

# Re-inject correct cert list with higher fidelity (status colors, external link)
cert_list_new = """                       <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:24 }}>
                          {modalCerts.map((c, i) => (
                             <div key={i} style={{ padding:32, background:T.card, border:`1px solid ${T.bdr}`, borderRadius:28, display:'flex', flexDirection:'column', gap:20, position:'relative' }}>
                                <div style={{ display:'flex', gap:16, alignItems:'flex-start' }}>
                                   <div style={{ width:52, height:52, borderRadius:16, background:'rgba(16,185,129,0.1)', color:'#10B981', display:'flex', alignItems:'center', justifyContent:'center' }}><Award size={26} /></div>
                                   <div style={{ flex:1 }}>
                                      <div style={{ fontWeight:900, fontSize:17, letterSpacing:-0.5 }}>{c.CertName}</div>
                                      <div style={{ fontSize:14, color:T.sub }}>{c.Provider}</div>
                                   </div>
                                </div>
                                
                                <div style={{ display:'grid', gap:8, fontSize:13 }}>
                                   <div style={{ display:'flex', justifyContent:'space-between' }}><span style={{ color:T.muted }}>Issued:</span> <span>{c.IssueDate}</span></div>
                                   <div style={{ display:'flex', justifyContent:'space-between' }}><span style={{ color:T.muted }}>Expires:</span> <span>{c.NoExpiry ? 'No Expiry' : (c.ExpiryDate || 'N/A')}</span></div>
                                </div>

                                <div style={{ marginTop:'auto', paddingTop:20, borderTop:`1px solid ${T.bdr}`, display:'flex', justifyContent:'space-between', alignItems: 'center' }}>
                                   <div style={{ display: 'flex', gap: 6 }}>
                                      {c.CredentialURL && <a href={c.CredentialURL} target="_blank" rel="noreferrer" style={{ background:'rgba(59,130,246,0.1)', color:'#3B82F6', padding:8, borderRadius:8 }}><ExternalLink size={16}/></a>}
                                      <button onClick={() => setSubForm({ ...c, index: i })} style={{ background:'rgba(59,130,246,0.1)', border:'none', color:'#3B82F6', padding:8, borderRadius:8 }}><Edit2 size={16}/></button>
                                      <button onClick={() => setModalCerts(prev => prev.filter((_, idx) => idx !== i))} style={{ background:'rgba(239,68,68,0.1)', border:'none', color:'#EF4444', padding:8, borderRadius:8 }}><Trash2 size={16}/></button>
                                   </div>
                                   <div style={{ fontSize:10, fontWeight:900, color:'#10B981', background:'rgba(16,185,129,0.1)', padding:'4px 10px', borderRadius:20 }}>VALIDATED</div>
                                </div>
                             </div>
                          ))}
"""

# Similarly update Projects for High Fidelity
proj_new_start = """{modalTab === 'Projects' && (
                    <div style={{ animation: 'fadeIn 0.2s', position: 'relative', minHeight: '100%' }}>
                       {subForm && (
                         <div style={{ position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                            <div onClick={() => setSubForm(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }} />
                            <div style={{ position: 'relative', background: T.card, border: `1px solid ${T.bdr}`, borderRadius: 32, width: '100%', maxWidth: 740, padding: 48, boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
                               <button onClick={() => setSubForm(null)} style={{ position: 'absolute', top: 24, right: 24, background: 'rgba(255,255,255,0.05)', border: 'none', color: T.sub, cursor: 'pointer', padding: 8, borderRadius: '50%' }}><X size={24}/></button>
                               <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 900 }}>{subForm.index !== undefined ? 'Refine Project Record' : 'Log Professional Milestone'}</h2>
                               <p style={{ color: T.sub, fontSize: 13, marginBottom: 32 }}>Administrative override for mission-critical project telemetry.</p>
                               
                               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
                                  <div style={{ gridColumn: 'span 2' }}>
                                     <label style={{ fontSize: 11, fontWeight: 900, color: T.muted, textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Project Identity</label>
                                     <input value={subForm.ProjectName} onChange={e => setSubForm({...subForm, ProjectName: e.target.value})} style={{ width: '100%', padding: '14px 18px', borderRadius: 14, background: T.input, border: `1px solid ${T.inputBdr}`, color: T.text, fontSize: 14, fontWeight: 600 }} placeholder="Project Name" />
                                  </div>
                                  <div>
                                     <label style={{ fontSize: 11, fontWeight: 900, color: T.muted, textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Vertical Role</label>
                                     <input value={subForm.Role} onChange={e => setSubForm({...subForm, Role: e.target.value})} style={{ width: '100%', padding: '14px 18px', borderRadius: 14, background: T.input, border: `1px solid ${T.inputBdr}`, color: T.text, fontSize: 14, fontWeight: 600 }} placeholder="e.g. Lead QE" />
                                  </div>
                                  <div>
                                     <label style={{ fontSize: 11, fontWeight: 900, color: T.muted, textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Capability Vertical</label>
                                     <select value={subForm.Domain} onChange={e => setSubForm({...subForm, Domain: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: 14, background: T.input, border: `1px solid ${T.inputBdr}`, color: T.text, fontWeight: 600 }}>
                                        <option value="Banking">Banking</option>
                                        <option value="Healthcare">Healthcare</option>
                                        <option value="Telecom">Telecom</option>
                                        <option value="Retail">Retail</option>
                                        <option value="Insurance">Insurance</option>
                                     </select>
                                  </div>
                                  <div style={{ gridColumn: 'span 2' }}>
                                     <label style={{ fontSize: 11, fontWeight: 900, color: T.muted, textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Strategic Summary</label>
                                     <textarea value={subForm.Description} onChange={e => setSubForm({...subForm, Description: e.target.value})} style={{ width: '100%', height: 120, padding: '14px 18px', borderRadius: 14, background: T.input, border: `1px solid ${T.inputBdr}`, color: T.text, fontSize: 14, resize:'none' }} placeholder="Detail project impact and technical execution..." />
                                  </div>
                                  <div style={{ gridColumn: 'span 2' }}>
                                     <label style={{ fontSize: 11, fontWeight: 900, color: T.muted, textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Tech Stack Intelligence (Comma Separated)</label>
                                     <input value={(subForm.Technologies || []).join(', ')} onChange={e => setSubForm({...subForm, Technologies: e.target.value.split(',').map(s=>s.trim())})} style={{ width: '100%', padding: '14px 18px', borderRadius: 14, background: T.input, border: `1px solid ${T.inputBdr}`, color: T.text, fontSize: 14 }} placeholder="e.g. React, Node.js, AWS" />
                                  </div>
                               </div>
                               
                               <div style={{ display: 'flex', gap: 16 }}>
                                  <button onClick={() => setSubForm(null)} style={{ flex: 1, padding: '16px', borderRadius: 16, background: 'rgba(255,255,255,0.05)', color: T.text, border: `1px solid ${T.bdr}`, fontWeight: 800, cursor: 'pointer' }}>Cancel</button>
                                  <button onClick={() => {
                                     if (!subForm.ProjectName) return toast.error('Project Identity required');
                                     const items = [...modalProjects];
                                     if (subForm.index !== undefined) items[subForm.index] = subForm;
                                     else items.push(subForm);
                                     setModalProjects(items);
                                     setSubForm(null);
                                  }} style={{ flex: 2, padding: '16px', borderRadius: 16, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', color: '#fff', border: 'none', fontWeight: 900, cursor: 'pointer', boxShadow: '0 10px 30px rgba(59,130,246,0.4)' }}>Commit Project Milestone</button>
                               </div>
                            </div>
                         </div>
                       )}
"""

# Assembling the final body - this is tricky because I need to replace blocks in a fragmented file
# I will use string replacement for the big blocks

# 1. Certs replacement
c_start_tag = "{modalTab === 'Certs' && ("
c_end_tag = "                  {modalTab === 'Projects' && ("
c_idx_start = body.find(c_start_tag)
c_idx_end = body.find(c_end_tag)

if c_idx_start != -1 and c_idx_end != -1:
    # We found the certs block. 
    # Build list part
    full_certs_section = cert_new_start + """
                       <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:32 }}>
                          <div>
                             <h3 style={{ margin:0, fontSize:28, fontWeight:900, letterSpacing:-1.5 }}>Personnel Performance Records</h3>
                             <p style={{ margin:0, fontSize:14, color:T.sub }}>Verification of professional licensing & technical credentials.</p>
                          </div>
                          <button onClick={() => setSubForm({ CertName: '', Provider: '', IssueDate: new Date().toISOString().split('T')[0], CredentialID: '', id: 'new' })} style={{ padding:'12px 24px', borderRadius:16, background:'rgba(59,130,246,0.1)', color:'#3B82F6', border:'none', fontSize:13, fontWeight:900, cursor:'pointer' }}>+ Add New Credential</button>
                       </div>
""" + cert_list_new + "                       </div>\n                    </div>\n                  )}\n\n"
    body = body[:c_idx_start] + full_certs_section + body[c_idx_end:]

# 2. Projects replacement
p_start_tag = "{modalTab === 'Projects' && ("
p_end_tag = "                  {modalTab === 'Education' && ("
p_idx_start = body.find(p_start_tag)
p_idx_end = body.find(p_end_tag)

if p_idx_start != -1 and p_idx_end != -1:
    full_projects_section = proj_new_start + """
                       <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:32 }}>
                          <div>
                             <h3 style={{ margin:0, fontSize:28, fontWeight:900, letterSpacing:-1.5 }}>Corporate Delivery Matrix</h3>
                             <p style={{ margin:0, fontSize:14, color:T.sub }}>Verification of mission-critical engineering milestones.</p>
                          </div>
                          <button onClick={() => setSubForm({ ProjectName: '', Role: '', Domain: 'Banking', Description: '', Technologies: [], id: 'new' })} style={{ padding:'12px 24px', borderRadius:16, background:'rgba(59,130,246,0.1)', color:'#3B82F6', border:'none', fontSize:13, fontWeight:900, cursor:'pointer' }}>+ Add Project</button>
                       </div>
                       
                       <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(400px, 1fr))', gap:28 }}>
                          {modalProjects.map((p, i) => (
                             <div key={i} style={{ padding:36, background:T.card, border:`1px solid ${T.bdr}`, borderRadius:32, display:'flex', flexDirection:'column', gap:24, transition:'0.3s', boxShadow:'0 10px 30px -10px rgba(0,0,0,0.1)' }}>
                                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                                   <div style={{ flex:1 }}>
                                      <div style={{ fontSize:11, fontWeight:900, color:'#3B82F6', textTransform:'uppercase', marginBottom:6, letterSpacing:1 }}>{p.Domain} • {p.Role || 'Engineer'}</div>
                                      <div style={{ fontWeight:900, fontSize:20, letterSpacing:-0.5 }}>{p.ProjectName}</div>
                                   </div>
                                   <div style={{ display:'flex', gap:8 }}>
                                       <button onClick={() => setSubForm({ ...p, index: i })} style={{ background:'rgba(59,130,246,0.1)', border:'none', color:'#3B82F6', padding:8, borderRadius:8 }}><Edit2 size={16}/></button>
                                       <button onClick={() => setModalProjects(prev => prev.filter((_, idx) => idx !== i))} style={{ background:'rgba(239,68,68,0.1)', border:'none', color:'#EF4444', padding:8, borderRadius:8 }}><Trash2 size={16}/></button>
                                   </div>
                                </div>
                                <div style={{ fontSize:15, color:T.text, lineHeight:1.7, opacity:0.8 }}>{p.Description}</div>
                                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                                   {(p.Technologies || []).slice(0,5).map(t => (
                                      <span key={t} style={{ fontSize:10, fontWeight:900, color:T.muted, background:T.bg, padding:'4px 10px', borderRadius:8, border:`1px solid ${T.bdr}` }}>{t}</span>
                                   ))}
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                  )}\n\n"
    body = body[:p_idx_start] + full_projects_section + body[p_idx_end:]

with open(path, 'w', encoding='utf-8') as f:
    f.write(manifest + body)

print("SUCCESS: Full high-fidelity AdminDashboard restoration completed.")
