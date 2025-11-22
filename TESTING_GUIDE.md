# Admin Dashboard Testing Guide

This guide will help you test all the admin features we've implemented.

## Setup & Prerequisites

### 1. Database Setup
Before testing, ensure your database is up to date:

```bash
# Generate Prisma client (if you see type errors)
pnpm prisma generate

# Push schema changes to database (if needed)
pnpm prisma db push

# Or run migrations
pnpm prisma migrate dev
```

### 2. Admin Access Setup
Ensure you're logged in as an admin user:

**Option A: Using adminUserIds**
- Your user ID must be in the `adminUserIds` array in `src/lib/auth.ts`
- Current admin ID: `"Mc6evwyM5GkHOSSxSKjOcBHmciSfdboq"`

**Option B: Using admin role**
- Set your user's role to "admin" in the database:
```sql
UPDATE "user" SET role = 'admin' WHERE email = 'your-email@example.com';
```

### 3. Access the Admin Dashboard
- Navigate to: `http://localhost:3000/admin`
- If not logged in, you'll be redirected to `/login`
- If you see "Access Denied", check your admin status

## Testing Checklist

### 1. Admin Dashboard Overview (`/admin`)

**Test Steps:**
- [ ] Navigate to `/admin`
- [ ] Verify you see 4 stats cards:
  - Total Users
  - Active Sessions
  - Banned Users
  - Administrators
- [ ] Check that numbers are accurate
- [ ] Verify the User Growth chart is displayed

**Expected Results:**
- Stats cards show correct counts
- Chart displays user growth data
- Sidebar navigation is visible

---

### 2. User Management (`/admin/users`)

#### 2.1 View Users List
- [ ] Navigate to `/admin/users`
- [ ] Verify user table displays:
  - Name and email
  - Role badge
  - Status (Active/Banned)
  - Join date
  - Actions dropdown
- [ ] Test search functionality
- [ ] Test pagination (if more than 10 users)

#### 2.2 Create New User
- [ ] Click "Create user" button
- [ ] Fill in the form:
  - Name: "Test User"
  - Email: "test@example.com"
  - Password: "password123"
  - Role: Select "user" or "admin"
- [ ] Click "Create user"
- [ ] Verify success toast appears
- [ ] Verify new user appears in the table

#### 2.3 Edit User
- [ ] Click the actions menu (three dots) on any user
- [ ] Click "Edit user"
- [ ] Modify name, email, or role
- [ ] Click "Save changes"
- [ ] Verify success toast
- [ ] Verify changes are reflected in the table

#### 2.4 Ban User
- [ ] Click actions menu on a user
- [ ] Click "Ban user"
- [ ] Enter a reason (e.g., "Violation of terms")
- [ ] Optionally set duration in days
- [ ] Click "Ban user"
- [ ] Verify success toast
- [ ] Verify user status shows "Banned" badge

#### 2.5 Unban User
- [ ] Click actions menu on a banned user
- [ ] Click "Unban user"
- [ ] Click "Unban"
- [ ] Verify success toast
- [ ] Verify user status shows "Active" badge

#### 2.6 Impersonate User
- [ ] Click actions menu on a user
- [ ] Click "Impersonate"
- [ ] Verify success toast
- [ ] Verify you're redirected and logged in as that user
- [ ] Check that you can see their perspective

---

### 3. Session Management (`/admin/sessions`)

**Test Steps:**
- [ ] Navigate to `/admin/sessions`
- [ ] Verify table displays:
  - User name and email
  - IP Address
  - User Agent
  - Expiration date
  - Status (Active/Expired)
  - Revoke button
- [ ] Test revoking a session:
  - [ ] Click "Revoke" on any active session
  - [ ] Verify success toast
  - [ ] Verify session is removed or marked as expired

**Expected Results:**
- All active sessions are listed
- Revoke functionality works correctly
- Expired sessions show correct status

---

### 4. Analytics (`/admin/analytics`)

**Test Steps:**
- [ ] Navigate to `/admin/analytics`
- [ ] Verify statistics are displayed:
  - Total Users
  - Teachers
  - Students
  - Banned Users
  - Active Sessions
- [ ] Verify numbers match actual data

**Expected Results:**
- All metrics are accurate
- Data updates when you refresh

---

### 5. Settings (`/admin/settings`)

**Test Steps:**
- [ ] Navigate to `/admin/settings`
- [ ] Verify settings information is displayed
- [ ] Check that current admin email is shown

**Expected Results:**
- Settings page loads correctly
- Admin information is accurate

---

## Advanced Testing Scenarios

### Test Access Control

1. **Non-admin user access:**
   - Log in as a regular user (not admin)
   - Try to access `/admin`
   - Should be redirected to `/login` or get access denied

2. **Admin role check:**
   - Verify users with `role: "admin"` can access
   - Verify users in `adminUserIds` can access

### Test Error Handling

1. **Invalid user creation:**
   - Try creating a user with existing email
   - Should show error message

2. **Network errors:**
   - Disconnect network
   - Try performing admin actions
   - Should show appropriate error messages

### Test UI/UX

1. **Responsive design:**
   - Test on mobile, tablet, desktop
   - Verify sidebar collapses correctly
   - Check table responsiveness

2. **Loading states:**
   - Verify loading indicators during API calls
   - Check disabled states on buttons during operations

3. **Toast notifications:**
   - Verify success toasts appear
   - Verify error toasts appear
   - Check toast auto-dismiss

---

## Quick Test Script

Run through this quick test to verify everything works:

```bash
# 1. Start your dev server
pnpm dev

# 2. In browser:
# - Go to http://localhost:3000/admin
# - Log in as admin user
# - Test each page navigation
# - Create a test user
# - Edit the test user
# - Ban the test user
# - Unban the test user
# - View sessions
# - Revoke a session
# - Check analytics
# - View settings
```

---

## Common Issues & Solutions

### Issue: "Access Denied" or redirect to login
**Solution:** 
- Check your user ID is in `adminUserIds` in `src/lib/auth.ts`
- Or set your user's role to "admin" in the database

### Issue: "Table does not exist" error
**Solution:**
- Run database migrations: `pnpm prisma migrate dev`
- Or push schema: `pnpm prisma db push`

### Issue: API errors when creating/editing users
**Solution:**
- Check browser console for detailed error messages
- Verify Better Auth admin plugin is properly configured
- Check network tab for API request/response details

### Issue: Impersonation not working
**Solution:**
- Verify Better Auth session cookies are set
- Check that impersonation is enabled in admin plugin
- Verify user has permission to impersonate

---

## Database Queries for Testing

You can use these Prisma queries in your database to set up test data:

```typescript
// Make a user an admin
await prisma.user.update({
  where: { email: "admin@example.com" },
  data: { role: "admin" }
});

// Create a test user
await prisma.user.create({
  data: {
    name: "Test User",
    email: "test@example.com",
    // ... other fields
  }
});

// Check admin users
await prisma.user.findMany({
  where: {
    OR: [
      { role: "admin" },
      { id: { in: ["Mc6evwyM5GkHOSSxSKjOcBHmciSfdboq"] } }
    ]
  }
});
```

---

## Next Steps

After testing, you may want to:
1. Add more detailed error messages
2. Implement bulk operations (ban multiple users)
3. Add export functionality for user data
4. Add more analytics charts
5. Implement audit logging for admin actions

