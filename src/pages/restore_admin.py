import os

content1 = r"""import { API_BASE } from '@/lib/api';
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

export default function AdminDashboard() {
"""

# Now I need the rest of the file. I'll read it from the existing file starting from where "  const navigate = useNavigate();" is.
path = r'c:\Users\Magudesh\Desktop\zensar update\again final check\zensar-skillmatrix\src\pages\AdminDashboard.tsx'
with open(path, 'r', encoding='utf-8') as f:
    orig = f.read()

idx = orig.find('  const navigate = useNavigate();')
if idx != -1:
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content1 + orig[idx:])
    print("SUCCESS: Full AdminDashboard restoration completed.")
else:
    print("ERROR: Anchor not found.")
