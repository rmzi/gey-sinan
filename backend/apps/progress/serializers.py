from rest_framework import serializers

from .models import UserLessonProgress, UserProgress, UserStreak


class WordProgressSerializer(serializers.ModelSerializer):
    wordId = serializers.CharField(source='word_id', read_only=True)
    easeFactor = serializers.FloatField(source='ease_factor')
    nextReview = serializers.DateTimeField(source='next_review')

    class Meta:
        model = UserProgress
        fields = ['wordId', 'easeFactor', 'interval', 'repetitions', 'nextReview', 'status']


class LessonProgressSerializer(serializers.ModelSerializer):
    lessonId = serializers.CharField(source='lesson_id', read_only=True)

    class Meta:
        model = UserLessonProgress
        fields = ['lessonId', 'status']


class StreakSerializer(serializers.ModelSerializer):
    lastDate = serializers.DateField(source='last_date', allow_null=True)

    class Meta:
        model = UserStreak
        fields = ['current', 'lastDate']


class WordProgressEntrySerializer(serializers.Serializer):
    """Serializer for a single word progress entry from the client payload."""
    easeFactor = serializers.FloatField(default=2.5)
    interval = serializers.IntegerField(default=0)
    repetitions = serializers.IntegerField(default=0)
    nextReview = serializers.DateTimeField()
    status = serializers.ChoiceField(choices=['new', 'learning', 'mastered'], default='new')


class StreakInputSerializer(serializers.Serializer):
    current = serializers.IntegerField(default=0)
    lastDate = serializers.DateField(allow_null=True, required=False)


class ProgressSyncSerializer(serializers.Serializer):
    """
    Accepts the full progress sync payload from the Expo client.
    Client uses camelCase keys matching the Zustand store shape.
    """
    wordProgress = serializers.DictField(
        child=WordProgressEntrySerializer(),
        required=False,
        default=dict,
    )
    lessonProgress = serializers.DictField(
        child=serializers.CharField(),
        required=False,
        default=dict,
    )
    streak = StreakInputSerializer(required=False)
    lastSyncedAt = serializers.DateTimeField(required=False, allow_null=True)
