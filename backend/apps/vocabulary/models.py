from django.db import models


class Word(models.Model):
    DIFFICULTY_CHOICES = [
        (1, 'Easy'),
        (2, 'Medium'),
        (3, 'Hard'),
    ]

    VERIFIED_CHOICES = [
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
    ]

    id = models.CharField(max_length=20, primary_key=True)
    harari_latin = models.CharField(max_length=100)
    harari_ethiopic = models.CharField(max_length=100, blank=True, default='')
    harari_arabic = models.CharField(max_length=100, blank=True, default='')
    english = models.CharField(max_length=200)
    category = models.CharField(max_length=50)
    difficulty = models.IntegerField(choices=DIFFICULTY_CHOICES, default=1)
    source = models.CharField(max_length=100, blank=True, default='')
    verified = models.CharField(max_length=20, choices=VERIFIED_CHOICES, default='pending')
    audio_file = models.FileField(upload_to='audio/words/', blank=True)
    image = models.ImageField(upload_to='images/words/', blank=True)
    audio_recorded = models.BooleanField(default=False)
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['category', 'id']

    def __str__(self):
        return f"{self.harari_latin} ({self.english})"


class DictionaryEntry(models.Model):
    harari_latin = models.CharField(max_length=200)
    english = models.TextField()
    category = models.CharField(max_length=50, blank=True, default='')
    notes = models.TextField(blank=True, default='')
    word = models.ForeignKey(
        'Word',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='dictionary_entries',
    )

    class Meta:
        verbose_name_plural = 'dictionary entries'
        ordering = ['harari_latin']

    def __str__(self):
        return f"{self.harari_latin} ({self.english[:50]})"


class Phrase(models.Model):
    id = models.CharField(max_length=20, primary_key=True)
    harari_latin = models.CharField(max_length=200)
    harari_ethiopic = models.CharField(max_length=200, blank=True, default='')
    harari_arabic = models.CharField(max_length=200, blank=True, default='')
    english = models.CharField(max_length=300)
    category = models.CharField(max_length=50, blank=True, default='')
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['category', 'id']

    def __str__(self):
        return f"{self.harari_latin} ({self.english})"


class Sentence(models.Model):
    word = models.ForeignKey('Word', on_delete=models.CASCADE, related_name='sentences')
    harari_latin = models.CharField(max_length=500)
    harari_ethiopic = models.CharField(max_length=500, blank=True, default='')
    harari_arabic = models.CharField(max_length=500, blank=True, default='')
    english = models.CharField(max_length=500)
    lesson_context = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['word', 'id']

    def __str__(self):
        return f"{self.harari_latin} ({self.english[:50]})"


class Lesson(models.Model):
    id = models.CharField(max_length=20, primary_key=True)
    unit = models.IntegerField()
    order = models.IntegerField()
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    words = models.ManyToManyField('Word', blank=True, related_name='lessons')
    exercises = models.JSONField(default=list)

    class Meta:
        ordering = ['unit', 'order']

    def __str__(self):
        return f"Unit {self.unit} Lesson {self.order}: {self.title}"
