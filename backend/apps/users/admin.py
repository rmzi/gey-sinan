from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Language Preferences', {'fields': ('preferred_script',)}),
    )
    list_display = UserAdmin.list_display + ('preferred_script',)
