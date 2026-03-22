import csv
import os

from django.conf import settings
from django.core.management.base import BaseCommand

from apps.vocabulary.models import DictionaryEntry


class Command(BaseCommand):
    help = 'Import dictionary entries from harari-dictionary.csv'

    def handle(self, *args, **options):
        csv_path = os.path.join(settings.BASE_DIR, '..', 'harari-dictionary.csv')
        csv_path = os.path.normpath(csv_path)

        if not os.path.exists(csv_path):
            self.stderr.write(f"File not found: {csv_path}")
            return

        created = 0
        updated = 0
        skipped = 0

        with open(csv_path, encoding='utf-8') as f:
            reader = csv.DictReader(f)

            for row in reader:
                harari_latin = row.get('harari_latin', '').strip()
                english = row.get('english', '').strip()

                if not harari_latin or not english:
                    skipped += 1
                    continue

                category = row.get('category', '').strip()
                notes = row.get('notes', '').strip()

                obj, was_created = DictionaryEntry.objects.update_or_create(
                    harari_latin=harari_latin,
                    defaults={
                        'english': english,
                        'category': category,
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
