import uuid

from django.conf import settings
from django.db import models


class Speaker(models.Model):
    AGE_RANGE_CHOICES = [
        ('18-25', '18-25'),
        ('26-35', '26-35'),
        ('36-45', '36-45'),
        ('46-55', '46-55'),
        ('56-65', '56-65'),
        ('65+', '65+'),
    ]

    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
        ('prefer_not_to_say', 'Prefer not to say'),
    ]

    FLUENCY_CHOICES = [
        ('native', 'Native'),
        ('fluent', 'Fluent'),
        ('partial', 'Partial'),
        ('heritage', 'Heritage'),
    ]

    ATTRIBUTION_CHOICES = [
        ('name', 'By Name'),
        ('anonymous', 'Anonymous'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    age_range = models.CharField(max_length=10, choices=AGE_RANGE_CHOICES)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES)
    fluency_level = models.CharField(max_length=20, choices=FLUENCY_CHOICES)
    dialect_notes = models.TextField(blank=True, default='')
    consent_app_use = models.BooleanField(default=False)
    consent_language_preservation = models.BooleanField(default=False)
    consent_ml_training = models.BooleanField(default=False)
    consent_attribution = models.CharField(
        max_length=20,
        choices=ATTRIBUTION_CHOICES,
        default='anonymous',
    )
    consent_timestamp = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.fluency_level})"


class Recording(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    speaker = models.ForeignKey('Speaker', on_delete=models.CASCADE, related_name='recordings')
    word = models.ForeignKey(
        'vocabulary.Word',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )
    phrase = models.ForeignKey(
        'vocabulary.Phrase',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )
    audio_file = models.FileField(upload_to='recordings/')
    mime_type = models.CharField(max_length=50, default='audio/webm')
    sample_rate = models.IntegerField(default=48000)
    duration = models.FloatField(default=0)
    peak_amplitude = models.FloatField(null=True, blank=True)
    clipping = models.BooleanField(default=False)
    too_quiet = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='approved_recordings',
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        target = self.word or self.phrase
        return f"Recording by {self.speaker} for {target} ({self.status})"
