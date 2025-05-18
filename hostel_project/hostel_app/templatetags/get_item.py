# hostel_app/templatetags/get_item.py
from django import template

register = template.Library()

@register.filter
def get_item(dictionary, key):
    if hasattr(dictionary, 'get'): # Проверяем, что это словарь или объект с методом get
        return dictionary.get(key)
    return None # Или другое значение по умолчанию, если ключ не найден