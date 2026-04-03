const d = async () => {
  try {
    console.log('Pushing Certifications...');
    await fetch('http://localhost:3001/api/certifications', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ 
        ID: 'cert_1010101', EmployeeID: '123123', EmployeeName: 'Automated TestUser', 
        CertName: 'AWS Certified Solutions Architect', Provider: 'Amazon', 
        IssueDate: '2025-01-01', ExpiryDate: '', NoExpiry: true, CredentialID: 'AWS-123', IsAIExtracted: false 
      }) 
    });

    console.log('Pushing Projects...');
    await fetch('http://localhost:3001/api/projects', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ 
        ID: 'proj_2020202', EmployeeID: '123123', EmployeeName: 'Automated TestUser', 
        ProjectName: 'Backend Optimization', Client: 'Zensar Internal', Domain: 'DevOps', 
        Role: 'Quality Engineer', StartDate: '2024-01-01', EndDate: '', IsOngoing: true, 
        Description: 'Automated deployments', SkillsUsed: '["Docker", "Jenkins"]', Technologies: '["NodeJS"]', 
        TeamSize: 5, Outcome: 'Successful', IsAIExtracted: false 
      }) 
    });

    console.log('Pushing Skills...');
    await fetch('http://localhost:3001/api/employees/123123/skills', { 
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ employeeName: 'Automated TestUser', Selenium: 3, Java: 2, Python: 1, Docker: 3, Jenkins: 2, eventType: 'SKILL_UPDATED' }) 
    });

    console.log('Successfully injected mock data!');
  } catch (err) {
    console.error('Error injecting mock data:', err);
  }
}; 
d();
