# Todo web app

A full-stack todo app built with React, Bootstrap, Node.js, Express, and MongoDB.

## Features

- Add a task with a title and optional description.
- Persist tasks through an Express REST API and MongoDB.
- View all tasks in responsive Bootstrap cards.
- Change a task's status between **Pending**, **Working**, and **Done**.
- Register and log in with secure password hashing; only registered users can be selected as task assignees.
- API and database addresses are configured with environment variables rather than hard-coded URLs.

## Run locally

1. Install Node.js 20+ and start a MongoDB instance (or create a free MongoDB Atlas cluster).
2. Copy `server/.env.example` to `server/.env` and set `MONGODB_URI`.
3. Copy `client/.env.example` to `client/.env`. Leave `VITE_API_BASE_URL` blank when the Vite proxy is used locally.
   Set a long `JWT_SECRET` in `server/.env`.
4. Install and start the app:

```bash
npm run install:all
npm run dev
```

Open `http://localhost:5173`. The API runs on `http://localhost:5000`.

## API

| Method | URL | Purpose |
| --- | --- | --- |
| GET | `/api/todos` | List tasks |
| POST | `/api/todos` | Create a task |
| PATCH | `/api/todos/:id/status` | Change task status |

## Free deployment (Render + MongoDB Atlas)

1. Create a free MongoDB Atlas database and create a database user. Copy its connection string.
2. Push this repository to GitHub.
3. In Render, create a **Web Service** from the repository. Use the root directory `server`, build command `npm install`, and start command `npm start`.
4. Set the Web Service environment variables:
   - `MONGODB_URI`: your Atlas connection string
   - `CLIENT_ORIGIN`: the final frontend URL (set this after creating the static site)
   - `JWT_SECRET`: a long random secret used to sign login sessions
5. In Render, create a **Static Site** from the same repository. Use root directory `client`, build command `npm install && npm run build`, and publish directory `dist`.
6. Set `VITE_API_BASE_URL` on the Static Site to your Render API URL with `/api` appended, for example `https://your-api.onrender.com/api`, then redeploy it.
7. Update `CLIENT_ORIGIN` on the API to the Static Site's exact URL and redeploy the API.

The optional `render.yaml` declares both services; create the Atlas database first and fill in the generated values in Render.
