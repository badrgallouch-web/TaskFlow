# TaskFlow

Project and task management app with a Node.js/Express API and static HTML frontend.

## Project structure

```
TaskFlow/
├── backend/                 # API server
│   ├── server.js            # Entry point
│   ├── controllers/         # Request handlers
│   ├── models/              # Mongoose schemas
│   ├── routes/              # Express routers
│   ├── middlewares/         # Auth, validation
│   └── services/            # Activity & notification helpers
├── frontend/
│   └── public/              # Static UI (HTML + JS)
│       ├── js/
│       └── *.html
├── docker-compose.yml       # MongoDB for local dev
├── Dockerfile
└── package.json
```

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root:

   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/TaskFlowDB
   PORT=3000
   JWT_SECRET=your_secret_here
   ```

3. Start MongoDB (required, via Docker):

   ```bash
   docker compose up -d
   ```

   If MongoDB exits immediately, reset the volume (only if you can lose local data):

   ```bash
   docker compose down -v && docker compose up -d
   ```

4. Start everything (MongoDB **and** the web app on port 3000):

   ```bash
   npm run docker:up
   ```

   Or for local development with auto-reload:

   ```bash
   docker compose up -d mongo
   npm run dev
   ```

5. Open the app at [http://localhost:3000/login.html](http://localhost:3000/login.html).

   If you see **connection refused**, the Node server is not running — use step 4, not `docker compose up -d mongo` alone.

## API overview

| Prefix | Description |
|--------|-------------|
| `/api/auth` | Register, login, profile |
| `/api/projects` | Projects and members |
| `/api/tasks` | Tasks (CRUD, assign, status) |
| `/api/dashboard` | Dashboard stats |
| `/api/notifications` | Notifications |
| `/api/projects/:id/activities` | Project activity log |

## Scripts

- `npm start` — run production server
- `npm run dev` — run with nodemon
