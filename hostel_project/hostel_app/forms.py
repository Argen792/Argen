# hostel_app/forms.py
from django import forms
from .models import Room


class RoomForm(forms.ModelForm):
    class Meta:
        model = Room
        fields = ['number', 'room_type', 'beds_total']
        widgets = {
            'number': forms.TextInput(attrs={'class': 'form-control'}),
            'room_type': forms.Select(attrs={'class': 'form-select'}),
            'beds_total': forms.NumberInput(attrs={'class': 'form-control', 'min': '1'}),
        }
        labels = {
            'number': 'Номер комнаты',
            'room_type': 'Тип комнаты',
            'beds_total': 'Всего кроватей',
        }


class OccupancyForm(forms.ModelForm):
    class Meta:
        model = Room
        fields = ['beds_taken', 'is_paid', 'check_in_date', 'check_in_time', 'days_booked']
        widgets = {
            'beds_taken': forms.NumberInput(attrs={'class': 'form-control', 'min': '0'}),
            'is_paid': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'check_in_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'check_in_time': forms.TimeInput(attrs={'class': 'form-control', 'type': 'time'}),
            'days_booked': forms.NumberInput(attrs={'class': 'form-control', 'min': '0'}),
        }
        labels = {
            'beds_taken': 'Занято кроватей',
            'is_paid': 'Оплачено',
            'check_in_date': 'Дата заезда',
            'check_in_time': 'Время заезда',
            'days_booked': 'Количество дней проживания',
        }

    def clean(self):
        cleaned_data = super().clean()
        beds_taken = cleaned_data.get('beds_taken')
        beds_total = self.instance.beds_total  # Доступ к общему количеству кроватей комнаты

        if beds_taken is not None and beds_total is not None and beds_taken > beds_total:
            raise forms.ValidationError(
                f"Количество занятых кроватей ({beds_taken}) не может превышать общее количество кроватей ({beds_total})."
            )

        days_booked = cleaned_data.get('days_booked')
        check_in_date = cleaned_data.get('check_in_date')

        if beds_taken and beds_taken > 0:
            if not days_booked or days_booked <= 0:
                self.add_error('days_booked', "Укажите количество дней проживания, если комната занята.")
            if not check_in_date:
                self.add_error('check_in_date', "Укажите дату заезда, если комната занята.")

        return cleaned_data