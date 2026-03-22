from django.conf import settings
from django.db import models


class UserProgress(models.Model):
    STATUS_CHOICES = [
        ('new', 'New'),
        ('learning', 'Learning'),
        ('mastered', 'Mastered'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='word_progress',
    )
    word = models.ForeignKey('vocabulary.Word', on_delete=models.CASCADE)
    ease_factor = models.FloatField(default=2.5)
    interval = models.IntegerField(default=0)
    repetitions = models.IntegerField(default=0)
    next_review = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')

    class Meta:
        unique_together = ['user', 'word']
        verbose_name_plural = 'user progress'

    def __str__(self):
        return f"{self.user} — {self.word} ({self.status})"


class UserLessonProgress(models.Model):
    STATUS_CHOICES = [
        ('locked', 'Locked'),
        ('available', 'Available'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    lesson = models.ForeignKey('vocabulary.Lesson', on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='locked')

    class Meta:
        unique_together = ['user', 'lesson']
        verbose_name_plural = 'user lesson progress'

    def __str__(self):
        return f"{self.user} — {self.lesson} ({self.status})"


class UserStreak(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='streak',
    )
    current = models.IntegerField(default=0)
    last_date = models.DateField(null=True, blank=True)

    class Meta:
        verbose_name_plural = 'user streaks'

    def __str__(self):
        return f"{self.user} — streak: {self.current}"
