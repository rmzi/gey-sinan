from rest_framework import serializers

from .models import DictionaryEntry, Lesson, Phrase, Word


class WordSerializer(serializers.ModelSerializer):
    audioUrl = serializers.SerializerMethodField()

    class Meta:
        model = Word
        fields = [
            'id',
            'harari_latin',
            'harari_ethiopic',
            'harari_arabic',
            'english',
            'category',
            'difficulty',
            'source',
            'verified',
            'audioUrl',
            'audio_recorded',
            'notes',
            'created_at',
            'updated_at',
        ]

    def get_audioUrl(self, obj):
        if obj.audio_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.audio_file.url)
            return obj.audio_file.url
        return None


class WordListSerializer(serializers.ModelSerializer):
    audioUrl = serializers.SerializerMethodField()

    class Meta:
        model = Word
        fields = [
            'id',
            'harari_latin',
            'harari_ethiopic',
            'harari_arabic',
            'english',
            'category',
            'difficulty',
            'audioUrl',
        ]

    def get_audioUrl(self, obj):
        if obj.audio_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.audio_file.url)
            return obj.audio_file.url
        return None


class DictionaryEntrySerializer(serializers.ModelSerializer):
    word = WordListSerializer(read_only=True)

    class Meta:
        model = DictionaryEntry
        fields = [
            'id',
            'harari_latin',
            'english',
            'category',
            'notes',
            'word',
        ]


class PhraseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Phrase
        fields = [
            'id',
            'harari_latin',
            'harari_ethiopic',
            'harari_arabic',
            'english',
            'category',
            'notes',
            'created_at',
        ]


class LessonSerializer(serializers.ModelSerializer):
    words = WordListSerializer(many=True, read_only=True)

    class Meta:
        model = Lesson
        fields = [
            'id',
            'unit',
            'order',
            'title',
            'description',
            'words',
            'exercises',
        ]


class LessonListSerializer(serializers.ModelSerializer):
    wordCount = serializers.IntegerField(source='word_count', read_only=True)

    class Meta:
        model = Lesson
        fields = [
            'id',
            'unit',
            'order',
            'title',
            'description',
            'wordCount',
        ]
