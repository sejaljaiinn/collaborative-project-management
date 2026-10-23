# Collaborative Project Management Platform

A full-stack project management app built with React + Vite frontend and Node.js + Express backend, using local MongoDB for persistence.

## Tech Stack
- Frontend: React, Vite, React Router
- Backend: Node.js, Express, Mongoose
- Database: MongoDB (local only, Docker-ready)
- Auth: JWT + bcrypt
- Styling: Custom CSS

## Features
- User authentication and authorization
- Admin, project manager, team member, and viewer roles
- Project lifecycle management
- Task assignment, status tracking, and version conflict handling
- Team membership management
- Commenting on tasks
- Modern role-aware dashboard UI

## Local Setup

### 1. Start MongoDB locally
Using Docker:

```bash
docker run -d --name mongo-cpm -p 27017:27017 -v mongo-cpm-data:/data/db mongo:latest
```

### 2. Install dependencies
From the repository root:

```bash
npm install --workspaces
```

### 3. Configure environment
Create `server/.env` from `server/.env.example` and update values.

### 4. Run the app
```bash
npm run dev
```

This starts the backend and the frontend together.

## Demo users
The seed script creates default users:
- admin@projecthub.com / admin123
- manager@projecthub.com / manager123
- member@projecthub.com / member123
- viewer@projecthub.com / viewer123

Run seed script:

```bash
npm run seed --workspace server
```

## Scripts

- `npm run dev` — run frontend + backend with concurrent processes
- `npm run build` — build the frontend
- `npm run start --workspace server` — run the backend in production mode
- `npm run seed --workspace server` — insert demo data

## Important Note
This project intentionally uses local MongoDB only. MongoDB Atlas or cloud backend-as-a-service is not used, in compliance with the hackathon rules.
