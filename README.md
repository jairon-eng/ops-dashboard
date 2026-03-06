# 🚀 Ops Dashboard

A full-stack operational monitoring dashboard built with:

- ASP.NET Core 8 Web API
- Entity Framework Core
- PostgreSQL
- React + Vite
- Docker Compose
- JWT Authentication
- Swagger

This project simulates an internal operations monitoring tool used to track system incidents and maintenance events.

---

# 📌 Overview

**Ops Dashboard** is a full-stack application designed to simulate a lightweight operational monitoring system.

It allows users to:

- Register operational events
- Track event severity and status
- Filter and search events dynamically
- View operational KPIs
- Resolve incidents with business logic enforcement

The goal of this project is to demonstrate **full stack architecture, API design, and real domain behavior**, not just basic CRUD functionality.

---

# 🏗 Architecture

## 🔧 Backend

- ASP.NET Core 8 Web API
- Entity Framework Core (Code First)
- PostgreSQL
- JWT authentication
- DTO-based API responses
- Business rule enforcement
- Aggregation queries for metrics
- Filtering, sorting, pagination, and search

Key concepts demonstrated:

- RESTful API design
- Query parameter filtering
- Allow-list sorting for security
- Pagination with total count
- Domain logic inside application layer

---

## 🎨 Frontend

- React (Vite)
- Fetch API integration
- Token-based authentication
- Dashboard UI with KPIs
- Badge-based severity/status visualization
- Dynamic filtering
- Pagination controls
- Search functionality

The frontend communicates with the API through `/api` routes proxied via Nginx when running inside Docker.

---

## 🗃 Database

- PostgreSQL 16
- Running inside Docker
- EF Core migrations
- Enums stored as strings for readability

Migrations are automatically applied at startup using:

```csharp
db.Database.Migrate();
```

This allows the application to initialize the database schema automatically when containers start.

---

# 🐳 Running with Docker (Recommended)

The entire application can be started with **one command**.

## Requirements

- Docker
- Docker Compose

## Start the system

From the root of the repository:

```bash
docker compose up --build
```

This starts:

| Service    | URL                            |
|------------|--------------------------------|
| Frontend   | http://localhost:5173          |
| API        | http://localhost:8080          |
| Swagger    | http://localhost:8080/swagger  |
| PostgreSQL | localhost:5432                |

Docker services:

- **db** → PostgreSQL database
- **api** → ASP.NET Core Web API
- **web** → React build served with Nginx

---

# 🧪 Running Locally (Without Docker)

## 1. Start PostgreSQL

```bash
docker compose up -d db
```

## 2. Run backend

```bash
cd backend
dotnet run --project src/OpsDashboard.Api
```

Swagger:

```text
http://localhost:5282/swagger
```

## 3. Run frontend

```bash
cd frontend/ops-dashboard-ui
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 📊 API Endpoints

## Events

```text
GET    /api/events
GET    /api/events/{id}
POST   /api/events
PATCH  /api/events/{id}/status
```

Features supported:

- Filtering
- Pagination
- Sorting
- Search by title

Example:

```text
/api/events?severity=High&sort=createdAt_desc&page=1&pageSize=10
```

---

## Metrics

```text
GET /api/metrics
```

Returns operational KPIs:

- Open event count
- Resolved today count
- Events grouped by severity

---

# 🔐 Authentication

The API uses **JWT authentication**.

Protected endpoints:

- Create event
- Update event status

Public endpoints:

- Event queries
- Metrics

---

# 🎯 Purpose of This Project

This project demonstrates practical full-stack engineering skills:

- ASP.NET Core API development
- EF Core with PostgreSQL
- React frontend integration
- Authentication with JWT
- Dockerized infrastructure
- API filtering and pagination
- Maintainable architecture

---

# 🔮 Possible Future Improvements

- Role-based access control
- Unit tests for API services
- CI/CD pipeline
- Production deployment configuration
- Real-time updates with WebSockets

---

# 👨‍💻 Author

**Jairon Misael Herrera Monterroso**  
Full Stack Developer — .NET & React
