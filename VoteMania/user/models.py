from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType


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
        # Create activity for both users when friendship is created
        UserActivity.objects.create(
            user=self.from_user,
            activity_type='friend_added',
            target_user=self.to_user,
            description=f"Стал(а) друзьями с {self.to_user.username}"
        )
        UserActivity.objects.create(
            user=self.to_user,
            activity_type='friend_added',
            target_user=self.from_user,
            description=f"Стал(а) друзьями с {self.from_user.username}"
        )
        self.delete()

    def reject(self):
        self.delete()

class UserActivity(models.Model):
    ACTIVITY_TYPES = [
        ('voting_created', 'Создал(а) голосование'),
        ('voting_ended', 'Голосование завершено'),
        ('voted', 'Проголосовал(а)'),
        ('friend_added', 'Добавил(а) в друзья'),
        ('friend_request', 'Отправил(а) запрос в друзья'),
        ('voting_invitation', 'Получил(а) приглашение на голосование'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Optional references
    target_user = models.ForeignKey(User, null=True, blank=True, 
                                   on_delete=models.SET_NULL, related_name='targeted_activities')
    
    # Generic foreign key for relating to any model (voting, etc.)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.get_activity_type_display()} - {self.created_at}"
