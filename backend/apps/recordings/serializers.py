from rest_framework import serializers

from .models import Recording, Speaker


class SpeakerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Speaker
        fields = [
            'id',
            'name',
            'email',
            'age_range',
            'gender',
            'fluency_level',
            'dialect_notes',
            'consent_app_use',
            'consent_language_preservation',
            'consent_ml_training',
            'consent_attribution',
            'consent_timestamp',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class RecordingSerializer(serializers.ModelSerializer):
    audio_file = serializers.FileField(write_only=True)
    audioUrl = serializers.SerializerMethodField()

    class Meta:
        model = Recording
        fields = [
            'id',
            'speaker',
            'word',
            'phrase',
            'audio_file',
            'audioUrl',
            'mime_type',
            'sample_rate',
            'duration',
            'peak_amplitude',
            'clipping',
            'too_quiet',
            'status',
            'approved_by',
            'approved_at',
            'created_at',
        ]
        read_only_fields = ['id', 'status', 'approved_by', 'approved_at', 'created_at']

    def get_audioUrl(self, obj):
        if obj.audio_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.audio_file.url)
            return obj.audio_file.url
        return None


class RecordingListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recording
        fields = ['id', 'word', 'status', 'created_at']
