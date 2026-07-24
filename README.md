# ⚡ PulseHR

> Premium, production-ready enterprise Employee Management System (EMS) designed for CodeVertex Solutions.

[![Tech Stack](https://img.shields.io/badge/stack-React19%20%7C%20Node%20%7C%20Postgres%20%7C%20Supabase%20%7C%20Socket.io-blue?style=flat-square)](https://github.com/rehancodeofficial/Smart-EMS)

PulseHR is a high-performance, full-stack, enterprise-grade Employee Management System (EMS) built using React 19, Express 5, PostgreSQL (via Prisma), Supabase Storage, and Socket.io. Engineered to streamline operations for CodeVertex Solutions, the system features sub-second page loads, real-time bi-directional notifications, role-based access control (RBAC) across five distinct roles, automated payroll processing, leaves/attendance management, device asset tracking, and comprehensive audit logs.

---

## 🔗 Live Demo

Experience the live system or explore the developer API configurations:

<p align="left">
  <a href="https://pulsehr.rehanhussain.dev" target="_blank">
    <img src="https://img.shields.io/badge/Live_Website-pulsehr.rehanhussain.dev-EA580C?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
  </a>
  <a href="https://pulsehr.rehanhussain.dev/docs" target="_blank">
    <img src="https://img.shields.io/badge/Documentation-API_&_Architecture-10B981?style=for-the-badge&logo=gitbook&logoColor=white" alt="Documentation" />
  </a>
  <a href="https://pulsehr.rehanhussain.dev/api-docs" target="_blank">
    <img src="https://img.shields.io/badge/API_Swagger_Docs-v1.0-3B82F6?style=for-the-badge&logo=swagger&logoColor=white" alt="API Docs" />
  </a>
</p>

## 🧭 Table of Contents

- [Hero Section](#-pulsehr)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [Folder Structure](#-folder-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Database Design](#-database-design)
- [Security Matrix](#-security-matrix)
- [Performance Optimization](#-performance-optimization)
- [Testing Suite](#-testing-suite)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Deployment Model](#-deployment-model)
- [Roadmap](#-roadmap)
- [Known Limitations](#-known-limitations)
- [Future Improvements](#-future-improvements)
- [Contributing](#-contributing)
- [FAQ](#-faq)
- [Changelog](#-changelog)
- [Support](#-support)
- [Author](#-author)
- [License](#-license)

---

## ⚡ Features

### 🔐 Authentication & Access Control

* **JSON Web Tokens (JWT)**: Secure stateless HTTPOnly cookie-based employee access tokens and DB-tracked refresh tokens.
* **Role-Based Access Control (RBAC)**: Strict permission enforcement across `employee`, `supervisor`, `manager`, `accountant`, and `admin`.
* **Credential Protection**: Auto-lockout options and secure password hashing using Bcrypt.js.
* **Verification**: Email token validation and password reset flows with database consumption checks.

### 🏢 Real-Time Notifications & Sockets

* **Bi-directional WebSockets**: Live event streaming to active employee clients using Socket.io.
* **Targeted Broadcasts**: Real-time message triggers segmented by specific `employeeId` or global role levels (e.g. notifying managers of leave requests).
* **Notification Preferences**: Configurable user settings to toggle email or in-app alerts for leaves, tasks, and payrolls.

### 📅 Attendance & Leaves Workflow

* **Check-In/Check-Out Tracking**: Precise daily working hours calculations with auto-late flag triggers based on configurable company policies (e.g., 09:15).
* **Leave Balances**: Multi-status balance ledgering (annual, sick, casual, emergency) tracking used, pending, and carried-over entitlements.
* **Approvals Engine**: Hierarchical leave request processing allowing designated supervisors and managers to approve or reject requests.

### 💵 Payroll & Operations Management

* **Payroll Generator**: Monthly salary processing matching base pay, applying custom deduction percentages, and storing net pay details.
* **Asset Allocation**: Asset category inventories (laptops, monitors, furniture) mapped directly to designated employees with lifecycle tracking (`available`, `assigned`, `maintenance`, `retired`).
* **Supabase File Manager**: Document management supporting multi-type file uploads (contracts, offer letters, IDs) securely stored in Supabase Storage with signed download links.
* **Enterprise Auditing**: Multi-actor audit logger keeping track of all database writes, IP addresses, and metadata payloads.

---

## 🏗 Architecture

```mermaid
graph TD
    Client[React 19 Frontend / Shadcn UI] <-->|Socket.io / HTTP| LB[Nginx Load Balancer]
    LB <--> App[Express 5 Server Node.js]
    App <--> DB[(PostgreSQL Database / Prisma)]
    App <--> Storage[(Supabase Storage Bucket)]
    App <--> Sockets[Socket.io Real-time Server]
```

### High-Level Architecture

The system utilizes a decoupled, three-tier architecture optimization. The client-side React SPA communicates with a modular Express 5 API server, which acts as the gateway to a PostgreSQL relational database handled via Prisma, a Supabase Storage bucket for static documents, and an in-memory Socket.io connection for real-time employee notifications.

<details>
<summary><b>🔍 System Design & Details</b></summary>

* **System Design**: A monolithic yet highly modular Express 5 API server utilizing Domain-Driven structures.
* **Deployment Diagram**: Containerized services deployed via Docker Compose with external managed databases and CDN endpoints.
* **Database ERD**: Direct structural mapping between Departments, Employees, UserCredentials, AttendanceRecords, LeaveRequests, Projects, Tasks, Assets, Documents, and Payrolls using Prisma Schema.
* **Sequence Diagram**: Manager approves a leave request -> DB records update -> hooks trigger Socket.io notification to employee client -> logs transaction details to Audit logs.

</details>

---

## 🛠 Technology Stack

| Layer                     | Technology                                     | Purpose                                                             |
| :------------------------ | :--------------------------------------------- | :------------------------------------------------------------------ |
| **Frontend**              | React 19, Vite, Tailwind CSS, Radix UI          | Ultra-fast UI rendering, responsive modern layout, fluid components |
| **Backend**               | Node.js, Express 5, TypeScript                 | Lightweight, asynchronous, high-throughput backend APIs             |
| **Database**              | PostgreSQL                                     | Relational ACID-compliant transaction records                       |
| **ORM**                   | Prisma                                         | Strongly-typed SQL client and migrations manager                    |
| **Real-time**             | Socket.io                                      | Persistent bi-directional coordinates and delivery updates          |
| **Cloud Storage**         | Supabase Storage                               | Auto-optimized employee documents and file uploads storage          |
| **State Management**      | Zustand                                        | Lightweight, decoupled frontend state stores                        |
| **Authentication**        | JWT (Access/Refresh Tokens)                    | Distributed identity access management and single-sign-on           |
| **Forms & Validation**    | React Hook Form, Zod                           | Strongly typed validation guards on client and server boundaries    |

---

## 📂 Folder Structure

```bash
PulseHR/
├── api/
│   └── index.ts            # Serverless function entrypoint for Vercel backend
├── prisma/
│   ├── schema.prisma       # Database design schemas
│   └── seed.ts             # Seeding files for default assets and users
├── server/
│   ├── src/
│   │   ├── middleware/     # RBAC, auth, validation filters
│   │   ├── routes/         # REST and WebSocket endpoints
│   │   ├── utils/          # Invoicing, notifications, and helper engines
│   │   ├── app.ts          # App initialization
│   │   └── index.ts        # Server listener and socket setup
│   └── Dockerfile          # Container config
├── src/
│   ├── components/         # Reusable design primitives (Shadcn UI)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility helpers
│   ├── routes/             # App routers and page layouts
│   ├── services/           # Axios API query/mutation bindings
│   ├── main.tsx            # React 19 entrypoint
│   └── App.tsx             # Main routing hub
├── docker-compose.yml      # Orchestration definition for dev/staging
└── vercel.json             # Vercel deployment configuration blueprint
```

---

## 🚀 Getting Started

### Prerequisites

* **Node.js**: v18.0.0 or higher
* **PostgreSQL**: v15.0 or higher
* **Supabase Account**: Bucket named `documents` initialized

### Installation & Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/rehancodeofficial/Smart-EMS.git
   cd Smart-EMS
   ```

2. **Project Dependencies & Environment Config**

   ```bash
   npm install
   cp .env.example .env
   ```

3. **Database Migration & Seeding**

   ```bash
   # Run Prisma Migrations
   npx prisma migrate dev --name init
   # Seed default roles, users, and departments
   npm run seed
   ```

4. **Running Locally (Traditional)**

   * Start the backend development server:
     ```bash
     npm run dev:server
     ```
   * Start the frontend development server:
     ```bash
     npm run dev
     ```

5. **Running with Docker Compose**

   ```bash
   docker-compose up --build
   ```

   The frontend will be exposed at `http://localhost:8080` and backend APIs at `http://localhost:4000`.

---

## ⚙️ Environment Variables

### Application (`.env`)

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vertex_ems?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/vertex_ems?schema=public"
JWT_ACCESS_SECRET="default_access_token_secret_32_chars_minimum_here_123"
JWT_REFRESH_SECRET="default_refresh_token_secret_32_chars_minimum_here_123"
SUPABASE_URL="https://your_project_id.supabase.co"
SUPABASE_ANON_KEY="your_supabase_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"
```

---

## 🔌 API Documentation

### Public / Authentication Endpoints

| Method   | Endpoint                | Description                                 |
| :------- | :---------------------- | :------------------------------------------ |
| `POST`   | `/api/auth/register`    | Register a new employee user account        |
| `POST`   | `/api/auth/login`       | Authenticate user and issue JWT auth tokens |
| `POST`   | `/api/auth/refresh`     | Rotate expired access tokens using refresh  |

### Employee & Operations

| Method   | Endpoint                | Description                                 |
| :------- | :---------------------- | :------------------------------------------ |
| `GET`    | `/api/employees`        | List all active/inactive company profiles   |
| `GET`    | `/api/attendance`       | Retrieve check-in and check-out data logs   |
| `POST`   | `/api/leaves`           | Submit a leave application request          |
| `POST`   | `/api/payroll/generate` | Generate salary logs for a designated month |

---

## 🗄 Database Design

PulseHR uses **PostgreSQL** configured via **Prisma ORM**.

* **ACID Transactions**: Standard ledger patterns verify consistency during payroll computations.
* **Indexing**: Mapped over `Employee(email)`, `Department(code)`, `AttendanceRecord(date)`, and `AuditLog(timestamp)` to maximize search performance.
* **Enums**: Strongly structured attributes defining `Role`, `EmploymentStatus`, `AttendanceStatus`, `LeaveType`, `LeaveStatus`, `TaskPriority`, and `AssetStatus`.

---

## 🛡 Security Matrix

* **Token Lifecycle Management**: Rotating Access/Refresh JSON Web Tokens with client fingerprint validations.
* **Network Defenses**: Express Rate Limit blocks brute-force authentication requests. Helmet secures headers against typical XSS/clickjacking attacks.
* **Database Guards**: Cascade deletes securely clean up orphaned authentication tokens and credentials when employees are removed.

---

## 🚀 Performance Optimization

* **Eager/Lazy Loading**: Router routes are separated into eager loading (login, signup) and lazy components (dashboard, reports, payroll).
* **Database Indexes**: Queries on employees and logs utilize B-tree indexes to maintain rapid lookups as record counts scale.
* **Multipart Streaming**: Multer stream integrations transfer uploaded assets to Supabase Storage without caching files onto server memory disks.

---

## 🧪 Testing Suite

```bash
# Verify type safety and syntax validation rules
npm run typecheck

# Lint workspace styles and configurations
npm run lint
```

---

## 🔄 CI/CD Pipeline

PulseHR uses **GitHub Actions** to automate validation:

1. **Lint & Format**: Runs ESLint and Prettier to verify syntax and formatting standards.
2. **Type Safety**: Verifies TypeScript compile checks across frontend pages.
3. **Build Target**: Compiles the distribution bundle ensuring package compatibility.
4. **Deploy Step**: Triggers production rollouts on Vercel upon main branch updates.

---

## 📦 Deployment Model

```
               [ DNS Routing ]
                      │
           ┌──────────┴──────────┐
           ▼                     ▼
 ┌───────────────────┐ ┌───────────────────┐
 │    Vercel Edge    │ │ Supabase Storage  │
 └─────────┬─────────┘ └───────────────────┘
           │
           ▼
 ┌───────────────────┐
 │ Managed Postgres  │
 └───────────────────┘
```

* **Application Stack**: Both client static bundles and backend APIs deploy onto **Vercel** serverless pipelines.
* **Asset Storages**: Storage files exist inside remote **Supabase Storage** buckets.
* **Database Systems**: Hosted on cloud PostgreSQL database architectures.

---

## 🗺 Roadmap

* [X] Core Employee Directory backend systems
* [X] Attendance check-in/check-out timers
* [X] Supabase document manager file transfers
* [ ] Biometric integrations for office attendance hardware
* [ ] Auto-billing notifications with tax details
* [ ] Multi-lingual localized interfaces

---

## ⚠️ Known Limitations

* **Clock Synch**: Attendance logs depend on client-reported system times which are subject to manual system modifications.
* **Storage Budgets**: Supabase Storage limits standard free tier sizes to 1GB total limits.

---

## 🔮 Future Improvements

1. Add biometric clock sync APIs mapping hardware logs directly to database tables.
2. Automate local tax calculation models into the monthly payroll generator.
3. Set up dynamic slack alerts notifying admins of critical audit events.
4. Integrate backup SMTP settings for missing authentication emails.
5. Upgrade to multi-currency balance settlements.
6. Support drag-and-drop hierarchy restructuring on visual org charts.
7. Include automated database backup routines.
8. Setup end-to-end testing coverage using Playwright tools.
9. Construct developer sandbox playgrounds for API route tests.
10. Integrate Microsoft Active Directory or Single Sign-On plugins.

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the project repository.
2. Create a feature branch: `git checkout -b feature/AmazingFeature`.
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`.
4. Push to the branch: `git push origin feature/AmazingFeature`.
5. Open a Pull Request.

---

## ❓ FAQ

<details>
<summary><b>Can employees edit attendance entries?</b></summary>
No. Attendance logs can only be adjusted or modified by authorized administrators, accountants, or managers.
</details>

<details>
<summary><b>Does it support PDF invoice exports?</b></summary>
Future updates include automated PDF salary pay slips.
</details>

---

## 📝 Changelog

### [1.0.0] - 2026-07-24

* Initial Release.
* Full-stack Employee Directory architecture.
* Real-time notifications using Socket.io.
* Supabase file management.
* Custom database audit logs.

---

## 📞 Support

* **Website**: [pulsehr.rehanhussain.dev](https://pulsehr.rehanhussain.dev)
* **Email**: rehancodeofficial@gmail.com
* **Documentation**: [API &amp; Architecture](https://pulsehr.rehanhussain.dev/docs)
* **LinkedIn**: [Muhammad Rehan Hussain](https://www.linkedin.com/in/rehancodeofficial/)

---

## 👥 Author

* **Muhammad Rehan Hussain**
  * Portfolio: [rehanhussain.dev](https://rehanhussain.dev)
  * GitHub: [@rehancodeofficial](https://github.com/rehancodeofficial)
  * LinkedIn: [Muhammad Rehan Hussain](https://www.linkedin.com/in/rehancodeofficial/)

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
