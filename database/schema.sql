-- PostgreSQL Schema for Skill Matrix Application
-- Run this script to create the database structure

-- Create database (run as postgres user)
-- CREATE DATABASE skillmatrix;
-- CREATE USER skillmatrix_user WITH PASSWORD 'your_password';
-- GRANT ALL PRIVILEGES ON DATABASE skillmatrix TO skillmatrix_user;

-- Connect to the database first, then run:

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skills table (32 skills per employee)
CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES employees(id) ON DELETE CASCADE,
    skill_name VARCHAR(255) NOT NULL,
    self_rating INTEGER DEFAULT 0 CHECK (self_rating >= 0 AND self_rating <= 3),
    manager_rating INTEGER CHECK (manager_rating >= 0 AND manager_rating <= 3),
    validated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, skill_name)
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
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
CREATE TABLE IF NOT EXISTS certifications (
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
CREATE TABLE IF NOT EXISTS growth_plans (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES employees(id) ON DELETE CASCADE,
    skill_id VARCHAR(50),
    current_level INTEGER DEFAULT 0 CHECK (current_level >= 0 AND current_level <= 3),
    target_level INTEGER DEFAULT 0 CHECK (target_level >= 0 AND target_level <= 3),
    target_date DATE,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    status VARCHAR(50) DEFAULT 'Active',
    actions TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_zensar_id ON employees(zensar_id);
CREATE INDEX IF NOT EXISTS idx_skills_employee_id ON skills(employee_id);
CREATE INDEX IF NOT EXISTS idx_projects_employee_id ON projects(employee_id);
CREATE INDEX IF NOT EXISTS idx_certifications_employee_id ON certifications(employee_id);
CREATE INDEX IF NOT EXISTS idx_growth_plans_employee_id ON growth_plans(employee_id);

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

CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON skills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certifications_updated_at BEFORE UPDATE ON certifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_growth_plans_updated_at BEFORE UPDATE ON growth_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional)
-- This would be replaced by your actual data migration
INSERT INTO employees (id, zensar_id, name, email, designation, department) VALUES
('emp_001', 'Z001', 'John Doe', 'john.doe@zensar.com', 'Senior Test Engineer', 'Quality Engineering')
ON CONFLICT (id) DO NOTHING;

-- Sample skills for the employee
INSERT INTO skills (employee_id, skill_name, self_rating) VALUES
('emp_001', 'Selenium', 3),
('emp_001', 'Java', 2),
('emp_001', 'API Testing', 3)
ON CONFLICT (employee_id, skill_name) DO NOTHING;
