# Complete Skill Matrix API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication
- Login required for most operations
- Use session/token from `/api/login` endpoint

---

## 🧑‍💼 EMPLOYEES API

### GET All Employees
```http
GET /api/employees
```
**Response:** Array of all employees with all 32 skills

### GET Single Employee
```http
GET /api/employees/:id
```
**Params:** `id` (employee ID, Zensar ID, or email)

### CREATE Employee
```http
POST /api/employees
```
**Body:**
```json
{
  "zensarId": "Z001",
  "name": "John Doe",
  "email": "john@zensar.com",
  "phone": "1234567890",
  "designation": "Senior Test Engineer",
  "department": "Quality Intelligence",
  "location": "India",
  "yearsIT": 5,
  "yearsZensar": 3,
  "password": "password123",
  "primarySkill": "Selenium",
  "primaryDomain": "Banking"
}
```

### UPDATE Employee
```http
PUT /api/employees/:id
```
**Body:** Same as CREATE (excluding password)

### DELETE Employee
```http
DELETE /api/employees/:id
```

---

## 🎯 SKILLS API

### GET Employee Skills
```http
GET /api/employees/:id/skills
```
**Response:** Array of all 32 skills with ratings
```json
[
  {
    "skillId": "selenium",
    "skillName": "Selenium",
    "selfRating": 3,
    "managerRating": 2,
    "validated": true
  }
]
```

### UPDATE Self Skills
```http
PUT /api/employees/:id/skills
```
**Body:**
```json
{
  "Selenium": 3,
  "Java": 2,
  "API Testing": 3,
  "Python": 1
}
```

### UPDATE Manager Skills
```http
PUT /api/employees/:id/skills/manager
```
**Body:**
```json
{
  "Selenium": 3,
  "Java": 2,
  "Selenium_validated": true,
  "Java_validated": false
}
```

---

## 📁 PROJECTS API

### GET All Projects
```http
GET /api/projects
```
**Response:** Projects with employee details

### GET Employee Projects
```http
GET /api/employees/:id/projects
```

### CREATE Project
```http
POST /api/projects
```
**Body:**
```json
{
  "employeeId": "emp_001",
  "projectName": "Banking App Testing",
  "role": "Lead Tester",
  "startDate": "2024-01-01",
  "endDate": "2024-06-30",
  "description": "End-to-end testing of banking application",
  "technologies": ["Selenium", "Java", "API Testing"]
}
```

### UPDATE Project
```http
PUT /api/projects/:id
```
**Body:** Same as CREATE

### DELETE Project
```http
DELETE /api/projects/:id
```

---

## 🏆 CERTIFICATIONS API

### GET All Certifications
```http
GET /api/certifications
```

### GET Employee Certifications
```http
GET /api/employees/:id/certifications
```

### CREATE Certification
```http
POST /api/certifications
```
**Body:**
```json
{
  "employeeId": "emp_001",
  "certName": "ISTQB Foundation Level",
  "issuingOrganization": "ISTQB",
  "issueDate": "2023-06-15",
  "expiryDate": "2026-06-15",
  "credentialId": "ISTQB-001",
  "credentialUrl": "https://istqb.org"
}
```

### UPDATE Certification
```http
PUT /api/certifications/:id
```
**Body:** Same as CREATE

### DELETE Certification
```http
DELETE /api/certifications/:id
```

---

## 📈 GROWTH PLANS API

### GET All Growth Plans
```http
GET /api/growth-plans
```

### GET Employee Growth Plans
```http
GET /api/employees/:id/growth-plans
```

### CREATE Growth Plan
```http
POST /api/growth-plans
```
**Body:**
```json
{
  "employeeId": "emp_001",
  "skillName": "Selenium",
  "currentLevel": 2,
  "targetLevel": 3,
  "targetDate": "2024-12-31",
  "status": "Active",
  "actions": [
    "Complete advanced Selenium course",
    "Work on 2 automation projects",
    "Get certified in Selenium"
  ]
}
```

### UPDATE Growth Plan
```http
PUT /api/growth-plans/:id
```
**Body:** Same as CREATE + `progress` field

