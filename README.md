# ManuComp AI

AI-powered manufacturing employee competency management system for tracking skills, assessments, and workforce development.

## Overview

ManuComp AI is a comprehensive dashboard application designed for manufacturing organizations to manage and track employee competencies. The system enables managers to assess employee skills, track competency levels, generate AI-powered insights, and make data-driven decisions about workforce development.

## Features

- **Dashboard** - Overview of key metrics including total employees, roles, competencies, and assessment statistics
- **Employee Management** - Full CRUD operations for employee records with detailed competency profiles
- **Role Management** - Define and manage job roles with associated competency requirements
- **Competency Library** - Maintain a catalog of competencies with descriptions and proficiency levels
- **Assessment System** - Conduct and track employee competency assessments with history
- **Bulk Assessments** - Perform assessments across multiple employees efficiently
- **Analytics** - Visual insights and charts showing competency distribution and trends
- **Audit Log** - Comprehensive system activity log tracking all changes and user actions (Admin only)
- **AI Assistant** - GPT-powered insights for competency gaps and development recommendations
- **Role-Based Access** - Secure access control with Admin, Manager, and Employee roles
- **Responsive Design** - Fully responsive UI with sidebar navigation and mobile support

## Tech Stack

- **Frontend Framework** - React 18 with TypeScript
- **Build Tool** - Vite
- **UI Components** - shadcn/ui (Radix UI primitives)
- **Styling** - Tailwind CSS
- **Routing** - React Router DOM v6
- **State Management** - TanStack Query (React Query)
- **Form Handling** - React Hook Form + Zod validation
- **Charts** - Recharts
- **Icons** - Lucide React

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm/bun
- A backend API server (configured in `src/services/api.ts`)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd manucomp-ai-dashboard
```

2. Install dependencies using your preferred package manager:

```bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install

# Using bun
bun install
```

3. Create a `.env` file in the root directory with your API endpoint:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit tests with Vitest |
| `npm run test:watch` | Run tests in watch mode |

## Project Structure

```
src/
├── components/
│   ├── assessments/       # Assessment-related components
│   ├── competencies/      # Competency form components
│   ├── employees/         # Employee detail tab components
│   ├── roles/             # Role form components
│   ├── ui/                # shadcn/ui base components
│   ├── AppLayout.tsx      # Main application layout
│   ├── AppSidebar.tsx     # Sidebar navigation
│   ├── DataTable.tsx      # Reusable data table
│   └── ...
├── hooks/
│   ├── useAuth.tsx        # Authentication context hook
│   └── useToast.ts        # Toast notification hook
├── pages/
│   ├── DashboardPage.tsx
│   ├── EmployeesPage.tsx
│   ├── EmployeeDetailPage.tsx
│   ├── RolesPage.tsx
│   ├── RoleDetailPage.tsx
│   ├── CompetenciesPage.tsx
│   ├── AssessmentsPage.tsx
│   ├── BulkAssessmentPage.tsx
│   ├── AnalyticsPage.tsx
│   ├── AuditPage.tsx
│   ├── SettingsPage.tsx
│   ├── LoginPage.tsx
│   └── RegisterPage.tsx
├── services/
│   ├── api.ts             # Axios instance configuration
│   ├── employees.ts       # Employee API calls
│   ├── roles.ts           # Role API calls
│   ├── competencies.ts    # Competency API calls
│   ├── assessments.ts     # Assessment API calls
│   ├── analytics.ts       # Analytics API calls
│   ├── audit.ts           # Audit log API calls
│   └── dashboard.ts       # Dashboard API calls
├── lib/
│   └── utils.ts           # Utility functions
├── App.tsx                # Root component with routing
├── main.tsx               # Application entry point
└── index.css              # Global styles
```

## Authentication

The application uses JWT-based authentication. Upon login, the API returns an access token that is stored and sent with subsequent requests. Role-based access control restricts certain features:

- **Admin** - Full access to all features including settings
- **Manager** - Access to employees, roles, competencies, assessments, analytics, and AI assistant
- **Employee** - Limited access to view own profile and competencies

## API Configuration

The API base URL is configured via the `VITE_API_BASE_URL` environment variable. API requests are handled through an Axios instance configured in `src/services/api.ts`.

Default configuration:
- Base URL: `http://localhost:8000/api/v1`
- Timeout: Request timeout handling configured
- Retry: Automatic retry for failed requests (except 501 errors)

## Testing

The project uses Vitest for unit testing and Playwright for end-to-end testing.

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch
```

## Build

To create a production build:

```bash
npm run build
```

The build output will be in the `dist` directory.

## License

Private - All rights reserved
