from django.contrib import admin

from .models import DictionaryEntry, Lesson, Phrase, Sentence, Word


@admin.register(Word)
class WordAdmin(admin.ModelAdmin):
    list_display = ['id', 'harari_latin', 'english', 'category', 'difficulty', 'verified', 'audio_recorded']
    search_fields = ['harari_latin', 'english', 'id']
    list_filter = ['category', 'difficulty', 'verified', 'audio_recorded']
    actions = ['mark_verified', 'mark_rejected']

    @admin.action(description='Mark selected words as verified')
    def mark_verified(self, request, queryset):
        queryset.update(verified='verified')

    @admin.action(description='Mark selected words as rejected')
    def mark_rejected(self, request, queryset):
        queryset.update(verified='rejected')


@admin.register(DictionaryEntry)
class DictionaryEntryAdmin(admin.ModelAdmin):
    list_display = ['harari_latin', 'english_short', 'category']
    search_fields = ['harari_latin', 'english']
    list_filter = ['category']

    def english_short(self, obj):
        return obj.english[:80]
    english_short.short_description = 'English'


@admin.register(Phrase)
class PhraseAdmin(admin.ModelAdmin):
    list_display = ['id', 'harari_latin', 'english', 'category']
    search_fields = ['harari_latin', 'english']
    list_filter = ['category']


@admin.register(Sentence)
class SentenceAdmin(admin.ModelAdmin):
    list_display = ['harari_latin', 'english', 'word']
    search_fields = ['harari_latin', 'english']
    raw_id_fields = ['word']


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'unit', 'order']
    list_filter = ['unit']
    filter_horizontal = ['words']
