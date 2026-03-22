from django.urls import path

from .views import ProgressSyncView, StatsView

urlpatterns = [
    path('sync/', ProgressSyncView.as_view(), name='progress-sync'),
    path('stats/', StatsView.as_view(), name='progress-stats'),
]
