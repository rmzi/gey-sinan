import csv
import os

from django.conf import settings
from django.core.management.base import BaseCommand

from apps.vocabulary.models import Phrase


class Command(BaseCommand):
    help = 'Import phrases from phrases.csv'

    def handle(self, *args, **options):
        csv_path = os.path.join(settings.BASE_DIR, '..', 'phrases.csv')
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

                if len(row) < 5:
                    skipped += 1
                    continue

                phrase_id = row[0].strip()
                harari_latin = row[1].strip()
                harari_ethiopic = row[2].strip()
                harari_arabic = row[3].strip()
                english = row[4].strip()
                category = row[5].strip() if len(row) > 5 else ''
                # row[6] is word_ids — skip it (join table not modeled here)
                notes = row[7].strip() if len(row) > 7 else ''

                if not phrase_id or not harari_latin or not english:
                    skipped += 1
                    continue

                obj, was_created = Phrase.objects.update_or_create(
                    id=phrase_id,
                    defaults={
                        'harari_latin': harari_latin,
                        'harari_ethiopic': harari_ethiopic,
                        'harari_arabic': harari_arabic,
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
