from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import DictionarySearchView, LessonViewSet, PhraseViewSet, WordViewSet

router = DefaultRouter()
router.register(r'words', WordViewSet)
router.register(r'phrases', PhraseViewSet)
router.register(r'lessons', LessonViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dictionary/', DictionarySearchView.as_view(), name='dictionary-search'),
]
