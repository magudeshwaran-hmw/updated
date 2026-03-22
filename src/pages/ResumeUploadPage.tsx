import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Upload, FileText, CheckCircle2, Loader2, Brain, AlertTriangle,
  Zap, RefreshCw, ArrowRight, Wifi, WifiOff
} from 'lucide-react';
import {
  checkOllamaStatus, extractTextFromFile, analyzeResumeWithOllama,
  applyDetectedSkills, DetectedSkill, OllamaStatus, extractPersonalDetailsAI,
  extractPersonalDetails, PersonalDetails,
} from '@/lib/ollamaAI';
import { SKILLS } from '@/lib/mockData';
import { SkillRating, ProficiencyLevel } from '@/lib/types';
import { saveSkillRatings, getEmployee, createNewEmployee } from '@/lib/localDB';
import { useAuth } from '@/lib/authContext';
import { useDark, mkTheme } from '@/lib/themeContext';

const LEVEL_COLORS: Record<ProficiencyLevel, string> = {
  0: '#374151', 1: '#D97706', 2: '#2563EB', 3: '#059669',
};
const LEVEL_LABELS: Record<ProficiencyLevel, string> = {
  0: 'N/A', 1: 'Beginner', 2: 'Intermediate', 3: 'Expert',
};

export default function ResumeUploadPage() {
  const navigate = useNavigate();
  const { employeeId } = useAuth();
  const { dark } = useDark();
  const T = mkTheme(dark);

  const [file, setFile] = useState<File | null>(null);
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus | null>(null);
  const [checkingOllama, setCheckingOllama] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [detectedSkills, setDetectedSkills] = useState<DetectedSkill[] | null>(null);
  const [detectedProfile, setDetectedProfile] = useState<PersonalDetails | null>(null);
  const [analysisStep, setAnalysisStep] = useState('');
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [autoStarted, setAutoStarted] = useState(false);

  // Auto-analyze as soon as a file is picked (no button needed)
  const runFullAnalysis = useCallback(async (f: File) => {
    setAnalyzing(true);
    setDetectedSkills(null);
    setDetectedProfile(null);
    setAnalysisError(null);

    try {
      setAnalysisStep('📄 Reading resume...');
      const text = await extractTextFromFile(f);

      // Check Ollama
      setAnalysisStep('🔍 Detecting AI engine...');
      const status = await checkOllamaStatus();
      setOllamaStatus(status);

      if (status.available && status.model) {
        // AI path — extract profile + skills in parallel
        setAnalysisStep('🧠 AI extracting your profile & skills... (may take a moment)');
        const [profile, detected] = await Promise.all([
          extractPersonalDetailsAI(text, status.model),
          analyzeResumeWithOllama(text, status.model),
        ]);

        setDetectedProfile(profile);
        setDetectedSkills(detected);

        // Save profile details to localStorage for SkillMatrixPage
        if (employeeId && employeeId !== 'new') {
          const { upsertEmployee, getEmployee } = await import('@/lib/localDB');
          const existing = getEmployee(employeeId);
          if (existing) {
            upsertEmployee({
              ...existing,
              name:        profile.name        || existing.name,
              email:       profile.email       || existing.email,
              phone:       profile.phone       || existing.phone,
              designation: profile.designation || existing.designation,
              location:    profile.location    || existing.location,
              yearsIT:     profile.yearsIT     || existing.yearsIT,
              resumeUploaded: true,
            });
          }
        }

        // Apply skills to ratings
        const baseRatings: SkillRating[] = SKILLS.map(s => ({
          skillId: s.id, selfRating: 0 as ProficiencyLevel, managerRating: null, validated: false,
        }));
        const merged = applyDetectedSkills(baseRatings, detected);
        if (employeeId && employeeId !== 'new') saveSkillRatings(employeeId, merged);

        toast.success(`✅ AI detected ${detected.length} skills & auto-filled your profile!`);
      } else {
        // Regex fallback — still extract profile
        const profile = extractPersonalDetails(text);
        setDetectedProfile(profile);

        if (employeeId && employeeId !== 'new') {
          const { upsertEmployee, getEmployee } = await import('@/lib/localDB');
          const existing = getEmployee(employeeId);
          if (existing) {
            upsertEmployee({
              ...existing,
              name:        profile.name        || existing.name,
              designation: profile.designation || existing.designation,
              location:    profile.location    || existing.location,
              yearsIT:     profile.yearsIT     || existing.yearsIT,
              resumeUploaded: true,
            });
          }
        }
        toast.success('📋 Profile extracted from resume! Start your AI engine (Ollama) for skill auto-detection.');
      }
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Unknown error';
      setAnalysisStep('');
      const friendly = raw.includes('timed out')
        ? 'Analysis timed out. Please try again or skip and fill skills manually.'
        : raw.includes('JSON')
        ? 'Could not read AI result. Try again or fill manually.'
        : 'Analysis failed. You can skip and fill skills manually.';
      setAnalysisError(friendly);
    } finally {
      setAnalyzing(false);
      setAnalysisStep('');
    }
  }, [employeeId]);

  const checkOllama = async () => {
    setCheckingOllama(true);
    const status = await checkOllamaStatus();
    setOllamaStatus(status);
    setCheckingOllama(false);
    if (status.available) toast.success('AI Engine connected! Ready to analyze.');
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && (f.type === 'application/pdf' || f.name.endsWith('.docx') || f.name.endsWith('.txt'))) {
      setFile(f);
      setDetectedSkills(null);
      setAutoStarted(true);
      runFullAnalysis(f);
    } else {
      toast.error('Please upload a PDF, DOCX, or TXT file');
    }
  }, [runFullAnalysis]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setDetectedSkills(null);
      setAutoStarted(true);
      runFullAnalysis(f);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    if (!ollamaStatus?.available) {
      toast.error('AI analysis is not available. Please skip and fill skills manually.');
      return;
    }

    setAnalyzing(true);
    setDetectedSkills(null);
    setAnalysisError(null);

    try {
      setAnalysisStep('📄 Reading resume file...');
      const text = await extractTextFromFile(file);

      setAnalysisStep('🧠 Analyzing your resume... (this may take a moment)');
      const detected = await analyzeResumeWithOllama(text, ollamaStatus.model!);

      setDetectedSkills(detected);
      setAnalysisStep('');

      // Auto-save detected skills
      const baseRatings: SkillRating[] = SKILLS.map(s => ({
        skillId: s.id, selfRating: 0 as ProficiencyLevel, managerRating: null, validated: false,
      }));
      const merged = applyDetectedSkills(baseRatings, detected);

      if (employeeId && employeeId !== 'new') {
        saveSkillRatings(employeeId, merged);
      }

      toast.success(`✅ AI detected ${detected.length} skills from your resume!`);
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Unknown error';
      setAnalysisStep('');
      // Show inline error (not just toast) so user can see the Skip option clearly
      const friendly = raw.includes('CPU mode')
        ? 'Analysis could not complete. Please try again or skip and fill skills manually.'
        : raw.includes('timed out')
        ? 'Analysis took too long. Please try again or skip and fill manually.'
        : raw.includes('JSON')
        ? 'Could not read the analysis result. Please try again or fill manually.'
        : `Analysis failed. You can skip and fill skills manually instead.`;
      setAnalysisError(friendly);
      toast.error('AI analysis failed — see details below');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleContinue = () => {
    navigate('/employee/skills');
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif", padding: '40px 24px', transition: 'background 0.35s, color 0.35s' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: T.text, fontFamily: "'Space Grotesk', sans-serif", marginBottom: '8px' }}>
            Upload Resume
          </h1>
          <p style={{ color: T.sub, fontSize: '15px' }}>
            Our AI will analyze your resume and <strong style={{ color: '#60A5FA' }}>auto-detect your QE skills</strong> — saving you time on skill entry.
          </p>
        </div>

        {/* ── AI Status Card ─────────────────────────────────────── */}
        <div style={{
          background: ollamaStatus?.available ? 'rgba(16,185,129,0.08)' : T.card,
          border: `1px solid ${ollamaStatus?.available ? 'rgba(16,185,129,0.35)' : ollamaStatus?.error ? 'rgba(239,68,68,0.30)' : T.bdr}`,
          borderRadius: '16px', padding: '20px 24px', marginBottom: '28px',
          display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
        }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', flexShrink: 0, background: ollamaStatus?.available ? 'rgba(16,185,129,0.2)' : T.input, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {ollamaStatus?.available ? <Wifi size={22} color="#10B981" /> : <WifiOff size={22} color={T.muted} />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '15px', color: T.text, marginBottom: '2px' }}>
              AI Skill Analysis — {ollamaStatus?.available ? 'Ready' : 'Not Available'}
            </div>
            <div style={{ fontSize: '13px', color: T.sub }}>
              {ollamaStatus?.error
                ? 'AI analysis is temporarily unavailable.'
                : ollamaStatus?.available
                ? 'Ready! Will scan your resume and pre-fill skills automatically.'
                : 'Click "Check Connection" to enable AI skill detection, or skip and fill manually.'}
            </div>
          </div>
          <button onClick={checkOllama} disabled={checkingOllama} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '8px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.35)', color: '#60A5FA', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', opacity: checkingOllama ? 0.6 : 1 }}>
            {checkingOllama ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={14} />}
            {checkingOllama ? 'Checking...' : 'Check Connection'}
          </button>
        </div>

        {/* ── Drop Zone ─────────────────────────────────────────── */}
        <div onDragOver={e => e.preventDefault()} onDrop={handleDrop}
          style={{ border: `2px dashed ${file ? 'rgba(16,185,129,0.5)' : T.inputBdr}`, borderRadius: '20px', padding: '60px 32px', textAlign: 'center', background: file ? 'rgba(16,185,129,0.06)' : T.card, transition: 'all 0.3s', marginBottom: '24px' }}
        >
          {file ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <FileText size={56} color="#10B981" />
              <div style={{ fontSize: '18px', fontWeight: 700, color: T.text }}>{file.name}</div>
              <div style={{ fontSize: '13px', color: T.muted }}>{(file.size / 1024).toFixed(0)} KB</div>
              <button onClick={() => { setFile(null); setDetectedSkills(null); }}
                style={{ background: 'none', border: `1px solid ${T.bdr}`, borderRadius: '8px', padding: '6px 14px', color: T.sub, cursor: 'pointer', fontSize: '13px' }}>
                Change file
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: 80, height: 80, borderRadius: '20px', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Upload size={36} color="#3B82F6" />
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: T.text, marginBottom: '6px' }}>Drop your resume here</div>
                <div style={{ fontSize: '14px', color: T.sub }}>PDF, DOCX, or TXT — up to 10MB</div>
              </div>
              <label>
                <input type="file" accept=".pdf,.docx,.txt" onChange={handleFileSelect} style={{ display: 'none' }} />
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '10px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.30)', color: '#60A5FA', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>Browse Files</span>
              </label>
            </div>
          )}
        </div>

        {/* ── Analysis Step Status ──────────────────────────────── */}
        {analysisStep && (
          <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Loader2 size={18} color="#60A5FA" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
            <span style={{ color: '#93C5FD', fontSize: '14px' }}>{analysisStep}</span>
          </div>
        )}

        {/* ── Analysis Error Banner ─────────────────────────────── */}
        {analysisError && (
          <div style={{ background: 'rgba(239,68,68,0.09)', border: '1px solid rgba(239,68,68,0.30)', borderRadius: '14px', padding: '18px 22px', marginBottom: '20px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <AlertTriangle size={20} color="#F87171" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: '#FCA5A5', fontSize: '14px', marginBottom: '6px' }}>AI Analysis Failed</div>
              <div style={{ color: 'rgba(252,165,165,0.8)', fontSize: '13px', lineHeight: 1.65, marginBottom: '12px' }}>{analysisError}</div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button onClick={() => { setAnalysisError(null); handleAnalyze(); }}
                  style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(239,68,68,0.18)', border: '1px solid rgba(239,68,68,0.35)', color: '#FCA5A5', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  Try Again
                </button>
                <button onClick={() => navigate('/employee/skills')}
                  style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.30)', color: '#60A5FA', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  Skip — Fill Skills Manually →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Auto-Detected Profile Preview ──────────────────────────── */}
        {detectedProfile && (detectedProfile.name || detectedProfile.designation || detectedProfile.email) && (
          <div style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.28)', borderRadius: '16px', padding: '18px 22px', marginBottom: '20px', animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ fontWeight: 700, fontSize: '14px', color: '#34D399', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={15} /> Auto-Detected Profile
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: '8px' }}>
              {[
                { label: 'Name',        value: detectedProfile.name },
                { label: 'Email',       value: detectedProfile.email },
                { label: 'Phone',       value: detectedProfile.phone },
                { label: 'Designation', value: detectedProfile.designation },
                { label: 'Location',    value: detectedProfile.location },
                { label: 'Experience',  value: detectedProfile.yearsIT ? `${detectedProfile.yearsIT} years IT` : '' },
              ].filter(f => f.value).map(f => (
                <div key={f.label} style={{ padding: '8px 12px', borderRadius: '10px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)' }}>
                  <div style={{ fontSize: '10px', color: '#34D399', fontWeight: 700, marginBottom: '2px' }}>{f.label.toUpperCase()}</div>
                  <div style={{ fontSize: '13px', color: T.text, fontWeight: 600 }}>{f.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Action Buttons ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
          {analyzing ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 28px', borderRadius: '12px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', color: '#60A5FA', fontWeight: 700, fontSize: '15px' }}>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> {analysisStep || 'Analyzing...'}
            </div>
          ) : detectedSkills ? (
            <button onClick={() => navigate('/employee/skills')} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 28px', borderRadius: '12px', background: 'linear-gradient(135deg, #10B981, #059669)', border: 'none', color: '#fff', fontWeight: 700, fontSize: '15px', cursor: 'pointer', boxShadow: '0 0 24px rgba(16,185,129,0.4)' }}>
              <CheckCircle2 size={18} /> Continue to Skill Matrix <ArrowRight size={16} />
            </button>
          ) : file && !autoStarted ? (
            <button onClick={() => runFullAnalysis(file)} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 28px', borderRadius: '12px', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', border: 'none', color: '#fff', fontWeight: 700, fontSize: '15px', cursor: 'pointer', boxShadow: '0 0 24px rgba(59,130,246,0.4)' }}>
              <Brain size={18} /> Analyze with AI
            </button>
          ) : null}
          <button onClick={() => navigate('/employee/skills')}
            style={{ padding: '14px 24px', borderRadius: '12px', background: T.card, border: `1px solid ${T.bdr}`, color: T.sub, fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
            {detectedProfile ? 'Continue →' : 'Skip — Fill Manually'}
          </button>
        </div>

        {/* AI not available — no banner needed, the status card + Skip button are sufficient */}

        {/* ── Detected Skills Results ───────────────────────────── */}
        {detectedSkills && detectedSkills.length > 0 && (
          <div style={{ background: T.card, border: `1px solid ${T.bdr}`, borderRadius: '20px', padding: '28px', animation: 'fadeIn 0.5s ease-out' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: T.text, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: "'Space Grotesk', sans-serif" }}>
              <Zap size={20} color="#FBBF24" /> AI Detected {detectedSkills.length} Skills
            </h3>
            <p style={{ color: T.sub, fontSize: '13px', marginBottom: '20px' }}>Pre-populated in your skill matrix. You can adjust levels manually if needed.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
              {detectedSkills.map(s => (
                <div key={s.skillId} style={{ padding: '14px 16px', borderRadius: '12px', background: `${LEVEL_COLORS[s.selfRating]}12`, border: `1px solid ${LEVEL_COLORS[s.selfRating]}35` }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: T.text, marginBottom: '4px' }}>{s.skillName}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: T.muted }}>{s.category}</span>
                    <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: `${LEVEL_COLORS[s.selfRating]}25`, color: LEVEL_COLORS[s.selfRating] }}>{LEVEL_LABELS[s.selfRating]}</span>
                  </div>
                  {s.reason && <div style={{ fontSize: '11px', color: T.muted, marginTop: '6px', lineHeight: 1.4 }}>{s.reason.slice(0, 60)}{s.reason.length > 60 ? '...' : ''}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700;800&display=swap');
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
