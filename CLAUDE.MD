# Project Overview

This document provides context for AI assistants working with this codebase.

## Project Description

**Offsets** is a collaborative literary web project where players create interconnected nodes of creative writing that branch and grow like a tree. Originally run in 2004-2005, this is a modern revival of the project.

Players respond to existing "live" nodes with their own creative writing (any length), creating links that can be linguistic, conceptual, formal, or stylistic. Authors remain anonymous until their node "withers" (receives no responses for 3 days), at which point their name is revealed.

## Tech Stack

- **Language**: TypeScript
- **Framework**: Next.js 14+ (React-based full-stack framework)
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Deployment**: TBD (Vercel recommended for Next.js)

## Project Structure

```
/
├── app/                 # Next.js app directory (pages and API routes)
├── components/          # React components
├── lib/                 # Utility functions and database client
├── prisma/              # Database schema and migrations
└── public/              # Static assets
```

## Development Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
npm install
npx prisma generate
npx prisma db push
```

### Running the Project

```bash
npm run dev
```

Access at http://localhost:3000

## Key Concepts

### Node Lifecycle
- **Live nodes**: Can receive responses, author is anonymous
- **Withered nodes**: No responses for 3 days (72 hours), author name revealed, cannot receive new responses
- **Pending nodes**: Submitted but awaiting admin approval

### The Tree Metaphor
Nodes branch from parent nodes, creating a tree structure. Each node can have multiple children. Players see their selected node plus its parent for context, with option to view full ancestry.

### Moderation Flow
1. Player submits node with their name and content
2. Submission enters "pending" state (invisible to other players)
3. Admin reviews and approves/rejects
4. Approved nodes publish immediately and become "live"

### Anonymous Attribution
Players submit their name with each node, but names are hidden until the node withers. No login required initially, but system designed to add authentication later without breaking existing anonymous submissions.

## Coding Standards

- TypeScript strict mode enabled
- Component-based architecture
- Server components by default, client components only when needed
- API routes in app/api/
- Database queries through Prisma
- Clean, readable literary-focused UI design

## Important Notes

- No character limit on node content (can be any length)
- Nodes automatically wither after 3 days (72 hours) with no responses
- System uses a cron job or scheduled task to check for withered nodes
- Admin approval required for all submissions
- Initial version has no authentication - players just enter their name
- Future enhancement: add user accounts and allow claiming of previous anonymous submissions

## Resources

- Original project: https://github.com/danieldevine/OnSets
- Next.js docs: https://nextjs.org/docs
- Prisma docs: https://www.prisma.io/docs
