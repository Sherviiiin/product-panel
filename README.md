# Product Panel

A full-stack marketplace application built with TypeScript and modern web technologies.

## Overview

Product Panel is a marketplace platform where users can browse products, interact with products, and sellers can manage their product listings.

The project is built as a monorepo using pnpm workspaces and follows a feature-based architecture with separated frontend, server logic, and database layers.

---

## Features

## Authentication

- User registration and login
- Session-based authentication
- Role-based access for users and sellers

---

## Product Catalog

- Product listing
- Product search
- Product detail page
- Product categories
- Product specifications
- Product view tracking
- Like and save functionality
- Seller listings per product

---

## User Dashboard

- View saved products
- View liked products
- View recently viewed products
- Search and sorting
- Product table view using TanStack Table
- Toggle like/save actions
- Edit user profile

---

## Seller Dashboard

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
- TanStack Start
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

# Development

Install dependencies from the project root:

```bash
pnpm install
```

Start the PostgreSQL database using Docker.

Run this command from the project root directory:

```bash
docker compose up -d
```

After the database container is running, run database migration and seed commands from the database package directory.

Navigate to:

```bash
cd packages/db
```

Run database migration:

```bash
pnpm db:migrate
```

Run database seed:

```bash
pnpm db:seed
```

After preparing the database, navigate to the web application directory:

```bash
cd ../../apps/web
```

Run the development server:

```bash
pnpm dev
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
