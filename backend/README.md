# SupportDesk Backend API

A modular, production-ready Node.js/Express backend for a support desk system, featuring authentication, ticket management, agent management, real-time updates, and robust validation.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
  - [Auth](#auth)
  - [Tickets](#tickets)
  - [Agents](#agents)
  - [Dashboard](#dashboard)
- [WebSocket Events](#websocket-events)
- [Error Handling](#error-handling)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)

---

## Getting Started

1. **Install dependencies:**
   ```sh
   pnpm install
   ```

2. **Set up your `.env` file:**
   ```
   MONGO_URI=mongodb://localhost:27017/supportdesk
   JWT_SECRET=your_jwt_secret_here
   PORT=5000
   ```

3. **Run the server:**
   ```sh
   pnpm dev
   ```

---

## Environment Variables

| Variable     | Description                        | Required |
|--------------|------------------------------------|----------|
| MONGO_URI    | MongoDB connection string          | Yes      |
| JWT_SECRET   | Secret for JWT signing             | Yes      |
| PORT         | Port to run the server (default 5000) | No    |

---

## API Endpoints

### Auth

| Method | Endpoint         | Description                | Auth Required | Body/Params                |
|--------|------------------|---------------------------|---------------|----------------------------|
| POST   | `/api/auth/register` | Register a new user      | No            | `{ email, password, role? }` |
| POST   | `/api/auth/login`    | Login and get JWT token  | No            | `{ email, password }`         |
| GET    | `/api/auth/me`       | Get current user info    | Yes (JWT)     | -                          |

---

### Tickets

| Method | Endpoint              | Description                        | Auth Required | Body/Params                |
|--------|-----------------------|------------------------------------|---------------|----------------------------|
| POST   | `/api/tickets`        | Create a new ticket                | Yes           | `{ title, description }`   |
| GET    | `/api/tickets`        | List tickets (role-based)          | Yes           | -                          |
| GET    | `/api/tickets/:id`    | Get ticket details                 | Yes           | -                          |
| PUT    | `/api/tickets/:id`    | Update ticket (status, assign, add message) | Yes | `{ status?, assignedTo?, message? }` |

---

### Agents (Admin Only)

| Method | Endpoint              | Description                        | Auth Required | Body/Params                |
|--------|-----------------------|------------------------------------|---------------|----------------------------|
| GET    | `/api/agents`         | List all agents                    | Yes (Admin)   | -                          |
| POST   | `/api/agents`         | Create a new agent                 | Yes (Admin)   | `{ email, password }`      |
| DELETE | `/api/agents/:id`     | Delete an agent                    | Yes (Admin)   | -                          |

---

### Dashboard (Agent/Admin Only)

| Method | Endpoint                    | Description                        | Auth Required | Body/Params                |
|--------|-----------------------------|------------------------------------|---------------|----------------------------|
| GET    | `/api/dashboard/summary`    | Ticket/user/agent counts           | Yes (Agent/Admin) | -                     |
| GET    | `/api/dashboard/agent-stats`| Ticket counts per agent            | Yes (Agent/Admin) | -                     |

---

## WebSocket Events

- Connect to the backend server via WebSocket (same host/port as HTTP).
- Events:
  - `ticket_created`: `{ type: 'ticket_created', ticket, action: 'create' }`
  - `ticket_updated`: `{ type: 'ticket_updated', ticket, action: 'update' }`

---

## Error Handling

- All errors return JSON: `{ message: string }`
- Validation errors return: `{ errors: [ { path, message } ] }`
- Unhandled errors are logged and return a generic 500 error.

---

## Project Structure

```
src/
  config/         # DB and environment config
  controllers/    # Route handler logic
  middlewares/    # Auth, validation, error handling
  models/         # Mongoose models
  routes/         # Route definitions
  utils/          # Logger, Zod schemas, helpers
  types/          # Custom TypeScript types
  index.ts        # Entry point (server + DB)
  server.ts       # Express app setup
```

---

## Tech Stack

- Node.js, Express, TypeScript
- MongoDB, Mongoose
- Zod (validation)
- Winston (logging)
- WebSocket (real-time updates)
- JWT (authentication)
- Helmet, CORS (security)

---

**For more details, see the code comments and each module's documentation.** 