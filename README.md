# Round2-Hacknova
Repository for team Hacknova for Round 2
# ResQLink

# ResQLink — Offline-First Emergency Response System

ResQLink is an emergency response platform designed to help survivors send SOS alerts, share their location, communicate with rescue teams, and continue emergency operations when network connectivity is temporarily unavailable.

## Live Demo

**Main Application:**  
https://resqlink-863e.onrender.com

**Rescue Dashboard:**  
https://resqlink-863e.onrender.com/dashboard

## Key Features

### Emergency SOS

- One-click emergency SOS submission
- Survivor name and emergency description
- Injury severity input
- Automatic emergency priority calculation
- Incident status tracking

### Location Intelligence

- Browser GPS location
- Last saved location
- Manual latitude and longitude entry
- Location displayed with emergency incidents on the rescue dashboard

### Emergency Prioritization

The system calculates an emergency priority score using:

- Injury severity
- Location accessibility
- Resource urgency
- Waiting time

Priority levels:

- LOW
- MEDIUM
- HIGH
- CRITICAL

The current MVP uses a transparent rule-based priority engine.

### Offline-First SOS

When the device loses connectivity:

- SOS information is stored locally
- The survivor can continue using the emergency interface
- Queued SOS requests are automatically synchronized when connectivity returns
- The synchronized incident becomes visible on the rescue dashboard

### Rescue Dashboard

Rescue teams can:

- View active emergency incidents
- View incident priority
- View survivor locations
- View available rescue teams
- Monitor emergency cases
- View incidents and teams on the map

### Two-Way Communication

The system supports communication between:

**Survivor → Rescue Team**

and

**Rescue Team → Survivor**

Messages are associated with the corresponding emergency incident.

## Technology Stack

### Frontend

- HTML5
- CSS3
- JavaScript
- Leaflet.js
- Browser Geolocation API
- Service Worker
- Local Storage

### Backend

- Python
- Flask
- Gunicorn
- JSON-based data storage

### Testing

- Pytest

### Deployment

- GitHub
- Render

## Project Structure

    Round2-Hacknova/
    │
    ├── ai/
    │
    ├── backend/
    │   ├── app.py
    │   ├── routes/
    │   └── services/
    │
    ├── data/
    │   ├── incidents.json
    │   ├── messages.json
    │   └── teams.json
    │
    ├── docs/
    │
    ├── frontend/
    │   ├── css/
    │   ├── js/
    │   ├── index.html
    │   ├── dashboard.html
    │   └── sw.js
    │
    ├── mesh/
    │
    ├── tests/
    │
    ├── .gitignore
    ├── LICENSE
    ├── README.md
    └── requirements.txt

## How the System Works

    Survivor
       │
       ▼
    Emergency SOS
       │
       ├── GPS / Manual Location
       │
       ▼
    Priority Engine
       │
       ├── Injury Severity
       ├── Accessibility
       ├── Resource Urgency
       └── Waiting Time
       │
       ▼
    Emergency Incident
       │
       ├──────────────► Rescue Dashboard
       │                       │
       │                       ▼
       │                 Rescue Team
       │                       │
       ◄───────────────────────┘
       │
       ▼
    Two-Way Communication

## Offline Workflow

    Network Available
           │
           ▼
         Send SOS
           │
           ▼
       Backend API
           │
           ▼
    Rescue Dashboard


    Network Unavailable
           │
           ▼
         Send SOS
           │
           ▼
     Local Storage Queue
           │
           ▼
    Connection Restored
           │
           ▼
    Automatic Synchronization
           │
           ▼
     Rescue Dashboard

## Running Locally

Clone the repository:

    git clone https://github.com/MakersNeedMore-MnM/Round2-Hacknova.git

Move into the project:

    cd Round2-Hacknova

Create the virtual environment:

    python -m venv .venv

Activate it on Windows PowerShell:

    .venv\Scripts\Activate.ps1

Install dependencies:

    pip install -r requirements.txt

Start the Flask application:

    python backend/app.py

Open the application:

    http://127.0.0.1:5000/

Open the dashboard:

    http://127.0.0.1:5000/dashboard

## Testing

Run:

    pytest

## Implemented MVP

The current working MVP demonstrates:

- Emergency SOS
- GPS/manual location
- Emergency priority calculation
- Rescue dashboard
- Incident mapping
- Rescue-team communication
- Survivor communication
- Offline SOS storage
- Automatic synchronization after reconnection
- Service Worker-based application caching
- Public web deployment

## Future Enhancements

The following are planned extensions rather than fully implemented MVP functionality:

- Real Bluetooth/Wi-Fi Direct mesh networking
- Production-grade peer-to-peer communication
- Trained machine-learning emergency prioritization model
- On-device AI inference
- Fully offline map tiles
- Persistent production database
- Hardware SOS beacon integration
- IoT sensor integration
- Advanced route optimization

## Project Goal

ResQLink aims to reduce communication delays during emergencies by providing an offline-first