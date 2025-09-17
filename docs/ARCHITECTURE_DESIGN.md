# DBR-AI System Architecture & Design Documentation

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [System Architecture Overview](#system-architecture-overview)
3. [Database Layer](#database-layer)
4. [API Layer](#api-layer)
5. [Frontend Layer](#frontend-layer)
6. [Modularity Analysis](#modularity-analysis)
7. [Parallel Development Strategy](#parallel-development-strategy)
8. [Future Development Benefits](#future-development-benefits)
9. [Technical Recommendations](#technical-recommendations)

---

## Executive Summary

The DBR-AI (Drum-Buffer-Rope Artificial Intelligence) system is a modern production scheduling and resource planning application built on a three-tier architecture. It implements the Theory of Constraints methodology for optimizing manufacturing workflows.

### Key Technologies
- **Frontend**: React 18 with TypeScript, Vite, AG-Grid
- **Backend**: ASP.NET Web API (.NET Framework 4.6.1)
- **Database**: SQL Server with stored procedures
- **Communication**: RESTful APIs with JSON

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           DBR-AI System Architecture                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                        PRESENTATION LAYER                         │   │
│  │                                                                   │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │   │
│  │  │   Landing    │  │  Resource   │  │  Priority   │             │   │
│  │  │    Page     │  │   Planner   │  │    List     │             │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘             │   │
│  │                                                                   │   │
│  │  ┌────────────────────────────────────────────────┐             │   │
│  │  │            React Components Layer               │             │   │
│  │  │  • Header  • Grids  • Modals  • Controls      │             │   │
│  │  └────────────────────────────────────────────────┘             │   │
│  │                                                                   │   │
│  │  ┌────────────────────────────────────────────────┐             │   │
│  │  │            State Management & Context           │             │   │
│  │  │  • ThemeContext  • Toast  • Navigation State   │             │   │
│  │  └────────────────────────────────────────────────┘             │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                   ▼                                      │
│              ═══════════════ HTTP/REST API ═══════════════              │
│                                   ▼                                      │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                         APPLICATION LAYER                         │   │
│  │                                                                   │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐  │   │
│  │  │    Calendar     │  │    Resource     │  │   Priority      │  │   │
│  │  │   Controller    │  │   Controller    │  │ List Controller │  │   │
│  │  └─────────────────┘  └─────────────────┘  └────────────────┘  │   │
│  │                                                                   │   │
│  │  ┌────────────────────────────────────────────────────────────┐  │   │
│  │  │                    Business Services                        │  │   │
│  │  │  • PriorityListService  • ImportStatusService              │  │   │
│  │  │  • DbrRepository        • TargetDateRepository             │  │   │
│  │  └────────────────────────────────────────────────────────────┘  │   │
│  │                                                                   │   │
│  │  ┌────────────────────────────────────────────────────────────┐  │   │
│  │  │                   Data Access Layer                         │  │   │
│  │  │  • LINQ-to-SQL (Legacy)  • Entity Framework Core (Modern)  │  │   │
│  │  └────────────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                   ▼                                      │
│              ═══════════════ SQL Server ═══════════════                 │
│                                   ▼                                      │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                           DATA LAYER                              │   │
│  │                                                                   │   │
│  │  ┌────────────────────────────────────────────────────────────┐  │   │
│  │  │                     SQL Server Database                     │  │   │
│  │  │                      OCX_DBR_TEST                          │  │   │
│  │  │                                                            │  │   │
│  │  │  Tables:                       Views:                      │  │   │
│  │  │  • ocx_param_resource_calendar • vw_ocx_base_Production   │  │   │
│  │  │  • ocx_param_scheduled_resource • vw_ocx_Import_Logs     │  │   │
│  │  │  • app_grid_configs            • vw_priority_list        │  │   │
│  │  │                                                            │  │   │
│  │  │  Stored Procedures:                                        │  │   │
│  │  │  • ocx_usp_Reset_DBR                                      │  │   │
│  │  │  • ocx_usp_Run_DBR_on_All_Constraints                     │  │   │
│  │  │  • usp_PriorityList_UpdateTargetDates                     │  │   │
│  │  └────────────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Database Layer

### Schema Design

```sql
-- Core Tables Structure
┌─────────────────────────────┐
│ ocx_param_scheduled_resource│
├─────────────────────────────┤
│ PK: resource_group (varchar)│
│ is_constraint (bit)         │
│ capacity (int)              │
│ created_by (varchar)        │
│ created_date (datetime)     │
│ modified_by (varchar)       │
│ modified_date (datetime)    │
└─────────────────────────────┘
            │
            │ 1:N
            ▼
┌─────────────────────────────┐
│ ocx_param_resource_calendar │
├─────────────────────────────┤
│ PK: dates (date)            │
│ PK: resource (varchar)      │
│ capacity (int)              │
│ is_off (bit)                │
│ is_customised (bit)         │
│ created_by (varchar)        │
│ created_date (datetime)     │
│ modified_by (varchar)       │
│ modified_date (datetime)    │
└─────────────────────────────┘

┌─────────────────────────────┐
│ Production_Orders (View)    │
├─────────────────────────────┤
│ ProductionOrderNr           │
│ MaterialNumber              │
│ Quantity                    │
│ Resource                    │
│ TargetDate                  │
│ TargetRbc                   │
│ WorkstepsToGo               │
│ StartDateStdHours           │
│ CustomizedTargetDate        │
└─────────────────────────────┘

┌─────────────────────────────┐
│ app_grid_configs            │
├─────────────────────────────┤
│ PK: grid_key (varchar)      │
│ can_write (bit)             │
│ editable_columns (json)     │
│ hidden_columns (json)       │
│ column_options (json)       │
└─────────────────────────────┘
```

### Database Features
- **Normalized Design**: 3NF normalization for data integrity
- **Audit Trails**: Created/modified tracking on all tables
- **Views for Complex Queries**: Simplifies API data access
- **Stored Procedures**: Encapsulates business logic
- **Table-Valued Parameters**: Efficient bulk operations

---

## API Layer

### RESTful API Design Pattern

```
┌──────────────────────────────────────────────────────────┐
│                    API Architecture                       │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Client Request                                           │
│       │                                                   │
│       ▼                                                   │
│  ┌─────────────┐                                         │
│  │   CORS      │ ← Configured for localhost:5173         │
│  │ Middleware  │                                         │
│  └─────────────┘                                         │
│       │                                                   │
│       ▼                                                   │
│  ┌─────────────┐                                         │
│  │   Routing   │ ← Attribute-based + Convention          │
│  │   Engine    │                                         │
│  └─────────────┘                                         │
│       │                                                   │
│       ▼                                                   │
│  ┌─────────────────────────────────────┐                │
│  │        Controller Layer              │                │
│  ├─────────────────────────────────────┤                │
│  │ • Input Validation                  │                │
│  │ • Request Mapping                   │                │
│  │ • Response Formatting               │                │
│  └─────────────────────────────────────┘                │
│       │                                                   │
│       ▼                                                   │
│  ┌─────────────────────────────────────┐                │
│  │        Service Layer                 │                │
│  ├─────────────────────────────────────┤                │
│  │ • Business Logic                    │                │
│  │ • Data Transformation               │                │
│  │ • Transaction Management            │                │
│  └─────────────────────────────────────┘                │
│       │                                                   │
│       ▼                                                   │
│  ┌─────────────────────────────────────┐                │
│  │      Repository Layer                │                │
│  ├─────────────────────────────────────┤                │
│  │ • LINQ-to-SQL (Legacy)              │                │
│  │ • Entity Framework Core (Modern)    │                │
│  │ • Dapper (Stored Procedures)        │                │
│  └─────────────────────────────────────┘                │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### API Endpoint Categories

1. **Resource Management APIs**
   - Calendar operations (CRUD)
   - Resource configuration
   - Resource group management

2. **Production Planning APIs**
   - Priority list retrieval
   - Target date management
   - DBR algorithm execution

3. **System Configuration APIs**
   - Grid configurations
   - Import status monitoring
   - User preferences

---

## Frontend Layer

### Component Architecture

```
┌────────────────────────────────────────────────────────────┐
│                   Frontend Architecture                     │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  App Component                       │   │
│  │  • Route Management                                 │   │
│  │  • Global State                                     │   │
│  │  • Theme Provider                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│       ┌───────────────────┼───────────────────┐           │
│       ▼                   ▼                   ▼           │
│  ┌──────────┐      ┌──────────┐       ┌──────────┐       │
│  │ Landing  │      │ Resource │       │ Priority │       │
│  │  Page    │      │ Planner  │       │   List   │       │
│  └──────────┘      └──────────┘       └──────────┘       │
│                           │                                 │
│                    ┌──────┴──────┐                         │
│                    ▼              ▼                        │
│            ┌──────────┐    ┌──────────┐                   │
│            │  Master  │    │ Calendar │                   │
│            │   Grid   │    │   Grid   │                   │
│            └──────────┘    └──────────┘                   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            Shared Components Library                 │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ • Header        • FilterModal   • HelpGuide        │   │
│  │ • ControlRail   • Toast         • PageNavigation   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │               Utility Libraries                      │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ • AG-Grid       • React Hooks   • Date Utils       │   │
│  │ • Axios/Fetch   • TypeScript    • Tailwind CSS     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### State Management Flow

```
User Action → Component Event Handler → API Call → State Update → UI Re-render
     ↑                                                                    │
     └────────────────────── Feedback Loop ──────────────────────────────┘
```

---

## Modularity Analysis

### 1. **Vertical Slice Architecture**

Each feature is implemented as a complete vertical slice:

```
Feature Module Structure:
├── Frontend Component
│   ├── View (TSX)
│   ├── State Management
│   └── API Integration
├── Backend Controller
│   ├── Endpoint Definition
│   ├── Validation Logic
│   └── Response Mapping
├── Service Layer
│   ├── Business Logic
│   └── Data Transformation
└── Database Layer
    ├── Tables/Views
    └── Stored Procedures
```

### 2. **Component Independence**

Each component operates independently with clear interfaces:

| Component | Dependencies | Interface |
|-----------|-------------|-----------|
| Landing Page | None | Standalone |
| Resource Planner | Calendar API, Resource API | Props: filterGroups, selectedResource |
| Priority List | Priority API, Target Date API | Props: resource filter, pagination |
| Calendar Grid | Calendar API | Props: selectedResource, canWrite |
| Master Grid | Resource API | Props: filterGroups, onSelectResource |

### 3. **API Versioning Strategy**

```
/api/v1/  ← Modern endpoints (async, EF Core)
/api/     ← Legacy endpoints (LINQ-to-SQL)

Benefits:
• Backward compatibility
• Gradual migration path
• Parallel development of new features
```

### 4. **Database Abstraction Layers**

```
Application Code
       ↓
Repository Interface
       ↓
┌──────────────┬──────────────┬──────────────┐
│ LINQ-to-SQL  │  EF Core     │   Dapper     │
│  (Legacy)    │  (Modern)    │  (Stored Proc)│
└──────────────┴──────────────┴──────────────┘
       ↓
  SQL Server
```

---

## Parallel Development Strategy

### 1. **Team Structure & Responsibilities**

```
┌─────────────────────────────────────────────────────────┐
│                  Development Teams                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Frontend Team                 Backend Team             │
│  ┌─────────────────┐          ┌─────────────────┐      │
│  │ • UI Components │          │ • API Endpoints  │      │
│  │ • State Mgmt   │          │ • Business Logic │      │
│  │ • UX Design    │          │ • Data Access    │      │
│  │ • Testing      │          │ • Testing        │      │
│  └─────────────────┘          └─────────────────┘      │
│          │                            │                  │
│          └──────────┬─────────────────┘                 │
│                     ▼                                    │
│            ┌─────────────────┐                          │
│            │  API Contract   │                          │
│            │  (OpenAPI/Swagger)│                         │
│            └─────────────────┘                          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 2. **Contract-First Development**

**Step 1: Define API Contract**
```typescript
// API Contract Definition (shared between teams)
interface CalendarAPI {
  GET: {
    path: '/api/calendar/{resource}';
    params: { resource: string; from?: string; to?: string };
    response: CalendarRowDto[];
  };
  PATCH: {
    path: '/api/calendar/{resource}';
    body: CalendarPatchDto;
    response: { success: boolean };
  };
}
```

**Step 2: Parallel Implementation**
- **Frontend**: Create mock services implementing contract
- **Backend**: Implement actual endpoints per contract

**Step 3: Integration**
- Replace mock services with actual API calls
- Validate contract compliance

### 3. **Development Workflow**

```
Sprint Planning
     │
     ├──→ API Contract Design (Both Teams)
     │         │
     │         ├──→ Frontend Development
     │         │    ├── Mock Data Services
     │         │    ├── Component Development
     │         │    └── Unit Testing
     │         │
     │         └──→ Backend Development
     │              ├── API Implementation
     │              ├── Database Schema
     │              └── Integration Testing
     │
     └──→ Integration Phase
           ├── Contract Validation
           ├── End-to-End Testing
           └── Deployment
```

### 4. **Mock Service Strategy**

Frontend teams can develop independently using mock services:

```typescript
// Mock service for development
class MockCalendarService implements CalendarService {
  async getCalendar(resource: string): Promise<CalendarRowDto[]> {
    return mockCalendarData; // Predefined test data
  }

  async updateCalendar(resource: string, changes: CalendarPatchDto): Promise<void> {
    // Simulate API delay
    await delay(500);
    // Update local mock data
  }
}

// Easy switch to real service
const calendarService = process.env.USE_MOCKS
  ? new MockCalendarService()
  : new RealCalendarService();
```

---

## Future Development Benefits

### 1. **Scalability Benefits**

```
Current Architecture Supports:
┌──────────────────────────────────────────┐
│ • Microservices Migration                │
│   - Each controller → Separate service   │
│   - Database per service pattern         │
│                                          │
│ • Horizontal Scaling                     │
│   - Stateless API design                │
│   - Load balancer ready                 │
│                                          │
│ • Cloud Migration                        │
│   - Azure App Service compatible        │
│   - SQL Azure ready                     │
└──────────────────────────────────────────┘
```

### 2. **Technology Migration Path**

```
Current State → Migration Path → Future State
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
.NET 4.6.1    → .NET 6/8      → .NET 9+
LINQ-to-SQL   → EF Core       → EF Core 8+
React 18      → React 19      → Next.js
REST API      → GraphQL       → gRPC
SQL Server    → PostgreSQL    → Cloud Native DB
```

### 3. **Feature Addition Pattern**

Adding a new feature (e.g., Machine Learning predictions):

```
1. Database: Add prediction tables/views
   └── No impact on existing schema

2. API: Create new controller/endpoints
   └── /api/v2/predictions
   └── Isolated from existing APIs

3. Frontend: New component/page
   └── Import existing shared components
   └── Use established patterns

4. Integration: Wire up through existing navigation
   └── Add to PageType enum
   └── Update navigation menu
```

### 4. **Testing Strategy**

```
┌────────────────────────────────────┐
│         Testing Pyramid            │
├────────────────────────────────────┤
│                                    │
│            E2E Tests               │
│         ┌──────────┐              │
│        /            \             │
│       /              \            │
│      / Integration   \           │
│     /     Tests       \          │
│    ┌──────────────────┐         │
│   /                    \        │
│  /    Unit Tests        \       │
│ ┌────────────────────────┐      │
└────────────────────────────────────┘

Testing Independence:
• Frontend: Jest + React Testing Library
• Backend: MSTest/xUnit
• Integration: Postman/Newman
• E2E: Cypress/Playwright
```

---

## Technical Recommendations

### 1. **Immediate Improvements**

| Priority | Recommendation | Benefit |
|----------|---------------|---------|
| High | Implement authentication/authorization | Security |
| High | Add API versioning headers | Better version control |
| High | Create OpenAPI/Swagger documentation | Team collaboration |
| Medium | Implement caching layer | Performance |
| Medium | Add request/response logging | Debugging |
| Low | Migrate to .NET 6+ | Modern framework benefits |

### 2. **Architecture Evolution**

```
Phase 1: Current State (Monolithic API)
  └── Single API project
  └── Shared database

Phase 2: Service Separation (6 months)
  └── Resource Service
  └── Calendar Service
  └── Priority Service
  └── Shared database

Phase 3: Microservices (12 months)
  └── Independent services
  └── Service mesh
  └── Database per service

Phase 4: Cloud Native (18 months)
  └── Kubernetes deployment
  └── Event-driven architecture
  └── CQRS pattern
```

### 3. **Development Best Practices**

```typescript
// Frontend: Use TypeScript interfaces for type safety
interface ResourceDto {
  resource_group: string;
  is_constraint?: boolean;
  capacity?: number;
}

// Backend: Use DTOs for API contracts
public class ResourceDto
{
    [Required]
    public string ResourceGroup { get; set; }
    public bool? IsConstraint { get; set; }
    [Range(0, int.MaxValue)]
    public int? Capacity { get; set; }
}

// Database: Use migrations for schema changes
CREATE PROCEDURE [dbo].[sp_MigrateSchema_v2]
AS
BEGIN
    -- Add new columns with defaults
    -- Preserve existing data
    -- Update views
END
```

### 4. **Monitoring & Observability**

```
Application Insights Integration:
┌─────────────────────────────────┐
│ • Request telemetry             │
│ • Dependency tracking           │
│ • Exception logging             │
│ • Performance metrics           │
│ • Custom events                 │
└─────────────────────────────────┘
     │
     ▼
Azure Dashboard
• Real-time metrics
• Alert configuration
• Log analytics
```

---

## Conclusion

The DBR-AI system demonstrates a well-architected, modular design that supports:

1. **Independent Development**: Clear separation of concerns enables parallel work streams
2. **Technology Flexibility**: Abstraction layers allow technology migration without system rewrites
3. **Scalability**: Stateless design and service-oriented architecture support growth
4. **Maintainability**: Clear structure and patterns reduce technical debt
5. **Testability**: Each layer can be tested independently

The architecture provides a solid foundation for future enhancements while maintaining system stability and development velocity.

---

## Appendix: Quick Reference

### API Endpoints
- Calendar: `/api/calendar`
- Resources: `/api/resources`
- Priority List: `/api/v1/priority-list`
- DBR Operations: `/api/v1/dbr`

### Key Technologies
- Frontend: React + TypeScript + Vite
- Backend: ASP.NET Web API
- Database: SQL Server
- UI Grid: AG-Grid Community

### Development Servers
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:44345`
- Database: `ONECHAIN-QA\OCX_DBR_TEST`

### Contact Points
- Frontend Repo: `E:\dbr-frontend\DBR-AI`
- Backend Repo: `C:\Users\aganwar\source\repos\DBR_AI`