# CLAUDE.md — Retech Inventory V1 Implementation Plan

**Version:** 1.0.0
**Last Updated:** 2025-11-20
**Status:** Planning Phase
**Owner:** Development Team / AI Agent

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack & Architecture](#technology-stack--architecture)
3. [Repository Structure](#repository-structure)
4. [Implementation Phases](#implementation-phases)
5. [Database Schema](#database-schema)
6. [API Specification](#api-specification)
7. [Security & Authentication](#security--authentication)
8. [Desktop Application](#desktop-application)
9. [iOS Mobile Application](#ios-mobile-application)
10. [Infrastructure & DevOps](#infrastructure--devops)
11. [Testing Strategy](#testing-strategy)
12. [Development Workflow](#development-workflow)
13. [Acceptance Criteria](#acceptance-criteria)
14. [Agent Operating Guide](#agent-operating-guide)
15. [Quick Reference](#quick-reference)

---

## Project Overview

### Business Context

**Retech Inventory** is a production-grade inventory management system designed for electronics wholesale/resale businesses. The system tracks individual devices by IMEI and serial numbers, manages customer invoicing, provides comprehensive reporting, and supports multi-platform access (desktop and mobile).

### Core Business Requirements

- **Device Tracking:** Individual device management with IMEI/serial validation
- **Invoice Management:** Professional invoice generation with PDF export
- **Access Control:** Role-based permissions (Admin, Manager, Staff)
- **Reporting:** Real-time inventory and sales analytics
- **Multi-Platform:** Desktop app for daily operations, iOS app for field access
- **Offline Support:** Continue working without internet connectivity
- **Audit Trail:** Complete history of all inventory changes

### Definition of Success (V1)

- Users can track 1,000+ devices with unique identifiers
- Generate and email invoices in under 5 seconds
- Desktop app works on Windows 10+ and macOS 11+
- iOS app provides read-only inventory access
- System handles 100 concurrent users
- 99.9% uptime with automated backups
- Complete audit trail for compliance

---

## Technology Stack & Architecture

### Backend (API Server)

**Primary Stack:**
- **Runtime:** Node.js 20+ LTS
- **Framework:** NestJS 10.x with TypeScript 5+
- **Database:** PostgreSQL 15+ with full-text search
- **ORM:** Prisma 5.x with type-safe queries
- **Authentication:** JWT with refresh tokens (passport-jwt)
- **Password Hashing:** Argon2 for security
- **Validation:** class-validator + class-transformer
- **Documentation:** OpenAPI 3.0 via @nestjs/swagger

**Supporting Services:**
- **Queue:** Redis + Bull for background jobs
- **Cache:** Redis for session and data caching
- **File Storage:** MinIO (local) / S3 (production)
- **Email:** NodeMailer with templates
- **PDF Generation:** Puppeteer for invoices

**Observability:**
- **Logging:** Winston with structured logs
- **Monitoring:** OpenTelemetry + Prometheus
- **Error Tracking:** Sentry
- **Health Checks:** /health, /metrics endpoints

### Desktop Application

**Stack:**
- **Framework:** Electron 28+ (latest stable)
- **UI Framework:** React 18 with TypeScript
- **Build Tool:** Vite 5.x for fast builds
- **UI Components:** shadcn/ui + Tailwind CSS 3.x
- **State Management:** Zustand for global state, React Query for server state
- **Forms:** React Hook Form with Zod validation
- **Routing:** React Router v6
- **Offline Storage:** SQLite via better-sqlite3
- **Auto-Updates:** electron-updater with GitHub Releases
- **Packaging:** electron-builder

**Architecture:**
- Main process: Node.js backend integration, system APIs
- Renderer process: React application, isolated context
- Preload scripts: Secure IPC bridge
- Context isolation enabled for security

### iOS Mobile Application

**Stack:**
- **Framework:** SwiftUI (iOS 17+)
- **Architecture:** MVVM pattern
- **Networking:** URLSession with async/await
- **HTTP Client:** Alamofire (optional, evaluate)
- **JSON Parsing:** Codable protocol
- **Storage:** Core Data for offline cache
- **Keychain:** Secure credential storage
- **Async:** Swift Concurrency (async/await)

**Features:**
- Read-only inventory views
- Device search by IMEI/serial/model
- Real-time sync when online
- Offline mode with cached data
- Barcode scanning (future enhancement)

### Infrastructure

**Deployment:**
- **Containerization:** Docker + Docker Compose
- **Orchestration:** Docker Swarm (simple) or Kubernetes (if needed)
- **Reverse Proxy:** Nginx with SSL termination
- **SSL Certificates:** Let's Encrypt with auto-renewal
- **CI/CD:** GitHub Actions
- **Hosting Options:** AWS ECS Fargate, Railway, Fly.io, or DigitalOcean

**Data Management:**
- **Backups:** Automated PostgreSQL dumps every 6 hours to S3
- **Retention:** 30-day backup retention with daily snapshots
- **PITR:** Point-in-time recovery if using managed database
- **Disaster Recovery:** RTO: 1 hour, RPO: 6 hours

---

## Repository Structure

```
retech-inventory-v1/
├── README.md
├── CLAUDE.md                    # This file
├── .github/
│   └── workflows/
│       ├── backend-ci.yml
│       ├── desktop-build.yml
│       └── ios-build.yml
├── backend/
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── strategies/
│   │   │   │   │   ├── jwt.strategy.ts
│   │   │   │   │   └── local.strategy.ts
│   │   │   │   └── guards/
│   │   │   │       ├── jwt-auth.guard.ts
│   │   │   │       └── roles.guard.ts
│   │   │   ├── users/
│   │   │   │   ├── users.module.ts
│   │   │   │   ├── users.controller.ts
│   │   │   │   ├── users.service.ts
│   │   │   │   └── dto/
│   │   │   ├── inventory/
│   │   │   │   ├── inventory.module.ts
│   │   │   │   ├── devices.controller.ts
│   │   │   │   ├── devices.service.ts
│   │   │   │   ├── dto/
│   │   │   │   └── entities/
│   │   │   ├── invoicing/
│   │   │   │   ├── invoicing.module.ts
│   │   │   │   ├── invoices.controller.ts
│   │   │   │   ├── invoices.service.ts
│   │   │   │   ├── pdf.service.ts
│   │   │   │   └── templates/
│   │   │   ├── reporting/
│   │   │   │   ├── reporting.module.ts
│   │   │   │   ├── reports.controller.ts
│   │   │   │   └── reports.service.ts
│   │   │   ├── customers/
│   │   │   ├── suppliers/
│   │   │   ├── audit/
│   │   │   └── health/
│   │   ├── common/
│   │   │   ├── decorators/
│   │   │   │   ├── roles.decorator.ts
│   │   │   │   └── user.decorator.ts
│   │   │   ├── guards/
│   │   │   │   └── roles.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── logging.interceptor.ts
│   │   │   │   └── transform.interceptor.ts
│   │   │   ├── pipes/
│   │   │   │   └── validation.pipe.ts
│   │   │   ├── filters/
│   │   │   │   └── http-exception.filter.ts
│   │   │   └── middleware/
│   │   ├── config/
│   │   │   ├── database.config.ts
│   │   │   ├── jwt.config.ts
│   │   │   └── app.config.ts
│   │   └── prisma/
│   │       └── prisma.service.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   ├── test/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   └── Dockerfile
├── desktop/
│   ├── src/
│   │   ├── main/
│   │   │   ├── index.ts
│   │   │   ├── ipc/
│   │   │   ├── services/
│   │   │   └── database/
│   │   ├── renderer/
│   │   │   ├── src/
│   │   │   │   ├── App.tsx
│   │   │   │   ├── main.tsx
│   │   │   │   ├── components/
│   │   │   │   │   ├── ui/           # shadcn components
│   │   │   │   │   ├── layout/
│   │   │   │   │   └── features/
│   │   │   │   ├── pages/
│   │   │   │   │   ├── LoginPage.tsx
│   │   │   │   │   ├── DashboardPage.tsx
│   │   │   │   │   ├── InventoryPage.tsx
│   │   │   │   │   └── InvoicePage.tsx
│   │   │   │   ├── hooks/
│   │   │   │   ├── services/
│   │   │   │   │   └── api.service.ts
│   │   │   │   ├── store/
│   │   │   │   │   ├── auth.store.ts
│   │   │   │   │   └── settings.store.ts
│   │   │   │   ├── lib/
│   │   │   │   └── types/
│   │   │   ├── index.html
│   │   │   └── vite.config.ts
│   │   └── preload/
│   │       └── index.ts
│   ├── package.json
│   ├── electron-builder.yml
│   └── tsconfig.json
├── mobile-ios/
│   ├── RetechInventory/
│   │   ├── RetechInventoryApp.swift
│   │   ├── Models/
│   │   │   ├── Device.swift
│   │   │   ├── User.swift
│   │   │   └── APIResponse.swift
│   │   ├── Views/
│   │   │   ├── LoginView.swift
│   │   │   ├── DashboardView.swift
│   │   │   ├── DeviceListView.swift
│   │   │   └── DeviceDetailView.swift
│   │   ├── ViewModels/
│   │   │   ├── AuthViewModel.swift
│   │   │   ├── DeviceViewModel.swift
│   │   │   └── SearchViewModel.swift
│   │   ├── Services/
│   │   │   ├── NetworkService.swift
│   │   │   ├── AuthService.swift
│   │   │   └── StorageService.swift
│   │   ├── Network/
│   │   │   ├── APIClient.swift
│   │   │   ├── Endpoints.swift
│   │   │   └── NetworkError.swift
│   │   ├── CoreData/
│   │   │   ├── PersistenceController.swift
│   │   │   └── RetechInventory.xcdatamodeld
│   │   ├── Utilities/
│   │   │   ├── KeychainHelper.swift
│   │   │   └── Extensions.swift
│   │   └── Resources/
│   │       ├── Assets.xcassets
│   │       └── Localizable.strings
│   ├── RetechInventoryTests/
│   ├── RetechInventoryUITests/
│   ├── RetechInventory.xcodeproj
│   └── Podfile (if using CocoaPods)
├── shared/
│   ├── types/
│   │   ├── api.types.ts
│   │   ├── device.types.ts
│   │   └── invoice.types.ts
│   └── constants/
│       └── enums.ts
├── infrastructure/
│   ├── docker/
│   │   ├── docker-compose.yml
│   │   ├── docker-compose.prod.yml
│   │   ├── backend.Dockerfile
│   │   └── nginx.conf
│   ├── scripts/
│   │   ├── backup.sh
│   │   ├── restore.sh
│   │   └── deploy.sh
│   └── terraform/          # Optional IaC
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
├── docs/
│   ├── api/
│   │   └── openapi.json
│   ├── deployment/
│   │   ├── DEPLOYMENT.md
│   │   └── INFRASTRUCTURE.md
│   ├── development/
│   │   └── SETUP.md
│   └── user-guides/
│       ├── ADMIN_GUIDE.md
│       └── USER_MANUAL.md
└── package.json            # Root workspace config
```

---

## Implementation Phases

### Phase 1: Foundation & Backend Core (Weeks 1-2)

**Goal:** Establish project structure, database, and authentication

#### Week 1: Project Setup
- [ ] Initialize monorepo with npm/pnpm workspaces
- [ ] Set up NestJS backend project structure
- [ ] Configure TypeScript with strict mode
- [ ] Set up ESLint + Prettier for code quality
- [ ] Initialize Git repository with .gitignore
- [ ] Create Docker Compose for local development
- [ ] Set up PostgreSQL 15+ container
- [ ] Set up Redis container for caching/queues
- [ ] Configure environment variables management (.env.example)
- [ ] Set up Winston logging with structured output

**Deliverables:**
- Running Docker environment
- NestJS app responds at http://localhost:3000
- Health check endpoint working
- Logs output to console in JSON format

#### Week 2: Database & Authentication
- [ ] Design Prisma schema for all entities
- [ ] Create initial migration
- [ ] Seed database with sample data
- [ ] Implement Users module (CRUD)
- [ ] Implement Auth module:
  - [ ] Local strategy (email/password)
  - [ ] JWT strategy with access tokens
  - [ ] Refresh token rotation
  - [ ] Password hashing with Argon2
- [ ] Create RBAC guards and decorators
- [ ] Add Swagger/OpenAPI documentation
- [ ] Write unit tests for auth flows
- [ ] Test password reset flow

**Deliverables:**
- Complete database schema in Prisma
- Working authentication endpoints
- Role-based access control functional
- Swagger UI available at /api/docs
- 80%+ test coverage for auth module

### Phase 2: Core Backend Features (Weeks 3-4)

**Goal:** Implement inventory, invoicing, and reporting modules

#### Week 3: Inventory Management
- [ ] Create Inventory module structure
- [ ] Implement Devices controller and service:
  - [ ] Create device (validate IMEI/serial uniqueness)
  - [ ] List devices (pagination, filtering, sorting)
  - [ ] Get device by ID
  - [ ] Update device
  - [ ] Delete device (soft delete)
  - [ ] Bulk import via CSV
  - [ ] Export to CSV/Excel
- [ ] Add IMEI/serial validation logic
- [ ] Implement device status state machine
- [ ] Add full-text search on PostgreSQL
- [ ] Create inventory movement tracking
- [ ] Implement audit logging
- [ ] Write integration tests
- [ ] Add performance indexes

**Deliverables:**
- Full CRUD API for devices
- CSV import working with validation
- Search endpoint responds in <100ms
- Audit log captures all changes

#### Week 4: Invoicing & Reporting
- [ ] Create Invoicing module:
  - [ ] Create invoice (draft state)
  - [ ] Add line items (serialized + non-serialized)
  - [ ] Calculate totals, tax, discounts
  - [ ] Finalize invoice
  - [ ] Record payments
  - [ ] Generate PDF with Puppeteer
  - [ ] Email invoice to customer
- [ ] Create Customers module (CRUD)
- [ ] Create Suppliers module (CRUD)
- [ ] Implement Reporting module:
  - [ ] Inventory summary report
  - [ ] Sales report (by date range)
  - [ ] Revenue analytics
  - [ ] Profit estimation
- [ ] Add background job queue for PDF/email
- [ ] Write comprehensive tests
- [ ] Optimize database queries

**Deliverables:**
- Invoice generation working end-to-end
- PDF export functional
- Reports API returning accurate data
- Background jobs processing reliably

### Phase 3: Desktop Application (Weeks 5-6)

**Goal:** Build full-featured Electron desktop app

#### Week 5: Desktop Foundation
- [ ] Initialize Electron + React + Vite project
- [ ] Set up electron-builder configuration
- [ ] Configure IPC between main/renderer
- [ ] Set up React Router for navigation
- [ ] Add shadcn/ui components
- [ ] Configure Tailwind CSS
- [ ] Set up Zustand for state management
- [ ] Set up React Query for API calls
- [ ] Create API client service
- [ ] Implement authentication flow:
  - [ ] Login page
  - [ ] Token storage (secure)
  - [ ] Auto-logout on token expiry
- [ ] Create main layout with navigation
- [ ] Set up SQLite for offline storage
- [ ] Implement auto-update mechanism

**Deliverables:**
- Desktop app launches on macOS/Windows
- Authentication working
- Navigation between pages functional
- Auto-update downloads and installs updates

#### Week 6: Desktop Features
- [ ] Dashboard page:
  - [ ] Inventory summary cards
  - [ ] Recent activity feed
  - [ ] Quick actions
- [ ] Inventory page:
  - [ ] Device list with DataTable
  - [ ] Search and filters
  - [ ] Add device form
  - [ ] Edit device modal
  - [ ] Bulk actions (delete, export)
  - [ ] CSV import with preview
- [ ] Invoice page:
  - [ ] Create invoice flow
  - [ ] Select devices
  - [ ] Add customer
  - [ ] Preview invoice
  - [ ] Generate PDF
  - [ ] Email invoice
- [ ] Settings page:
  - [ ] User profile
  - [ ] API configuration
  - [ ] Appearance settings
- [ ] Offline mode:
  - [ ] Sync data to SQLite
  - [ ] Queue operations when offline
  - [ ] Sync on reconnection
- [ ] Error handling and toast notifications

**Deliverables:**
- Fully functional desktop app
- All core features working
- Offline mode operational
- Build artifacts for macOS and Windows

### Phase 4: iOS Mobile Application (Weeks 7-8)

**Goal:** Build read-only iOS app for field access

#### Week 7: iOS Foundation
- [ ] Create Xcode project with SwiftUI
- [ ] Set up project structure (MVVM)
- [ ] Configure build settings and schemes
- [ ] Set up Core Data model
- [ ] Create NetworkService with URLSession
- [ ] Implement AuthService with Keychain
- [ ] Create authentication views:
  - [ ] LoginView
  - [ ] Splash screen
- [ ] Implement JWT token management
- [ ] Set up app navigation structure
- [ ] Create reusable UI components

**Deliverables:**
- iOS project builds successfully
- Authentication flow working
- Navigation structure in place

#### Week 8: iOS Features
- [ ] DashboardView:
  - [ ] Display inventory stats
  - [ ] Show category breakdown
  - [ ] Recent activity
- [ ] DeviceListView:
  - [ ] List all devices
  - [ ] Pull-to-refresh
  - [ ] Infinite scrolling
  - [ ] Search bar
  - [ ] Filters
- [ ] DeviceDetailView:
  - [ ] Show device information
  - [ ] Display status badge
  - [ ] Show purchase/sale info
- [ ] SearchView:
  - [ ] Search by IMEI/serial
  - [ ] Search by model
  - [ ] Recent searches
- [ ] Offline mode:
  - [ ] Cache data in Core Data
  - [ ] Sync on app launch
  - [ ] Show offline indicator
- [ ] Settings view:
  - [ ] API endpoint configuration
  - [ ] Logout option
  - [ ] App version info

**Deliverables:**
- Fully functional read-only iOS app
- Offline mode working
- App ready for TestFlight distribution

### Phase 5: Infrastructure & DevOps (Week 9)

**Goal:** Set up production infrastructure and CI/CD

#### Backend Infrastructure
- [ ] Create production Dockerfile
- [ ] Set up Nginx reverse proxy config
- [ ] Configure SSL with Let's Encrypt
- [ ] Set up managed PostgreSQL (RDS/Neon)
- [ ] Configure Redis for production
- [ ] Set up S3 bucket for files and backups
- [ ] Create backup script (automated)
- [ ] Set up restore procedure
- [ ] Configure monitoring:
  - [ ] Prometheus metrics
  - [ ] Grafana dashboards
  - [ ] Sentry error tracking
  - [ ] Uptime monitoring
- [ ] Configure alerts for critical issues

#### CI/CD Pipelines
- [ ] Backend CI/CD:
  - [ ] Lint and type-check
  - [ ] Run unit tests
  - [ ] Run integration tests
  - [ ] Build Docker image
  - [ ] Push to registry
  - [ ] Deploy to staging
  - [ ] Run smoke tests
  - [ ] Deploy to production (manual approval)
- [ ] Desktop CI/CD:
  - [ ] Lint and type-check
  - [ ] Run tests
  - [ ] Build for macOS (code sign + notarize)
  - [ ] Build for Windows (code sign)
  - [ ] Upload to GitHub Releases
  - [ ] Trigger auto-update
- [ ] iOS CI/CD:
  - [ ] Lint with SwiftLint
  - [ ] Run unit tests
  - [ ] Build for simulator
  - [ ] Archive for TestFlight (manual)

**Deliverables:**
- Production environment fully operational
- All CI/CD pipelines working
- Monitoring and alerts configured
- Backups running automatically
- Documentation complete

### Phase 6: Testing, Security & Polish (Week 10)

**Goal:** Ensure production readiness

#### Testing
- [ ] Backend:
  - [ ] Achieve 80%+ unit test coverage
  - [ ] Write integration tests for all modules
  - [ ] E2E tests for critical paths
  - [ ] Load testing (100 concurrent users)
  - [ ] Test database migrations
- [ ] Desktop:
  - [ ] Component tests with React Testing Library
  - [ ] E2E tests with Playwright
  - [ ] Test auto-update flow
  - [ ] Test offline mode thoroughly
- [ ] iOS:
  - [ ] Unit tests for view models
  - [ ] UI tests for critical flows
  - [ ] Test on multiple devices

#### Security
- [ ] Run security audit:
  - [ ] OWASP Top 10 checklist
  - [ ] Dependency vulnerability scan
  - [ ] SQL injection testing
  - [ ] XSS testing
  - [ ] CSRF protection verification
- [ ] Penetration testing (if budget allows)
- [ ] Review RBAC implementation
- [ ] Audit logging verification
- [ ] Data encryption verification
- [ ] Rate limiting testing

#### Polish
- [ ] UI/UX review and refinements
- [ ] Performance optimization
- [ ] Documentation completion:
  - [ ] API documentation
  - [ ] Deployment guide
  - [ ] User manual
  - [ ] Admin guide
  - [ ] Troubleshooting guide
- [ ] Create demo video
- [ ] Prepare training materials
- [ ] Final QA pass

**Deliverables:**
- All tests passing
- Security audit complete
- Documentation finalized
- System ready for production launch

---

## Database Schema

### Prisma Schema (schema.prisma)

```prisma
// This is your Prisma schema file

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// User Management
// ============================================

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String
  firstName     String
  lastName      String
  role          Role      @default(STAFF)
  isActive      Boolean   @default(true)
  lastLoginAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  createdDevices       Device[]              @relation("DeviceCreator")
  createdInvoices      Invoice[]             @relation("InvoiceCreator")
  inventoryMovements   InventoryMovement[]
  auditLogs            AuditLog[]
  refreshTokens        RefreshToken[]

  @@map("users")
}

model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("refresh_tokens")
}

enum Role {
  ADMIN
  MANAGER
  STAFF
  VIEWER
}

// ============================================
// Product Catalog
// ============================================

model Product {
  id          String    @id @default(uuid())
  name        String
  brand       String
  category    String
  description String?
  isArchived  Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relations
  variants ProductVariant[]

  @@index([brand, category])
  @@index([isArchived])
  @@map("products")
}

model ProductVariant {
  id                  String   @id @default(uuid())
  productId           String
  storage             String?  // e.g., "128GB", "256GB"
  color               String?
  condition           String   // e.g., "New", "Like New", "Good", "Fair"
  sku                 String?  @unique
  defaultPurchasePrice Decimal? @db.Decimal(10, 2)
  defaultSalePrice    Decimal? @db.Decimal(10, 2)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  // Relations
  product Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  devices Device[]
  invoiceLines InvoiceLine[]

  @@index([productId])
  @@map("product_variants")
}

// ============================================
// Inventory Management
// ============================================

model Device {
  id               String       @id @default(uuid())
  productVariantId String
  imei             String?      @unique
  serialNumber     String       @unique
  status           DeviceStatus @default(IN_STOCK)
  condition        String       // Physical condition
  purchasePrice    Decimal?     @db.Decimal(10, 2)
  purchaseDate     DateTime?
  supplierId       String?
  locationId       String?
  notes            String?
  createdById      String
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt

  // Relations
  productVariant ProductVariant @relation(fields: [productVariantId], references: [id])
  supplier       Supplier?      @relation(fields: [supplierId], references: [id])
  location       Location?      @relation(fields: [locationId], references: [id])
  createdBy      User           @relation("DeviceCreator", fields: [createdById], references: [id])

  inventoryMovements InventoryMovement[]
  invoiceLines       InvoiceLine[]

  @@index([imei])
  @@index([serialNumber])
  @@index([status])
  @@index([productVariantId])
  @@index([supplierId])
  @@map("devices")
}

enum DeviceStatus {
  IN_STOCK
  RESERVED
  SOLD
  RETURNED
  RMA
  WRITTEN_OFF
}

model Location {
  id          String   @id @default(uuid())
  name        String   @unique
  address     String?
  description String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  devices Device[]
  movementsFrom InventoryMovement[] @relation("MovementFrom")
  movementsTo   InventoryMovement[] @relation("MovementTo")

  @@map("locations")
}

model InventoryMovement {
  id               String       @id @default(uuid())
  deviceId         String
  type             MovementType
  reasonCode       String?
  fromLocationId   String?
  toLocationId     String?
  relatedInvoiceId String?
  notes            String?
  createdById      String
  createdAt        DateTime     @default(now())

  // Relations
  device        Device    @relation(fields: [deviceId], references: [id])
  fromLocation  Location? @relation("MovementFrom", fields: [fromLocationId], references: [id])
  toLocation    Location? @relation("MovementTo", fields: [toLocationId], references: [id])
  invoice       Invoice?  @relation(fields: [relatedInvoiceId], references: [id])
  createdBy     User      @relation(fields: [createdById], references: [id])

  @@index([deviceId])
  @@index([type])
  @@index([createdAt])
  @@map("inventory_movements")
}

enum MovementType {
  STOCK_IN
  SALE
  TRANSFER
  ADJUSTMENT
  RETURN_CUSTOMER
  RETURN_SUPPLIER
}

// ============================================
// Invoicing
// ============================================

model Invoice {
  id             String          @id @default(uuid())
  invoiceNumber  String          @unique
  customerId     String
  status         InvoiceStatus   @default(DRAFT)
  subtotal       Decimal         @db.Decimal(10, 2)
  tax            Decimal         @db.Decimal(10, 2)
  discount       Decimal         @default(0) @db.Decimal(10, 2)
  total          Decimal         @db.Decimal(10, 2)
  paidAmount     Decimal         @default(0) @db.Decimal(10, 2)
  paymentStatus  PaymentStatus   @default(UNPAID)
  paymentMethod  String?
  notes          String?
  createdById    String
  finalizedAt    DateTime?
  dueDate        DateTime?
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt

  // Relations
  customer  Customer      @relation(fields: [customerId], references: [id])
  createdBy User          @relation("InvoiceCreator", fields: [createdById], references: [id])

  lines     InvoiceLine[]
  payments  Payment[]
  inventoryMovements InventoryMovement[]

  @@index([invoiceNumber])
  @@index([customerId])
  @@index([status])
  @@index([createdAt])
  @@map("invoices")
}

enum InvoiceStatus {
  DRAFT
  FINALIZED
  CANCELLED
}

enum PaymentStatus {
  UNPAID
  PARTIAL
  PAID
  REFUNDED
}

model InvoiceLine {
  id                 String   @id @default(uuid())
  invoiceId          String
  type               LineType
  deviceId           String?  // For serialized items
  productVariantId   String?  // For non-serialized items
  description        String
  quantity           Int      @default(1)
  unitPrice          Decimal  @db.Decimal(10, 2)
  lineDiscount       Decimal  @default(0) @db.Decimal(10, 2)
  taxRate            Decimal  @default(0) @db.Decimal(5, 2)
  lineTotal          Decimal  @db.Decimal(10, 2)
  createdAt          DateTime @default(now())

  // Relations
  invoice        Invoice         @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  device         Device?         @relation(fields: [deviceId], references: [id])
  productVariant ProductVariant? @relation(fields: [productVariantId], references: [id])

  @@index([invoiceId])
  @@map("invoice_lines")
}

enum LineType {
  SERIALIZED    // Individual device by IMEI/serial
  NON_SERIALIZED // Accessories, services, etc.
}

model Payment {
  id         String   @id @default(uuid())
  invoiceId  String
  method     String   // e.g., "Cash", "Card", "Bank Transfer"
  amount     Decimal  @db.Decimal(10, 2)
  reference  String?
  receivedAt DateTime @default(now())
  createdAt  DateTime @default(now())

  // Relations
  invoice Invoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)

  @@index([invoiceId])
  @@map("payments")
}

// ============================================
// Customers & Suppliers
// ============================================

model Customer {
  id        String    @id @default(uuid())
  name      String
  contact   String?
  email     String?
  phone     String?
  address   String?
  taxId     String?
  notes     String?
  isActive  Boolean   @default(true)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  // Relations
  invoices Invoice[]

  @@index([email])
  @@map("customers")
}

model Supplier {
  id        String   @id @default(uuid())
  name      String
  contact   String?
  email     String?
  phone     String?
  address   String?
  notes     String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  devices Device[]

  @@map("suppliers")
}

// ============================================
// Audit & Compliance
// ============================================

model AuditLog {
  id        String   @id @default(uuid())
  userId    String
  entity    String   // e.g., "Device", "Invoice"
  entityId  String
  action    String   // e.g., "CREATE", "UPDATE", "DELETE"
  before    Json?
  after     Json?
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())

  // Relations
  user User @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([entity, entityId])
  @@index([createdAt])
  @@map("audit_logs")
}
```

### Database Indexes & Performance

**Critical Indexes:**
```sql
-- Full-text search for devices
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_devices_imei_trgm ON devices USING gin (imei gin_trgm_ops);
CREATE INDEX idx_devices_serial_trgm ON devices USING gin (serial_number gin_trgm_ops);

-- Product search
CREATE INDEX idx_products_name_trgm ON products USING gin (name gin_trgm_ops);
CREATE INDEX idx_products_brand_trgm ON products USING gin (brand gin_trgm_ops);

-- Composite indexes for common queries
CREATE INDEX idx_devices_status_created ON devices (status, created_at DESC);
CREATE INDEX idx_invoices_customer_date ON invoices (customer_id, created_at DESC);
```

---

## API Specification

### Base URL Structure

```
Development:  http://localhost:3000/api/v1
Production:   https://api.retech.example.com/api/v1
```

### Authentication

All endpoints except `/auth/login` require JWT bearer token:

```http
Authorization: Bearer <access_token>
```

### Common Response Structures

**Success Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Validation failed",
    "details": [...]
  }
}
```

**Paginated Response:**
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Core Endpoints

#### Authentication (`/auth`)

```
POST   /auth/login              # Login with email/password
POST   /auth/refresh            # Refresh access token
POST   /auth/logout             # Logout (invalidate refresh token)
GET    /auth/me                 # Get current user profile
POST   /auth/change-password    # Change password
POST   /auth/forgot-password    # Request password reset
POST   /auth/reset-password     # Reset password with token
```

**Example: Login**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@retech.com",
  "password": "SecurePassword123!"
}

Response:
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "id": "uuid",
      "email": "admin@retech.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "ADMIN"
    }
  }
}
```

#### Users (`/users`) - Admin Only

```
GET    /users                   # List all users
POST   /users                   # Create new user
GET    /users/:id               # Get user by ID
PATCH  /users/:id               # Update user
DELETE /users/:id               # Delete user (soft delete)
PATCH  /users/:id/role          # Update user role
PATCH  /users/:id/activate      # Activate user
PATCH  /users/:id/deactivate    # Deactivate user
```

#### Devices (`/devices`)

```
GET    /devices                 # List devices (paginated, filtered)
POST   /devices                 # Create single device
GET    /devices/:id             # Get device details
PATCH  /devices/:id             # Update device
DELETE /devices/:id             # Delete device
GET    /devices/search          # Search by IMEI/serial
POST   /devices/bulk            # Bulk import from CSV
GET    /devices/export          # Export to CSV
PATCH  /devices/:id/status      # Update device status
GET    /devices/:id/history     # Get movement history
```

**Query Parameters for GET /devices:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `search` (text search)
- `status` (filter by status)
- `brand` (filter by brand)
- `category` (filter by category)
- `supplierId` (filter by supplier)
- `locationId` (filter by location)
- `condition` (filter by condition)
- `sortBy` (field to sort by)
- `sortOrder` (asc/desc)

**Example: Create Device**
```http
POST /api/v1/devices
Authorization: Bearer <token>
Content-Type: application/json

{
  "productVariantId": "uuid",
  "imei": "123456789012345",
  "serialNumber": "SN123456",
  "condition": "Like New",
  "purchasePrice": 450.00,
  "purchaseDate": "2025-11-15",
  "supplierId": "uuid",
  "locationId": "uuid",
  "notes": "Battery replaced"
}
```

#### Inventory Movements (`/inventory`)

```
POST   /inventory/stock-in      # Record new stock arrival
POST   /inventory/transfer      # Transfer between locations
POST   /inventory/adjustment    # Write-off, damaged, etc.
POST   /inventory/return/customer   # Customer return
POST   /inventory/return/supplier   # Return to supplier
GET    /inventory/movements     # List all movements
GET    /inventory/movements/:deviceId  # Movements for device
```

#### Products (`/products`)

```
GET    /products                # List all products
POST   /products                # Create product
GET    /products/:id            # Get product with variants
PATCH  /products/:id            # Update product
DELETE /products/:id            # Delete product
POST   /products/:id/variants   # Add variant
PATCH  /variants/:id            # Update variant
DELETE /variants/:id            # Delete variant
PATCH  /products/:id/archive    # Archive product
PATCH  /products/:id/unarchive  # Unarchive product
```

#### Invoices (`/invoices`)

```
GET    /invoices                # List all invoices
POST   /invoices                # Create invoice (draft)
GET    /invoices/:id            # Get invoice details
PATCH  /invoices/:id            # Update invoice (draft only)
DELETE /invoices/:id            # Delete invoice (draft only)
POST   /invoices/:id/lines      # Add line item
PATCH  /invoices/:id/lines/:lineId  # Update line item
DELETE /invoices/:id/lines/:lineId  # Remove line item
POST   /invoices/:id/finalize   # Finalize invoice
POST   /invoices/:id/cancel     # Cancel invoice
GET    /invoices/:id/pdf        # Download PDF
POST   /invoices/:id/email      # Email invoice to customer
POST   /invoices/:id/payments   # Record payment
GET    /invoices/:id/payments   # List payments
```

**Example: Create Invoice**
```http
POST /api/v1/invoices
Authorization: Bearer <token>
Content-Type: application/json

{
  "customerId": "uuid",
  "dueDate": "2025-12-31",
  "notes": "Wholesale order",
  "lines": [
    {
      "type": "SERIALIZED",
      "deviceId": "uuid",
      "description": "iPhone 15 Pro 256GB",
      "quantity": 1,
      "unitPrice": 999.00,
      "taxRate": 8.5
    },
    {
      "type": "NON_SERIALIZED",
      "productVariantId": "uuid",
      "description": "Screen Protector",
      "quantity": 2,
      "unitPrice": 15.00,
      "taxRate": 8.5
    }
  ]
}
```

#### Customers (`/customers`)

```
GET    /customers               # List all customers
POST   /customers               # Create customer
GET    /customers/:id           # Get customer details
PATCH  /customers/:id           # Update customer
DELETE /customers/:id           # Delete customer
GET    /customers/:id/invoices  # Customer invoice history
GET    /customers/:id/stats     # Customer statistics
```

#### Suppliers (`/suppliers`)

```
GET    /suppliers               # List all suppliers
POST   /suppliers               # Create supplier
GET    /suppliers/:id           # Get supplier details
PATCH  /suppliers/:id           # Update supplier
DELETE /suppliers/:id           # Delete supplier
GET    /suppliers/:id/devices   # Devices from supplier
GET    /suppliers/:id/stats     # Supplier statistics
```

#### Reports (`/reports`)

```
GET    /reports/inventory       # Inventory summary
GET    /reports/sales           # Sales report
GET    /reports/revenue         # Revenue analytics
GET    /reports/profit          # Profit estimation
GET    /reports/devices-by-status    # Device count by status
GET    /reports/top-products    # Best selling products
GET    /reports/low-stock       # Low stock alerts
```

**Query Parameters for Reports:**
- `startDate` (ISO 8601 date)
- `endDate` (ISO 8601 date)
- `groupBy` (day/week/month)
- `supplierId` (filter by supplier)
- `customerId` (filter by customer)

#### Mobile Endpoints (`/mobile`)

Read-only endpoints optimized for iOS app:

```
GET    /mobile/stats            # Dashboard statistics
GET    /mobile/products         # Product list with counts
GET    /mobile/products/:id     # Product details with variants
GET    /mobile/devices          # Device list (simplified)
GET    /mobile/devices/:id      # Device details
GET    /mobile/search           # Global search
```

---

## Security & Authentication

### Authentication Flow

1. **Initial Login:**
   - User submits email + password
   - Backend validates credentials
   - Returns access token (15min) + refresh token (7 days)
   - Client stores tokens securely

2. **API Requests:**
   - Include `Authorization: Bearer <access_token>` header
   - Backend validates JWT signature and expiry
   - Extracts user ID and role from token
   - Applies RBAC guards

3. **Token Refresh:**
   - When access token expires, client calls `/auth/refresh`
   - Sends refresh token
   - Backend validates and issues new access token
   - Rotates refresh token for security

4. **Logout:**
   - Client calls `/auth/logout`
   - Backend invalidates refresh token
   - Client clears stored tokens

### Password Security

- **Hashing:** Argon2id (memory-hard, resistant to GPU attacks)
- **Requirements:**
  - Minimum 8 characters
  - At least 1 uppercase, 1 lowercase, 1 number
  - No common passwords (check against dictionary)

### Role-Based Access Control (RBAC)

**Role Hierarchy:**

| Role    | Permissions |
|---------|-------------|
| ADMIN   | Full access: manage users, all modules, settings |
| MANAGER | Manage inventory, invoices, customers, suppliers, reports |
| STAFF   | Create/edit devices, create invoices, view reports |
| VIEWER  | Read-only access to inventory and reports |

**Implementation:**
```typescript
// Example: Decorator usage
@Roles('ADMIN', 'MANAGER')
@UseGuards(JwtAuthGuard, RolesGuard)
@Post('devices')
async createDevice(@Body() dto: CreateDeviceDto) {
  // Only Admin and Manager can create devices
}
```

### API Security Measures

1. **Rate Limiting:**
   - Authentication endpoints: 5 requests/min per IP
   - API endpoints: 100 requests/min per user
   - Use Redis for distributed rate limiting

2. **Input Validation:**
   - All DTOs validated with class-validator
   - Sanitize inputs to prevent XSS
   - Prisma ORM prevents SQL injection

3. **CORS:**
   - Restrict to known origins (desktop app, mobile app)
   - Credentials allowed for authenticated requests

4. **Security Headers:**
   - Helmet.js for standard security headers
   - CSP (Content Security Policy)
   - HSTS (HTTP Strict Transport Security)

5. **Audit Logging:**
   - Log all sensitive operations (create, update, delete)
   - Log authentication attempts
   - Store IP address and user agent
   - Retain logs for compliance (30 days minimum)

### Data Protection

1. **Encryption at Rest:**
   - Database: Enable PostgreSQL encryption
   - Files: Server-side encryption in S3

2. **Encryption in Transit:**
   - TLS 1.3 for all API communication
   - Certificate pinning in mobile app

3. **Sensitive Data Handling:**
   - Never log passwords or tokens
   - Mask credit card numbers in logs
   - Redact PII in error messages

---

## Desktop Application

### Technology Details

**Core Stack:**
- Electron 28+ (Chromium + Node.js)
- React 18 with TypeScript
- Vite for fast builds and HMR
- shadcn/ui + Tailwind CSS for UI
- Zustand for global state
- React Query for server state
- React Hook Form + Zod for forms

**Key Features:**
- Native window controls
- System tray integration
- Auto-updates via electron-updater
- Offline mode with SQLite
- Print support
- File system access for imports/exports

### Architecture

```
┌─────────────────────────────────────┐
│         Main Process (Node.js)       │
│  - System APIs                       │
│  - SQLite database                   │
│  - Auto-updater                      │
│  - IPC handlers                      │
└───────────────┬─────────────────────┘
                │ IPC
┌───────────────▼─────────────────────┐
│       Preload Script (Bridge)        │
│  - Exposes safe APIs to renderer     │
│  - Context isolation                 │
└───────────────┬─────────────────────┘
                │
┌───────────────▼─────────────────────┐
│      Renderer Process (React)        │
│  - User interface                    │
│  - API client                        │
│  - Business logic                    │
└─────────────────────────────────────┘
```

### Security Configuration

**electron-builder.yml:**
```yaml
appId: com.retech.inventory
productName: Retech Inventory
copyright: Copyright © 2025

mac:
  category: public.app-category.business
  hardenedRuntime: true
  gatekeeperAssess: false
  entitlements: build/entitlements.mac.plist
  entitlementsInherit: build/entitlements.mac.plist
  notarize:
    teamId: YOUR_TEAM_ID

win:
  target: nsis
  certificateFile: certificates/win-certificate.pfx
  certificatePassword: ${WIN_CSC_KEY_PASSWORD}

linux:
  target: AppImage
  category: Office

publish:
  provider: github
  owner: your-org
  repo: retech-inventory
```

### Auto-Update Configuration

**main/index.ts:**
```typescript
import { autoUpdater } from 'electron-updater';

// Check for updates on startup
autoUpdater.checkForUpdatesAndNotify();

// Check every 4 hours
setInterval(() => {
  autoUpdater.checkForUpdatesAndNotify();
}, 4 * 60 * 60 * 1000);

autoUpdater.on('update-downloaded', () => {
  // Notify user and prompt to restart
  dialog.showMessageBox({
    type: 'info',
    title: 'Update Ready',
    message: 'A new version has been downloaded. Restart to apply?',
    buttons: ['Restart', 'Later']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});
```

### Offline Mode Strategy

1. **Initial Sync:**
   - On login, fetch essential data from API
   - Store in SQLite: devices, products, customers
   - Mark data with sync timestamp

2. **Offline Operations:**
   - Allow device creation/editing
   - Queue operations in `pending_sync` table
   - Show offline indicator in UI

3. **Reconnection:**
   - Detect network availability
   - Process pending_sync queue
   - Conflict resolution: last-write-wins or prompt user
   - Update local cache with server data

**SQLite Schema (simplified):**
```sql
CREATE TABLE devices_cache (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,  -- JSON
  synced_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE pending_sync (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  operation TEXT NOT NULL,  -- 'CREATE', 'UPDATE', 'DELETE'
  entity TEXT NOT NULL,      -- 'device', 'invoice', etc.
  entity_id TEXT,
  payload TEXT NOT NULL,     -- JSON
  created_at INTEGER NOT NULL
);
```

### Build and Distribution

**Development:**
```bash
cd desktop
npm install
npm run dev  # Starts Electron with HMR
```

**Build:**
```bash
npm run build:mac     # macOS build
npm run build:win     # Windows build
npm run build:linux   # Linux build
npm run build:all     # All platforms
```

**Release Process:**
1. Bump version in package.json
2. Update CHANGELOG.md
3. Commit and tag: `git tag v1.0.0`
4. Push: `git push --tags`
5. CI builds and uploads to GitHub Releases
6. Auto-updater detects new version

---

## iOS Mobile Application

### Technology Details

**Core Stack:**
- SwiftUI (iOS 17+)
- Swift 5.9+
- Combine framework for reactive programming
- URLSession for networking
- Core Data for persistence
- Keychain for secure storage

**Architecture:**
- MVVM (Model-View-ViewModel)
- Dependency injection via environment
- Repository pattern for data access

### Project Structure

```swift
// Models
struct Device: Codable, Identifiable {
    let id: String
    let imei: String?
    let serialNumber: String
    let brand: String
    let model: String
    let status: DeviceStatus
    let condition: String
    let purchasePrice: Decimal?
    // ...
}

enum DeviceStatus: String, Codable {
    case inStock = "IN_STOCK"
    case sold = "SOLD"
    case returned = "RETURNED"
}

// View Model
@MainActor
class DeviceListViewModel: ObservableObject {
    @Published var devices: [Device] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let networkService: NetworkService
    private let storageService: StorageService

    init(networkService: NetworkService, storageService: StorageService) {
        self.networkService = networkService
        self.storageService = storageService
    }

    func loadDevices() async {
        isLoading = true
        defer { isLoading = false }

        do {
            // Try network first
            let devices = try await networkService.fetchDevices()
            self.devices = devices
            // Cache for offline
            await storageService.saveDevices(devices)
        } catch {
            // Fallback to cache
            if let cached = await storageService.loadDevices() {
                self.devices = cached
                errorMessage = "Showing cached data (offline)"
            } else {
                errorMessage = error.localizedDescription
            }
        }
    }
}

// View
struct DeviceListView: View {
    @StateObject private var viewModel: DeviceListViewModel
    @State private var searchText = ""

    var body: some View {
        NavigationStack {
            List {
                ForEach(filteredDevices) { device in
                    NavigationLink(destination: DeviceDetailView(device: device)) {
                        DeviceRow(device: device)
                    }
                }
            }
            .searchable(text: $searchText)
            .refreshable {
                await viewModel.loadDevices()
            }
            .navigationTitle("Inventory")
            .overlay {
                if viewModel.isLoading {
                    ProgressView()
                }
            }
            .alert("Error", isPresented: .constant(viewModel.errorMessage != nil)) {
                Button("OK") {
                    viewModel.errorMessage = nil
                }
            } message: {
                Text(viewModel.errorMessage ?? "")
            }
        }
        .task {
            await viewModel.loadDevices()
        }
    }

    private var filteredDevices: [Device] {
        if searchText.isEmpty {
            return viewModel.devices
        }
        return viewModel.devices.filter {
            $0.imei?.localizedCaseInsensitiveContains(searchText) == true ||
            $0.serialNumber.localizedCaseInsensitiveContains(searchText) ||
            $0.model.localizedCaseInsensitiveContains(searchText)
        }
    }
}
```

### Authentication with Keychain

```swift
class KeychainHelper {
    static func saveToken(_ token: String, for key: String) throws {
        let data = Data(token.utf8)
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecValueData as String: data
        ]

        SecItemDelete(query as CFDictionary)
        let status = SecItemAdd(query as CFDictionary, nil)

        guard status == errSecSuccess else {
            throw KeychainError.saveFailed
        }
    }

    static func loadToken(for key: String) throws -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess,
              let data = result as? Data,
              let token = String(data: data, encoding: .utf8) else {
            return nil
        }

        return token
    }
}
```

### Core Data for Offline Cache

**RetechInventory.xcdatamodeld:**
```swift
// Entity: CachedDevice
// Attributes:
//   - id: String
//   - imei: String?
//   - serialNumber: String
//   - brand: String
//   - model: String
//   - status: String
//   - condition: String
//   - syncedAt: Date
//   - data: Data (full JSON)

class PersistenceController {
    static let shared = PersistenceController()

    let container: NSPersistentContainer

    init() {
        container = NSPersistentContainer(name: "RetechInventory")
        container.loadPersistentStores { _, error in
            if let error = error {
                fatalError("Core Data failed to load: \(error)")
            }
        }
    }

    func saveDevices(_ devices: [Device]) async throws {
        let context = container.viewContext

        // Clear old cached devices
        let fetchRequest: NSFetchRequest<NSFetchRequestResult> = CachedDevice.fetchRequest()
        let deleteRequest = NSBatchDeleteRequest(fetchRequest: fetchRequest)
        try context.execute(deleteRequest)

        // Save new devices
        for device in devices {
            let cached = CachedDevice(context: context)
            cached.id = device.id
            cached.imei = device.imei
            cached.serialNumber = device.serialNumber
            cached.brand = device.brand
            cached.model = device.model
            cached.status = device.status.rawValue
            cached.syncedAt = Date()

            // Store full JSON for detailed view
            if let data = try? JSONEncoder().encode(device) {
                cached.data = data
            }
        }

        try context.save()
    }
}
```

### Build Configuration

**Build Settings:**
- Deployment Target: iOS 17.0
- Swift Language Version: 5.9
- Code Signing: Automatic
- Bundle Identifier: com.retech.inventory.mobile

**Info.plist:**
```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access to scan barcodes</string>
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
</dict>
```

### Build Commands

```bash
# Build for simulator
xcodebuild -scheme RetechInventory \
  -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,name=iPhone 15' \
  build

# Run tests
xcodebuild -scheme RetechInventory \
  -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,name=iPhone 15' \
  test

# Archive for distribution
xcodebuild -scheme RetechInventory \
  -sdk iphoneos \
  -configuration Release \
  archive \
  -archivePath ./build/RetechInventory.xcarchive

# Export IPA
xcodebuild -exportArchive \
  -archivePath ./build/RetechInventory.xcarchive \
  -exportOptionsPlist ExportOptions.plist \
  -exportPath ./build/
```

---

## Infrastructure & DevOps

### Local Development Environment

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: retech_inventory
      POSTGRES_USER: retech
      POSTGRES_PASSWORD: devpassword123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U retech"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  minio:
    image: minio/minio:latest
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://retech:devpassword123@postgres:5432/retech_inventory
      REDIS_URL: redis://redis:6379
      JWT_SECRET: dev_jwt_secret_change_in_production
      NODE_ENV: development
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    volumes:
      - ./backend/src:/app/src
      - ./backend/prisma:/app/prisma
    command: npm run start:dev

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

**Start Development:**
```bash
docker-compose up -d
cd backend && npm run prisma:migrate:dev
cd backend && npm run seed
```

### Production Deployment

**Backend Dockerfile:**
```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npm run build
RUN npx prisma generate

FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

USER node

EXPOSE 3000

CMD ["dumb-init", "node", "dist/main.js"]
```

**Nginx Configuration:**
```nginx
upstream api_backend {
    server localhost:3000;
}

server {
    listen 80;
    server_name api.retech.example.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.retech.example.com;

    ssl_certificate /etc/letsencrypt/live/api.retech.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.retech.example.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    client_max_body_size 20M;

    location / {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### CI/CD with GitHub Actions

**Backend CI/CD (.github/workflows/backend-ci.yml):**
```yaml
name: Backend CI/CD

on:
  push:
    branches: [main, develop]
    paths:
      - 'backend/**'
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: test_db
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_pass
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        working-directory: ./backend
        run: npm ci

      - name: Run linter
        working-directory: ./backend
        run: npm run lint

      - name: Run tests
        working-directory: ./backend
        run: npm test
        env:
          DATABASE_URL: postgresql://test_user:test_pass@localhost:5432/test_db

      - name: Build
        working-directory: ./backend
        run: npm run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Build and push Docker image
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker build -t retech/backend:latest ./backend
          docker push retech/backend:latest

      - name: Deploy to production
        run: |
          # Your deployment script (SSH to server, pull image, restart)
          echo "Deploying to production..."
```

**Desktop Build (.github/workflows/desktop-build.yml):**
```yaml
name: Desktop Build

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    strategy:
      matrix:
        os: [macos-latest, windows-latest]

    runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        working-directory: ./desktop
        run: npm ci

      - name: Build
        working-directory: ./desktop
        run: npm run build
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          # macOS code signing
          CSC_LINK: ${{ secrets.MAC_CERT_BASE64 }}
          CSC_KEY_PASSWORD: ${{ secrets.MAC_CERT_PASSWORD }}
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_ID_PASSWORD: ${{ secrets.APPLE_ID_PASSWORD }}
          # Windows code signing
          WIN_CSC_LINK: ${{ secrets.WIN_CERT_BASE64 }}
          WIN_CSC_KEY_PASSWORD: ${{ secrets.WIN_CERT_PASSWORD }}

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: ${{ matrix.os }}-build
          path: desktop/dist/*

      - name: Release
        uses: softprops/action-gh-release@v1
        with:
          files: desktop/dist/*
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Database Backups

**Backup Script (infrastructure/scripts/backup.sh):**
```bash
#!/bin/bash
set -e

# Configuration
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="retech_inventory"
DB_USER="retech"
BACKUP_DIR="/var/backups/postgres"
S3_BUCKET="s3://retech-backups"
RETENTION_DAYS=30

# Create backup
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql.gz"

echo "Starting backup at $(date)"

# Dump database
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME | gzip > $BACKUP_FILE

# Upload to S3
aws s3 cp $BACKUP_FILE ${S3_BUCKET}/

# Clean up old backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

# Clean up old S3 backups
aws s3 ls ${S3_BUCKET}/ | while read -r line; do
    createDate=$(echo $line | awk '{print $1" "$2}')
    createDate=$(date -d "$createDate" +%s)
    olderThan=$(date -d "$RETENTION_DAYS days ago" +%s)
    if [[ $createDate -lt $olderThan ]]; then
        fileName=$(echo $line | awk '{print $4}')
        if [[ $fileName != "" ]]; then
            aws s3 rm ${S3_BUCKET}/$fileName
        fi
    fi
done

echo "Backup completed at $(date)"
```

**Cron Job:**
```cron
# Run backup every 6 hours
0 */6 * * * /path/to/backup.sh >> /var/log/backup.log 2>&1
```

### Monitoring with Prometheus

**Prometheus Configuration (prometheus.yml):**
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'retech-api'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
```

**Backend Metrics Endpoint:**
```typescript
// Add to backend
import { register, collectDefaultMetrics, Counter, Histogram } from 'prom-client';

// Collect default metrics
collectDefaultMetrics();

// Custom metrics
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
});

export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

// Expose metrics endpoint
@Get('/metrics')
async getMetrics() {
  return register.metrics();
}
```

---

## Testing Strategy

### Backend Testing

#### Unit Tests (Jest)
```typescript
// Example: devices.service.spec.ts
describe('DevicesService', () => {
  let service: DevicesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DevicesService,
        {
          provide: PrismaService,
          useValue: {
            device: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<DevicesService>(DevicesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a new device', async () => {
      const dto = {
        productVariantId: 'uuid',
        serialNumber: 'SN123',
        condition: 'New',
      };

      const expected = { id: 'uuid', ...dto };
      jest.spyOn(prisma.device, 'create').mockResolvedValue(expected as any);

      const result = await service.create(dto);
      expect(result).toEqual(expected);
      expect(prisma.device.create).toHaveBeenCalledWith({ data: dto });
    });

    it('should throw error for duplicate serial number', async () => {
      const dto = { serialNumber: 'DUPLICATE' };

      jest.spyOn(prisma.device, 'create').mockRejectedValue(
        new Error('Unique constraint failed')
      );

      await expect(service.create(dto)).rejects.toThrow();
    });
  });
});
```

#### Integration Tests
```typescript
// Example: devices.e2e-spec.ts
describe('Devices (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();

    // Login and get token
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'password' });

    authToken = response.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /devices', () => {
    it('should create a device', () => {
      return request(app.getHttpServer())
        .post('/devices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productVariantId: 'uuid',
          serialNumber: 'TEST123',
          condition: 'New',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.serialNumber).toBe('TEST123');
        });
    });

    it('should return 401 without auth token', () => {
      return request(app.getHttpServer())
        .post('/devices')
        .send({ serialNumber: 'TEST' })
        .expect(401);
    });
  });
});
```

**Coverage Target:** 80% minimum

**Run Commands:**
```bash
npm run test              # Unit tests
npm run test:e2e          # Integration tests
npm run test:cov          # Coverage report
```

### Desktop Testing

#### Component Tests (React Testing Library)
```typescript
// Example: DeviceList.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeviceList } from './DeviceList';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockDevices = [
  { id: '1', serialNumber: 'SN001', brand: 'Apple', model: 'iPhone 15' },
  { id: '2', serialNumber: 'SN002', brand: 'Samsung', model: 'Galaxy S24' },
];

jest.mock('../services/api.service', () => ({
  fetchDevices: jest.fn(() => Promise.resolve(mockDevices)),
}));

describe('DeviceList', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <DeviceList />
      </QueryClientProvider>
    );
  };

  it('should render devices list', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('SN001')).toBeInTheDocument();
      expect(screen.getByText('iPhone 15')).toBeInTheDocument();
    });
  });

  it('should filter devices by search', async () => {
    renderComponent();
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText('SN001')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search...');
    await user.type(searchInput, 'iPhone');

    expect(screen.getByText('iPhone 15')).toBeInTheDocument();
    expect(screen.queryByText('Galaxy S24')).not.toBeInTheDocument();
  });
});
```

#### E2E Tests (Playwright)
```typescript
// Example: login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('http://localhost:5173');

    await page.fill('[name="email"]', 'admin@test.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('http://localhost:5173');

    await page.fill('[name="email"]', 'wrong@test.com');
    await page.fill('[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('.error-message')).toContainText('Invalid credentials');
  });
});
```

### iOS Testing

#### Unit Tests (XCTest)
```swift
import XCTest
@testable import RetechInventory

class DeviceViewModelTests: XCTestCase {
    var viewModel: DeviceListViewModel!
    var mockNetworkService: MockNetworkService!
    var mockStorageService: MockStorageService!

    override func setUp() {
        super.setUp()
        mockNetworkService = MockNetworkService()
        mockStorageService = MockStorageService()
        viewModel = DeviceListViewModel(
            networkService: mockNetworkService,
            storageService: mockStorageService
        )
    }

    func testLoadDevicesSuccess() async throws {
        // Given
        let mockDevices = [
            Device(id: "1", serialNumber: "SN001", brand: "Apple", model: "iPhone 15", status: .inStock),
            Device(id: "2", serialNumber: "SN002", brand: "Samsung", model: "Galaxy S24", status: .inStock)
        ]
        mockNetworkService.devicesToReturn = mockDevices

        // When
        await viewModel.loadDevices()

        // Then
        XCTAssertEqual(viewModel.devices.count, 2)
        XCTAssertEqual(viewModel.devices.first?.serialNumber, "SN001")
        XCTAssertNil(viewModel.errorMessage)
    }

    func testLoadDevicesOffline() async throws {
        // Given
        mockNetworkService.shouldFail = true
        let cachedDevices = [Device(id: "1", serialNumber: "CACHED", brand: "Apple", model: "iPhone 14", status: .inStock)]
        mockStorageService.cachedDevices = cachedDevices

        // When
        await viewModel.loadDevices()

        // Then
        XCTAssertEqual(viewModel.devices.count, 1)
        XCTAssertEqual(viewModel.devices.first?.serialNumber, "CACHED")
        XCTAssertNotNil(viewModel.errorMessage)
        XCTAssertTrue(viewModel.errorMessage!.contains("offline"))
    }
}
```

#### UI Tests (XCUITest)
```swift
import XCTest

class LoginUITests: XCTestCase {
    var app: XCUIApplication!

    override func setUp() {
        super.setUp()
        continueAfterFailure = false
        app = XCUIApplication()
        app.launch()
    }

    func testLoginSuccess() {
        // Given
        let emailField = app.textFields["Email"]
        let passwordField = app.secureTextFields["Password"]
        let loginButton = app.buttons["Login"]

        // When
        emailField.tap()
        emailField.typeText("admin@test.com")

        passwordField.tap()
        passwordField.typeText("password123")

        loginButton.tap()

        // Then
        XCTAssertTrue(app.navigationBars["Dashboard"].waitForExistence(timeout: 5))
    }

    func testLoginInvalidCredentials() {
        let emailField = app.textFields["Email"]
        let passwordField = app.secureTextFields["Password"]
        let loginButton = app.buttons["Login"]

        emailField.tap()
        emailField.typeText("wrong@test.com")

        passwordField.tap()
        passwordField.typeText("wrongpassword")

        loginButton.tap()

        XCTAssertTrue(app.alerts["Error"].waitForExistence(timeout: 5))
    }
}
```

---

## Development Workflow

### Git Branching Strategy

**Branch Types:**
- `main` - Production-ready code, protected
- `develop` - Integration branch for development
- `feature/TASK-123-description` - Feature branches
- `bugfix/TASK-456-description` - Bug fix branches
- `hotfix/TASK-789-description` - Emergency fixes for production

**Workflow:**
1. Create feature branch from `develop`
2. Implement feature with tests
3. Create pull request to `develop`
4. Code review + CI checks pass
5. Merge to `develop`
6. When ready, merge `develop` to `main` for release

### Commit Convention (Conventional Commits)

Format: `<type>(<scope>): <subject>`

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance (dependencies, build, etc.)

**Examples:**
```
feat(inventory): add CSV import for devices
fix(auth): resolve token refresh race condition
docs(api): update authentication endpoint examples
refactor(desktop): extract device form into reusable component
test(backend): add integration tests for invoice module
chore(deps): upgrade NestJS to v10.3
```

### Code Review Checklist

**Before Creating PR:**
- [ ] Code follows style guide (linted)
- [ ] All tests pass locally
- [ ] New features have tests
- [ ] Documentation updated
- [ ] No console.log or debug code
- [ ] No sensitive data committed

**Reviewer Checklist:**
- [ ] Code solves the stated problem
- [ ] Logic is clear and maintainable
- [ ] Edge cases handled
- [ ] Security considerations addressed
- [ ] Performance is acceptable
- [ ] Tests are comprehensive
- [ ] API changes documented

### Local Development Setup

**Prerequisites:**
- Node.js 20+
- Docker & Docker Compose
- Git
- (macOS) Xcode Command Line Tools
- (Windows) Visual Studio Build Tools

**Initial Setup:**
```bash
# Clone repository
git clone https://github.com/your-org/retech-inventory-v1.git
cd retech-inventory-v1

# Install dependencies
npm install  # Root workspace
cd backend && npm install
cd ../desktop && npm install

# Start infrastructure
docker-compose up -d

# Run database migrations
cd backend && npx prisma migrate dev

# Seed database
npm run seed

# Start backend
cd backend && npm run start:dev

# In another terminal, start desktop app
cd desktop && npm run dev
```

**Environment Variables:**

Create `.env` files in each project:

**backend/.env:**
```env
NODE_ENV=development
PORT=3000

DATABASE_URL=postgresql://retech:devpassword123@localhost:5432/retech_inventory
REDIS_URL=redis://localhost:6379

JWT_SECRET=your-super-secret-jwt-key-change-me
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_ENDPOINT=http://localhost:9000
AWS_BUCKET=retech-files

SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply@retech.local

SENTRY_DSN=
```

**desktop/.env:**
```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_ENV=development
```

---

## Acceptance Criteria

### Functional Requirements

#### Authentication & User Management
- [ ] Users can register, login, and logout
- [ ] Password reset via email works
- [ ] JWT tokens expire and refresh correctly
- [ ] RBAC enforces permissions (Admin, Manager, Staff, Viewer)
- [ ] Users can change their password
- [ ] Admin can manage user accounts

#### Inventory Management
- [ ] Create device with IMEI/serial validation
- [ ] Update device details
- [ ] Delete device (soft delete)
- [ ] Search devices by IMEI, serial, model
- [ ] Filter devices by status, brand, supplier, location
- [ ] Sort devices by various fields
- [ ] Pagination works correctly
- [ ] CSV import validates and creates devices
- [ ] CSV export includes all visible fields
- [ ] Device status transitions tracked in audit log
- [ ] Inventory movements recorded for all changes

#### Product Catalog
- [ ] Create products with variants (storage, color, condition)
- [ ] Update product and variant details
- [ ] Archive/unarchive products
- [ ] Link devices to product variants

#### Invoicing
- [ ] Create draft invoice
- [ ] Add serialized line items (select device)
- [ ] Add non-serialized line items (accessories, services)
- [ ] Calculate totals, tax, discounts correctly
- [ ] Finalize invoice (locks for editing)
- [ ] Generate PDF invoice
- [ ] Email invoice to customer
- [ ] Record payments
- [ ] Track payment status (Unpaid, Partial, Paid)
- [ ] Cancel invoice
- [ ] Devices marked as SOLD when invoice finalized

#### Customers & Suppliers
- [ ] Create, update, delete customers
- [ ] View customer invoice history
- [ ] Create, update, delete suppliers
- [ ] View devices from supplier

#### Reporting
- [ ] Inventory summary report (total devices, by status, by category)
- [ ] Sales report (by date range, product, customer)
- [ ] Revenue report with charts
- [ ] Profit estimation (purchase price vs selling price)
- [ ] Export reports to CSV/Excel

#### Desktop Application
- [ ] Login and logout
- [ ] Dashboard shows key metrics
- [ ] Full device management (CRUD)
- [ ] Invoice creation flow works end-to-end
- [ ] Settings page allows configuration
- [ ] Offline mode: data cached locally
- [ ] Offline mode: operations queued and synced
- [ ] Auto-update downloads and installs updates
- [ ] Print functionality for invoices

#### iOS Application
- [ ] Login with same credentials as desktop
- [ ] Dashboard shows inventory statistics
- [ ] Browse devices (read-only)
- [ ] Search devices by IMEI/serial/model
- [ ] View device details
- [ ] Offline mode: data cached in Core Data
- [ ] Pull-to-refresh syncs with server
- [ ] Logout clears cached data

### Non-Functional Requirements

#### Performance
- [ ] API response time < 200ms (p95) for most endpoints
- [ ] Search returns results in < 100ms
- [ ] CSV import of 1000 devices completes in < 30s
- [ ] PDF generation completes in < 3s
- [ ] Desktop app launches in < 5s
- [ ] iOS app launches in < 3s
- [ ] Supports 100 concurrent API users without degradation

#### Reliability
- [ ] API uptime: 99.9% (measured)
- [ ] Database backups run every 6 hours automatically
- [ ] Backup restore tested successfully
- [ ] Zero data loss on application crash
- [ ] Graceful degradation when services unavailable

#### Security
- [ ] All passwords hashed with Argon2
- [ ] JWT tokens have proper expiry (15min access, 7 days refresh)
- [ ] HTTPS enforced for all API communication
- [ ] CORS restricted to known origins
- [ ] SQL injection attacks prevented
- [ ] XSS attacks prevented
- [ ] Rate limiting active (100 req/min per user)
- [ ] Sensitive operations logged in audit log
- [ ] OWASP Top 10 vulnerabilities addressed
- [ ] Dependency vulnerability scan shows no critical issues

#### Usability
- [ ] Desktop app intuitive for daily operations
- [ ] Error messages clear and actionable
- [ ] Loading states shown during async operations
- [ ] Offline indicator visible when disconnected
- [ ] Form validation provides helpful feedback
- [ ] iOS app follows Apple HIG (Human Interface Guidelines)

#### Documentation
- [ ] API documentation complete (Swagger/OpenAPI)
- [ ] Deployment guide written and tested
- [ ] User manual created with screenshots
- [ ] Admin guide covers user management, backups, troubleshooting
- [ ] README has quick start instructions
- [ ] Architecture diagrams created

#### DevOps
- [ ] CI/CD pipelines pass for all platforms
- [ ] Automated tests run on every PR
- [ ] Code coverage meets 80% threshold
- [ ] Docker images build successfully
- [ ] Desktop builds signed and notarized (macOS)
- [ ] Desktop builds code-signed (Windows)
- [ ] Auto-update mechanism tested and working
- [ ] Monitoring dashboards configured (Grafana)
- [ ] Alerts configured for critical issues (Sentry, email)

---

## Agent Operating Guide

> **This section is specifically for AI agents (like Codex, Claude, GPT-4) working on this project. Human developers can benefit too, but the focus is on providing context and tools for autonomous code generation and problem-solving.**

### Primary Objectives

1. **Implement backend first** (NestJS + PostgreSQL + Prisma) with complete test coverage
2. **Build desktop app** (Electron + React) for daily operations
3. **Create iOS app** (SwiftUI) for read-only inventory access
4. **Set up infrastructure** (Docker, CI/CD, monitoring, backups)
5. **Ensure production readiness** (security, performance, documentation)

### Tools to Use

#### 1. **xcodebuild** - iOS Build & Test
```bash
# Build for simulator
xcodebuild -scheme RetechInventory \
  -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,name=iPhone 15' \
  build

# Run tests
xcodebuild -scheme RetechInventory \
  -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,name=iPhone 15' \
  test
```

#### 2. **context7** - Fetch Authoritative Library Docs
Use context7 to get up-to-date documentation for libraries:

**Step 1: Resolve library ID**
```bash
context7 resolve-library-id nestjs/nest
# Returns: /nestjs/nest
```

**Step 2: Get documentation**
```bash
context7 get-library-docs /nestjs/nest
# Returns: Latest NestJS documentation
```

**Suggested library IDs to use:**
- `/nestjs/nest` - NestJS framework
- `/prisma/prisma` - Prisma ORM
- `/electron/electron` - Electron framework
- `/electron-userland/electron-builder` - Electron packaging
- `/apple/swift` - Swift language
- `/apple/swiftui` - SwiftUI framework
- `/tanstack/query` - React Query (for desktop)
- `/shadcn/ui` - UI components (for desktop)

#### 3. **exa** - Web & Code Search
Use exa to find recent examples and best practices:
```bash
# Search for code examples
exa code "nestjs jwt authentication example 2025"

# Search for articles
exa web "electron auto-update best practices 2025"

# Search specific domains
exa web "swiftui core data integration" --domains developer.apple.com
```

#### 4. **Oracle** - Sanity Check Risky Changes
Use Oracle to validate complex implementations before committing:
```bash
# CLI usage
npx -y @steipete/oracle@latest "Is this Prisma migration safe for production?"

# Or use web version at https://oracle.steipete.com/
```

**When to use Oracle:**
- Before running database migrations
- When implementing security-sensitive features (auth, RBAC)
- When using unfamiliar APIs or patterns
- Before making performance optimizations
- When handling user data or PII

### Memory & Continuity

**For GPT-5 Pro or similar models with memory:**

**Initial prompt:**
```
Save "Retech Inventory V1 project" with the following context:

- Stack: NestJS backend, PostgreSQL database, Electron desktop app, SwiftUI iOS app
- Architecture: Monorepo with backend/, desktop/, mobile-ios/
- Current phase: [Foundation | Backend | Desktop | iOS | Infrastructure | Testing]
- Last completed: [milestone description]
- Next tasks: [list of upcoming tasks]

When I say "Recall Retech session", load this context and continue from where we left off.
```

**Resuming work:**
```
Recall Retech session. Continue with [specific task or phase].
```

### Grounding Documentation

Before implementing a feature in an unfamiliar area, fetch official docs using context7:

**Example workflow:**
1. Task: Implement JWT authentication in NestJS
2. Fetch docs: `context7 get-library-docs /nestjs/nest` (focus on guards, strategies)
3. Search examples: `exa code "nestjs jwt passport example github"`
4. Implement with confidence using official patterns
5. Validate: `oracle "Review this JWT implementation for security issues"`

### Implementation Workflow

#### Phase 1: Backend (Weeks 1-4)

**Week 1: Foundation**
```bash
# 1. Set up project structure
mkdir -p backend/src/{modules,common,config,prisma}

# 2. Initialize NestJS
cd backend
npm init -y
npm install --save @nestjs/core @nestjs/common @nestjs/platform-express rxjs reflect-metadata

# 3. Set up Prisma
npm install --save-dev prisma
npm install @prisma/client
npx prisma init

# 4. Fetch NestJS best practices
context7 get-library-docs /nestjs/nest
exa code "nestjs project structure best practices 2025"

# 5. Implement main.ts, app.module.ts with:
#    - Validation pipe (global)
#    - CORS configuration
#    - Helmet for security headers
#    - Swagger/OpenAPI setup
#    - Winston logging

# 6. Create Docker Compose for local dev
# 7. Start infrastructure: docker-compose up -d
```

**Week 2: Auth & RBAC**
```bash
# 1. Design Prisma schema (User, RefreshToken models)
# 2. Create migration: npx prisma migrate dev --name init
# 3. Generate client: npx prisma generate

# 4. Implement Auth module:
#    - auth.controller.ts (login, refresh, logout)
#    - auth.service.ts (business logic)
#    - jwt.strategy.ts (JWT validation)
#    - local.strategy.ts (email/password)
#    - guards (jwt-auth.guard.ts, roles.guard.ts)

# 5. Fetch Passport docs
context7 get-library-docs /jaredhanson/passport
exa code "nestjs passport jwt refresh token example"

# 6. Write comprehensive tests
npm run test -- auth.service.spec.ts
npm run test:e2e -- auth.e2e-spec.ts

# 7. Validate security
oracle "Review this authentication implementation for vulnerabilities"
```

**Weeks 3-4: Core Modules**
Follow similar pattern for each module:
1. Design database models (Prisma schema)
2. Create migration
3. Generate DTOs with validation decorators
4. Implement controller + service + tests
5. Add Swagger decorators
6. Fetch relevant docs (context7) if needed
7. Test with integration tests
8. Validate with Oracle for complex logic

#### Phase 2: Desktop (Weeks 5-6)

```bash
# 1. Initialize Electron + React + Vite
npm create vite@latest desktop -- --template react-ts
cd desktop
npm install

# 2. Add Electron
npm install --save-dev electron electron-builder
npm install electron-updater

# 3. Fetch Electron docs
context7 get-library-docs /electron/electron
context7 get-library-docs /electron-userland/electron-builder

# 4. Set up main/renderer/preload structure
mkdir -p src/{main,renderer,preload}

# 5. Configure IPC for secure communication
# 6. Add shadcn/ui components
npx shadcn-ui@latest init

# 7. Implement features incrementally:
#    - Auth flow (login, token storage)
#    - Dashboard
#    - Inventory management
#    - Invoice creation
#    - Settings

# 8. Configure electron-builder for auto-update
# 9. Test build: npm run build:mac
```

#### Phase 3: iOS (Weeks 7-8)

```bash
# 1. Create Xcode project
open -a Xcode

# 2. Set up MVVM structure
mkdir -p RetechInventory/{Models,Views,ViewModels,Services,Network,CoreData}

# 3. Fetch SwiftUI docs
context7 get-library-docs /apple/swiftui
exa code "swiftui mvvm networking example"

# 4. Implement network layer with URLSession
# 5. Implement Keychain for token storage
# 6. Create Core Data model for offline cache
# 7. Build views (LoginView, DashboardView, DeviceListView, DeviceDetailView)
# 8. Implement view models with @Published properties
# 9. Add pull-to-refresh and search

# 10. Test on simulator
xcodebuild -scheme RetechInventory \
  -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,name=iPhone 15' \
  build
```

#### Phase 4: Infrastructure (Week 9)

```bash
# 1. Create production Dockerfile
# 2. Set up Nginx config with SSL
# 3. Configure GitHub Actions workflows
# 4. Set up database backup script
# 5. Configure Prometheus + Grafana
# 6. Set up Sentry for error tracking
# 7. Test deployment to staging
# 8. Validate monitoring and alerts
# 9. Document deployment process
```

#### Phase 5: Testing & Polish (Week 10)

```bash
# 1. Run full test suite
cd backend && npm run test:cov
cd ../desktop && npm test

# 2. Security audit
npm audit
oracle "Security audit of authentication and authorization implementation"

# 3. Performance testing
# Load test API with 100 concurrent users
# Measure API response times (p50, p95, p99)

# 4. Documentation review
# Ensure all endpoints documented in Swagger
# Update README with setup instructions
# Create deployment guide

# 5. Final QA
# Test all critical user flows
# Verify offline mode works
# Test auto-update mechanism
```

### Verification & Double-Check

**Before committing:**
1. **Lint:** `npm run lint` (fix all issues)
2. **Tests:** `npm test` (all passing)
3. **Build:** `npm run build` (no errors)
4. **Type-check:** `npx tsc --noEmit` (no type errors)

**Before deploying:**
1. **Security:** Run `npm audit`, fix critical vulnerabilities
2. **Performance:** Test with realistic data volumes
3. **Backups:** Verify backup script works and can restore
4. **Monitoring:** Confirm metrics and alerts configured

**Use Oracle for:**
- Prisma migrations before applying to production
- Security-critical code (auth, payments, data access)
- Complex business logic that handles money or PII
- Performance-critical queries or algorithms

### Communication & Commits

**Commit messages:**
- Use Conventional Commits format
- Be specific and descriptive
- Reference task IDs if applicable

**Example:**
```bash
git commit -m "feat(inventory): add CSV import with validation

- Parse CSV using fast-csv library
- Validate IMEI/serial uniqueness before import
- Show preview with error highlighting
- Add integration tests

Closes TASK-123"
```

**Pull requests:**
- Keep PRs focused (1 feature or bug fix)
- Include tests with new features
- Update documentation as needed
- Add screenshots for UI changes
- Request review from relevant team members

**Swagger sync:**
- Update Swagger decorators when API changes
- Regenerate API client for desktop app
- Commit generated client with API changes

### Error Handling Patterns

**Backend:**
```typescript
// Use custom exceptions
throw new BadRequestException('Invalid IMEI format');
throw new NotFoundException(`Device with ID ${id} not found`);
throw new ForbiddenException('Insufficient permissions');

// Global exception filter handles consistent error format
```

**Desktop:**
```typescript
// Show user-friendly error toasts
toast.error('Failed to create device. Please check the form and try again.');

// Log technical details for debugging
console.error('[DeviceService]', error);
```

**iOS:**
```swift
// Show alerts for errors
@State private var errorMessage: String?

.alert("Error", isPresented: .constant(errorMessage != nil)) {
    Button("OK") { errorMessage = nil }
} message: {
    Text(errorMessage ?? "")
}
```

### Performance Optimization Tips

**Database:**
- Add indexes for frequently queried fields
- Use `select` to fetch only needed fields
- Paginate large result sets
- Use transactions for multi-step operations

**API:**
- Enable compression (gzip)
- Cache expensive queries (Redis)
- Use background jobs for slow operations (Bull queue)
- Implement rate limiting

**Desktop:**
- Lazy load routes with React.lazy()
- Virtualize long lists (react-window)
- Debounce search inputs
- Optimize bundle size (analyze with rollup-plugin-visualizer)

**iOS:**
- Use LazyVStack for long lists
- Prefetch next page when user scrolls near end
- Cache images (URLCache)
- Batch Core Data saves

### Common Pitfalls to Avoid

1. **Don't commit secrets** - Use environment variables, never hardcode
2. **Don't skip migrations** - Always create migrations for schema changes
3. **Don't ignore TypeScript errors** - Fix them, don't use `@ts-ignore`
4. **Don't forget error handling** - Every async operation can fail
5. **Don't skip tests** - Tests are documentation and safety net
6. **Don't log sensitive data** - Mask passwords, tokens, PII
7. **Don't deploy without backups** - Always have a rollback plan
8. **Don't ignore warnings** - Linter warnings catch bugs early

---

## Quick Reference

### Essential Commands

**Backend:**
```bash
cd backend

# Development
npm run start:dev          # Start with hot-reload
npm run build              # Build for production
npm run start:prod         # Start production build

# Database
npx prisma studio          # Open Prisma Studio (GUI)
npx prisma migrate dev     # Create and apply migration
npx prisma generate        # Generate Prisma Client
npx prisma db seed         # Seed database

# Testing
npm test                   # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Generate coverage report
npm run test:e2e           # Run e2e tests

# Linting
npm run lint               # Check for issues
npm run lint:fix           # Auto-fix issues
```

**Desktop:**
```bash
cd desktop

# Development
npm run dev                # Start Electron with HMR

# Build
npm run build              # Build renderer only
npm run build:mac          # Build macOS app
npm run build:win          # Build Windows app
npm run build:linux        # Build Linux app

# Testing
npm test                   # Run component tests
npm run test:e2e           # Run Playwright e2e tests
```

**iOS:**
```bash
cd mobile-ios

# Build
xcodebuild -scheme RetechInventory \
  -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,name=iPhone 15' \
  build

# Test
xcodebuild -scheme RetechInventory \
  -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,name=iPhone 15' \
  test

# Clean
xcodebuild clean
```

**Infrastructure:**
```bash
# Start local environment
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop all services
docker-compose down

# Rebuild containers
docker-compose up -d --build

# Database backup
./infrastructure/scripts/backup.sh

# Database restore
./infrastructure/scripts/restore.sh backup_file.sql.gz
```

### Environment Setup Checklist

**First-time setup:**
- [ ] Install Node.js 20+
- [ ] Install Docker Desktop
- [ ] Install Git
- [ ] (macOS) Install Xcode Command Line Tools: `xcode-select --install`
- [ ] Clone repository: `git clone [url]`
- [ ] Install root dependencies: `npm install`
- [ ] Install backend dependencies: `cd backend && npm install`
- [ ] Install desktop dependencies: `cd desktop && npm install`
- [ ] Copy `.env.example` to `.env` in each project
- [ ] Start Docker services: `docker-compose up -d`
- [ ] Run database migrations: `cd backend && npx prisma migrate dev`
- [ ] Seed database: `cd backend && npm run seed`
- [ ] Start backend: `cd backend && npm run start:dev`
- [ ] Start desktop: `cd desktop && npm run dev`
- [ ] Verify http://localhost:3000/api/docs (Swagger UI)

### Key URLs (Local Development)

- Backend API: http://localhost:3000
- Swagger/OpenAPI: http://localhost:3000/api/docs
- Desktop App: Electron window (launched via `npm run dev`)
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- MinIO Console: http://localhost:9001 (minioadmin / minioadmin)
- Prisma Studio: http://localhost:5555 (after `npx prisma studio`)

### Troubleshooting

**Database connection fails:**
```bash
# Check if PostgreSQL container is running
docker ps | grep postgres

# View logs
docker-compose logs postgres

# Restart container
docker-compose restart postgres
```

**Prisma Client out of sync:**
```bash
# Regenerate Prisma Client
cd backend
npx prisma generate
```

**Desktop app won't start:**
```bash
# Clear node_modules and reinstall
cd desktop
rm -rf node_modules
npm install

# Clear Electron cache
rm -rf ~/.config/Electron
```

**iOS build fails:**
```bash
# Clean build folder
xcodebuild clean

# Reset package cache
rm -rf ~/Library/Developer/Xcode/DerivedData
```

**Auto-update not working:**
```bash
# Check GitHub Release exists
# Verify electron-builder.yml publish config
# Ensure app version in package.json is incremented
# Check code signing certificates are valid
```

---

## Conclusion

This CLAUDE.md serves as the **definitive guide** for implementing the Retech Inventory V1 system. It provides:

- **Clear objectives** with measurable acceptance criteria
- **Detailed technical specifications** for all components
- **Step-by-step implementation phases** spanning 10 weeks
- **Best practices** for security, performance, and testing
- **Comprehensive documentation** of architecture and APIs
- **Agent-friendly guidance** for autonomous code generation

**Next Steps:**

1. **Review this document** with the team
2. **Set up the development environment** using the checklist
3. **Begin Phase 1** (Foundation & Backend Core)
4. **Commit early and often** with meaningful messages
5. **Test continuously** to catch issues early
6. **Deploy incrementally** starting with staging environment
7. **Iterate based on feedback** from users and stakeholders

**Success Metrics:**

- All acceptance criteria met
- 80%+ test coverage achieved
- Zero critical security vulnerabilities
- Production deployment successful
- Users can perform daily operations efficiently

**Document Maintenance:**

- Update this document as the project evolves
- Add lessons learned to a separate LESSONS.md
- Keep API documentation in sync with code
- Review and refine after each phase completion

---

**Owner:** Development Team
**Status:** Planning Complete, Ready for Implementation
**Next Milestone:** Phase 1 - Foundation & Backend Core (Weeks 1-2)
**Contact:** [Your contact information]

---

*This document is version-controlled. For the latest version, see the repository's main branch.*
