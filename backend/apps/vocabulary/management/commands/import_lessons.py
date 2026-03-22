import json
import os

from django.conf import settings
from django.core.management.base import BaseCommand

from apps.vocabulary.models import Lesson, Word


class Command(BaseCommand):
    help = 'Import lessons from src/data/lessons.json'

    def handle(self, *args, **options):
        json_path = os.path.join(settings.BASE_DIR, '..', 'src', 'data', 'lessons.json')
        json_path = os.path.normpath(json_path)

        if not os.path.exists(json_path):
            self.stderr.write(f"File not found: {json_path}")
            return

        with open(json_path, encoding='utf-8') as f:
            lessons_data = json.load(f)

        created = 0
        updated = 0

        for lesson_data in lessons_data:
            lesson_id = lesson_data['id']
            word_ids = lesson_data.get('wordIds', [])
            exercises = lesson_data.get('exercises', [])

            lesson, was_created = Lesson.objects.update_or_create(
                id=lesson_id,
                defaults={
                    'unit': lesson_data['unit'],
                    'order': lesson_data['order'],
                    'title': lesson_data['title'],
                    'description': lesson_data.get('description', ''),
                    'exercises': exercises,
                }
            )

            # Set M2M words — only link words that exist in the database
            word_objects = Word.objects.filter(id__in=word_ids)
            lesson.words.set(word_objects)

            missing = set(word_ids) - set(word_objects.values_list('id', flat=True))
            if missing:
                self.stdout.write(
                    self.style.WARNING(
                        f"Lesson {lesson_id}: missing word IDs: {', '.join(sorted(missing))}"
                    )
                )

            if was_created:
                created += 1
            else:
                updated += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Done. Created: {created}, Updated: {updated}"
            )
        )
