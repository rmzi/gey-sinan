from .base import *  # noqa: F401, F403

DEBUG = False

CORS_ALLOWED_ORIGINS = os.environ.get(  # noqa: F405
    'CORS_ALLOWED_ORIGINS', ''
).split(',')

SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

import sentry_sdk  # noqa: E402

sentry_sdk.init(
    dsn=os.environ.get('SENTRY_DSN', ''),  # noqa: F405
)
