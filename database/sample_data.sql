-- Sample Data for Skill Matrix Application
-- Run this after creating the schema to populate with test data

-- Insert Sample Employees
INSERT INTO employees (
    id, zensar_id, name, email, phone, designation, department, location, 
    years_it, years_zensar, password, primary_skill, primary_domain,
    -- Technical Skills (Self Rating)
    selenium_self, appium_self, jmeter_self, postman_self, jira_self, testrail_self,
    -- Programming Languages
    python_self, java_self, javascript_self, typescript_self, csharp_self, sql_self,
    -- Testing Types
    api_testing_self, mobile_testing_self, performance_testing_self, security_testing_self, database_testing_self,
    -- Domain Knowledge
    banking_self, healthcare_self, ecommerce_self, insurance_self, telecom_self,
    -- Testing Methodologies
    manual_testing_self, automation_testing_self, regression_testing_self, uat_self,
    -- DevOps & Tools
    git_self, jenkins_self, docker_self, azure_devops_self,
    -- AI & Emerging Technologies
    chatgpt_prompt_engineering_self, ai_test_automation_self
) VALUES 
(
    'emp_001', 'Z001', 'John Doe', 'john.doe@zensar.com', '9876543210', 
    'Senior Test Engineer', 'Quality Engineering', 'Pune', 8, 5, 
    '$2b$10$examplehashedpassword', 'Selenium', 'Banking',
    3, 2, 2, 3, 3, 2,
    2, 3, 1, 1, 2, 3,
    3, 2, 2, 1, 2,
    3, 1, 2, 1, 2,
    2, 3, 3, 2,
    3, 2, 2, 1,
    1, 1, 1, 1
),
(
    'emp_002', 'Z002', 'Jane Smith', 'jane.smith@zensar.com', '9876543211', 
    'Test Lead', 'Quality Engineering', 'Bangalore', 10, 7, 
    '$2b$10$examplehashedpassword', 'Java', 'Healthcare',
    3, 1, 3, 3, 3, 3,
    3, 3, 2, 2, 1, 3,
    3, 1, 3, 2, 3,
    2, 3, 1, 2, 1,
    2, 3, 3, 3,
    3, 3, 2, 2,
    2, 2, 1, 2
),
(
    'emp_003', 'Z003', 'Mike Johnson', 'mike.johnson@zensar.com', '9876543212', 
    'Automation Engineer', 'Quality Engineering', 'Hyderabad', 5, 3, 
    '$2b$10$examplehashedpassword', 'Python', 'E-Commerce',
    2, 3, 1, 2, 2, 1,
    3, 2, 3, 2, 1, 2,
    2, 3, 1, 1, 2,
    1, 2, 3, 2, 1,
    1, 2, 2, 1,
    2, 2, 1, 1,
    3, 2, 2, 1
),
(
    'emp_004', 'Z004', 'Sarah Williams', 'sarah.williams@zensar.com', '9876543213', 
    'Performance Tester', 'Quality Engineering', 'Chennai', 6, 4, 
    '$2b$10$examplehashedpassword', 'JMeter', 'Insurance',
    1, 0, 3, 2, 2, 2,
    2, 2, 1, 1, 2, 2,
    2, 1, 3, 1, 2,
    1, 1, 2, 3, 2,
    2, 1, 2, 2,
    1, 1, 2, 1,
    1, 1, 1, 1
),
(
    'emp_005', 'Z005', 'David Brown', 'david.brown@zensar.com', '9876543214', 
    'Manual Tester', 'Quality Engineering', 'Mumbai', 3, 2, 
    '$2b$10$examplehashedpassword', 'Manual Testing', 'Telecom',
    1, 0, 1, 2, 2, 2,
    1, 1, 0, 0, 1, 2,
    2, 0, 1, 0, 1,
    1, 0, 1, 2, 3,
    3, 1, 2, 2,
    1, 0, 1, 2,
    0, 0, 0, 0
);

-- Update some manager ratings and validation
UPDATE employees SET 
    selenium_manager = 3, selenium_validated = true,
    java_manager = 2, java_validated = true,
    api_testing_manager = 3, api_testing_validated = true,
    banking_manager = 3, banking_validated = true,
    submitted = true,
    overall_capability = 75
WHERE id = 'emp_001';

UPDATE employees SET 
    java_manager = 3, java_validated = true,
    jmeter_manager = 3, jmeter_validated = true,
    healthcare_manager = 2, healthcare_validated = true,
    submitted = true,
    overall_capability = 81
WHERE id = 'emp_002';

UPDATE employees SET 
    python_manager = 3, python_validated = true,
    appium_manager = 2, appium_validated = true,
    ecommerce_manager = 2, ecommerce_validated = true,
    submitted = true,
    overall_capability = 69
WHERE id = 'emp_003';

-- Insert Sample Projects
INSERT INTO projects (employee_id, project_name, role, start_date, end_date, description, technologies) VALUES
('emp_001', 'Banking Core System Testing', 'Lead Tester', '2024-01-01', '2024-06-30', 
 'End-to-end testing of core banking system including transaction processing, account management, and security features', 
 ARRAY['Selenium', 'Java', 'API Testing', 'Banking', 'SQL']),
('emp_001', 'Mobile Banking App Testing', 'Test Engineer', '2024-07-01', '2024-12-31', 
 'Testing of mobile banking application for iOS and Android platforms', 
 ARRAY['Appium', 'Java', 'Mobile Testing', 'API Testing']),
