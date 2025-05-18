# hostel_project/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('hostel_app.urls')), # Подключаем URL нашего приложения
]