from datetime import datetime, timezone

from django.db.models import Count, Q
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import UserLessonProgress, UserProgress, UserStreak
from .serializers import ProgressSyncSerializer


class ProgressSyncView(APIView):
    """
    POST /api/v1/progress/sync/

    Accepts the client-side progress payload and merges it with server state.
    Merge strategy:
    - Word progress: keep the record with more repetitions (prevents accidental SM-2 reset).
    - Lesson progress: last-write-wins from client, but never regress a 'completed' lesson.
    - Streak: take the higher current value.
    Returns the merged server state.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ProgressSyncSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        user = request.user
        word_progress_data = data.get('wordProgress', {})
        lesson_progress_data = data.get('lessonProgress', {})
        streak_data = data.get('streak', None)

        # --- Sync word progress ---
        for word_id, entry in word_progress_data.items():
            # Strip prefix if client sends "num-1" style — strip known prefixes
            # The model uses the Word PK as-is (e.g. "num-1"), so pass through directly.
            try:
                existing = UserProgress.objects.get(user=user, word_id=word_id)
                # Keep the record with more repetitions
                client_reps = entry['repetitions']
                if client_reps > existing.repetitions:
                    existing.ease_factor = entry['ease_factor']
                    existing.interval = entry['interval']
                    existing.repetitions = entry['repetitions']
                    existing.next_review = entry['next_review']
                    existing.status = entry['status']
                    existing.save()
            except UserProgress.DoesNotExist:
                # Check that the word exists before creating
                try:
                    UserProgress.objects.create(
                        user=user,
                        word_id=word_id,
                        ease_factor=entry['ease_factor'],
                        interval=entry['interval'],
                        repetitions=entry['repetitions'],
                        next_review=entry['next_review'],
                        status=entry['status'],
                    )
                except Exception:
                    # Word ID may not exist in DB; skip silently
                    pass

        # --- Sync lesson progress ---
        STATUS_RANK = {'locked': 0, 'available': 1, 'in_progress': 2, 'completed': 3}
        for lesson_id, client_status_val in lesson_progress_data.items():
            # Normalise underscore vs hyphen differences (client may send "in_progress")
            try:
                existing_lp = UserLessonProgress.objects.get(user=user, lesson_id=lesson_id)
                server_rank = STATUS_RANK.get(existing_lp.status, 0)
                client_rank = STATUS_RANK.get(client_status_val, 0)
                # Never regress; take whichever is further along
                if client_rank > server_rank:
                    existing_lp.status = client_status_val
                    existing_lp.save()
            except UserLessonProgress.DoesNotExist:
                try:
                    UserLessonProgress.objects.create(
                        user=user,
                        lesson_id=lesson_id,
                        status=client_status_val,
                    )
                except Exception:
                    pass

        # --- Sync streak ---
        if streak_data:
            streak_obj, _ = UserStreak.objects.get_or_create(user=user)
            client_current = streak_data.get('current', 0)
            client_last_date = streak_data.get('last_date')
            # Take the higher streak value
            if client_current >= streak_obj.current:
                streak_obj.current = client_current
                if client_last_date:
                    streak_obj.last_date = client_last_date
                streak_obj.save()

        # --- Build merged response ---
        word_progress_qs = UserProgress.objects.filter(user=user).select_related('word')
        word_progress_response = {}
        for wp in word_progress_qs:
            word_progress_response[wp.word_id] = {
                'easeFactor': wp.ease_factor,
                'interval': wp.interval,
                'repetitions': wp.repetitions,
                'nextReview': wp.next_review.isoformat(),
                'status': wp.status,
            }

        lesson_progress_qs = UserLessonProgress.objects.filter(user=user)
        lesson_progress_response = {lp.lesson_id: lp.status for lp in lesson_progress_qs}

        streak_response = {'current': 0, 'lastDate': None}
        try:
            streak_obj = UserStreak.objects.get(user=user)
            streak_response = {
                'current': streak_obj.current,
                'lastDate': streak_obj.last_date.isoformat() if streak_obj.last_date else None,
            }
        except UserStreak.DoesNotExist:
            pass

        return Response({
            'wordProgress': word_progress_response,
            'lessonProgress': lesson_progress_response,
            'streak': streak_response,
            'lastSyncedAt': datetime.now(timezone.utc).isoformat(),
        })


class StatsView(APIView):
    """
    GET /api/v1/progress/stats/

    Returns learning statistics for the current user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        now = datetime.now(timezone.utc)

        word_progress_qs = UserProgress.objects.filter(user=user)

        new_count = word_progress_qs.filter(status='new').count()
        learning_count = word_progress_qs.filter(status='learning').count()
        mastered_count = word_progress_qs.filter(status='mastered').count()
        due_today = word_progress_qs.filter(next_review__lte=now).count()

        total_words = new_count + learning_count + mastered_count

        lessons_completed = UserLessonProgress.objects.filter(
            user=user, status='completed'
        ).count()

        return Response({
            'new': new_count,
            'learning': learning_count,
            'mastered': mastered_count,
            'dueToday': due_today,
            'totalWords': total_words,
            'lessonsCompleted': lessons_completed,
        })
