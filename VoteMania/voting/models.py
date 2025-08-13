from django.db import models
from django.conf import settings

class Voting(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    deadline = models.DateTimeField()
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_votings')
    created_at = models.DateTimeField(auto_now_add=True)

class VotingParticipant(models.Model):
    voting = models.ForeignKey(Voting, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    invited_by_creator = models.BooleanField(default=False)
    accepted = models.BooleanField(default=False)  # Новое поле: принял ли приглашение
