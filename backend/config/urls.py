from django.conf import settings
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def health_check(request):
    return JsonResponse({"status": "ok"})


def config_view(request):
    return JsonResponse({
        "apiVersion": "v1",
        "minimumAppVersion": "0.1.0",
        "features": {
            "dictionarySearch": True,
            "recordingUpload": True,
            "progressSync": True,
            "pronunciationScoring": False,
        }
    })


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/health/', health_check, name='health-check'),
    path('api/v1/', include('apps.vocabulary.urls')),
    path('api/v1/recordings/', include('apps.recordings.urls')),
    path('api/v1/progress/', include('apps.progress.urls')),
    path('api/v1/users/', include('apps.users.urls')),
    path('api/v1/config/', config_view, name='api-config'),
    path('api/v1/auth/', include('dj_rest_auth.urls')),
    path('api/v1/auth/registration/', include('dj_rest_auth.registration.urls')),
]

if settings.DEBUG:
    try:
        import debug_toolbar
        urlpatterns = [
            path('__debug__/', include(debug_toolbar.urls)),
        ] + urlpatterns
    except ImportError:
        pass