('emp_002', 'Healthcare Portal Testing', 'Test Lead', '2023-09-01', '2024-03-31', 
 'Comprehensive testing of healthcare patient management portal', 
 ARRAY['Selenium', 'Java', 'JIRA', 'Healthcare', 'Manual Testing']),
('emp_002', 'Performance Testing Suite', 'Performance Tester', '2024-04-01', '2024-09-30', 
 'Load and stress testing for healthcare system', 
 ARRAY['JMeter', 'Performance Testing', 'Database Testing']),
('emp_003', 'E-Commerce Platform Automation', 'Automation Engineer', '2024-02-01', '2024-08-31', 
 'Develop and implement automation framework for e-commerce platform', 
 ARRAY['Python', 'Selenium', 'JavaScript', 'E-Commerce', 'Git']),
('emp_004', 'Insurance Claims System Load Testing', 'Performance Tester', '2024-03-01', '2024-07-31', 
 'Load testing of insurance claims processing system', 
 ARRAY['JMeter', 'Performance Testing', 'Insurance', 'SQL']),
('emp_005', 'Telecom Network Testing', 'Manual Tester', '2024-01-15', '2024-07-15', 
 'Manual testing of telecom network management system', 
 ARRAY['Manual Testing', 'Telecom', 'JIRA', 'TestRail']);

-- Insert Sample Certifications
INSERT INTO certifications (employee_id, cert_name, issuing_organization, issue_date, expiry_date, credential_id, credential_url) VALUES
('emp_001', 'ISTQB Advanced Level Test Manager', 'ISTQB', '2023-06-15', '2026-06-15', 'ATM-001', 'https://istqb.org'),
('emp_001', 'Selenium Certification', 'Selenium HQ', '2023-03-20', '2025-03-20', 'SEL-001', 'https://selenium.dev'),
('emp_002', 'Java SE 11 Developer', 'Oracle', '2023-08-10', '2025-08-10', 'OCP-001', 'https://oracle.com'),
('emp_002', 'JMeter Certification', 'Apache Foundation', '2023-11-05', '2025-11-05', 'JMT-001', 'https://jmeter.apache.org'),
('emp_003', 'Python Programming', 'Python Institute', '2023-09-15', '2025-09-15', 'PCAP-001', 'https://pythoninstitute.org'),
('emp_003', 'Appium Mobile Testing', 'Appium', '2024-01-20', '2026-01-20', 'APP-001', 'https://appium.io'),
('emp_004', 'Performance Testing Professional', 'Guru99', '2023-07-10', '2025-07-10', 'PTP-001', 'https://guru99.com'),
('emp_005', 'Manual Testing Foundation', 'Udemy', '2023-12-01', '2025-12-01', 'MTF-001', 'https://udemy.com');

-- Insert Sample Growth Plans
INSERT INTO growth_plans (employee_id, skill_name, current_level, target_level, target_date, status, actions) VALUES
('emp_001', 'AI Test Automation', 1, 3, '2024-12-31', 'Active', 
 ARRAY['Complete AI/ML testing course', 'Implement AI in current project', 'Get AI certification']),
('emp_001', 'Docker', 1, 2, '2024-09-30', 'Active', 
 ARRAY['Learn Docker basics', 'Set up test environments', 'Containerize test framework']),
('emp_002', 'Azure DevOps', 1, 3, '2024-11-30', 'Active', 
 ARRAY['Complete Azure DevOps training', 'Implement CI/CD pipeline', 'Migrate 2 projects to Azure']),
('emp_003', 'TypeScript', 1, 2, '2024-10-31', 'Active', 
 ARRAY['Learn TypeScript fundamentals', 'Convert JS automation to TS', 'Implement type safety']),
('emp_004', 'Security Testing', 1, 2, '2024-08-31', 'Active', 
 ARRAY['Learn security testing concepts', 'Complete security testing tools training', 'Perform security audit']),
('emp_005', 'Selenium', 1, 2, '2024-09-30', 'Active', 
 ARRAY['Learn Selenium basics', 'Create simple test scripts', 'Assist in automation project']);

-- Update some growth plans with progress
UPDATE growth_plans SET progress = 60, status = 'In Progress' WHERE employee_id = 'emp_001' AND skill_name = 'Docker';
UPDATE growth_plans SET progress = 40, status = 'In Progress' WHERE employee_id = 'emp_002' AND skill_name = 'Azure DevOps';
UPDATE growth_plans SET progress = 75, status = 'In Progress' WHERE employee_id = 'emp_003' AND skill_name = 'TypeScript';

-- Insert a completed growth plan
INSERT INTO growth_plans (employee_id, skill_name, current_level, target_level, target_date, status, actions, progress) VALUES
('emp_001', 'Git', 1, 3, '2024-03-31', 'Completed', 
 ARRAY['Learn Git basics', 'Implement Git workflow', 'Train team members'], 100);

-- Update overall capabilities for all employees
SELECT calculate_overall_capability('emp_001');
SELECT calculate_overall_capability('emp_002');
SELECT calculate_overall_capability('emp_003');
SELECT calculate_overall_capability('emp_004');
SELECT calculate_overall_capability('emp_005');

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Sample data inserted successfully!';
    RAISE NOTICE '👥 Created 5 sample employees';
    RAISE NOTICE '📁 Created 7 sample projects';
    RAISE NOTICE '🏆 Created 8 sample certifications';
    RAISE NOTICE '📈 Created 6 sample growth plans';
    RAISE NOTICE '🎯 Updated skill ratings and capabilities';
    RAISE NOTICE '🚀 Ready to test the application!';
END $$;
