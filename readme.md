# Multi-Tenant SaaS Notes

**Multi-Tenant SaaS Notes** is an application that allows multiple tenants (companies) to securely manage their users and notes, while enforcing role-based access and subscription limits.

---

## Installation

### Frontend Installation
```bash
cd frontend
npm install
npm run dev
```

### Backend Installation
```
cd backend
npm install
nodemon server.js
```

## Routes

### Auth Routes
POST /login       -> Login user and get JWT token

GET  /me          -> Get current logged-in user details (Protected)

### Note Routes
POST   /notes      -> Create a new note (Protected)

GET    /notes      -> Get all notes of logged-in user (Protected)

GET    /notes/:id  -> Get a single note by ID (Protected)

PUT    /notes/:id  -> Update a note by ID (Protected)

DELETE /notes/:id  -> Delete a note by ID (Protected)


## Tenant Routes
POST /tenants/:slug/upgrade -> Upgrade tenant subscription (Protected + Admin)

POST /tenants/:slug/invite  -> Invite user to tenant (Protected + Admin)


## Technology Used
### Frontend
React.js + Vite + TailwindCSS
### Backend
Node.js + Express.js + Neon Serverless Postgres + Prisma
### Database Approach
Shared Schema with a tenant ID column
1) Single Schema
2) Tenant isolation via tenantId column, both User and Note have a tenantId field pointing to the Tenant model.
### Database steps
1) Add a .env file with below URL
```
DATABASE_URL="url from Neon Serverless Postgres dashboard"
```
2) Create Your Schema

3) Apply schema.prisma to DB
```
npx prisma migrate dev --name init
```
4) Seed the given data
```
node prisma/seed.js
```