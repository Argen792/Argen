# hostel_app/models.py
from django.db import models
from django.utils import timezone
from datetime import timedelta


class Room(models.Model):
    class RoomTypeChoice(models.TextChoices):
        LUX = 'lux', 'Люкс'
        SIMPLE = 'simple', 'Простая'

    number = models.CharField(max_length=20, unique=True, verbose_name="Номер комнаты")
    room_type = models.CharField(
        max_length=10,
        choices=RoomTypeChoice.choices,
        default=RoomTypeChoice.SIMPLE,
        verbose_name="Тип комнаты"
    )
    beds_total = models.PositiveIntegerField(verbose_name="Всего кроватей")

    # Детали текущей занятости/бронирования
    beds_taken = models.PositiveIntegerField(default=0, verbose_name="Занято кроватей")
    is_paid = models.BooleanField(default=False, verbose_name="Оплачено")
    check_in_date = models.DateField(null=True, blank=True, verbose_name="Дата заезда")
    check_in_time = models.TimeField(null=True, blank=True, verbose_name="Время заезда")
    days_booked = models.PositiveIntegerField(default=0, verbose_name="Дней проживания")

    def __str__(self):
        return f"{self.get_room_type_display()} - {self.number}"

    @property
    def is_occupied(self):
        """Проверяет, занята ли комната (хотя бы одна кровать)."""
        return self.beds_taken > 0

    @property
    def check_out_date(self):
        """Рассчитывает дату выезда."""
        if self.check_in_date and self.days_booked > 0:
            return self.check_in_date + timedelta(days=self.days_booked)
        return None

    def save(self, *args, **kwargs):
        """Если кровати не заняты, сбрасываем информацию о бронировании."""
        if not self.beds_taken or self.beds_taken == 0:
            self.is_paid = False
            self.check_in_date = None
            self.check_in_time = None
            self.days_booked = 0
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Комната"
        verbose_name_plural = "Комнаты"
        ordering = ['number']