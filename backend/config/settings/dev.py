from .base import *  # noqa: F401, F403

DEBUG = True

ALLOWED_HOSTS = ['*']

INSTALLED_APPS = INSTALLED_APPS + [  # noqa: F405
    'debug_toolbar',
]

MIDDLEWARE = [  # noqa: F405
    'debug_toolbar.middleware.DebugToolbarMiddleware',
] + MIDDLEWARE  # noqa: F405

INTERNAL_IPS = ['127.0.0.1']

CORS_ALLOW_ALL_ORIGINS = True
