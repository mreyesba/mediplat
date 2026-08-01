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

uv run fastapi dev

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

### Development Guidelines & Network Rules

* **API Integration Proxy:** Any HTTP client request mapped directly using local relative syntax (e.g., fetch('/api/example')) maps automatically to the FastAPI layer via Vite configuration rules. No explicit domain variables are required in development code branches.
* **Database Viewing:** To visually query the SQLite state tables directly, run extensions like *SQLite Viewer* within VS Code against the root database asset.

## General architecture

                  [ Universal Landing Page ]
                     /                  \
        [ Patient Login ]             [ Provider Login ]

               |                              |
     [ Patient Dashboard ]           [ Doctor Dashboard ]
     - Upcoming Appointments         - Patient Queue / Schedule
     - Care Plan & Rx Tracking       - Electronic Health Records (EHR)
     - Secure Doctor Chat            - Patient Messaging & Telehealth

my-app/
│   backend/
│   └── app/
│       ├── __init__.py
│       ├── database.py   # SQLAlchemy configuration
|       ├── models.py     # Database schema models
│       │── main.py       # FastAPI application & entry point
│       ├── pyproject.toml
│       └── uv.lock
└── frontend/             # Vite/React app
