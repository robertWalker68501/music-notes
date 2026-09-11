# Music Notes

Music Notes is a personal workspace for musicians and home-recording
artists to organize the details of a recording project from the first
idea through completion.

Instead of scattering project information across notebooks, text files,
and unrelated apps, Music Notes is designed to keep projects, songs,
recording sessions, tracks, takes, settings, and production notes
together in one private workspace.

> **Project status:** Music Notes is under active development. Project
> management and authentication are implemented; the broader recording
> workflow shown in the dashboard is being built out incrementally.

## Features

### Currently implemented

-   **Personal user accounts** with email/password authentication
-   **Email verification** before accessing protected application areas
-   **Google and GitHub sign-in** support
-   **Protected dashboard** for authenticated users
-   **Project management** with create, view, edit, and delete workflows
-   **Project types** for albums, EPs, singles, demos, and other work
-   **Project status tracking** across planning, recording, mixing,
    mastering, and completion
-   **Private ownership** so users can access only their own projects
-   **Recent projects** and project counts on the dashboard
-   **Responsive light/dark UI**
-   **End-to-end testing** with Playwright

### Recording workflow

Music Notes is structured around a recording workflow that can grow from
a project into more detailed production records:

1.  **Projects** --- organize an album, EP, single, demo, or other
    recording idea.
2.  **Songs** --- group songs within a project and track their progress.
3.  **Recording sessions** --- document what happened during each
    session.
4.  **Tracks & takes** --- capture takes, notes, settings, and details
    worth repeating.

The project model is implemented today. The remaining workflow areas are
part of the application's ongoing development.

## Tech Stack

  Area             Technology
  ---------------- ---------------------------
  Framework        Next.js 16 App Router
  Language         TypeScript
  UI               React 19, shadcn, Base UI
  Styling          Tailwind CSS 4
  Database         PostgreSQL
  ORM              Prisma 7
  Authentication   Better Auth
  Validation       Zod + React Hook Form
  Rich text        TinyMCE
  File uploads     UploadThing
  Email            Resend + React Email
  Icons            Lucide React
  Testing          Playwright
  Charts           Recharts

## Getting Started

### Prerequisites

Before running Music Notes locally, install:

-   Node.js
-   npm
-   A PostgreSQL database
-   Credentials for any optional external services you want to use, such
    as Google, GitHub, Resend, UploadThing, or TinyMCE

### Installation

Clone the repository and install dependencies:

``` bash
npm install
```

Create a local environment file and provide the required configuration
for your development environment.

### Environment Variables

The application currently uses the following environment variables:

``` env
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

RESEND_API_KEY=
EMAIL_FROM=

UPLOADTHING_TOKEN=
NEXT_PUBLIC_TINYMCE_API_KEY=
```

Keep secrets out of source control. Use development credentials locally
and production credentials only in the production environment.

### Database Setup

Generate the Prisma client:

``` bash
npx prisma generate
```

Apply the project's migrations to your development database:

``` bash
npx prisma migrate dev
```

### Start the Development Server

``` bash
npm run dev
```

Then open `http://localhost:3000` in your browser.

## Available Scripts

``` bash
npm run dev
```

Starts the Next.js development server.

``` bash
npm run build
```

Creates a production build.

``` bash
npm run start
```

Runs the production build.

``` bash
npm run lint
```

Runs ESLint.

``` bash
npm run test:e2e
```

Runs the complete Playwright end-to-end test suite.

``` bash
npm run test:e2e:ui
```

Runs Playwright in interactive UI mode.

## Project Structure

``` text
app/
├── (auth)/                 # Sign-in and sign-up
├── (dashboard)/            # Authenticated workspace
│   └── dashboard/
│       └── projects/       # Project CRUD workflows
├── (root)/                 # Public pages
├── api/
│   ├── auth/               # Better Auth API
│   └── uploadthing/        # UploadThing API
└── generated/prisma/       # Generated Prisma client

components/                 # Shared application and UI components
emails/                     # React Email templates
lib/                        # Auth, Prisma, schemas, utilities, and services
prisma/                     # Prisma schema and migrations
providers/                  # Application providers
tests/e2e/                  # Playwright end-to-end tests
utils/                      # Shared utilities and integrations
```

## Data Model

The current application centers on two primary domain entities:

### User

A user owns a private Music Notes workspace. Authentication-related
sessions and provider accounts are associated with the user.

### Project

A project belongs to one user and represents a recording project such as
an album, EP, single, or demo.

Projects currently track:

-   Name
-   Description
-   Project type
-   Production status
-   Owner
-   Creation and update timestamps

Supported project statuses are:

-   Planning
-   Recording
-   Mixing
-   Mastering
-   Complete

## Authentication

Music Notes uses Better Auth and supports:

-   Email/password registration
-   Email verification
-   Email/password sign-in
-   Google authentication
-   GitHub authentication
-   Authenticated sessions
-   Protected dashboard routes

Unauthenticated users are redirected to sign in before accessing private
workspace content.

## Testing

The project uses Playwright for end-to-end coverage.

Run all E2E tests with:

``` bash
npm run test:e2e
```

For interactive debugging:

``` bash
npm run test:e2e:ui
```

The E2E suite is intended to validate real user workflows as well as
authorization and ownership boundaries.

## Privacy and Ownership

Music Notes is currently designed as a personal workspace. Projects are
associated with their owner, and application queries enforce user
ownership so one account cannot access another user's project data.

## Roadmap

The dashboard reflects the intended direction of the application. Future
development can expand projects into a deeper home-recording workflow,
including:

-   Songs within projects
-   Recording session logs
-   Track organization
-   Takes and take comparisons
-   Recording and production notes
-   Gear and settings documentation
-   Additional progress and workflow tools

## License

No license is currently specified for this project.
