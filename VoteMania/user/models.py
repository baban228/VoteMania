from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    email = models.EmailField(unique=True)
    telegram_username = models.CharField(max_length=50, blank=True, null=True)
    avatar = models.ImageField(
        upload_to='user/image',
        blank=True,
        null=True,
        default='user/image/default.png'
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']



class Friendship(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friendships')
    friend = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friends_with')
    created_at = models.DateTimeField(default=timezone.now)
    objects = models.Manager()
    class Meta:
        unique_together = ('user', 'friend')
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['friend']),
        ]

    def __str__(self):
        return f"{self.user} <-> {self.friend}"

class FriendRequest(models.Model):
    from_user = models.ForeignKey(User, related_name='friend_requests_sent', on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name='friend_requests_received', on_delete=models.CASCADE)
    timestamp = models.DateTimeField(default=timezone.now)
    objects = models.Manager()
    class Meta:
        unique_together = ('from_user', 'to_user')
        indexes = [
            models.Index(fields=['to_user', 'timestamp']),
            models.Index(fields=['from_user', 'timestamp']),
        ]

    def __str__(self):
        return f"{self.from_user} -> {self.to_user}"

    def accept(self):
        Friendship.objects.create(user=self.from_user, friend=self.to_user)
        Friendship.objects.create(user=self.to_user, friend=self.from_user)
        self.delete()

    def reject(self):
        self.delete()
