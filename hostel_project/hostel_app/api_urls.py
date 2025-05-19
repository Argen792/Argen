# hostel_app/api_urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import RoomViewSet # Убедитесь, что у вас есть api_views.py и RoomViewSet в нем

app_name = 'hostel_api_v1' # Определяем app_name, чтобы соответствовать namespace

router = DefaultRouter()
# r'rooms' означает, что эндпоинты будут типа /rooms/, /rooms/1/
# относительно префикса, под которым этот файл будет подключен в главном urls.py (т.е. /api/v1/rooms/)
router.register(r'rooms', RoomViewSet, basename='room') # basename важен для генерации имен URL роутером

urlpatterns = [
    path('', include(router.urls)), # Подключаем URL, сгенерированные роутером
]