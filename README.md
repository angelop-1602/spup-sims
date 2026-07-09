# SPUP SIMS

This repository is organized as one workspace for the SIMS shared backend and frontend apps.

## Folder Structure

```text
backend/      Future shared .NET backend API
app/
  hrm/        HRM Next.js frontend app
```

## Frontend

```powershell
cd app/hrm
npm install
npm run dev
```

The HRM frontend keeps its own Next.js files, including `package.json`, `tsconfig.json`, and the Next `app/` router folder.

## Backend

`backend` is intentionally empty for now. Add the .NET project there when the shared backend work starts.
