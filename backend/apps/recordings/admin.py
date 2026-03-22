from django.contrib import admin
from django.utils import timezone

from .models import Recording, Speaker


@admin.register(Speaker)
class SpeakerAdmin(admin.ModelAdmin):
    list_display = ['name', 'age_range', 'gender', 'fluency_level', 'consent_attribution', 'created_at']
    list_filter = ['fluency_level', 'gender', 'consent_attribution']
    search_fields = ['name']


@admin.register(Recording)
class RecordingAdmin(admin.ModelAdmin):
    list_display = ['id', 'speaker', 'word', 'phrase', 'status', 'duration', 'created_at']
    list_filter = ['status', 'clipping', 'too_quiet']
    raw_id_fields = ['speaker', 'word', 'phrase', 'approved_by']
    actions = ['approve_recordings', 'reject_recordings']

    @admin.action(description='Approve selected recordings')
    def approve_recordings(self, request, queryset):
        queryset.update(
            status='approved',
            approved_by=request.user,
            approved_at=timezone.now(),
        )

    @admin.action(description='Reject selected recordings')
    def reject_recordings(self, request, queryset):
        queryset.update(status='rejected')
