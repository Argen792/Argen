# hostel_app/serializers.py
from rest_framework import serializers
from .models import Room
from django.utils import timezone  # Для валидации дат
from datetime import timedelta  # Для валидации дат


class RoomSerializer(serializers.ModelSerializer):
    # Поля только для чтения, которые удобно иметь в API ответе
    room_type_display = serializers.CharField(source='get_room_type_display', read_only=True)
    # check_out_date будет вычисляться через свойство модели, но для отображения сделаем отдельное поле
    check_out_date_display = serializers.SerializerMethodField(read_only=True)
    # is_occupied тоже свойство модели
    is_occupied = serializers.BooleanField(read_only=True)

    class Meta:
        model = Room
        fields = [
            'id', 'number', 'room_type', 'room_type_display', 'beds_total',  # Основные поля комнаты
            'beds_taken', 'is_paid', 'check_in_date', 'check_in_time',  # Поля занятости
            'days_booked', 'is_occupied', 'check_out_date', 'check_out_date_display'
            # 'check_out_date' здесь будет свойством модели
        ]
        # Поля, которые не должны напрямую изменяться клиентом через этот сериализатор при POST/PUT
        # или которые вычисляются. 'id' всегда read_only по умолчанию.
        read_only_fields = [
            'id', 'room_type_display', 'is_occupied',
            'check_out_date', 'check_out_date_display'
        ]
        # Для полей занятости, мы можем разрешить их изменение через этот сериализатор,
        # но лучше иметь отдельный эндпоинт/сериализатор для обновления занятости,
        # чтобы логика была чище. Сейчас оставим их редактируемыми здесь для простоты ModelViewSet.

    def get_check_out_date_display(self, obj):
        # obj - это экземпляр Room
        if obj.check_out_date:
            return obj.check_out_date.strftime("%d.%m.%Y")
        return None

    def validate_beds_total(self, value):
        if value <= 0:
            raise serializers.ValidationError("Количество кроватей должно быть больше нуля.")
        return value

    def validate(self, data):
        """
        Общая валидация данных.
        Например, если beds_taken > beds_total.
        Эта валидация будет работать при создании (POST) и полном обновлении (PUT).
        """
        beds_total = data.get('beds_total', getattr(self.instance, 'beds_total', None))
        beds_taken = data.get('beds_taken', getattr(self.instance, 'beds_taken', 0))

        if beds_taken < 0:
            raise serializers.ValidationError(
                {"beds_taken": "Количество занятых кроватей не может быть отрицательным."})
        if beds_total is not None and beds_taken > beds_total:
            raise serializers.ValidationError(
                {
                    "beds_taken": f"Количество занятых кроватей ({beds_taken}) не может превышать общее количество кроватей ({beds_total})."}
            )

        days_booked = data.get('days_booked', getattr(self.instance, 'days_booked', 0))
        check_in_date = data.get('check_in_date', getattr(self.instance, 'check_in_date', None))

        if beds_taken > 0:
            if not check_in_date:
                raise serializers.ValidationError(
                    {"check_in_date": "Дата заезда обязательна, если есть занятые кровати."})
            if days_booked <= 0:
                raise serializers.ValidationError(
                    {"days_booked": "Количество дней проживания должно быть больше нуля, если есть занятые кровати."})
        elif beds_taken == 0:
            # Если кровати освобождаются через этот сериализатор (например, при PUT),
            # то сбрасываем связанные поля.
            # Однако, эту логику лучше вынести в метод save модели или в кастомный action.
            data['is_paid'] = False
            data['check_in_date'] = None
            data['check_in_time'] = None
            data['days_booked'] = 0

        return data


class RoomOccupancySerializer(serializers.Serializer):  # Не ModelSerializer, так как мы обновляем существующий instance
    """
    Сериализатор специально для обновления полей занятости через кастомное действие.
    Поля здесь не обязательны, так как мы можем обновлять их частично.
    """
    beds_taken = serializers.IntegerField(required=False, min_value=0)
    is_paid = serializers.BooleanField(required=False)
    check_in_date = serializers.DateField(required=False, allow_null=True, input_formats=["%Y-%m-%d"])
    check_in_time = serializers.TimeField(required=False, allow_null=True, input_formats=["%H:%M:%S", "%H:%M"])
    days_booked = serializers.IntegerField(required=False, min_value=0)

    def validate(self, data):
        # Валидация применяется к данным, которые были переданы в запросе
        # self.instance будет доступен, так как этот сериализатор будет инициализирован с instance во view
        if not self.instance:
            # Этот сериализатор предназначен только для обновления существующей комнаты
            raise serializers.ValidationError("Экземпляр комнаты не предоставлен для обновления занятости.")

        beds_taken = data.get('beds_taken', self.instance.beds_taken)  # Берем новое значение или старое
        beds_total = self.instance.beds_total

        if beds_taken > beds_total:
            raise serializers.ValidationError(
                {
                    "beds_taken": f"Количество занятых кроватей ({beds_taken}) не может превышать общее количество кроватей ({beds_total})."}
            )

        days_booked = data.get('days_booked', self.instance.days_booked)
        check_in_date = data.get(
            'check_in_date')  # Если не передано, не меняем, но если beds_taken > 0, оно должно быть

        # Если check_in_date не передается, но beds_taken > 0, используем существующее значение из instance
        if check_in_date is None and 'check_in_date' not in data and beds_taken > 0:  # 'check_in_date' not in data - чтобы разрешить передачу null для сброса
            check_in_date = self.instance.check_in_date

        if beds_taken > 0:
            if not check_in_date:  # Проверяем после возможного взятия из instance
                # Если check_in_date все еще None (например, если его передали как null ИЛИ его не было в instance)
                if not (
                        self.instance.check_in_date and 'check_in_date' not in data):  # Если в инстансе тоже нет и его не передали
                    raise serializers.ValidationError(
                        {"check_in_date": "Дата заезда обязательна, если есть занятые кровати."})
            if days_booked <= 0:  # Если beds_taken > 0, то days_booked тоже должен быть > 0
                raise serializers.ValidationError(
                    {"days_booked": "Количество дней проживания должно быть больше нуля, если есть занятые кровати."})
        return data

    def update(self, instance, validated_data):
        instance.beds_taken = validated_data.get('beds_taken', instance.beds_taken)
        instance.is_paid = validated_data.get('is_paid', instance.is_paid)
        # Позволяем установить null для сброса
        if 'check_in_date' in validated_data:
            instance.check_in_date = validated_data.get('check_in_date')
        if 'check_in_time' in validated_data:
            instance.check_in_time = validated_data.get('check_in_time')
        instance.days_booked = validated_data.get('days_booked', instance.days_booked)

        # Логика сброса полей, если комната освобождается (beds_taken стало 0)
        if instance.beds_taken == 0:
            instance.is_paid = False
            instance.check_in_date = None
            instance.check_in_time = None
            instance.days_booked = 0

        try:
            instance.full_clean()  # Валидация на уровне модели
        except Exception as e:
            raise serializers.ValidationError(str(e))

        instance.save()
        return instance