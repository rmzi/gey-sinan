from rest_framework.generics import CreateAPIView, ListAPIView
from rest_framework.permissions import IsAuthenticated

from .models import Recording, Speaker
from .serializers import RecordingListSerializer, RecordingSerializer, SpeakerSerializer


class SpeakerCreateView(CreateAPIView):
    queryset = Speaker.objects.all()
    serializer_class = SpeakerSerializer
    permission_classes = [IsAuthenticated]


class RecordingUploadView(CreateAPIView):
    queryset = Recording.objects.all()
    serializer_class = RecordingSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Associate with the speaker passed in the payload; no automatic linking to user here
        # since Speaker is a separate consent-based profile
        serializer.save()


class MyRecordingsView(ListAPIView):
    serializer_class = RecordingListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Return recordings where the speaker's email matches the authenticated user's email
        return Recording.objects.filter(
            speaker__email=self.request.user.email
        ).order_by('-created_at')
