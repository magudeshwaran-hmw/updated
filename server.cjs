/**
 * server.cjs — Express backend for Skill Navigator
 * Stores all employee data in employees.xlsx (local file)
 * Run: node server.cjs
 */
const express = require('express');
const cors    = require('cors');
const xlsx    = require('xlsx');
const path    = require('path');
const fs      = require('fs');
const fsp     = require('fs').promises;

const app  = express();
const PORT = 3001;
const EXCEL_PATH = path.join(__dirname, 'employees.xlsx');

app.use(cors());
app.use(express.json());
// ─── Async-safe Excel writer (retries on EBUSY / file-lock) ─────────────────
async function writeWorkbookAsync(wb) {
  const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      await fsp.writeFile(EXCEL_PATH, buffer);
      return; // success
    } catch (err) {
      if (err.code === 'EBUSY' && attempt < 6) {
        console.warn(`[Excel] File busy (attempt ${attempt}/6), retrying in 600ms...`);
        await new Promise(r => setTimeout(r, 600));
      } else {
        console.error('[Excel] Write failed:', err.message);
        throw new Error(
          err.code === 'EBUSY'
            ? 'Excel file is open in another program. Please close it and try again.'
            : err.message
        );
      }
    }
  }
}

// ─── Excel helpers ────────────────────────────────────────────────────────────

function readWorkbook() {
  if (fs.existsSync(EXCEL_PATH)) {
    const wb = xlsx.readFile(EXCEL_PATH);
    // Ensure Skills sheet exists in older files
    if (!wb.Sheets['Skills']) {
      const skillSheet = xlsx.utils.aoa_to_sheet([[
        'EmployeeID','SkillID','SkillName','Category','SelfRating','ManagerRating','Validated'
      ]]);
      xlsx.utils.book_append_sheet(wb, skillSheet, 'Skills');
      // Sync write only on startup (no user has the file open yet)
      xlsx.writeFile(wb, EXCEL_PATH);
    }
    return wb;
  }
  // Create fresh workbook with headers
  const wb = xlsx.utils.book_new();
  const empSheet = xlsx.utils.aoa_to_sheet([[
    'ID','ZensarID','Name','Email','Phone','Designation','Department','Location',
    'YearsIT','YearsZensar','PrimarySkill','PrimaryDomain',
    'Password','OverallCapability','Submitted','SubmittedAt',
    'ResumeUploaded','CreatedAt'
  ]]);
  const skillSheet = xlsx.utils.aoa_to_sheet([[
    'EmployeeID','SkillID','SkillName','Category','SelfRating','ManagerRating','Validated'
  ]]);
  xlsx.utils.book_append_sheet(wb, empSheet,   'Employees');
  xlsx.utils.book_append_sheet(wb, skillSheet, 'Skills');
  xlsx.writeFile(wb, EXCEL_PATH);
  return wb;
}

function getEmployees() {
  const wb   = readWorkbook();
  const ws   = wb.Sheets['Employees'];
  return xlsx.utils.sheet_to_json(ws, { defval: '' });
}

async function saveEmployees(employees) {
  const wb  = readWorkbook();
  wb.Sheets['Employees'] = xlsx.utils.json_to_sheet(employees);
  wb.SheetNames = ['Employees', ...(wb.SheetNames.filter(n => n !== 'Employees'))];
  await writeWorkbookAsync(wb);
}

function getSkills(employeeId) {
  const wb  = readWorkbook();
  const ws  = wb.Sheets['Skills'];
  if (!ws) return [];
  const rows = xlsx.utils.sheet_to_json(ws, { defval: '' });
  return employeeId ? rows.filter(r => r.EmployeeID === employeeId) : rows;
}

async function saveSkillsForEmployee(employeeId, skills) {
  const wb  = readWorkbook();
  const ws  = wb.Sheets['Skills'];
  const all = ws ? xlsx.utils.sheet_to_json(ws, { defval: '' }) : [];

  // Remove old rows for this employee, add new ones
  const others = all.filter(r => r.EmployeeID !== employeeId);
  const newRows = skills.map(s => ({
    EmployeeID:    employeeId,
    SkillID:       s.skillId,
    SkillName:     s.skillName || s.skillId,
    Category:      s.category  || '',
    SelfRating:    s.selfRating ?? 0,
    ManagerRating: s.managerRating ?? '',
    Validated:     s.validated ? 'Yes' : 'No',
  }));
  const merged = [...others, ...newRows];
  const newWs  = xlsx.utils.json_to_sheet(merged);
  wb.Sheets['Skills'] = newWs;
  // Ensure 'Skills' is in SheetNames
  if (!wb.SheetNames.includes('Skills')) wb.SheetNames.push('Skills');
  await writeWorkbookAsync(wb);
}

