# models.py
from django.db import models
from django.conf import settings
from django.utils import timezone

class Voting(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    deadline = models.DateTimeField()
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_votings')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class VotingParticipant(models.Model):
    voting = models.ForeignKey(Voting, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    invited_by_creator = models.BooleanField(default=False)
    accepted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('voting', 'user')

    def __str__(self):
        return f"{self.user.username} in {self.voting.title}"

# Новые модели для ссылок и голосования
class Link(models.Model):
    voting = models.ForeignKey(Voting, on_delete=models.CASCADE, related_name='links')
    url = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Link for {self.voting.title}"

class Vote(models.Model):
    VOTE_CHOICES = [
        ('for', 'For'),
        ('against', 'Against')
    ]
    
    link = models.ForeignKey(Link, on_delete=models.CASCADE, related_name='votes')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='votes')
    vote_type = models.CharField(max_length=10, choices=VOTE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('link', 'user')

    def __str__(self):
        return f"{self.user.username} voted {self.vote_type} for {self.link.voting.title}"