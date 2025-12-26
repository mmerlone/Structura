# Database Recreation Guide

This guide provides step-by-step instructions to completely wipe and recreate your Supabase database from scratch using the schema backup.

## 🚨 Important Warnings

- **This is a destructive operation** that will permanently delete all data
- **Cannot be undone** once completed
- **Backup your current data** before proceeding if you need it
- **Stop your application** during this process to prevent conflicts

## 📋 Prerequisites

1. **Environment Setup**: Ensure your `.env.local` file contains:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your_project.supabase.co
   SUPABASE_PROJECT_ID=your_project_id
   SUPABASE_DB_PASSWORD=your_database_password
   ```

2. **Schema Backup**: You should have a recent schema backup file in `backups/` directory
   - Current available: `frvujodbkfodtraxfcwa_schema_backup_2025-12-01T02-14-12-520Z.sql`
   - Size: ~143KB (complete schema with all objects)

3. **Required Tools**:
   - PostgreSQL client tools (`psql`, `pg_dump`)
   - Node.js and pnpm
   - Project dependencies installed

## 🗃️ Schema Backup Analysis

The existing schema backup (`frvujodbkfodtraxfcwa_schema_backup_2025-12-01T02-14-12-520Z.sql`) contains:

- ✅ **Complete schema structure** (4,974 lines)
- ✅ **All Supabase schemas** (auth, extensions, graphql, realtime, storage, etc.)
- ✅ **All tables** (including `public.profiles`)
- ✅ **All functions** (auth functions, custom functions, triggers)
- ✅ **All constraints and indexes**
- ✅ **Proper PostgreSQL dump format** (version 17.6)

The backup is **complete and suitable for full reconstruction**.

## � Database Recreation Workflow

### 1. Stop Services

```bash
# Stop development server
pkill -f "next dev"
```

### 2. Create Backup (Recommended)

```bash
# Create a full database backup
pnpm run db:backup:full
```

### 3. Wipe and Restore Database

## 🛠️ Database Management Scripts

The project includes these npm scripts for database operations:

| Command                        | Description                           |
| ------------------------------ | ------------------------------------- |
| `pnpm run db:wipe`             | Completely drops all database objects |
| `pnpm run db:restore`          | Restores from schema backup           |
| `pnpm run db:migrations:sync`  | Syncs migration history               |
| `pnpm run db:backup:structure` | Creates new schema backup             |
| `pnpm run db:backup:full`      | Creates full data backup              |
| `pnpm run gen:types`           | Regenerates TypeScript types          |

```bash
# Wipe the existing database (type WIPE_DATABASE_CONFIRM when prompted)
pnpm run db:wipe

# Restore from the latest schema backup
pnpm run db:restore
```

### 4. Sync Migrations and Generate Types

```bash
# Sync migration history
pnpm run db:migrations:sync

# Regenerate TypeScript types
pnpm run gen:types
```

### 5. Verify the Setup

```bash
# Start the development server
pnpm run dev
```

Test the following functionality:

- User registration/login
- Profile management
- Database operations
- API endpoints

This script will:

- Ensure the migration history table exists
- Sync migrations from `supabase/migrations/` directory
- Update the database to match your codebase
- Handle missing/outdated migrations appropriately

### Step 6: Regenerate TypeScript Types

```bash
# Generate fresh TypeScript types from the restored database
pnpm run gen:types
```

### Step 7: Verify the Recreation

## 🔍 Verification Steps

After completing the recreation, verify the setup:

1. **Check Database Objects**:

   ```sql
   -- List all tables in public schema
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public';
   ```

2. **Verify Migration History**:

   ```sql
   -- Check applied migrations
   SELECT * FROM supabase_migrations.schema_migrations;
   ```

3. **Test Application**:
   - Start your application with `pnpm run dev`
   - Verify authentication works
   - Test critical database operations
   - Check for any errors in logs

## 🚀 Next Steps

1. **For Development**:
   - Your database is now ready for development
   - You can start adding new migrations as needed

2. **For Production**:
   - Verify all data was restored correctly
   - Run your test suite
   - Monitor for any issues

## 📚 Related Documentation

- [Database Management Scripts](../scripts/README.md)
- [Supabase Documentation](https://supabase.com/docs/guides/database)

## 🛠️ Required Tools

=== "Linux (Debian/Ubuntu)"

````bash
    sudo apt update
    sudo apt install postgresql-client
    pg_dump --version
    ```

=== "macOS (Homebrew)"
`bash
    brew install libpq
    echo 'export PATH="/opt/homebrew/opt/libpq/bin:$PATH"' >> ~/.zshrc
    source ~/.zshrc
    pg_dump --version
    `

=== "Windows"
`powershell
    # Install via Chocolatey
    choco install postgresql
    # Or download from postgresql.org/download/windows/
    `

    Verify in Command Prompt:
    ```
    pg_dump --version
    ```

**4. Migration Sync Issues**

````

migration history table does not exist

````

**Solution**: This is normal after a complete wipe. The sync script will create the table automatically.

### Recovery from Failures

If the process fails at any step:

1. **Identify the failure point** from error messages
2. **Check database state** with manual psql commands
3. **Re-run the failed step** if appropriate
4. **Start over** if necessary (the wipe script is idempotent)

## 📊 What Gets Recreated

After successful completion, you'll have:

- ✅ **Clean database schema** matching your backup
- ✅ **All original tables** (profiles, etc.)
- ✅ **All functions and triggers**
- ✅ **Proper constraints and indexes**
- ✅ **Clean migration history**
- ✅ **Fresh TypeScript types**

## 🔄 One-Command Process

For advanced users, you can combine steps:

```bash
# Complete recreation in one command chain
pnpm run db:wipe && pnpm run db:restore && pnpm run db:migrations:sync && pnpm run gen:types
````

## 📞 Support

If you encounter issues:

1. Check the error logs carefully
2. Verify your environment variables
3. Ensure PostgreSQL client tools are installed
4. Check Supabase project status (not paused)
5. Review this documentation for common solutions

---

**⚠️ Remember**: This process destroys all data. Proceed with caution and ensure you have proper backups if needed.
