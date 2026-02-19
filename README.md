#  🚀 Ops Dashboard

A full stack operational dashboard built with:

- ASP.NET Core 8 (Web API)
- Entity Framework Core
- PostgreSQL (Docker)
- React + Vite
- Swagger (API documentation)

## 📌 Overview

Ops Dashboard is a full stack application designed to simulate an operational monitoring tool.

It allows users to:

- Register operational events
- Track severity and status
- Apply dynamic filters
- View real-time KPIs
- Update event status with business rules

The goal of this project is to demonstrate clean architecture, domain logic, and full stack integration — not just basic CRUD functionality.

## 🏗 Architecture

### 🔧 Backend
- ASP.NET Core 8 Web API
- Entity Framework Core (Code First)
- PostgreSQL
- DTO-based responses
- Business rule enforcement
- Aggregation queries for metrics

### 🎨 Frontend
- React (Vite)
- Fetch API integration
- Proxy configuration for local development
- Responsive dashboard layout
- Badge-based status visualization

### 🗃 Database
- PostgreSQL running via Docker
- Enums stored as strings
- EF Core migrations

## 🚀  How to Run

### 1. Start PostgreSQL (Docker)

docker compose up -d

### 2. Run Backend

cd backend
dotnet run --project src/OpsDashboard.Api

Swagger:
http://localhost:5282/swagger

### 3. Run Frontend

cd frontend/ops-dashboard-ui
npm install
npm run dev

Frontend:
http://localhost:5173

## 📊 API Endpoints

### 📁 Events

- GET /api/events
- GET /api/events/{id}
- POST /api/events
- PATCH /api/events/{id}/status

Supports filtering:
- Status
- Severity

### 📈  Metrics

- GET /api/metrics

Returns:
- Open event count
- Resolved today count
- Events grouped by severity

## 🧠 Business Logic Example

When updating an event status:

If status becomes Resolved,
ResolvedAt is automatically set to UTC now.

This demonstrates real domain logic beyond simple CRUD operations.

## 🎯 Purpose of This Project

This project demonstrates:

- RESTful API design
- Clean separation of concerns
- EF Core with PostgreSQL
- Aggregation queries
- Frontend-backend integration
- Structured Git commit history
- Maintainable architecture

## 🔮 Future Improvements

- Pagination support
- Authentication & role-based access
- Dockerfile for production
- Unit testing
- CI/CD pipeline

## 👨‍💻 Author

Jairon Misael Herrera Monterroso  
Full Stack Developer | .NET & React
