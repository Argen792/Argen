# hostel_app/views.py
from django.shortcuts import render, get_object_or_404, redirect
from django.urls import reverse_lazy
from django.views.generic import ListView, CreateView, UpdateView, DeleteView
from django.views import View
from .models import Room
from .forms import RoomForm, OccupancyForm
from django.utils import timezone
from datetime import date, timedelta
from collections import defaultdict
from django.db.models import Q, F, ExpressionWrapper, fields, Value
from django.db.models.functions import Coalesce

# --- Классы CRUD для Комнат ---
# hostel_app/views.py
# ... (другие импорты) ...

class RoomListView(ListView):
    model = Room
    template_name = 'hostel_app/room_list.html'
    context_object_name = 'rooms'

    def get_queryset(self):
        print("--- RoomListView: get_queryset CALLED ---") # Отладочное сообщение
        queryset = super().get_queryset().order_by('number')
        print(f"--- RoomListView: Queryset from DB: {list(queryset)} ---") # Посмотреть, что реально из базы пришло
        print(f"--- RoomListView: Count from DB: {queryset.count()} ---")
        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        print(f"--- RoomListView: Context data 'rooms': {context.get('rooms')} ---") # Посмотреть, что ушло в шаблон
        return context

# ... (остальные классы представлений) ...

class RoomCreateView(CreateView):
    model = Room
    form_class = RoomForm
    template_name = 'hostel_app/room_form.html'
    success_url = reverse_lazy('room_list')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['form_title'] = "Добавить новую комнату"
        return context

class RoomUpdateView(UpdateView):
    model = Room
    form_class = RoomForm
    template_name = 'hostel_app/room_form.html'
    success_url = reverse_lazy('room_list')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['form_title'] = f"Редактировать комнату: {self.object.number}"
        return context

class RoomDeleteView(DeleteView):
    model = Room
    template_name = 'hostel_app/room_confirm_delete.html'
    success_url = reverse_lazy('room_list')

class RoomOccupancyUpdateView(UpdateView):
    model = Room
    form_class = OccupancyForm
    template_name = 'hostel_app/room_occupancy_form.html'

    def get_success_url(self):
        return reverse_lazy('room_list')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['room'] = self.object
        context['form_title'] = f"Обновить занятость для комнаты: {self.object.number}"
        return context

    def form_valid(self, form):
        if form.cleaned_data.get('beds_taken') == 0:
            form.instance.is_paid = False
            form.instance.check_in_date = None
            form.instance.check_in_time = None
            form.instance.days_booked = 0
        return super().form_valid(form)
# --- КОНЕЦ КЛАССОВ CRUD ---


