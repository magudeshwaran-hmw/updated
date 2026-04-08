const fs = require('fs');
const path = 'c:/Users/Magudesh/Desktop/zensar update/again final check/zensar-skillmatrix/src/pages/AdminDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

const correctTop = `import { API_BASE } from '@/lib/api';
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
`;

const index = content.indexOf("export default function AdminDashboard()");
if (index !== -1) {
    const rest = content.substring(index);
    fs.writeFileSync(path, correctTop + "\n" + rest);
    console.log("SUCCESS: Unified administrative manifest restored.");
} else {
    console.log("ERROR: Anchor 'AdminDashboard' not found in target.");
}
