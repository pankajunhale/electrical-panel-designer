# Auth.js Setup Guide

This guide explains how to complete the Auth.js setup for your EP Designer application.

## 🚀 Setup Steps

### 1. Environment Variables
Copy `.env.example` to `.env.local` and fill in your values:
```bash
cp .env.example .env.local
```

Update the following variables:
- `DATABASE_URL`: Your MS SQL Server connection string
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL`: Your application URL (http://localhost:3000 for dev)

### 2. Database Migration
Push the new Auth.js tables to your database:
```bash
npm run db:push
```

### 3. Create Default Role
Ensure you have a default role in your database. Run this SQL or use Prisma Studio:
```sql
INSERT INTO roles (id, name, created_at, version) 
VALUES (NEWID(), 'User', GETDATE(), 1);
```

### 4. Test the Setup
1. Start your development server: `npm run dev`
2. Navigate to `/auth/login`
3. Try registering a new user
4. Test login/logout functionality

## 🔧 Key Features

### Authentication Flow
- **Registration**: Creates user with hashed password and default role
- **Login**: Validates credentials and creates JWT session
- **Logout**: Clears session and redirects to login
- **Route Protection**: Middleware protects `/cp/*` routes

### Session Management
- JWT-based sessions (no database sessions for better performance)
- 30-day expiration
- Role and team information included in session

### Security Features
- Password hashing with bcryptjs (12 rounds)
- CSRF protection built-in
- Secure cookie settings
- Input validation with Zod schemas

## 🛡️ Route Protection

### Middleware
The middleware protects routes automatically:
- Redirects unauthenticated users to `/auth/login`
- Redirects authenticated users away from auth pages
- Protects all `/cp/*` routes

### Server-side Auth Checks
Use these utilities in your server components/actions:

```typescript
import { getCurrentUser, requireAuth, requireRole } from "@/lib/session";

// Get current user (optional)
const user = await getCurrentUser();

// Require authentication
const user = await requireAuth();

// Require specific role
const user = await requireRole(["Admin", "Manager"]);
```

### Client-side Auth
Use NextAuth hooks in client components:

```typescript
import { useSession, signIn, signOut } from "next-auth/react";

function MyComponent() {
  const { data: session, status } = useSession();
  
  if (status === "loading") return <p>Loading...</p>;
  if (status === "unauthenticated") return <button onClick={() => signIn()}>Sign in</button>;
  
  return (
    <div>
      <p>Welcome {session.user.name}!</p>
      <p>Role: {session.user.role}</p>
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  );
}
```

## 📋 Integration with Existing Code

### User Model
Your existing User model is fully integrated:
- `passwordHash` field for credential storage
- `roleId` for role-based access control
- `userTeams` for team-based permissions

### Validation
Uses your existing Zod schemas:
- `loginSchema` for sign-in validation
- `registerSchema` for registration validation

### Database
Compatible with your MS SQL Server setup:
- Uses Prisma adapter for Auth.js
- Adds required Auth.js tables (Account, Session, VerificationToken)
- Maintains your existing schema structure

## 🎯 Next Steps

1. **Customize Role Permissions**: Update middleware for role-based route protection
2. **Team Access Control**: Implement team-specific route protection
3. **Email Verification**: Add email verification for new registrations
4. **Password Reset**: Implement password reset functionality
5. **Social Login**: Add OAuth providers if needed

## 🔍 Troubleshooting

### Common Issues

1. **"Invalid credentials" error**: Check if user exists and password is correct
2. **Redirect loops**: Verify middleware configuration and auth pages setup
3. **Database connection**: Ensure DATABASE_URL is correct for MS SQL Server
4. **Session not persisting**: Check NEXTAUTH_SECRET is set

### Debug Mode
Add this to your `.env.local` for detailed Auth.js logs:
```
NEXTAUTH_DEBUG=true
```

## 📚 Additional Resources

- [Auth.js Documentation](https://next-auth.js.org/)
- [Prisma Auth Guide](https://www.prisma.io/docs/guides/other/authentication)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)