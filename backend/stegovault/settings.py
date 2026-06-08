import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-stegovault-dev-change-in-prod-xk92mz7p'

# DEBUG is OFF by default so that an exposed/tunnelled backend never leaks the
# URLconf, tracebacks, or settings on error pages. Turn it on ONLY for local
# debugging: set DJANGO_DEBUG=1 in your shell before running the server.
DEBUG = os.environ.get('DJANGO_DEBUG', '') == '1'
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.contenttypes',
    'django.contrib.auth',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'vault',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
]

ROOT_URLCONF = 'stegovault.urls'
WSGI_APPLICATION = 'stegovault.wsgi.application'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {'context_processors': []},
    },
]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# ── CORS ────────────────────────────────────────────────────────────────────
# Allow the SPA to call this API from any origin (LAN, port forwarding, tunnels).
# Token auth lives in the Authorization header (no cookies), so wildcard origins
# are safe here. Tighten CORS_ALLOWED_ORIGINS for production if you lock this down.
from corsheaders.defaults import default_headers, default_methods

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = False
CORS_ALLOW_HEADERS = list(default_headers)            # includes authorization, content-type
CORS_ALLOW_METHODS = list(default_methods)            # includes GET, POST, OPTIONS
CORS_EXPOSE_HEADERS = ['Content-Disposition']         # let the encode download be read
CORS_PREFLIGHT_MAX_AGE = 86400                        # cache OPTIONS preflight for a day

DATA_UPLOAD_MAX_MEMORY_SIZE = 20 * 1024 * 1024  # 20 MB

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

STATIC_URL = '/static/'