class CalendarView(View):
    template_name = 'hostel_app/calendar.html'

    def get(self, request, *args, **kwargs):
        today = timezone.now().date()

        year_str = request.GET.get('year')
        month_str = request.GET.get('month')

        try:
            year = int(year_str) if year_str else today.year
        except (ValueError, TypeError):
            year = today.year

        try:
            month = int(month_str) if month_str else today.month
        except (ValueError, TypeError):
            month = today.month

        room_type_filter = request.GET.get('room_type', '')
        availability_filter = request.GET.get('availability_filter', 'all')

        # Инициализируем базовый queryset
        base_rooms_query = Room.objects.all()
        if room_type_filter:
            base_rooms_query = base_rooms_query.filter(room_type=room_type_filter)

        # Переменные для списков и для сетки календаря
        rooms_to_display_in_calendar = [] # Для сетки
        free_rooms_today_list = []      # Для списка "свободные сегодня"
        rooms_by_checkout_date_list = [] # Для списка "скоро освободятся"

        # Дата в далеком прошлом для Coalesce
        distant_past_date = date(1900, 1, 1)

        # Аннотируем queryset для сложных фильтров, если они выбраны,
        # или используем базовый queryset для отображения всех комнат в календаре.
        if availability_filter == 'free_today' or availability_filter == 'soon_to_be_free':
            annotated_rooms_query = base_rooms_query.annotate(
                _check_in_date=Coalesce(F('check_in_date'), Value(distant_past_date), output_field=fields.DateField()),
                _days_booked=Coalesce(F('days_booked'), Value(0), output_field=fields.IntegerField())
            ).annotate(
                calculated_checkout_date=ExpressionWrapper(
                    F('_check_in_date') + ExpressionWrapper(F('_days_booked') * Value(timedelta(days=1)),
                                                            output_field=fields.DurationField()),
                    output_field=fields.DateField()
                )
            )

            if availability_filter == 'free_today':
                free_rooms_today_list = list(
                    annotated_rooms_query.filter(
                        Q(beds_taken=0) |
                        (
                            Q(beds_taken__gt=0) &
                            Q(check_in_date__isnull=False) &
                            Q(days_booked__gt=0) &
                            Q(calculated_checkout_date__lte=today)
                        )
                    ).distinct().order_by('number')
                )
                # Если выбран этот фильтр, в сетке календаря ничего не показываем (или показываем только эти комнаты)
                # Решим пока не показывать сетку, если активен фильтр списка
                rooms_to_display_in_calendar = [] # или free_rooms_today_list если хотите их и в сетке

            elif availability_filter == 'soon_to_be_free':
                rooms_by_checkout_date_list = list(
                    annotated_rooms_query.filter(
                        beds_taken__gt=0,
                        check_in_date__isnull=False,
                        days_booked__gt=0,
                        calculated_checkout_date__gte=today
                    ).order_by('calculated_checkout_date', 'number')
                )
                # Аналогично, если активен фильтр списка, сетку не показываем
                rooms_to_display_in_calendar = [] # или rooms_by_checkout_date_list
        else: # availability_filter == 'all'
            rooms_to_display_in_calendar = list(base_rooms_query.order_by('number'))


        first_day_of_month = date(year, month, 1)
        if month == 12:
            last_day_of_month = date(year + 1, 1, 1) - timedelta(days=1)
        else:
            last_day_of_month = date(year, month + 1, 1) - timedelta(days=1)

        days_in_month = [first_day_of_month + timedelta(days=i) for i in
                         range((last_day_of_month - first_day_of_month).days + 1)]

        calendar_data = defaultdict(dict)
        # Заполняем calendar_data только если мы отображаем сетку календаря
        if availability_filter == 'all' or not availability_filter:
            for room in rooms_to_display_in_calendar:
                if room.check_in_date and room.days_booked > 0 and room.check_out_date:
                    current_booking_date = room.check_in_date
                    end_booking_date = room.check_out_date
                    while current_booking_date < end_booking_date:
                        if first_day_of_month <= current_booking_date <= last_day_of_month:
                            calendar_data[room.id][current_booking_date.isoformat()] = {
                                'status': 'occupied',
                                'is_paid': room.is_paid,
                                'check_out_date_str': end_booking_date.isoformat()
                            }
                        current_booking_date += timedelta(days=1)
                    if first_day_of_month <= end_booking_date <= last_day_of_month:
                        calendar_data[room.id][end_booking_date.isoformat()] = {
                            'status': 'checkout',
                            'is_paid': room.is_paid,
                            'check_out_date_str': end_booking_date.isoformat()
                        }

        prev_month_date = first_day_of_month - timedelta(days=1)
        next_month_date = last_day_of_month + timedelta(days=1)

        context = {
            'rooms_for_calendar_grid': rooms_to_display_in_calendar,
            'days_in_month': days_in_month,
            'current_month_display': first_day_of_month.strftime("%B %Y"),
            'calendar_data': calendar_data,
            'room_types': Room.RoomTypeChoice.choices,
            'current_room_type_filter': room_type_filter,
            'current_availability_filter': availability_filter,
            'free_rooms_today_list': free_rooms_today_list, # Передаем всегда, шаблон решит показывать или нет
            'rooms_by_checkout_date_list': rooms_by_checkout_date_list, # Передаем всегда
            'prev_year': prev_month_date.year,
            'prev_month': prev_month_date.month,
            'next_year': next_month_date.year,
            'next_month': next_month_date.month,
            'today_iso': today.isoformat()
        }
        return render(request, self.template_name, context)