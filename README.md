# Items Management App

A full-stack application for tracking borrowing of items within a company. Built with React + NestJS + Firebase.

## System Requirements

- Node.js 20+
- npm 10+
- Java 11+ (required for Firebase emulators)
- Firebase CLI (`npm install -g firebase-tools`)

## Getting Started

```bash
git clone git@github.com:profiq/items-management-app.git
cd items-management-app
npm install
cp .env.example .env
```

Fill in the required values in `.env` (see [Environment Variables](#environment-variables)).

## Running in Development

### Option A — all-in-one

```bash
npm run dev:all
```

Starts the backend, frontend, and Firebase emulators in a single command.

### Option B — separate terminals

**Terminal 1 — Firebase emulators (Auth + Storage)**

```bash
cd frontend
npm run firebase:emulator
```

**Terminal 2 — Backend** (port 3000)

```bash
npm run dev:backend
```

**Terminal 3 — Frontend** (port 5173)

```bash
npm run dev:frontend
```

Open [http://localhost:5173](http://localhost:5173).

The Swagger API docs are available at [http://localhost:3000/api](http://localhost:3000/api).

### Option C — Docker Compose

```bash
docker compose up
```

Uses `compose.yml` at the repository root to build and run the backend container.

## Environment Variables

| Variable                            | Description                                                            |
| ----------------------------------- | ---------------------------------------------------------------------- |
| `VITE_FIREBASE_API_KEY`             | Firebase project API key                                               |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Firebase auth domain                                                   |
| `VITE_FIREBASE_PROJECT_ID`          | Firebase project ID                                                    |
| `VITE_FIREBASE_STORAGE_BUCKET`      | Firebase storage bucket                                                |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID                                           |
| `VITE_FIREBASE_APP_ID`              | Firebase app ID                                                        |
| `VITE_FIREBASE_MEASUREMENT_ID`      | Firebase Measurement ID (optional, for Analytics)                      |
| `VITE_FIREBASE_EMULATE`             | Set to `true` to use Firebase emulators instead of a real project      |
| `VITE_FIREBASE_EMULATOR_URL`        | Firebase Auth emulator URL (default: `http://localhost:9099`)          |
| `GOOGLE_CLIENT_EMAIL`               | Firebase Admin SDK service account email                               |
| `GOOGLE_PRIVATE_KEY`                | Firebase Admin SDK service account private key                         |
| `VITE_API_URL`                      | Backend URL (default: `http://localhost:3000`)                         |
| `FIRST_ADMIN_EMAIL`                 | Email of the first admin user (provisioned on first start)             |
| `GOOGLE_STORAGE_BUCKET`             | Google Cloud Storage bucket name (required for item image upload)      |
| `FIREBASE_STORAGE_EMULATOR_HOST`    | Firebase Storage emulator host (local dev only, e.g. `localhost:9199`) |

For local development, `VITE_FIREBASE_EMULATE=true` is set by default in `.env.example` — the Firebase emulators are used instead of a real Firebase project, so the Firebase API key variables can be left blank.

## Project Overview

### User Roles

- **Reader** — browses the catalog, borrows and returns items, views their loan history
- **Admin** — manages items, categories, locations, and loans

### Features

#### Catalog (Reader)

- Item list with search, category filter, and availability filter
- Item detail with copy locations and per-copy availability
- Borrow a copy directly from the detail page

#### Admin — Catalog Management

- Create / edit / archive categories, items, item copies, and locations
- Image upload for items via Firebase Storage
- Archiving sets an `archived_at` timestamp (soft delete)

#### Admin — Loan Management

- View all loans across all users
- Overdue loans highlighted separately
- Return or extend any loan on behalf of a user

#### Email Notifications

- Reminder email 3 days before due date
- Overdue email on the due date
- Follow-up overdue email every 7 days while unreturned

## Architecture

```
/
├── backend/      # NestJS API (port 3000)
├── frontend/     # React SPA (port 5173)
├── compose.yml   # Docker Compose
└── firebase.json # Firebase emulator + hosting config
```

**Backend:** NestJS + TypeORM + SQLite (dev) / MariaDB (prod). Auth via Firebase JWT verification.

**Frontend:** React + Vite + TanStack Query + Tailwind CSS + Radix UI.

**Auth:** Firebase Authentication. The frontend acquires a JWT from Firebase and sends it as a Bearer token on every request. The backend verifies it with the Firebase Admin SDK.

## Data Model

| Entity                  | Description                                                                                                |
| ----------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Users**               | System users with email, full name, role. Soft-deletable.                                                  |
| **Cities**              | Lookup table for cities. Soft-deletable.                                                                   |
| **Locations**           | Physical storage locations, each belonging to a City. Soft-deletable.                                      |
| **Categories**          | Classification labels for items (e.g. Electronics, Books). Soft-deletable.                                 |
| **Tags**                | Free-form labels for flexible filtering. Globally unique.                                                  |
| **Items**               | Core catalog entity — a type of borrowable thing. Belongs to multiple Categories and Tags. Soft-deletable. |
| **Item Copies**         | A specific physical copy of an item, assigned to a Location with an optional condition. Soft-deletable.    |
| **Loans**               | A borrowing event linking a Copy to a User, with borrow date, due date, and return info.                   |
| **Email Notifications** | Tracks emails sent for a loan (type + send timestamp).                                                     |

Full interactive API docs: [http://localhost:3000/api](http://localhost:3000/api) (Swagger)
