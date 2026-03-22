from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    SCRIPT_CHOICES = [
        ('latin', 'Latin'),
        ('ethiopic', 'Ethiopic'),
        ('arabic', 'Arabic'),
    ]

    preferred_script = models.CharField(
        max_length=10,
        choices=SCRIPT_CHOICES,
        default='latin',
    )

    class Meta(AbstractUser.Meta):
        swappable = 'AUTH_USER_MODEL'

    def __str__(self):
        return self.username
