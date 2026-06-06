@echo off
echo Setting up StegoVault backend...

if not exist venv (
    python -m venv venv
)

call venv\Scripts\activate

pip install -r requirements.txt --quiet

python manage.py migrate --run-syncdb

echo.
echo Backend running at http://localhost:8000
echo.

python manage.py runserver
