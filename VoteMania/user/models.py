# models.py
from django.contrib.auth.models import AbstractUser
from django.db import models


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