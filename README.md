# FishyTodo — Full-Stack (Lab 7)

A visually-driven full-stack task manager designed with ADHD in mind, where every task becomes a fish swimming in your personal tank — now powered by a secure ASP.NET Core REST API backed by PostgreSQL.

---

## Live Demo

| Layer    | URL |
|----------|-----|
| Frontend | https://patriciamoraru.github.io/FishyTodo-Fullstack/ |
| Backend  | https://fishytodo-api.onrender.com |
| Swagger  | https://fishytodo-api.onrender.com (root URL) |

---

## Repository Structure

```
FishyTodo-Fullstack/
├── client/               # React + Vite frontend
│   ├── src/
│   │   ├── components/   # UI views (Tank, List, History, Login, Admin…)
│   │   ├── context/      # React contexts (Task, Theme, Mood, Role)
│   │   ├── utils/        # API helpers, fish images, sounds
│   │   └── App.jsx       # Router + layout
│   ├── .env.development.example
│   └── vite.config.js
├── server/               # ASP.NET Core 9 Web API
│   ├── Controllers/      # TasksController, TokenController, HealthController
│   ├── Data/             # EF Core DbContext
│   ├── Migrations/       # Auto-generated EF migrations
│   ├── Models/           # TaskItem, TokenRequest, PagedResult
│   └── Program.cs        # App bootstrap, CORS, JWT, DB
├── docker-compose.yml    # Local full-stack with PostgreSQL
└── .env.example          # Environment variable template
```

---

## Running Locally

### Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [PostgreSQL 15+](https://www.postgresql.org/) (or use Docker)

---

### 1 — Backend (ASP.NET Core API)

```bash
cd server
```

Create `appsettings.Development.json` (gitignored) with your local DB:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=fishytodo;Username=postgres;Password=postgres"
  }
}
```

The `appsettings.json` already has default values for `Jwt` settings — no extra setup needed for local dev.

Run the API:

```bash
dotnet run
```

The API starts at **http://localhost:5112**. EF Core migrations run automatically on startup, so the database schema is created for you.

---

### 2 — Frontend (React + Vite)

```bash
cd client
```

Copy the environment example and adjust if needed:

```bash
cp .env.development.example .env.development.local
```

Default values in the example already point to `http://localhost:5112`, so no changes are required for local dev.

Install dependencies and start:

```bash
npm install
npm run dev
```

The frontend starts at **http://localhost:5173**.

---

### 3 — Full-stack with Docker Compose (alternative)

Copy the root env file and fill in secrets:

```bash
cp .env.example .env
```

Then run everything (API + PostgreSQL) with:

```bash
docker compose up --build
```

The API will be available at **http://localhost:5112** and the React dev server still runs separately with `npm run dev` inside `client/`.

---

## Authentication Flow

FishyTodo uses **demo JWT authentication** — there are no user accounts or passwords. Instead, you pick a role and the API mints a short-lived JWT for that role.

### Step 1 — Get a token

`POST /token`

```json
{ "role": "ADMIN" }
```

Response:

```json
{
  "token": "<jwt>",
  "role": "ADMIN",
  "permissions": ["READ", "WRITE", "DELETE"],
  "expiresIn": "1 minute(s)"
}
```

### Step 2 — Use the token

Include it as a Bearer token on every protected request:

```
Authorization: Bearer <jwt>
```

If a token expires, the frontend automatically fetches a new one on the next request — no manual refresh needed.

---

## Roles & Permissions

| Role      | READ | WRITE | DELETE | UI access |
|-----------|------|-------|--------|-----------|
| `VISITOR` | ✓    |       |        | View tasks and moods only |
| `WRITER`  | ✓    | ✓     |        | Add and complete tasks, log moods |
| `ADMIN`   | ✓    | ✓     | ✓      | Full access + Admin Dashboard |

Role is selected on the login screen. The frontend enforces permissions visually (buttons hidden/disabled) and the backend enforces them via `[Authorize(Roles = "...")]` on each endpoint.

---

## API Endpoints

### Token

| Method | Path     | Auth | Description          |
|--------|----------|------|----------------------|
| POST   | `/token` | None | Get a JWT for a role |

### Tasks

| Method | Path              | Required role    | Description                        |
|--------|-------------------|------------------|------------------------------------|
| GET    | `/api/tasks`      | VISITOR+         | List active tasks (paginated)       |
| GET    | `/api/tasks?includeCompleted=true` | VISITOR+ | All tasks including completed |
| GET    | `/api/tasks/{id}` | VISITOR+         | Get a single task                  |
| POST   | `/api/tasks`      | WRITER, ADMIN    | Create a task                      |
| PUT    | `/api/tasks/{id}` | WRITER, ADMIN    | Update / complete a task           |
| DELETE | `/api/tasks/{id}` | ADMIN            | Delete a task                      |

#### Task object

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "title": "Feed the fish",
  "priority": "medium",
  "completed": false,
  "createdAt": "2026-05-11T00:00:00Z",
  "completedAt": null
}
```

Priority values: `tiny` · `small` · `medium` · `big` · `whale`

#### Pagination query params (GET `/api/tasks`)

| Param              | Default | Description                     |
|--------------------|---------|---------------------------------|
| `page`             | 1       | Page number                     |
| `pageSize`         | 10      | Items per page (max 100)        |
| `includeCompleted` | false   | Include completed tasks         |

### Health

| Method | Path      | Auth | Description       |
|--------|-----------|------|-------------------|
| GET    | `/health` | None | Service heartbeat |

---

## Testing with Swagger

Swagger UI is available at the **root URL** of the API:

- Local: http://localhost:5112
- Production: https://fishytodo-api.onrender.com

### Steps to test a protected endpoint

1. Open the Swagger UI.
2. Find **POST /token**, click **Try it out**.
3. Enter `{ "role": "ADMIN" }` and execute — copy the `token` value from the response.
4. Click the **Authorize** button (🔒) at the top of the page.
5. Enter `Bearer <your-token>` and confirm.
6. All subsequent requests will include the JWT automatically.

---

## How the Frontend Connects to the Backend

1. On login the user picks a role → `POST /token` is called → JWT stored in `localStorage`.
2. Every API call goes through `authorizedFetch()` in `client/src/utils/taskApi.js`, which attaches the `Authorization: Bearer` header automatically.
3. If a 401 is returned (token expired), the old token is cleared and a fresh one is fetched before retrying — transparent to the user.
4. The API base URL is configured via `VITE_API_BASE_URL` in the environment file (defaults to `http://localhost:5112` for local dev, `https://fishytodo-api.onrender.com` in production).

---

## Lab 7 Requirements Checklist

- [x] ASP.NET Core 9 REST API
- [x] PostgreSQL database via Entity Framework Core
- [x] EF Core migrations applied automatically on startup
- [x] JWT authentication (`/token` endpoint)
- [x] Role-based authorisation (`VISITOR`, `WRITER`, `ADMIN`)
- [x] CORS configured for the React frontend origin
- [x] CRUD endpoints for tasks (GET, POST, PUT, DELETE)
- [x] Pagination on task listing
- [x] React frontend fetches tasks from the API
- [x] Add, complete, and delete tasks through API calls
- [x] JWT included in all protected requests
- [x] Loading and error states handled in the UI
- [x] Swagger UI available in both development and production
- [x] Docker support (Dockerfile for API + `docker-compose.yml`)
- [x] Frontend deployed to GitHub Pages
- [x] Backend deployed to Render
