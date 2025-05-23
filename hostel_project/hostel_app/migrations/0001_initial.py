# Generated by Django 4.2.21 on 2025-05-18 10:52

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Room',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('number', models.CharField(max_length=20, unique=True, verbose_name='Номер комнаты')),
                ('room_type', models.CharField(choices=[('lux', 'Люкс'), ('simple', 'Простая')], default='simple', max_length=10, verbose_name='Тип комнаты')),
                ('beds_total', models.PositiveIntegerField(verbose_name='Всего кроватей')),
                ('beds_taken', models.PositiveIntegerField(default=0, verbose_name='Занято кроватей')),
                ('is_paid', models.BooleanField(default=False, verbose_name='Оплачено')),
                ('check_in_date', models.DateField(blank=True, null=True, verbose_name='Дата заезда')),
                ('check_in_time', models.TimeField(blank=True, null=True, verbose_name='Время заезда')),
                ('days_booked', models.PositiveIntegerField(default=0, verbose_name='Дней проживания')),
            ],
            options={
                'verbose_name': 'Комната',
                'verbose_name_plural': 'Комнаты',
                'ordering': ['number'],
            },
        ),
    ]
