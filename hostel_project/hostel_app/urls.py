# hostel_app/urls.py
from django.urls import path
from .views import ( # <--- Убедитесь, что этот импорт правильный
    RoomListView,
    RoomCreateView,
    RoomUpdateView,
    RoomDeleteView,
    RoomOccupancyUpdateView,
    CalendarView
)

urlpatterns = [
    path('', RoomListView.as_view(), name='room_list'),
    path('room/new/', RoomCreateView.as_view(), name='room_create'),
    path('room/<int:pk>/edit/', RoomUpdateView.as_view(), name='room_update'),
    path('room/<int:pk>/delete/', RoomDeleteView.as_view(), name='room_delete'),
    path('room/<int:pk>/occupancy/', RoomOccupancyUpdateView.as_view(), name='room_occupancy_update'),
    path('calendar/', CalendarView.as_view(), name='calendar'),
]