# Prisma Setup Guide

This project has been migrated from direct SQL Server usage to Prisma ORM with SQL Server.

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="sqlserver://localhost:1433;database=ep_designer;user=your_username;password=your_password;trustServerCertificate=true"

# Next.js
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Generate Prisma Client

```bash
npm run db:generate
```

### 4. Push Schema to Database

```bash
npm run db:push
```

### 5. (Optional) Create Migration

```bash
npm run db:migrate
```

### 6. (Optional) Open Prisma Studio

```bash
npm run db:studio
```

## Database Schema

The Prisma schema includes all the models from the original SQL Server schema:

- **Authentication**: User, Role, Team
- **Panel Design**: Project, Client, Panel, PanelLocation, Feeder, FeederLayout, SLConfig
- **Equipment**: EquipmentType, EquipmentData
- **Types**: StarterType, SourceType, BreakerType, FeederType

## Migration Changes

### Removed Files

- `lib/db.ts` - Old SQL Server connection and query functions
- SQL Server dependencies (`mssql`, `@types/mssql`)

### Updated Files

- `lib/database-service.ts` - Now uses Prisma instead of raw SQL
- `lib/prisma.ts` - New Prisma client configuration
- `prisma/schema.prisma` - Complete database schema definition

### Schema Simplification

The Prisma schema has been simplified to avoid complex circular references and validation errors:

- Removed complex audit trail relations (createdBy/updatedBy) to prevent cyclic referential actions
- Kept core business logic relations intact
- Maintained all essential models and their relationships

### Benefits

- Type-safe database operations
- Automatic query optimization
- Better developer experience with IntelliSense
- Easier migrations and schema management
- Built-in connection pooling

## Usage

The `DatabaseService` class now uses Prisma methods instead of raw SQL:

```typescript
import { DatabaseService } from "@/lib/database-service";

// Get all projects
const projects = await DatabaseService.getAllProjects();

// Create a project
const projectId = await DatabaseService.createProject({
  name: "New Project",
  description: "Project description",
});
```

## Troubleshooting

1. **Connection Issues**: Ensure SQL Server is running and accessible
2. **Schema Issues**: Run `npm run db:push` to sync schema changes
3. **Type Issues**: Run `npm run db:generate` after schema changes