// simple hash — good enough for internal tool
function hashPw(pw) {
  let h = 0;
  for (let i = 0; i < pw.length; i++) h = (Math.imul(31, h) + pw.charCodeAt(i)) | 0;
  return h.toString(36);
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// POST /api/register
app.post('/api/register', async (req, res) => {
  const { name, email, phone, designation, department, location,
          yearsIT, yearsZensar, password, resumeUploaded, zensarId } = req.body;

  if (!name || (!email && !phone) || !password)
    return res.status(400).json({ error: 'Name, email/phone and password are required.' });

  const employees = getEmployees();
  const dup = employees.find(e =>
    (email && e.Email?.toLowerCase() === email.toLowerCase()) ||
    (phone && e.Phone === phone) ||
    (zensarId && e.ZensarID === zensarId)
  );
  if (dup) return res.status(409).json({ error: 'Zensar ID, email or phone already registered.' });

  const id  = `emp_${Date.now()}`;
  const now = new Date().toISOString();
  const newEmp = {
    ID: id, ZensarID: zensarId || '', Name: name, Email: email || '', Phone: phone || '',
    Designation: designation || '', Department: department || 'Quality Engineering',
    Location: location || '', YearsIT: yearsIT || 0, YearsZensar: yearsZensar || 0,
    PrimarySkill: '', PrimaryDomain: '', Password: hashPw(password),
    OverallCapability: 0, Submitted: 'No', SubmittedAt: '',
    ResumeUploaded: resumeUploaded ? 'Yes' : 'No', CreatedAt: now,
  };
  employees.push(newEmp);
  try {
    await saveEmployees(employees);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
  const { Password: _, ...safe } = newEmp;
  console.log(`[Register] New employee: ${name} (${id})`);
  res.json({ success: true, employee: { ...safe, id } });
});

// POST /api/login  — accepts ZensarID, email, or phone
app.post('/api/login', (req, res) => {
  const { login: loginId, password } = req.body;
  if (!loginId || !password) return res.status(400).json({ error: 'Login ID and password required.' });

  const employees = getEmployees();
  const emp = employees.find(e =>
    e.ZensarID === loginId ||
    e.Email?.toLowerCase() === loginId.toLowerCase() ||
    e.Phone === loginId
  );

  if (!emp) return res.status(401).json({ error: 'No account found with this Zensar ID / email / phone.' });
  if (emp.Password !== hashPw(password)) return res.status(401).json({ error: 'Incorrect password.' });

  const { Password: _, ...safe } = emp;
  res.json({ success: true, employee: { ...safe, id: emp.ID, name: emp.Name, role: 'employee' } });
});

// GET /api/employees
app.get('/api/employees', (req, res) => {
  const employees = getEmployees().map(e => {
    const { Password: _, ...safe } = e;
    return { ...safe, id: e.ID, name: e.Name };
  });
  res.json(employees);
});

// GET /api/employees/:id
app.get('/api/employees/:id', (req, res) => {
  const emp = getEmployees().find(e => e.ID === req.params.id);
  if (!emp) return res.status(404).json({ error: 'Employee not found.' });
  const { Password: _, ...safe } = emp;
  res.json({ ...safe, id: emp.ID, name: emp.Name });
});

// PUT /api/employees/:id
app.put('/api/employees/:id', async (req, res) => {
  const employees = getEmployees();
  const idx = employees.findIndex(e => e.ID === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Not found.' });
  const updated = { ...employees[idx], ...req.body };
  employees[idx] = updated;
  try { await saveEmployees(employees); } catch (err) {
    return res.status(500).json({ error: err.message });
  }
  const { Password: _, ...safe } = updated;
  res.json({ success: true, employee: { ...safe, id: updated.ID } });
});

// GET /api/employees/:id/skills
app.get('/api/employees/:id/skills', (req, res) => {
  const skills = getSkills(req.params.id);
  // Return in frontend format
  const mapped = skills.map(s => ({
    skillId:       s.SkillID,
    selfRating:    parseInt(s.SelfRating) || 0,
    managerRating: s.ManagerRating !== '' ? parseInt(s.ManagerRating) : null,
    validated:     s.Validated === 'Yes',
  }));
  res.json(mapped);
});

// PUT /api/employees/:id/skills
app.put('/api/employees/:id/skills', async (req, res) => {
  const { skills } = req.body;
  if (!Array.isArray(skills)) return res.status(400).json({ error: 'skills must be an array.' });
  try {
    await saveSkillsForEmployee(req.params.id, skills);

    const rated = skills.filter(s => (s.selfRating || 0) > 0).length;
    const cap   = Math.round((rated / 32) * 100);
    const employees = getEmployees();
    const idx = employees.findIndex(e => e.ID === req.params.id);
    if (idx >= 0) {
      employees[idx].OverallCapability = cap;
      await saveEmployees(employees);
    }
    console.log(`[Skills] ✅ Saved ${skills.length} skills for ${req.params.id} | capability: ${cap}%`);
    res.json({ success: true, saved: skills.length, capability: cap });
  } catch (err) {
    console.error('[Skills] ❌ Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/employees/:id/submit
app.post('/api/employees/:id/submit', async (req, res) => {
  try {
    const employees = getEmployees();
    const idx = employees.findIndex(e => e.ID === req.params.id);
    if (idx < 0) return res.status(404).json({ error: 'Employee not found.' });
    employees[idx].Submitted   = 'Yes';
    employees[idx].SubmittedAt = new Date().toISOString();
    await saveEmployees(employees);
    console.log(`[Submit] ✅ Employee ${req.params.id} marked submitted`);
    res.json({ success: true });
  } catch (err) {
    console.error('[Submit] ❌ Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Start ────────────────────────────────────────────────────────────
readWorkbook();
app.listen(PORT, () => {
  console.log(`\n✅ Skill Navigator API running on http://localhost:${PORT}`);
  console.log(`📊 Excel file: ${EXCEL_PATH}\n`);
});
