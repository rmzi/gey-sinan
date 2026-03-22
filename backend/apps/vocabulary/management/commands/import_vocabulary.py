import csv
import os

from django.conf import settings
from django.core.management.base import BaseCommand

from apps.vocabulary.models import Word

EASY_CATEGORIES = {
    'numbers', 'greetings', 'family', 'pronouns', 'body',
    'food', 'home', 'colors', 'animals', 'places',
}

MEDIUM_CATEGORIES = {
    'emotions', 'verbs', 'adjectives', 'nature', 'time',
    'clothing', 'market', 'religion', 'community', 'daily_actions', 'school',
}


def get_difficulty(category):
    cat = category.lower()
    if cat in EASY_CATEGORIES:
        return 1
    if cat in MEDIUM_CATEGORIES:
        return 2
    return 3


class Command(BaseCommand):
    help = 'Import vocabulary from vocabulary.csv'

    def handle(self, *args, **options):
        csv_path = os.path.join(settings.BASE_DIR, '..', 'vocabulary.csv')
        csv_path = os.path.normpath(csv_path)

        if not os.path.exists(csv_path):
            self.stderr.write(f"File not found: {csv_path}")
            return

        created = 0
        updated = 0
        skipped = 0

        with open(csv_path, encoding='utf-8') as f:
            reader = csv.reader(f)
            # Skip header row
            next(reader)

            for row in reader:
                # Skip comment lines and empty rows
                if not row or row[0].startswith('#'):
                    skipped += 1
                    continue

                if len(row) < 6:
                    skipped += 1
                    continue

                word_id = row[0].strip()
                harari_latin = row[1].strip()
                harari_ethiopic = row[2].strip()
                harari_arabic = row[3].strip()
                english = row[4].strip()
                category = row[5].strip()
                source = row[6].strip() if len(row) > 6 else ''
                verified = row[7].strip() if len(row) > 7 else 'pending'
                audio_recorded_raw = row[8].strip().lower() if len(row) > 8 else 'no'
                notes = row[9].strip() if len(row) > 9 else ''

                audio_recorded = audio_recorded_raw == 'yes'

                if not word_id or not harari_latin or not english:
                    skipped += 1
                    continue

                difficulty = get_difficulty(category)

                obj, was_created = Word.objects.update_or_create(
                    id=word_id,
                    defaults={
                        'harari_latin': harari_latin,
                        'harari_ethiopic': harari_ethiopic,
                        'harari_arabic': harari_arabic,
                        'english': english,
                        'category': category,
                        'difficulty': difficulty,
                        'source': source,
                        'verified': verified if verified in ('pending', 'verified', 'rejected') else 'pending',
                        'audio_recorded': audio_recorded,
                        'notes': notes,
                    }
                )

                if was_created:
                    created += 1
                else:
                    updated += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Done. Created: {created}, Updated: {updated}, Skipped: {skipped}"
            )
        )
