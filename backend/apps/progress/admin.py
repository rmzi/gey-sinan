from django.contrib import admin

from .models import UserLessonProgress, UserProgress, UserStreak


@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    list_display = ['user', 'word', 'status', 'interval', 'repetitions', 'next_review']
    list_filter = ['status']
    raw_id_fields = ['user', 'word']
    search_fields = ['user__username', 'word__harari_latin', 'word__english']


@admin.register(UserLessonProgress)
class UserLessonProgressAdmin(admin.ModelAdmin):
    list_display = ['user', 'lesson', 'status']
    list_filter = ['status']
    raw_id_fields = ['user', 'lesson']


@admin.register(UserStreak)
class UserStreakAdmin(admin.ModelAdmin):
    list_display = ['user', 'current', 'last_date']
    search_fields = ['user__username']
