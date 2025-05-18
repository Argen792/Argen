# hostel_app/admin.py
from django.contrib import admin
from .models import Room

@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ('number', 'room_type', 'beds_total', 'beds_taken', 'is_paid', 'check_in_date', 'days_booked', 'check_out_date')
    list_filter = ('room_type', 'is_paid')
    search_fields = ('number',)
    fieldsets = (
        ("Основная информация", {
            'fields': ('number', 'room_type', 'beds_total')
        }),
        ("Информация о занятости", {
            'fields': ('beds_taken', 'is_paid', 'check_in_date', 'check_in_time', 'days_booked')
        }),
    )

    def get_readonly_fields(self, request, obj=None):
        # check_out_date делаем только для чтения, так как это property
        return ['check_out_date']