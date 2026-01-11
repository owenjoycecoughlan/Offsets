# Offsets

A collaborative literary web project where players create interconnected nodes of creative writing that branch and grow like a tree. Originally run in 2004-2005, this is a modern revival of the project.

## Overview

**Offsets** allows players to:
- Read existing "live" nodes in the tree
- Respond with creative writing (any length)
- Create connections that can be linguistic, conceptual, formal, or stylistic
- Remain anonymous until their node "withers" (no responses for 3 days)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the local database:
```bash
npx prisma dev
```
This will start a local Prisma Postgres instance and display connection strings.

3. Update the `.env` file with the TCP connection string (should already be set):
```
DATABASE_URL="postgres://postgres:postgres@localhost:51214/template1?sslmode=disable"
```

4. Push the database schema:
```bash
npx prisma db push
npx prisma generate
```

5. (Optional) Seed the database with an initial root node:
```bash
npm run seed
```

### Running the Development Server

1. Make sure the Prisma dev server is running (from step 2 above)

2. In a separate terminal, start Next.js:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) to see the app

## Project Structure

- `/app` - Next.js pages and API routes
  - `/node/[id]` - Individual node view with response form
  - `/admin` - Admin panel for approving submissions
  - `/api` - API endpoints for nodes, approvals, and cron jobs
- `/components` - React components (forms, buttons, etc.)
- `/lib` - Utility functions and database client
- `/prisma` - Database schema and migrations

## How It Works

### For Players

1. Visit the home page to see all "live" nodes
2. Click a node to read it and see its parent node for context
3. Fill out the response form with your name and creative content
4. Your submission goes to the admin for approval
5. Once approved, it's published immediately as a new live node
6. Your name remains hidden until the node withers (3 days with no responses)

### For Admins

1. Visit `/admin` to see pending submissions
2. Review each submission in context (see what it's responding to)
3. Approve or reject submissions
4. Approved nodes are published immediately

## Key Features

- **No length limit**: Nodes can be any size
- **Rolling withering**: Nodes automatically wither after 3 days without responses
- **Immediate approval**: Once approved by admin, nodes publish right away
- **No login required**: Players just enter their name (authentication can be added later)
- **Ancestry view**: See the full chain from any node back to the root
- **Cron endpoint**: `/api/cron/wither` can be called to process withering

## Scheduled Tasks

To automate node withering, set up a cron job or scheduled task to call:
```
GET http://your-domain.com/api/cron/wither
```

Recommended: Run this daily or multiple times per day.

## Development

```bash
# Run development server
npm run dev

# Seed database with initial node
npm run seed

# Open Prisma Studio (database GUI)
npx prisma studio
```

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Prisma 7** - Database ORM
- **PostgreSQL** - Database (via Prisma Postgres local dev)
- **Tailwind CSS** - Styling

## Future Enhancements

- User authentication system
- Email notifications when your node gets responses
- Visual graph/tree view of the network
- Export functionality
- Search and filtering
- Statistics and analytics

## Original Project

Based on the Offsets literary project from 2004-2005. See the [original rules and concept](https://github.com/danieldevine/OnSets) for more background.
