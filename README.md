### Full-Stack Local Development Setup

Welcome! Follow this guide to initialize the local environment, which features a React/Vite frontend, a FastAPI backend, and a Postgres database running locally via Docker.

### Prerequisites

* **Node.js** (v18 or higher recommended) -> [Download Node.js Installer](https://nodejs.org/en/download)
* **uv** (Modern Python package & tool manager) -> [Official Astral uv Setup Documentation](https://docs.astral.sh/uv/getting-started/installation/)

  * *Safe Terminal Install:* Run `pip install uv`.
* **Docker** (with Compose) -> [Install Docker Desktop](https://docs.docker.com/desktop/) — used to run the local Postgres database.

💡 **Note on Python:** You do not need to manually download or install Python. uv will automatically fetch and manage the correct isolated Python version for this backend workspace under the hood.

### Environment Configuration

1. Copy the example env file at the repo root:

```bash
cp .env.example .env
```

2. Fill in the values in `.env`:
   * `SECRET_KEY` — generate one with `python -c "import secrets; print(secrets.token_hex(32))"`. Each developer/environment should generate their own.
   * `POSTGRES_PASSWORD` — pick anything; it's only used locally between your machine and the Postgres container.
   * `DATABASE_URL` — keep the user/password/db in sync with the `POSTGRES_*` values above (see the comment in `.env.example`).

`.env` is gitignored — never commit it.

### Database Setup (Postgres via Docker)

From the repo root, start the local Postgres container:

```bash
docker compose up -d
```

This reads `.env` for the `POSTGRES_*` credentials and exposes Postgres on `127.0.0.1:5432`. Check it's healthy with:

```bash
docker compose ps
```

### Backend Setup (FastAPI)

1. Open a terminal instance and target the backend root folder:

```bash
cd backend/app
```

2. Sync the project environment and install dependencies automatically:

```bash
uv sync
```

*This single command creates a `.venv`, reads `pyproject.toml`, and locks matching dependency streams.*

3. Start the live-reloading FastAPI development server:

```bash
uv run fastapi dev src/main.py
```

  * **API Core Server:** [http://localhost:8000](http://localhost:8000)
  * **Interactive API Playground Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)
  * *Note: Tables are created automatically against the Postgres database on first boot — make sure the Docker container from the step above is running first.*

### Frontend Setup (Vite + React)

1. Open a separate terminal instance and target the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Launch the dev server:

```bash
npm run dev
```

  * **Development Web Port UI:** [http://localhost:5173](http://localhost:5173)

### Development Guidelines & Security Architecture

* **Input Sanitization:** Primary fields (usernames and emails) automatically run `.strip().lower()` before evaluating database logic or checks. Keep string variables lowercase to guarantee alignment.
* **Authentication Pipeline:** Authentication runs natively via cryptographically signed JWT strings stored inside **httpOnly cookies**. This completely protects our local state from XSS vulnerabilities.
* **Making Network Requests:** When calling endpoints using fetch or axios from React components, always use relative paths (e.g., `fetch('/api/example')`). You **MUST** include `credentials: 'include'` in your settings object so the browser passes the secure cookie through Vite's dev proxy.
* **Database Inspections:** To visually query local data tables, connect to the local Postgres container with any Postgres client (e.g. `psql`, TablePlus, or the VS Code *PostgreSQL* extension) using the credentials from your `.env` file, host `localhost`, port `5432`.
