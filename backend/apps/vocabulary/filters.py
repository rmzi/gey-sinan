import django_filters

from .models import Word


class WordFilter(django_filters.FilterSet):
    class Meta:
        model = Word
        fields = ['category', 'difficulty', 'verified']
