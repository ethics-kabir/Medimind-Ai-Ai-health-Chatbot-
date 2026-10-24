# MediMind AI

**AI Applications Lab / Python Programming project**

MediMind is a full-stack classroom project that demonstrates a React interface connected to a Python FastAPI application. It includes an educational health chat, a guided symptom form, a small medicine information library, emergency keyword checks, and a history dashboard.

> **Educational demo only.** MediMind does not diagnose, prescribe, or replace professional care. Do not enter real names or sensitive health information. The app has no accounts: records are stored in the configured backend database and can be seen or deleted by anyone who can use that deployment. In an emergency, call 112 in India or your local emergency number.

## What the project demonstrates

- Python REST endpoints, request validation, and FastAPI's interactive API documentation.
- A deterministic emergency keyword check that runs before the optional Gemini request.
- An optional Google Gemini integration, with built-in demo responses when no key is configured.
- SQLAlchemy models with SQLite for local development and PostgreSQL support for hosting.
- A mobile responsive React 19 + Vite website with English/Hindi labels.
- Emergency call links that open the Android phone dialer for 112, 108, or 102 when a visitor taps them in a mobile browser.

## Technology and layout

```text
MediMind AI
├── frontend/                 React 19, Vite, Tailwind CSS
│   └── src/                  pages, components, language context, API client
├── backend/                  Python 3.12, FastAPI, SQLAlchemy
│   └── app/
│       ├── api/              chat, symptom check, medications, health
│       ├── safety/           emergency keyword rules
│       ├── services/         Gemini integration and demo responses
│       ├── models/           Pydantic schemas and SQLAlchemy models
│       └── knowledge/data/   educational reference JSON
├── render.yaml               Render backend blueprint
└── .env.example              safe configuration template
```

Request flow:

```text
React UI → FastAPI (/api/...) → safety rules → demo/Gemini service
                                      ↘ SQLAlchemy → SQLite locally / PostgreSQL when hosted
```

## Run locally on Windows

Use two PowerShell terminals. Install Node.js 22.12 or newer, pnpm 10.34.7, and Python 3.12 first. If pnpm is not installed, run `npm install --global pnpm@10.34.7`. The backend's `.python-version` also selects Python 3.12 on Render.

### 1. Start the Python API

```powershell
cd path\to\medimind-ai\backend
Copy-Item .env.example .env
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The app starts in demo mode without an API key. To enable Gemini, put your key in `backend/.env` as `GEMINI_API_KEY=...` and restart the API. Never put this key in the frontend or commit it.

The API docs are at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs). The local SQLite file is created at `backend/medimind.db` and is ignored by Git.

### 2. Start the React app

```powershell
cd path\to\medimind-ai\frontend
pnpm install --frozen-lockfile
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173). Vite forwards `/api` calls to the local Python API. Keep both terminals running while using the app.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/health` | API, database, and AI mode status |
| `GET` | `/api/health-tips` | Static educational tips |
| `POST` | `/api/chat` | Submit a chat message |
| `GET` | `/api/conversations` | List saved chat conversations |
| `GET` | `/api/conversations/{id}` | Load one conversation |
| `DELETE` | `/api/conversations/{id}` | Delete one conversation |
| `DELETE` | `/api/conversations` | Clear all saved conversations |
| `POST` | `/api/symptom-check` | Submit the guided symptom form |
| `GET` | `/api/symptom-checks` | List saved symptom checks |
| `DELETE` | `/api/symptom-checks/{id}` | Delete one symptom check |
| `DELETE` | `/api/symptom-checks` | Clear all saved symptom checks |
| `GET` | `/api/medications` | List or search the reference library |
| `GET` | `/api/medications/{name}` | Get a medicine entry |

## Publish the source to GitHub

The source is ready to publish. `.gitignore` excludes `.env` files, the local SQLite database, dependency folders, build output, and the unused Android wrapper files. Keep the repository **private** if you add coursework or personal material.

1. Sign in at [GitHub](https://github.com/new) and create a new empty repository. Do not initialize it with another README or license.
2. In PowerShell, change to the project root and run the following. Replace the URL with the one shown on your new GitHub repository page:

   ```powershell
   git init -b main
   git add .
   git status
   git commit -m "Build MediMind AI lab project"
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
   git push -u origin main
   ```

3. If Git asks who you are, set your commit name and email with `git config --global user.name "Your Name"` and `git config --global user.email "you@example.com"`, then repeat the commit.
4. Refresh the GitHub page; the files and README should appear. Do not upload `.env`, `backend/medimind.db`, a Gemini key, or a signing keystore.

You can use GitHub Desktop instead: choose **Add an Existing Repository**, select this project folder, commit the files, then choose **Publish repository**.

## Deploy a public web version

Push the GitHub repository first. Deploy the API and frontend separately:

### Backend on Render

1. Create a PostgreSQL database in Render. SQLite files on a typical hosted web service are temporary and can be lost when the service restarts or is redeployed.
2. In Render, create a Blueprint from this repository and use the included `render.yaml` (the API service uses `backend/` as its root).
3. Set `DATABASE_URL` to the PostgreSQL **internal** connection URL. At the initial Blueprint prompt for `CORS_ORIGINS`, enter `http://localhost:5173` temporarily. After the Vercel site exists, change it to the exact site origin, such as `https://your-site.vercel.app` (no trailing slash), and redeploy the API. Add `GEMINI_API_KEY` only in Render if you choose to use Gemini; it is optional.
4. Once deployed, check `https://YOUR-RENDER-SERVICE.onrender.com/api/health`.

### Frontend on Vercel

1. Import the same GitHub repository into Vercel and set **Root Directory** to `frontend`.
2. Add the environment variable `VITE_API_URL` with the full API base, ending in `/api`, for example `https://your-service.onrender.com/api`.
3. Deploy and open the Vercel URL. After changing the API URL, redeploy the frontend. Copy the site origin into Render's `CORS_ORIGINS` setting and redeploy the API so the browser is allowed to call it.

Render's free web services may sleep when idle, so the first request after a quiet period can take longer. A deployed demo has no account system; all visitors share the same configured database and the history controls can delete its records. Do not use a public deployment for personal health information.

## Mobile website behavior

Visitors can open the Vercel URL directly in Chrome or another Android browser. The layout adapts to narrow screens, the navigation becomes a touch friendly menu, forms remain usable at phone width, and the emergency buttons use standard `tel:` links. Tapping one opens the phone dialer with the number filled in; Android requires the visitor to confirm the call.

The website still needs the deployed Render API for chat, symptom checks, medicine information, and history. Set `VITE_API_URL` in Vercel before deploying so these features reach that API.

## Safety and data limits

- The app is an educational programming project, not medical software.
- Emergency rules are a simple keyword demo, not a clinically validated detection system. They can miss emergencies or flag ordinary text.
- Gemini responses can be incorrect. The optional AI integration is not a substitute for a clinician.
- There is no authentication or per-user data separation. A shared deployment has shared chat and symptom history; clearing history removes records for everyone.
- The sample medication content is for software demonstration only. Verify medical information with a qualified professional and authoritative sources.