### DELETE Growth Plan
```http
DELETE /api/growth-plans/:id
```

---

## 🔐 AUTHENTICATION API

### Register New Employee
```http
POST /api/register
```
**Body:** Same as CREATE Employee

### Login
```http
POST /api/login
```
**Body:**
```json
{
  "login": "Z001", // or email or phone
  "password": "password123"
}
```
**Response:**
```json
{
  "success": true,
  "employee": {
    "id": "Z001",
    "name": "John Doe",
    "role": "employee"
  }
}
```

---

## 📊 DASHBOARD API

### Get Dashboard Statistics
```http
GET /api/dashboard/stats
```
**Response:**
```json
{
  "totalEmployees": 150,
  "submittedEmployees": 120,
  "averageCapability": 75,
  "totalProjects": 45,
  "totalCertifications": 89,
  "activeGrowthPlans": 34
}
```

### Get Skills Distribution
```http
GET /api/dashboard/skills-distribution
```
**Response:**
```json
{
  "averageCompletion": 75,
  "submittedCount": 120
}
```

---

## 🤖 LLM API

### Generate AI Response
```http
POST /api/llm
```
**Body:**
```json
{
  "prompt": "Generate a 90-day learning plan for Selenium automation",
  "model": "llama3"
}
```

---

## 🎯 ALL 32 SKILLS LIST

### Technical Skills
1. Selenium
2. Appium
3. JMeter
4. Postman
5. JIRA
6. TestRail

### Programming Languages
7. Python
8. Java
9. JavaScript
10. TypeScript
11. C#
12. SQL

### Testing Types
13. API Testing
14. Mobile Testing
15. Performance Testing
16. Security Testing
17. Database Testing

### Domain Knowledge
18. Banking
19. Healthcare
20. E-Commerce
21. Insurance
22. Telecom

### Testing Methodologies
23. Manual Testing
24. Automation Testing
25. Regression Testing
26. UAT

### DevOps & Tools
27. Git
28. Jenkins
29. Docker
30. Azure DevOps

### AI & Emerging Technologies
31. ChatGPT/Prompt Engineering
32. AI Test Automation

---

## 📝 Skill Rating Scale

- **0**: Not Rated
- **1**: Beginner
- **2**: Intermediate
- **3**: Expert

---

## 🔍 Database Schema

### Employees Table
- All employee info + 96 skill columns (32 skills × 3 fields each)
- Fields: `{skill}_self`, `{skill}_manager`, `{skill}_validated`

### Related Tables
- `projects` - Employee projects
- `certifications` - Employee certifications
- `growth_plans` - Employee development plans

---

## 🚀 Quick Start

1. **Start the server:**
   ```bash
   npm run server
   ```

2. **Test connection:**
   ```bash
   curl http://localhost:3001/api/employees
   ```

3. **Register first user:**
   ```bash
   curl -X POST http://localhost:3001/api/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Admin","email":"admin@zensar.com","password":"admin123"}'
   ```

---

## 📱 Frontend Integration

The frontend should use these API endpoints:

- **Authentication:** `/api/login`, `/api/register`
- **Employee Data:** `/api/employees`, `/api/employees/:id`
- **Skills:** `/api/employees/:id/skills`
- **Projects:** `/api/projects`, `/api/employees/:id/projects`
- **Certifications:** `/api/certifications`, `/api/employees/:id/certifications`
- **Growth Plans:** `/api/growth-plans`, `/api/employees/:id/growth-plans`
- **Dashboard:** `/api/dashboard/stats`, `/api/dashboard/skills-distribution`

---

## 🛠️ Error Handling

All endpoints return consistent error format:
```json
{
  "error": "Error message description"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error

---

## 📊 Performance Features

- **Connection Pooling**: Efficient database connections
- **Indexes**: Optimized for common queries
- **Views**: Pre-computed summaries
- **Functions**: Automatic capability calculation
- **Triggers**: Auto-update timestamps

This complete API provides full CRUD operations for all entities in the Skill Matrix application! 🎉
