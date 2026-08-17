### Full-Stack Local Development Setup

Welcome! Follow this guide to initialize the local environment, which features a React/Vite frontend, a FastAPI backend, and an embedded SQLite database. 

### Prerequisites

* **Node.js** (v18 or higher recommended) -> [Download Node.js Installer](https://nodejs.org/en/download)
* **uv** (Modern Python package & tool manager) -> [Official Astral uv Setup Documentation](https://docs.astral.sh/uv/getting-started/installation/) 

  * *Safe Terminal Install:* Run pip install uv.

💡 **Note on Python:** You do not need to manually download or install Python. uv will automatically fetch and manage the correct isolated Python version for this backend workspace under the hood. 

### Backend Engine Setup (FastAPI + SQLite)

1. Open a terminal instance and target the backend root folder: 

bash

cd backend/app
 
2. Sync the project environment and install dependencies automatically: 

bash

uv sync

*This single command creates a .venv, reads the pyproject.toml, and locks matching dependency streams.*
 
3. Start the live-reloading FastApi development server: 

bash

uv run fastapi dev src/main.py

  * **API Core Server:** [http://localhost:8000](http://localhost:8000)
  * **Interactive API Playground Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)
  * *Note: The SQLite database file (database.db) automatically generates upon your first boot.*

### Frontend Engine Setup (Vite + React)

1. Open a separate terminal instance and target the frontend directory: 

bash

cd frontend
 
2. Drop past configurations, purge lock states, and complete dependencies download: 

bash

npm install

3. Launch the frontend pipeline: 

bash

npm run dev

  * **Development Web Port UI:** [http://localhost:5173](http://localhost:5173)

### Development Guidelines & Security Architecture

* **Input Sanitization:** Primary fields (Usernames and Emails) automatically run .strip().lower() modifications before evaluating database logic or checks. Keep string variables lowercase to guarantee alignment.
* **Authentication Pipeline:** Authentication runs natively via cryptographically signed JWT strings stored inside **httpOnly cookies**. This completely protects our local states from XSS vulnerabilities.
* **Making Network Requests:** When calling endpoints using fetch or axios from React components, always utilize relative syntax paths (e.g., fetch('/api/example')). You **MUST** include credentials: 'include' within your settings object parameters so the browser passes local secure proxy cookies through Vite flawlessly.
* **Database Inspections:** To visually query local data tables without running external terminal modules, download the *SQLite Viewer* extension in VS Code and select the local asset (backend/app/database.db).