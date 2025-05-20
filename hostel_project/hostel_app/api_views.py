# hostel_app/api_views.py
from rest_framework import viewsets, status, permissions  # Убедитесь, что status импортирован
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import date, timedelta  # Убедитесь, что date импортирован
from django.db.models import Q, F, ExpressionWrapper, fields, Value
from django.db.models.functions import Coalesce

from .models import Room
from .serializers import RoomSerializer, RoomOccupancySerializer  # Импортируем ОБА сериализатора


class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all().order_by('number')
    serializer_class = RoomSerializer  # Основной сериализатор для стандартных действий ViewSet
    permission_classes = [permissions.AllowAny] # Add this for testing

    # permission_classes = [permissions.IsAuthenticated] # Раскомментируйте для включения защиты API

    # --- ЕДИНСТВЕННОЕ И ПРАВИЛЬНОЕ ОПРЕДЕЛЕНИЕ update_occupancy ---
    @action(detail=True, methods=['post', 'put', 'patch'], url_path='update-occupancy')
    def update_occupancy(self, request, pk=None):
        room = self.get_object()
        # Используем RoomOccupancySerializer для валидации и частичного обновления
        # partial=True здесь важно, чтобы сериализатор не требовал все свои поля
        # для PATCH, а для POST/PUT он также позволит обновлять только переданные поля.
        serializer = RoomOccupancySerializer(instance=room, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()  # Вызовет метод update() из RoomOccupancySerializer
            # После успешного обновления, возвращаем полный объект комнаты
            # используя основной RoomSerializer (self.get_serializer() использует self.serializer_class)
            full_room_serializer = self.get_serializer(room)
            return Response(full_room_serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # --- Кастомные действия для получения списков комнат ---
    @action(detail=False, methods=['get'], url_path='free-today')
    def free_today(self, request):
        today = timezone.now().date()
        distant_past_date = date(1900, 1, 1)

        # Аннотируем queryset для безопасного вычисления calculated_checkout_date
        annotated_qs = Room.objects.annotate(
            _coalesced_check_in_date=Coalesce(F('check_in_date'), Value(distant_past_date),
                                              output_field=fields.DateField()),
            _coalesced_days_booked=Coalesce(F('days_booked'), Value(0), output_field=fields.IntegerField())
        ).annotate(
            calculated_checkout_date=ExpressionWrapper(
                F('_coalesced_check_in_date') + ExpressionWrapper(
                    F('_coalesced_days_booked') * Value(timedelta(days=1)),
                    output_field=fields.DurationField()),
                output_field=fields.DateField()
            )
        )

        free_rooms_qs = annotated_qs.filter(
            Q(beds_taken=0) |
            (
                    Q(beds_taken__gt=0) &
                    Q(check_in_date__isnull=False) &  # Проверяем оригинальное поле
                    Q(days_booked__gt=0) &  # Проверяем оригинальное поле
                    Q(calculated_checkout_date__lte=today)
            )
        ).distinct().order_by('number')

        serializer = self.get_serializer(free_rooms_qs, many=True)  # Использует RoomSerializer
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='soon-to-be-free')
    def soon_to_be_free(self, request):
        today = timezone.now().date()
        distant_past_date = date(1900, 1, 1)

        annotated_qs = Room.objects.annotate(
            _coalesced_check_in_date=Coalesce(F('check_in_date'), Value(distant_past_date),
                                              output_field=fields.DateField()),
            _coalesced_days_booked=Coalesce(F('days_booked'), Value(0), output_field=fields.IntegerField())
        ).annotate(
            calculated_checkout_date=ExpressionWrapper(
                F('_coalesced_check_in_date') + ExpressionWrapper(
                    F('_coalesced_days_booked') * Value(timedelta(days=1)),
                    output_field=fields.DurationField()),
                output_field=fields.DateField()
            )
        )

        rooms_by_checkout_date_qs = annotated_qs.filter(
            beds_taken__gt=0,
            check_in_date__isnull=False,  # Проверяем оригинальное поле
            days_booked__gt=0,  # Проверяем оригинальное поле
            calculated_checkout_date__gte=today
        ).order_by('calculated_checkout_date', 'number')

        serializer = self.get_serializer(rooms_by_checkout_date_qs, many=True)  # Использует RoomSerializer
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='calendar-info')
    def calendar_info(self, request):
        # Этот эндпоинт может быть доработан для возврата данных в формате,
        # удобном для построения календаря на фронтенде.
        # Например, можно возвращать только занятые комнаты с датами заезда/выезда.
        # Сейчас он вернет все комнаты, у которых есть (или была) информация о бронировании.
        rooms_with_booking_info = Room.objects.filter(check_in_date__isnull=False, days_booked__gt=0)
        serializer = self.get_serializer(rooms_with_booking_info, many=True)  # Использует RoomSerializer
        return Response(serializer.data)