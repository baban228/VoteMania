from django import template
from ..models import Friendship, FriendRequest

register = template.Library()

@register.filter
def is_friend(user, other_user):
    """Проверяет, являются ли два пользователя друзьями."""
    return Friendship.objects.filter(user=user, friend=other_user).exists()

@register.filter
def has_sent_request(user, other_user):
    """Проверяет, отправил ли user запрос other_user."""
    return FriendRequest.objects.filter(from_user=user, to_user=other_user).exists()