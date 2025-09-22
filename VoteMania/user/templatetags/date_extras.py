from django import template
from django.utils import timezone
from django.utils.timesince import timesince as django_timesince

register = template.Library()

@register.filter(name='timesince')
def timesince(value):
    """Formats a date as the time since that date (i.e. "4 days, 6 hours")."""
    if not value:
        return ''
    try:
        return django_timesince(value, timezone.now())
    except (ValueError, TypeError):
        return ''