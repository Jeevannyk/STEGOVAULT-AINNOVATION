---
name: run-stegovault
description: Run, start, build, test, screenshot, or verify StegoVault — an AI-powered steganography vault with a Django REST backend and React/Vite frontend.
---

StegoVault has two services: a Django REST backend (`backend/`, port 8000) and a React/Vite frontend (`frontend/stegovault-frontend/`, port 5173). The primary driver is `smoke.py` in this skill directory; the screenshot command uses Chrome headless. All paths below are relative to the repo root.

## Prerequisites

Python 3.x and Node 18+ must be installed (both already present on this machine). A virtual environment lives at `backend/venv/`. Frontend `node_modules` are already installed.

Chrome is required for screenshots:
```
C:\Program Files\Google\Chrome\Application\chrome.exe
```

## Build

Backend (no build step — Django runs from source):
```powershell
cd backend
./venv/Scripts/python.exe manage.py migrate --run-syncdb
```

Frontend (no explicit build needed for dev mode — Vite serves directly):
```powershell
cd frontend/stegovault-frontend
npm run dev -- --port 5173
```

## Run (agent path)

### Start both servers

```bash
# Terminal 1 — backend
cd backend && ./venv/Scripts/python.exe manage.py runserver --noreload 8000 > /tmp/django.log 2>&1 &

# Terminal 2 — frontend
cd frontend/stegovault-frontend && npm run dev -- --port 5173 > /tmp/vite.log 2>&1 &
```

Wait ~8 seconds for both to be ready, then verify:
```bash
curl -s http://localhost:8000/api/encode/    # should return {"detail":"Method \"GET\" not allowed."}
curl -s http://localhost:5173 | head -3      # should return <!doctype html>
```

### Run smoke tests

```bash
backend/venv/Scripts/python.exe .claude/skills/run-stegovault/smoke.py all
```

Specific tests:
```bash
backend/venv/Scripts/python.exe .claude/skills/run-stegovault/smoke.py encode
backend/venv/Scripts/python.exe .claude/skills/run-stegovault/smoke.py decode
backend/venv/Scripts/python.exe .claude/skills/run-stegovault/smoke.py analyze
```

### Take a screenshot

```bash
backend/venv/Scripts/python.exe .claude/skills/run-stegovault/smoke.py screenshot C:\path\to\out.png
```

This launches Chrome headless against `http://localhost:5173` (frontend must be running).

### Test the API directly

Encode a secret into an image:
```bash
# Use Python for multipart uploads (curl -F fails on Windows Git Bash with /tmp paths)
backend/venv/Scripts/python.exe -c "
import urllib.request, json
from pathlib import Path

boundary = b'----StegoVaultBoundary'
carrier_bytes = Path('path/to/carrier.png').read_bytes()
body = (b'--' + boundary + b'\r\n'
        b'Content-Disposition: form-data; name=\"image\"; filename=\"carrier.png\"\r\n'
        b'Content-Type: image/png\r\n\r\n' + carrier_bytes + b'\r\n'
        b'--' + boundary + b'\r\n'
        b'Content-Disposition: form-data; name=\"secret\"\r\n\r\nsecret-value\r\n'
        b'--' + boundary + b'\r\n'
        b'Content-Disposition: form-data; name=\"password\"\r\n\r\npassword123\r\n'
        b'--' + boundary + b'--\r\n')
req = urllib.request.Request('http://localhost:8000/api/encode/', data=body)
req.add_header('Content-Type', 'multipart/form-data; boundary=----StegoVaultBoundary')
with urllib.request.urlopen(req) as r:
    Path('stego.png').write_bytes(r.read())
    print('Saved stego.png')
"
```

## Run (human path)

Start both servers as above, then open `http://localhost:5173` in a browser. The app loads directly on the Encode page. Use the sidebar to navigate to Decode, Analyze, or Analytics.

## Gotchas

- **`STATIC_URL` missing from settings.py** — the original `backend/stegovault/settings.py` did not include `STATIC_URL`. Running `manage.py runserver` crashes with `ImproperlyConfigured`. Fix: `STATIC_URL = '/static/'` has been added to the file.

- **`django.contrib.auth` missing from `INSTALLED_APPS`** — the original settings only had `django.contrib.contenttypes`. Any request to the vault endpoints raised `RuntimeError: Model class django.contrib.auth.models.Permission doesn't declare an explicit app_label`. Fix: `django.contrib.auth` has been added to `INSTALLED_APPS` and `migrate --run-syncdb` must be rerun.

- **`curl -F "file=@/tmp/..."` fails on Windows Git Bash (exit code 26)** — Git Bash's `curl` cannot read POSIX `/tmp/` paths when passing files via `-F`. Use Python's `urllib` instead (as in `smoke.py` and the examples above).

- **Multiple stale Django processes** — each `manage.py runserver` launch in the Bash tool creates a new background process. Use `ps aux | grep python | grep -v grep` and `kill -9 <PIDs>` to clean up before restarting, or the port stays bound to an old process.

- **React router is client-side** — navigating to `http://localhost:5173/decode` in headless Chrome still shows the Encode page because Vite serves the SPA root for all routes. Deep-link screenshots need JavaScript navigation, not URL changes.

- **Analyze endpoint scores solid-color images as 0** — the AI scorer computes entropy and chi-square; uniform-color test images have zero entropy and produce `score=0.0, rating=Poor`. This is expected behavior in tests.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `ImproperlyConfigured: STATIC_URL` | `STATIC_URL = '/static/'` already added to `backend/stegovault/settings.py` |
| `RuntimeError: Permission doesn't declare app_label` | `django.contrib.auth` already added to `INSTALLED_APPS`; run `migrate --run-syncdb` |
| Port 8000 already in use | `ps aux | grep manage.py` then `kill -9 <PID>` |
| `curl -F` exit code 26 | Use Python `urllib` as shown above |
| Screenshot is blank/wrong page | Verify `http://localhost:5173` returns HTML; wait for Vite to fully start |
| `ModuleNotFoundError: No module named 'django'` | Use `backend/venv/Scripts/python.exe`, not system `python` |
