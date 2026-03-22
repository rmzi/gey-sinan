from django.db.models import Count, Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from rest_framework.generics import ListAPIView
from rest_framework.viewsets import ReadOnlyModelViewSet

from .filters import WordFilter
from .models import DictionaryEntry, Lesson, Phrase, Word
from .serializers import (
    DictionaryEntrySerializer,
    LessonListSerializer,
    LessonSerializer,
    PhraseSerializer,
    WordListSerializer,
    WordSerializer,
)


class WordViewSet(ReadOnlyModelViewSet):
    queryset = Word.objects.all()
    filterset_class = WordFilter
    search_fields = ['harari_latin', 'english']
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]

    def get_serializer_class(self):
        if self.action == 'list':
            return WordListSerializer
        return WordSerializer


class DictionarySearchView(ListAPIView):
    serializer_class = DictionaryEntrySerializer

    def get_queryset(self):
        q = self.request.query_params.get('q', '')
        qs = DictionaryEntry.objects.select_related('word')
        if q:
            qs = qs.filter(Q(harari_latin__icontains=q) | Q(english__icontains=q))
        return qs.order_by('harari_latin')


class PhraseViewSet(ReadOnlyModelViewSet):
    queryset = Phrase.objects.all()
    serializer_class = PhraseSerializer


class LessonViewSet(ReadOnlyModelViewSet):
    queryset = Lesson.objects.annotate(word_count=Count('words'))

    def get_serializer_class(self):
        if self.action == 'list':
            return LessonListSerializer
        return LessonSerializer
