const fs = require('fs');
const path = 'c:/Users/Magudesh/Desktop/zensar update/again final check/zensar-skillmatrix/src/pages/AdminDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

const imports = `import { API_BASE } from '@/lib/api';
/**
 * AdminDashboard.tsx
 * Redesigned for Elite Aesthetic, supporting Light/Dark modes.
 * Features: Admin-to-Employee impersonation with immediate session sync.
 */
import { useMemo, useState, useEffect, useRef } from 'react';
import { SKILLS } from '@/lib/mockData';
import { useNavigate } from 'react-router-dom';
import { generateCareerInsight, computeSkillPriorities, recommendCertifications } from '@/lib/aiIntelligence';
import { 
  Users, CheckCircle2, TrendingUp, Award, BarChart3, Search, 
  Eye, Edit2, Shield, RefreshCw, FileSpreadsheet, Plus, Settings, Trash2, Upload, X, Bot, Layout, LayoutDashboard, Grid, AlertTriangle, Download, Target, Sparkles, Map, Brain, Briefcase, Loader2, PenTool, GraduationCap, FileText, Zap, Globe
} from 'lucide-react';
import { toast } from '@/lib/ToastContext';
import { useDark, mkTheme } from '@/lib/themeContext';
import { exportAllToExcel } from '@/lib/localDB';
import { apiGetAllEmployees } from '@/lib/api';
import { useApp } from '@/lib/AppContext';
import { useAuth } from '@/lib/authContext';
import { AppData, transformRawToAppData } from '@/lib/appStore';
import EmployeeDashboard from '@/pages/EmployeeDashboard';

import { callLLM } from '@/lib/llm';
import ZensarLoader from '@/components/ZensarLoader';
`;

// Find where the old imports ended and the rest of the file starts
// We know that ZensarLoader is usually the last specialized import before chart.js
const loaderStr = "import ZensarLoader from '@/components/ZensarLoader';";
const loaderIndex = content.indexOf(loaderStr);

if (loaderIndex !== -1) {
    const rest = content.substring(loaderIndex + loaderStr.length);
    fs.writeFileSync(path, imports + rest);
    console.log("Successfully restored imports.");
} else {
    // Fallback search for chart.js
    const chartStr = "import {";
    const chartIndex = content.indexOf(chartStr, content.indexOf("aiIntelligence"));
    if (chartIndex !== -1) {
        const rest = content.substring(chartIndex);
        fs.writeFileSync(path, imports + "\n" + rest);
        console.log("Successfully restored imports (fallback).");
    } else {
        console.log("Could not find insertion point.");
    }
}
