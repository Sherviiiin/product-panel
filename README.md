# Product Panel

A full-stack marketplace application built with TypeScript and modern web technologies.

## Overview

Product Panel is a marketplace platform where users can browse products, interact with products, and sellers can manage their product listings.

The project is built as a monorepo using pnpm workspaces and follows a feature-based architecture with separated frontend, server logic, and database layers.

---

## Features

### Authentication

- User registration and login
- Session-based authentication
- Role-based access for users and sellers

---

### Product Catalog

- Product listing
- Product search
- Product detail page
- Product categories
- Product specifications
- Product view tracking
- Like and save functionality
- Seller listings per product

---

### User Dashboard

- View saved products
- View liked products
- View recently viewed products
- Search and sorting
- Product table view using TanStack Table
- Toggle like/save actions
- Edit user profile

---

### Seller Dashboard

- View seller listed products
- Add existing products to seller store
- Create new products
- Update seller listing information:
  - Price
  - Discount price
  - Stock
  - Sales URL
- Delete listings
- Edit seller profile and store information

---

# Architecture

The project uses a feature-based architecture inside a pnpm monorepo.

Project structure:

```
product-pannel/

├── apps/
│   └── web/
│       └── src/
│           ├── features/
│           │   ├── auth/
│           │   ├── catalog/
│           │   └── dashboard/
│           │
│           ├── components/
│           ├── routes/
│           └── styles/

├── packages/
│   └── db/

├── package.json
└── pnpm-workspace.yaml
```

Each feature contains related parts:

```
feature/

├── components/
├── queries/
├── server/
├── store/
└── schema.ts
```

---

# Tech Stack

## Frontend

- React
- TypeScript
- TanStack Router
- TanStack Query
- TanStack Form
- TanStack Table
- Zustand
- Tailwind CSS
- shadcn/ui
- nuqs

## Backend

- TanStack Start Server Functions
- Repository pattern
- Service layer architecture

## Database

- PostgreSQL
- Drizzle ORM

## Tooling

- pnpm workspace
- TypeScript

---

# Database Entities

Main entities:

```
User

├── User Profile
└── Seller Profile


Product

├── Categories
├── Specifications
├── Seller Listings
├── Likes
├── Saves
└── Views
```

---

# Data Flow

Server-side request flow:

```
Client

↓

Server Function

↓

Service Layer

↓

Repository

↓

Database
```

---

# Development Setup

## Prerequisites

- Node.js
- pnpm
- Docker and Docker Compose

## 1. Install dependencies

Run from the project root:

```bash
pnpm install
```

## 2. Configure environment variables

Create these three files from their examples:

- `.env`
- `apps/web/.env`
- `packages/db/.env`

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
Copy-Item apps/web/.env.example apps/web/.env
Copy-Item packages/db/.env.example packages/db/.env
```

On macOS/Linux:

```bash
cp .env.example .env
cp apps/web/.env.example apps/web/.env
cp packages/db/.env.example packages/db/.env
```

Update the credentials and secrets before continuing.

The DATABASE_URL values must match the PostgreSQL credentials and database name defined in the root .env file.
SESSION_SECRET must be at least 32 characters.

## 3. Start PostgreSQL

```bash
docker compose up -d
```

PostgreSQL runs on localhost:5432.
pgAdmin is available at http://localhost:5050.

## 4. Run database migrations

```bash
pnpm db:migrate
```

## 5. Seed development data (optional)

WARNING: The seed script deletes existing users,
products, and related records before recreating demo data.

Run it ONLY on a disposable development database.
Never run it against production or valuable existing data.

```bash
pnpm db:seed
```

## 6. Start the application

```bash
pnpm dev
```

Open http://localhost:3000.

# Code Quality and Tests

Run these commands from the project root.

TypeScript:

```bash
pnpm typecheck
```

Biome:

```bash
pnpm exec biome lint .
```

Unit tests:

```bash
pnpm --filter web test
```

Integration tests:

```bash
pnpm --filter web test:integration
```

Integration tests require a running PostgreSQL database.
Auth integration tests create, update, and delete
temporary database records.

Do not run integration tests against production.

Production build:

```bash
pnpm build
```

Preview the production build locally:

```bash
pnpm preview
```

---

# Seed Users

The seed data includes test users for authentication.

Normal users:

```
Email: u1@test.com
...
Email: u16@test.com
```

Seller users:

```
Email: seller17@test.com
...
Email: seller24@test.com
```

The password for all seeded users is:

```
123
```

---

# AI-Assisted Development

This project was developed with the assistance of AI tools during the development process.

AI was used as a development assistant for:

- Exploring implementation approaches
- Reviewing architecture decisions
- Debugging issues
- Improving code structure
- Assisting with documentation

All architecture decisions, implementation choices, and final integration were reviewed and managed during development.
