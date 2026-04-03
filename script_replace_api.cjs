const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/pages/SkillMatrixPage.tsx',
  'src/pages/ResumeUploadPage.tsx',
  'src/pages/ProjectsPage.tsx',
  'src/pages/CertificationsPage.tsx',
  'src/pages/AdminDashboard.tsx',
  'src/lib/localDB.ts',
  'src/lib/llm.ts',
  'src/lib/appStore.ts',
];

const apiExport = "export const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? `http://${window.location.hostname}:3001/api` : '/api');";

// Update api.ts
const apiPath = path.join(__dirname, 'src/lib/api.ts');
let apiContent = fs.readFileSync(apiPath, 'utf8');
apiContent = apiContent.replace(/const BASE = `http:\/\/\$\{window\.location\.hostname\}:3001\/api`;/g, apiExport);
apiContent = apiContent.replace(/export const API_BASE = .*;/g, apiExport); // in case running twice
apiContent = apiContent.replace(/\$\{BASE\}/g, '${API_BASE}'); // fix BASE -> API_BASE if needed
fs.writeFileSync(apiPath, apiContent);

for (const file of filesToUpdate) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');

  // Add import if not present and we need it
  if (!content.includes("import { API_BASE }")) {
      content = "import { API_BASE } from '@/lib/api';\n" + content;
  }

  // Replace all port 3001 references
  content = content.replace(/`http:\/\/\$\{window\.location\.hostname\}:3001\/api/g, '`${API_BASE}');
  content = content.replace(/'http:\/\/localhost:3001\/api/g, '`${API_BASE}');
  content = content.replace(/`http:\/\/localhost:3001\/api/g, '`${API_BASE}');
  
  fs.writeFileSync(filePath, content);
}

console.log("Replaced backend URLs successfully.");
