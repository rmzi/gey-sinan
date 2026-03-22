from django.urls import path

from .views import MyRecordingsView, RecordingUploadView, SpeakerCreateView

urlpatterns = [
    path('speakers/', SpeakerCreateView.as_view(), name='speaker-create'),
    path('upload/', RecordingUploadView.as_view(), name='recording-upload'),
    path('my-recordings/', MyRecordingsView.as_view(), name='my-recordings'),
]
