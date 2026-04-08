-- Complete PostgreSQL Schema for Skill Matrix Application
-- All 32 skills as separate columns for optimal performance

-- Drop existing tables if they exist (for fresh setup)
DROP TABLE IF EXISTS growth_plans CASCADE;
DROP TABLE IF EXISTS certifications CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS employees CASCADE;

-- Employees table with all 32 skills as columns
CREATE TABLE employees (
    id VARCHAR(50) PRIMARY KEY,
    zensar_id VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    designation VARCHAR(255),
    department VARCHAR(255) DEFAULT 'Quality Engineering',
    location VARCHAR(255) DEFAULT 'India',
    years_it INTEGER DEFAULT 0,
    years_zensar INTEGER DEFAULT 0,
    password VARCHAR(255),
    overall_capability INTEGER DEFAULT 0,
    submitted BOOLEAN DEFAULT FALSE,
    resume_uploaded BOOLEAN DEFAULT FALSE,
    primary_skill VARCHAR(255),
    primary_domain VARCHAR(255),
    
    -- All 32 Skills (Self Rating: 0-3, Manager Rating: 0-3, Validated: boolean)
    -- Technical Skills
    selenium_self INTEGER DEFAULT 0 CHECK (selenium_self >= 0 AND selenium_self <= 3),
    selenium_manager INTEGER CHECK (selenium_manager >= 0 AND selenium_manager <= 3),
    selenium_validated BOOLEAN DEFAULT FALSE,
    
    appium_self INTEGER DEFAULT 0 CHECK (appium_self >= 0 AND appium_self <= 3),
    appium_manager INTEGER CHECK (appium_manager >= 0 AND appium_manager <= 3),
    appium_validated BOOLEAN DEFAULT FALSE,
    
    jmeter_self INTEGER DEFAULT 0 CHECK (jmeter_self >= 0 AND jmeter_self <= 3),
    jmeter_manager INTEGER CHECK (jmeter_manager >= 0 AND jmeter_manager <= 3),
    jmeter_validated BOOLEAN DEFAULT FALSE,
    
    postman_self INTEGER DEFAULT 0 CHECK (postman_self >= 0 AND postman_self <= 3),
    postman_manager INTEGER CHECK (postman_manager >= 0 AND postman_manager <= 3),
    postman_validated BOOLEAN DEFAULT FALSE,
    
    jira_self INTEGER DEFAULT 0 CHECK (jira_self >= 0 AND jira_self <= 3),
    jira_manager INTEGER CHECK (jira_manager >= 0 AND jira_manager <= 3),
    jira_validated BOOLEAN DEFAULT FALSE,
    
    testrail_self INTEGER DEFAULT 0 CHECK (testrail_self >= 0 AND testrail_self <= 3),
    testrail_manager INTEGER CHECK (testrail_manager >= 0 AND testrail_manager <= 3),
    testrail_validated BOOLEAN DEFAULT FALSE,
    
    -- Programming Languages
    python_self INTEGER DEFAULT 0 CHECK (python_self >= 0 AND python_self <= 3),
    python_manager INTEGER CHECK (python_manager >= 0 AND python_manager <= 3),
    python_validated BOOLEAN DEFAULT FALSE,
    
    java_self INTEGER DEFAULT 0 CHECK (java_self >= 0 AND java_self <= 3),
    java_manager INTEGER CHECK (java_manager >= 0 AND java_manager <= 3),
    java_validated BOOLEAN DEFAULT FALSE,
    
    javascript_self INTEGER DEFAULT 0 CHECK (javascript_self >= 0 AND javascript_self <= 3),
    javascript_manager INTEGER CHECK (javascript_manager >= 0 AND javascript_manager <= 3),
    javascript_validated BOOLEAN DEFAULT FALSE,
    
    typescript_self INTEGER DEFAULT 0 CHECK (typescript_self >= 0 AND typescript_self <= 3),
    typescript_manager INTEGER CHECK (typescript_manager >= 0 AND typescript_manager <= 3),
    typescript_validated BOOLEAN DEFAULT FALSE,
    
    csharp_self INTEGER DEFAULT 0 CHECK (csharp_self >= 0 AND csharp_self <= 3),
    csharp_manager INTEGER CHECK (csharp_manager >= 0 AND csharp_manager <= 3),
    csharp_validated BOOLEAN DEFAULT FALSE,
    
    sql_self INTEGER DEFAULT 0 CHECK (sql_self >= 0 AND sql_self <= 3),
    sql_manager INTEGER CHECK (sql_manager >= 0 AND sql_manager <= 3),
    sql_validated BOOLEAN DEFAULT FALSE,
    
    -- Testing Types
    api_testing_self INTEGER DEFAULT 0 CHECK (api_testing_self >= 0 AND api_testing_self <= 3),
    api_testing_manager INTEGER CHECK (api_testing_manager >= 0 AND api_testing_manager <= 3),
    api_testing_validated BOOLEAN DEFAULT FALSE,
    
    mobile_testing_self INTEGER DEFAULT 0 CHECK (mobile_testing_self >= 0 AND mobile_testing_self <= 3),
    mobile_testing_manager INTEGER CHECK (mobile_testing_manager >= 0 AND mobile_testing_manager <= 3),
    mobile_testing_validated BOOLEAN DEFAULT FALSE,
    
    performance_testing_self INTEGER DEFAULT 0 CHECK (performance_testing_self >= 0 AND performance_testing_self <= 3),
    performance_testing_manager INTEGER CHECK (performance_testing_manager >= 0 AND performance_testing_manager <= 3),
    performance_testing_validated BOOLEAN DEFAULT FALSE,
    
    security_testing_self INTEGER DEFAULT 0 CHECK (security_testing_self >= 0 AND security_testing_self <= 3),
    security_testing_manager INTEGER CHECK (security_testing_manager >= 0 AND security_testing_manager <= 3),
    security_testing_validated BOOLEAN DEFAULT FALSE,
    
    database_testing_self INTEGER DEFAULT 0 CHECK (database_testing_self >= 0 AND database_testing_self <= 3),
    database_testing_manager INTEGER CHECK (database_testing_manager >= 0 AND database_testing_manager <= 3),
    database_testing_validated BOOLEAN DEFAULT FALSE,
    
    -- Domain Knowledge
    banking_self INTEGER DEFAULT 0 CHECK (banking_self >= 0 AND banking_self <= 3),
    banking_manager INTEGER CHECK (banking_manager >= 0 AND banking_manager <= 3),
    banking_validated BOOLEAN DEFAULT FALSE,
    
    healthcare_self INTEGER DEFAULT 0 CHECK (healthcare_self >= 0 AND healthcare_self <= 3),
    healthcare_manager INTEGER CHECK (healthcare_manager >= 0 AND healthcare_manager <= 3),
    healthcare_validated BOOLEAN DEFAULT FALSE,
    
    ecommerce_self INTEGER DEFAULT 0 CHECK (ecommerce_self >= 0 AND ecommerce_self <= 3),
    ecommerce_manager INTEGER CHECK (ecommerce_manager >= 0 AND ecommerce_manager <= 3),
    ecommerce_validated BOOLEAN DEFAULT FALSE,
    
    insurance_self INTEGER DEFAULT 0 CHECK (insurance_self >= 0 AND insurance_self <= 3),
    insurance_manager INTEGER CHECK (insurance_manager >= 0 AND insurance_manager <= 3),
    insurance_validated BOOLEAN DEFAULT FALSE,
    
    telecom_self INTEGER DEFAULT 0 CHECK (telecom_self >= 0 AND telecom_self <= 3),
    telecom_manager INTEGER CHECK (telecom_manager >= 0 AND telecom_manager <= 3),
    telecom_validated BOOLEAN DEFAULT FALSE,
    
    -- Testing Methodologies
    manual_testing_self INTEGER DEFAULT 0 CHECK (manual_testing_self >= 0 AND manual_testing_self <= 3),
    manual_testing_manager INTEGER CHECK (manual_testing_manager >= 0 AND manual_testing_manager <= 3),
    manual_testing_validated BOOLEAN DEFAULT FALSE,
    
    automation_testing_self INTEGER DEFAULT 0 CHECK (automation_testing_self >= 0 AND automation_testing_self <= 3),
    automation_testing_manager INTEGER CHECK (automation_testing_manager >= 0 AND automation_testing_manager <= 3),
    automation_testing_validated BOOLEAN DEFAULT FALSE,
    
    regression_testing_self INTEGER DEFAULT 0 CHECK (regression_testing_self >= 0 AND regression_testing_self <= 3),
    regression_testing_manager INTEGER CHECK (regression_testing_manager >= 0 AND regression_testing_manager <= 3),
    regression_testing_validated BOOLEAN DEFAULT FALSE,
    
    uat_self INTEGER DEFAULT 0 CHECK (uat_self >= 0 AND uat_self <= 3),
    uat_manager INTEGER CHECK (uat_manager >= 0 AND uat_manager <= 3),
    uat_validated BOOLEAN DEFAULT FALSE,
    
    -- DevOps & Tools
    git_self INTEGER DEFAULT 0 CHECK (git_self >= 0 AND git_self <= 3),
    git_manager INTEGER CHECK (git_manager >= 0 AND git_manager <= 3),
    git_validated BOOLEAN DEFAULT FALSE,
    
    jenkins_self INTEGER DEFAULT 0 CHECK (jenkins_self >= 0 AND jenkins_self <= 3),
    jenkins_manager INTEGER CHECK (jenkins_manager >= 0 AND jenkins_manager <= 3),
    jenkins_validated BOOLEAN DEFAULT FALSE,
    
    docker_self INTEGER DEFAULT 0 CHECK (docker_self >= 0 AND docker_self <= 3),
    docker_manager INTEGER CHECK (docker_manager >= 0 AND docker_manager <= 3),
    docker_validated BOOLEAN DEFAULT FALSE,
    
    azure_devops_self INTEGER DEFAULT 0 CHECK (azure_devops_self >= 0 AND azure_devops_self <= 3),
    azure_devops_manager INTEGER CHECK (azure_devops_manager >= 0 AND azure_devops_manager <= 3),
    azure_devops_validated BOOLEAN DEFAULT FALSE,
    
    -- AI & Emerging Technologies
    chatgpt_prompt_engineering_self INTEGER DEFAULT 0 CHECK (chatgpt_prompt_engineering_self >= 0 AND chatgpt_prompt_engineering_self <= 3),
    chatgpt_prompt_engineering_manager INTEGER CHECK (chatgpt_prompt_engineering_manager >= 0 AND chatgpt_prompt_engineering_manager <= 3),
    chatgpt_prompt_engineering_validated BOOLEAN DEFAULT FALSE,
    
    ai_test_automation_self INTEGER DEFAULT 0 CHECK (ai_test_automation_self >= 0 AND ai_test_automation_self <= 3),
    ai_test_automation_manager INTEGER CHECK (ai_test_automation_manager >= 0 AND ai_test_automation_manager <= 3),
    ai_test_automation_validated BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES employees(id) ON DELETE CASCADE,
    project_name VARCHAR(255) NOT NULL,
    role VARCHAR(255),
    start_date DATE,
    end_date DATE,
    description TEXT,
    technologies TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Certifications table
CREATE TABLE certifications (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES employees(id) ON DELETE CASCADE,
    cert_name VARCHAR(255) NOT NULL,
    issuing_organization VARCHAR(255),
    issue_date DATE,
    expiry_date DATE,
    credential_id VARCHAR(255),
    credential_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Growth plans table
CREATE TABLE growth_plans (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES employees(id) ON DELETE CASCADE,
    skill_name VARCHAR(255),
    current_level INTEGER DEFAULT 0 CHECK (current_level >= 0 AND current_level <= 3),
    target_level INTEGER DEFAULT 0 CHECK (target_level >= 0 AND target_level <= 3),
    target_date DATE,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    status VARCHAR(50) DEFAULT 'Active',
    actions TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_zensar_id ON employees(zensar_id);
CREATE INDEX idx_employees_submitted ON employees(submitted);
CREATE INDEX idx_projects_employee_id ON projects(employee_id);
CREATE INDEX idx_certifications_employee_id ON certifications(employee_id);
CREATE INDEX idx_growth_plans_employee_id ON growth_plans(employee_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certifications_updated_at BEFORE UPDATE ON certifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_growth_plans_updated_at BEFORE UPDATE ON growth_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate overall capability
CREATE OR REPLACE FUNCTION calculate_overall_capability(employee_id_param VARCHAR(50))
RETURNS INTEGER AS $$
DECLARE
    rated_skills INTEGER := 0;
    total_skills INTEGER := 32;
    capability INTEGER;
BEGIN
    -- Count rated skills (self_rating > 0)
    SELECT 
        CASE WHEN selenium_self > 0 THEN 1 ELSE 0 END +
        CASE WHEN appium_self > 0 THEN 1 ELSE 0 END +
        CASE WHEN jmeter_self > 0 THEN 1 ELSE 0 END +
        CASE WHEN postman_self > 0 THEN 1 ELSE 0 END +
        CASE WHEN jira_self > 0 THEN 1 ELSE 0 END +
        CASE WHEN testrail_self > 0 THEN 1 ELSE 0 END +
        CASE WHEN python_self > 0 THEN 1 ELSE 0 END +
        CASE WHEN java_self > 0 THEN 1 ELSE 0 END +
        CASE WHEN javascript_self > 0 THEN 1 ELSE 0 END +
        CASE WHEN typescript_self > 0 THEN 1 ELSE 0 END +
        CASE WHEN csharp_self > 0 THEN 1 ELSE 0 END +
        CASE WHEN sql_self > 0 THEN 1 ELSE 0 END +
        CASE WHEN api_testing_self > 0 THEN 1 ELSE 0 END +
        CASE WHEN mobile_testing_self > 0 THEN 1 ELSE 0 END +
        CASE WHEN performance_testing_self > 0 THEN 1 ELSE 0 END +
        CASE WHEN security_testing_self > 0 THEN 1 ELSE 0 END +
        CASE WHEN database_testing_self > 0 THEN 1 ELSE 0 END +
        CASE WHEN banking_self > 0 THEN 1 ELSE 0 END +
        CASE WHEN healthcare_self > 0 THEN 1 ELSE 0 END +
        CASE WHEN ecommerce_self > 0 THEN 1 ELSE 0 END +
        CASE WHEN insurance_self > 0 THEN 1 ELSE 0 END +
        CASE WHEN telecom_self > 0 THEN 1 ELSE 0 END +
        CASE WHEN manual_testing_self > 0 THEN 1 ELSE 0 END +
        CASE WHEN automation_testing_self > 0 THEN 1 ELSE 0 END +
        CASE WHEN regression_testing_self > 0 THEN 1 ELSE 0 END +
        CASE WHEN uat_self > 0 THEN 1 ELSE 0 END +
        CASE WHEN git_self > 0 THEN 1 ELSE 0 END +
        CASE WHEN jenkins_self > 0 THEN 1 ELSE 0 END +
        CASE WHEN docker_self > 0 THEN 1 ELSE 0 END +
        CASE WHEN azure_devops_self > 0 THEN 1 ELSE 0 END +
        CASE WHEN chatgpt_prompt_engineering_self > 0 THEN 1 ELSE 0 END +
        CASE WHEN ai_test_automation_self > 0 THEN 1 ELSE 0 END
    INTO rated_skills
    FROM employees
    WHERE id = employee_id_param;
    
    -- Calculate capability percentage
    capability := ROUND((rated_skills::FLOAT / total_skills::FLOAT) * 100);
    
    -- Update the employee record
    UPDATE employees 
    SET overall_capability = capability, 
        submitted = CASE WHEN rated_skills >= 25 THEN TRUE ELSE FALSE END
    WHERE id = employee_id_param;
    
    RETURN capability;
END;
$$ LANGUAGE plpgsql;

-- Create view for skills summary
CREATE VIEW employee_skills_summary AS
SELECT 
    e.id,
    e.name,
    e.email,
    e.designation,
    e.department,
    e.overall_capability,
    e.submitted,
    -- Technical Skills Summary
    (e.selenium_self + e.appium_self + e.jmeter_self + e.postman_self + e.jira_self + e.testrail_self) as technical_skills_count,
    -- Programming Skills Summary  
    (e.python_self + e.java_self + e.javascript_self + e.typescript_self + e.csharp_self + e.sql_self) as programming_skills_count,
    -- Testing Skills Summary
    (e.api_testing_self + e.mobile_testing_self + e.performance_testing_self + e.security_testing_self + e.database_testing_self) as testing_skills_count,
    -- Domain Skills Summary
    (e.banking_self + e.healthcare_self + e.ecommerce_self + e.insurance_self + e.telecom_self) as domain_skills_count,
    -- Methodology Skills Summary
    (e.manual_testing_self + e.automation_testing_self + e.regression_testing_self + e.uat_self) as methodology_skills_count,
    -- DevOps Skills Summary
    (e.git_self + e.jenkins_self + e.docker_self + e.azure_devops_self) as devops_skills_count,
    -- AI Skills Summary
    (e.chatgpt_prompt_engineering_self + e.ai_test_automation_self) as ai_skills_count
FROM employees e;

COMMIT;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Complete skillmatrix database schema created successfully!';
    RAISE NOTICE '📊 Created employees table with all 32 skills as separate columns';
    RAISE NOTICE '🗄️ Created projects, certifications, and growth_plans tables';
    RAISE NOTICE '🔍 Created indexes and views for optimal performance';
    RAISE NOTICE '📈 Created capability calculation function';
END $$;
