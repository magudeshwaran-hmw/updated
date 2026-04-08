# PostgreSQL Installation Guide for Windows

## Step 1: Download PostgreSQL

1. **Open your web browser** and go to: https://www.postgresql.org/download/windows/

2. **Click the big "Download" button** for the latest version (usually PostgreSQL 16 or 17)

3. **You'll see options like:**
   - "Download the installer"
   - "Download EDB installer" ⭐ **Choose this one** (easier for beginners)

4. **Select your Windows version** (usually Windows x86-64)

5. **Click "Download"** again to start the download

## Step 2: Run the Installer

1. **Open your Downloads folder**
2. **Double-click the installer file** (looks like: `postgresql-16.x-x.exe`)

3. **Windows Security Warning** may appear → **Click "Run"**

## Step 3: Installation Wizard

### Screen 1: Welcome
- **Click "Next >"**

### Screen 2: Installation Directory
- **Keep the default** (usually `C:\Program Files\PostgreSQL\16`)
- **Click "Next >"**

### Screen 3: Select Components
- **Keep all checkboxes checked** (PostgreSQL Server, pgAdmin 4, Stack Builder)
- **Click "Next >"**

### Screen 4: Data Directory
- **Keep the default** (usually `C:\Program Files\PostgreSQL\16\data`)
- **Click "Next >"**

### Screen 5: Password ⚠️ **IMPORTANT**
- **Enter a password** for the `postgres` superuser
- **Write it down somewhere safe** - you'll need it!
- **Example password**: `postgres123` (choose your own)
- **Confirm password** in the second field
- **Click "Next >"**

### Screen 6: Port
- **Keep the default port** (5432)
- **Click "Next >"**

### Screen 7: Locale
- **Keep the default** (Default locale)
- **Click "Next >"**

### Screen 8: Ready to Install
- **Review your settings**
- **Click "Next >"**

## Step 4: Installation Progress

- **Wait for the installation to complete** (takes 2-5 minutes)
- **You'll see a progress bar**

## Step 5: Stack Builder (Optional)

1. **When asked about Stack Builder:**
   - **Uncheck "Launch Stack Builder at exit?"**
   - **Click "Finish"**

2. **Installation complete!** ✅

## Step 6: Create Your Database

### Option A: Using pgAdmin (GUI Method - Recommended for Beginners)

1. **Open pgAdmin 4** from your Start Menu
2. **Right-click on "Servers"** → **"Register"** → **"Server..."**
3. **General tab:**
   - Name: `skillmatrix_db`
4. **Connection tab:**
   - Host name/address: `localhost`
   - Port: `5432`
   - Maintenance database: `postgres`
   - Username: `postgres`
   - Password: *(the password you set in Step 3)*
5. **Click "Save"**
6. **Double-click your new server** to connect
7. **Right-click "Databases"** → **"Create"** → **"Database..."**
8. **Database name:** `skillmatrix`
9. **Click "Save"**

### Option B: Using Command Line (Advanced)

1. **Open Command Prompt** as Administrator
2. **Navigate to PostgreSQL bin folder:**
   ```cmd
   cd "C:\Program Files\PostgreSQL\16\bin"
   ```
3. **Connect to PostgreSQL:**
   ```cmd
   psql -U postgres
   ```
4. **Enter your password** when prompted
5. **Create database:**
   ```sql
   CREATE DATABASE skillmatrix;
   ```
6. **Create user:**
   ```sql
   CREATE USER skillmatrix_user WITH PASSWORD 'your_password_here';
   GRANT ALL PRIVILEGES ON DATABASE skillmatrix TO skillmatrix_user;
   ```
7. **Exit:**
   ```sql
   \q
   ```

## Step 7: Configure Your Application

1. **Copy the environment file:**
   ```cmd
   copy .env.example .env
   ```

2. **Edit `.env` file** with Notepad or VS Code:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=skillmatrix
   DB_USER=skillmatrix_user
   DB_PASSWORD=your_password_here
   ```

## Step 8: Test the Connection

1. **Open Command Prompt** in your project folder
2. **Run your application:**
   ```cmd
   npm run dev
   ```

3. **Look for these messages:**
   - `📦 Connected to PostgreSQL database`
   - `✅ Database tables initialized successfully`

## Troubleshooting

### Problem: "Connection refused"
**Solution:** Make sure PostgreSQL service is running
1. **Open Services** (press Win+R, type `services.msc`)
2. **Find "postgresql-x64-16"**
3. **Right-click → "Start"** if it's not running

### Problem: "Password authentication failed"
**Solution:** Double-check your password in `.env` file

### Problem: "Database does not exist"
**Solution:** Make sure you created the `skillmatrix` database

## Quick Reference

- **Default Port:** 5432
- **Default User:** postgres
- **Default Password:** *(what you set during installation)*
- **Database Name:** skillmatrix
- **Application User:** skillmatrix_user

## Next Steps

Once PostgreSQL is installed and configured:
1. Your application will auto-create tables on first run
2. All API endpoints will work with PostgreSQL
3. You can manage data using pgAdmin or SQL commands

## Need Help?

If you get stuck at any step:
1. **Take a screenshot** of where you are
2. **Note the error message**
3. **Ask for specific help** with that step

The most common issues are:
- Wrong password in `.env` file
- PostgreSQL service not running
- Database not created

Good luck! 🚀
