# 🚀 Production Deployment Guide

## Overview
This guide covers the deployment process for the Aadhaar UCL (Update Client) application with a focus on database schema consistency and proper migration management.

## ✅ Current Database Schema Status

### Migration Status
- **Total Migrations**: 11 files
- **All Migrations Applied**: ✅ Yes
- **Latest Migration**: `2025-09-21T12-00-00.000Z_add_form_columns.sql`
- **Schema Version**: Complete and production-ready

### Database Tables
| Table | Rows | Status | Description |
|-------|------|--------|-------------|
| user | 1 | ✅ Active | Better Auth user table with custom fields |
| account | 7 | ✅ Active | Authentication accounts |
| session | 61 | ✅ Active | User sessions |
| verification | 0 | ✅ Active | Email verification tokens |
| correction_requests | 4 | ✅ Active | Aadhaar correction requests (48 columns) |
| transactions | 27 | ✅ Active | Payment transaction history |
| schema_migrations | 11 | ✅ Active | Migration tracking |

### Form Schema Consistency
The form submission system is fully consistent with the database schema:

- **Total Columns**: 48 fields
- **Required Fields**: All properly validated
- **Data Types**: Correct for all fields
- **Constraints**: All NOT NULL constraints enforced
- **Indexes**: Optimized for performance queries

## 📋 Production Deployment Steps

### 1. Environment Variables Setup
```bash
# Required environment variables for production
DATABASE_URL=postgresql://user:password@host:port/database
BETTER_AUTH_SECRET=your-super-secret-key-here
NEXT_PUBLIC_BASE_URL=https://your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
RESEND_API_SECRET=your-resend-api-key
KUKUPAY_API_KEY=your-kukupay-api-key
KUKUPAY_API_URL=https://kukupay.pro/pay/create
WEBHOOK_URL=https://your-domain.com/api/webhook
```

### 2. Database Setup
```bash
# 1. Create PostgreSQL database
createdb your_database_name

# 2. Set environment variables
export DATABASE_URL="postgresql://user:password@localhost:5432/your_database_name"

# 3. Run migrations (this happens automatically on startup)
npm run migrate

# 4. Verify migrations
node scripts/run-migrations.js
```

### 3. Build and Deploy
```bash
# Build the application
npm run build

# Start with automatic migrations
npm start
```

The `npm start` command automatically:
1. Waits for database to be ready
2. Runs all pending migrations
3. Creates default users (admin and operator)
4. Starts the Next.js application

## 🔧 Migration System

### Migration Files
All migration files are located in `better-auth_migrations/`:

1. `0000-00-00T00-00-00.000Z_setup_extensions.sql` - PostgreSQL extensions
2. `2025-09-17T10-49-11.092Z.sql` - Better Auth core tables
3. `2025-09-17T16-33-20.000Z_correction_requests.sql` - Core correction requests table
4. `2025-09-17T16-41-20.000Z_user_management.sql` - User management fields
5. `2025-09-18T00-00-00.000Z_transactions.sql` - Transaction history
6. `2025-09-18T01-00-00.000Z_add_balance_to_users.sql` - User balance field
7. `2025-09-19T10-00-00.000Z_add_roles_and_user_management.sql` - Role-based access
8. `2025-09-19T15-30-00.000Z_add_is_blocked_column.sql` - User blocking
9. `2025-09-20T11-00-00.000Z_add_operator_fields.sql` - Operator management
10. `003_add_password_change_log.sql` - Password change tracking
11. `2025-09-21T12-00-00.000Z_add_form_columns.sql` - **Latest: Form expansion**

### Key Schema Changes (Form Submission)
The latest migration (`2025-09-21T12-00-00.000Z_add_form_columns.sql`) added 26 new columns to support the complete Aadhaar correction form:

**Bilingual Support:**
- `name_hindi`, `co_hindi`, `house_no_hindi`, `street_hindi`, `landmark_hindi`
- `area_hindi`, `city_hindi`, `post_office_hindi`, `district_hindi`, `sub_district_hindi`, `state_hindi`

**Family Information:**
- `head_of_family_name`, `head_of_family_name_hindi`, `relationship`, `relationship_hindi`
- `relative_aadhaar`, `relative_contact`, `same_address`

**Documentation:**
- `age`, `npr_receipt`, `dob_proof_type`, `identity_proof_type`, `address_proof_type`, `por_document_type`
- `appointment_id`, `residential_status`

## 🚨 Important Notes

### 1. Migration Safety
The migration system includes robust error handling:
- ✅ Tables are created with `IF NOT EXISTS`
- ✅ Existing relations are handled gracefully
- ✅ Migrations are tracked to prevent duplicates
- ✅ Rollback on failure with detailed error logging

### 2. Data Integrity
- ✅ All foreign key constraints are properly enforced
- ✅ Orphaned records are prevented
- ✅ Data validation at application and database levels
- ✅ Indexes optimized for common query patterns

### 3. Default Users
The system automatically creates:
- **Admin User**: `ADMIN001` / `admin123` (role: admin)
- **Operator User**: `DEFAULT_OP001` / `operator123` (role: operator)

## 🔍 Troubleshooting

### Common Issues
1. **Migration Failures**: Check database connection and permissions
2. **Missing Columns**: Verify latest migration was applied
3. **Schema Mismatches**: Run migration check script
4. **Permission Issues**: Ensure database user has CREATE/ALTER permissions

### Verification Commands
```bash
# Check migration status
node scripts/run-migrations.js

# Verify schema consistency
node -e "
const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// Add verification code from earlier check
"
```

## 📊 Performance Considerations

### Database Indexes
The schema includes optimized indexes for:
- `correction_requests`: aadhaar_number, user_id, status, created_at
- `transactions`: user_id, status, type, order_id, created_at
- `user`: balance, role, operator_uid, status

### Query Optimization
- All queries use parameterized statements
- Foreign key constraints are indexed
- Common filter patterns have dedicated indexes

## ✅ Deployment Checklist

- [ ] Set all required environment variables
- [ ] Ensure PostgreSQL database is accessible
- [ ] Verify database user has proper permissions
- [ ] Test database connection
- [ ] Run migrations manually (optional)
- [ ] Build the application
- [ ] Start with migration script
- [ ] Verify admin login works
- [ ] Test form submission end-to-end
- [ ] Check admin interface functionality

## 🎯 Conclusion

The database schema is **production-ready** with:
- ✅ All migrations applied successfully
- ✅ Form submission schema is fully consistent
- ✅ Proper constraints and indexes in place
- ✅ Robust migration system with error handling
- ✅ Automated deployment scripts

The application can be safely deployed to production using the standard `npm start` command, which handles migrations and user setup automatically.