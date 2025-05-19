# hostel_project/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken import views as authtoken_views # Для эндпоинта получения токена

urlpatterns = [
    path('admin/', admin.site.urls),

    # Эндпоинт для получения токена аутентификации
    # Клиент будет отправлять сюда POST-запрос с username и password
    # Этот эндпоинт лучше разместить до включения других API URL, чтобы он был уникальным
    path('api/get-token/', authtoken_views.obtain_auth_token, name='api_get_token'),

    # Подключаем URL для Django REST framework API с префиксом 'api/v1/'
    # Например, /api/v1/rooms/, /api/v1/rooms/1/ и т.д.
    # Убедитесь, что 'hostel_app.api_urls' указывает на ваш файл с API-маршрутами
    path('api/v1/', include('hostel_app.api_urls', namespace='hostel_api_v1')),

    # Подключаем URL для вашего старого веб-интерфейса на Django Templates
    # Будет доступен по корневым путям: /, /calendar/, /room/new/ и т.д.
    # Убедитесь, что 'hostel_app.urls' указывает на ваш файл с веб-маршрутами
    path('', include('hostel_app.urls', namespace='hostel_web')),
]