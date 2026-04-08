# PostgreSQL Migration Guide

This guide will help you migrate from Power Automate + SQL Server to direct PostgreSQL connection.

## Prerequisites

1. **Install PostgreSQL** on your system:
   - Windows: Download from https://www.postgresql.org/download/windows/
   - Mac: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql postgresql-contrib`

2. **Create Database**:
   ```sql
   -- Connect to PostgreSQL as postgres user
   psql -U postgres
   
   -- Create database and user
   CREATE DATABASE skillmatrix;
   CREATE USER skillmatrix_user WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE skillmatrix TO skillmatrix_user;
   
   -- Connect to the new database
   \c skillmatrix
   
   -- Grant schema permissions
   GRANT ALL ON SCHEMA public TO skillmatrix_user;
   ```

## Setup Steps

### 1. Update Dependencies
```bash
# Remove old mssql package and install pg
npm uninstall mssql
npm install pg
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and update with your PostgreSQL credentials:
```bash
cp .env.example .env
```

Update `.env` with your actual database settings:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=skillmatrix
DB_USER=skillmatrix_user
DB_PASSWORD=your_secure_password
```

### 3. Initialize Database Schema
Run the schema file to create tables:
```bash
psql -U skillmatrix_user -d skillmatrix -f database/schema.sql
```

Or let the application auto-create tables on first run (recommended for development).

### 4. Update Application Files

The migration includes these key changes:

#### New Files:
- `server-postgres.cjs` - New server with PostgreSQL connection
- `src/lib/database.ts` - Database connection module
- `database/schema.sql` - PostgreSQL schema definition
- `.env.example` - Environment configuration template

#### Modified Files:
- `package.json` - Updated dependencies and server script

### 5. Data Migration (Optional)

If you need to migrate existing data from SQL Server:

1. **Export from SQL Server**:
   ```sql
   -- Export employees
   SELECT * FROM employees;
   
   -- Export skills
   SELECT * FROM skills;
   
   -- Export projects
   SELECT * FROM projects;
   
   -- Export certifications
   SELECT * FROM certifications;
   ```

2. **Import to PostgreSQL**:
   ```sql
   -- Import employees (adjust column names as needed)
   COPY employees (id, zensar_id, name, email, phone, designation, department, location, years_it, years_zensar, password, overall_capability, submitted, resume_uploaded, primary_skill, primary_domain)
   FROM 'employees.csv' WITH CSV HEADER;
   
   -- Similar for other tables
   ```

## Testing the Migration

1. **Start the application**:
   ```bash
   npm run dev
   ```

2. **Verify database connection**:
   - Check console for "📦 Connected to PostgreSQL database"
   - Check for "✅ Database tables initialized successfully"

3. **Test API endpoints**:
   ```bash
   # Test employees endpoint
   curl http://localhost:3001/api/employees
   
   # Test registration
   curl -X POST http://localhost:3001/api/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
   ```

## Key Differences

### SQL Syntax Changes:
- `@parameter` → `$1, $2, $3` (parameterized queries)
- `GETDATE()` → `CURRENT_TIMESTAMP`
- `NVARCHAR` → `VARCHAR`
- `BIT` → `BOOLEAN`

### Connection Changes:
- Removed Power Automate HTTP calls
- Direct database connection using connection pooling
- Automatic table creation on startup
- Better error handling and logging

## Benefits of PostgreSQL Migration

✅ **Better Performance**: Direct database connection eliminates HTTP overhead
✅ **Cost Savings**: No Power Automate licensing costs
✅ **More Control**: Full control over database schema and queries
✅ **Better Security**: Direct database connections with proper authentication
✅ **Easier Development**: Local development without cloud dependencies
✅ **Scalability**: PostgreSQL can handle large datasets efficiently

## Troubleshooting

### Connection Issues:
- Check PostgreSQL service is running
- Verify database credentials in `.env`
- Ensure database and user exist with proper permissions

### Schema Issues:
- Run `database/schema.sql` manually if auto-creation fails
- Check PostgreSQL logs for detailed error messages

### Performance Issues:
- Add indexes to frequently queried columns
- Consider connection pooling settings in `src/lib/database.ts`

## Next Steps

1. Test all application features thoroughly
2. Set up database backups
3. Configure production database settings
4. Update deployment scripts for PostgreSQL
5. Consider adding database migrations for future schema changes
