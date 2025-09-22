from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from django.utils import timezone
from django.contrib.contenttypes.models import ContentType
from django.db.models import Q
from .models import Voting, VotingParticipant, Vote, Link
from user.models import UserActivity

@receiver(post_save, sender=Voting)
def create_voting_activity(sender, instance, created, **kwargs):
    if created:
        UserActivity.objects.create(
            user=instance.creator,
            activity_type='voting_created',
            description=f'Создал(а) голосование "{instance.title}"',
            content_type=ContentType.objects.get_for_model(instance),
            object_id=instance.id
        )

@receiver(post_save, sender=Vote)
def create_vote_activity(sender, instance, created, **kwargs):
    if created:
        voting = instance.link.voting
        vote_type = "за" if instance.vote_type == 'for' else "против"
        UserActivity.objects.create(
            user=instance.user,
            activity_type='voted',
            description=f'Проголосовал(а) {vote_type} в голосовании "{voting.title}"',
            content_type=ContentType.objects.get_for_model(voting),
            object_id=voting.id
        )

@receiver(post_save, sender=VotingParticipant)
def create_invitation_activity(sender, instance, created, **kwargs):
    if created and instance.invited_by_creator:
        UserActivity.objects.create(
            user=instance.user,
            activity_type='voting_invitation',
            description=f'Получил(а) приглашение в голосование "{instance.voting.title}"',
            content_type=ContentType.objects.get_for_model(instance.voting),
            object_id=instance.voting.id
        )

def get_voting_winner(voting):
    """Helper function to get the winner link in a voting"""
    links = Link.objects.filter(voting=voting)
    max_score = -1
    winning_link = None
    
    for link in links:
        for_votes = Vote.objects.filter(link=link, vote_type='for').count()
        against_votes = Vote.objects.filter(link=link, vote_type='against').count()
        score = for_votes - against_votes
        
        if score > max_score:
            max_score = score
            winning_link = link
    
    return winning_link

def check_voting_ended():
    """Check for ended votings and create activities for participants"""
    now = timezone.now()
    
    # Get votings that have just ended (deadline passed but no end activities created yet)
    already_processed = UserActivity.objects.filter(
        activity_type='voting_ended'
    ).values_list('object_id', flat=True)
    
    ended_votings = Voting.objects.filter(
        deadline__lte=now
    ).exclude(id__in=already_processed)
    
    for voting in ended_votings:
        # Get all participants including creator
        participants = list(VotingParticipant.objects.filter(
            voting=voting, 
            accepted=True
        ).select_related('user'))
        
        # Add creator if not in participants
        if not any(p.user == voting.creator for p in participants):
            participants.append(type('Participant', (), {'user': voting.creator})())
        
        # Get the winning link
        winning_link = get_voting_winner(voting)
        if winning_link:
            result_text = f'Результат: победила ссылка {winning_link.url}'
        else:
            result_text = 'Результат: нет победителя'
        
        # Create activity for each participant
        for participant in participants:
            UserActivity.objects.create(
                user=participant.user,
                activity_type='voting_ended',
                description=f'Голосование "{voting.title}" завершено. {result_text}',
                content_type=ContentType.objects.get_for_model(voting),
                object_id=voting.id
            )