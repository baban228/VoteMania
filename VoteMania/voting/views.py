from django.shortcuts import render, redirect, get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.utils import timezone
from .models import Voting, VotingParticipant
from user.models import User, Friendship
import json
from django.db import models


def index(request):
    return render(request, "voting/index.html")


@login_required
@csrf_exempt
def voting_friends(request, voting_id):
    if request.method == 'GET':
        user = request.user
        voting = Voting.objects.get(id=voting_id)
        # Все участники голосования (creator + принявшие приглашение)
        participants = VotingParticipant.objects.filter(voting=voting, accepted=True)
        participant_users = [p.user for p in participants]
        participant_data = [
            {
                'id': voting.creator.id,
                'username': voting.creator.username,
                'avatar': voting.creator.avatar.url if voting.creator.avatar else '',
                'is_participant': True,
                'is_invited': False,
                'is_creator': True
            }
        ]
        for u in participant_users:
            if u.id == voting.creator.id:
                continue
            participant_data.append({
                'id': u.id,
                'username': u.username,
                'avatar': u.avatar.url if u.avatar else '',
                'is_participant': True,
                'is_invited': False,
                'is_creator': False
            })
        # Друзья пользователя для приглашения
        friends = User.objects.filter(friends_with__user=user)
        voting_participants = VotingParticipant.objects.filter(voting=voting)
        participant_dict = {p.user_id: p for p in voting_participants}
        friends_data = []
        for f in friends:
            if f.id == voting.creator.id:
                continue
            vp = participant_dict.get(f.id)
            is_participant = bool(vp and vp.accepted)
            is_invited = bool(vp and not vp.accepted)
            friends_data.append({
                'id': f.id,
                'username': f.username,
                'avatar': f.avatar.url if f.avatar else '',
                'is_participant': is_participant,
                'is_invited': is_invited,
                'is_creator': False
            })
        return JsonResponse({'participants': participant_data, 'friends': friends_data})
    elif request.method == 'POST':
        # Добавить друга в участники голосования
        try:
            body = json.loads(request.body)
            user_id = body.get('user_id')
            voting = Voting.objects.get(id=voting_id)
            user = User.objects.get(id=user_id)
            if not VotingParticipant.objects.filter(voting=voting, user=user).exists():
                VotingParticipant.objects.create(voting=voting, user=user, invited_by_creator=True)
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
    elif request.method == 'DELETE':
        # Только создатель может удалять участников
        voting = Voting.objects.get(id=voting_id)
        if request.user != voting.creator:
            return JsonResponse({'error': 'Только создатель может удалять участников'}, status=403)
        try:
            body = json.loads(request.body)
            user_id = body.get('user_id')
            if user_id == voting.creator.id:
                return JsonResponse({'error': 'Нельзя удалить создателя'}, status=400)
            participant = VotingParticipant.objects.get(voting=voting, user_id=user_id)
            participant.delete()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)


@login_required
@csrf_exempt
def voting_list_create(request):
    if request.method == 'GET':
        user = request.user
        votings = Voting.objects.filter(
            models.Q(creator=user) |
            models.Q(participants__user=user, participants__accepted=True)
        ).distinct().order_by('-created_at')
        data = []
        for v in votings:
            # Список участников: всегда включаем создателя
            participants = [
                {
                    'id': v.creator.id,
                    'username': v.creator.username,
                    'is_creator': True
                }
            ]
            for p in v.participants.filter(accepted=True):
                if p.user_id != v.creator.id:
                    participants.append({
                        'id': p.user.id,
                        'username': p.user.username,
                        'is_creator': False
                    })
            data.append({
                'id': v.id,
                'title': v.title,
                'description': v.description,
                'deadline': v.deadline.isoformat(),
                'creator': v.creator.username,
                'created_at': v.created_at.isoformat(),
                'participants': participants
            })
        return JsonResponse({'votings': data})
    elif request.method == 'POST':
        try:
            body = json.loads(request.body)
            voting = Voting.objects.create(
                title=body['title'],
                description=body.get('description', ''),
                deadline=body['deadline'],
                creator=request.user
            )
            # Добавить создателя в участники
            VotingParticipant.objects.create(voting=voting, user=request.user, invited_by_creator=True)
            # Добавить других участников, если есть
            for username in body.get('participants', []):
                if username != request.user.username:
                    VotingParticipant.objects.create(
                        voting=voting,
                        user_id=username,  # предполагается, что username = id, иначе нужно искать по username
                        invited_by_creator=False
                    )
            return JsonResponse({'success': True, 'id': voting.id})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)


@login_required
@csrf_exempt
def voting_detail(request, voting_id):
    try:
        voting = Voting.objects.get(id=voting_id)
        if request.method == 'DELETE':
            # Только создатель может удалять голосование
            if request.user != voting.creator:
                return JsonResponse({'error': 'Только создатель может удалить голосование'}, status=403)
            voting.delete()
            return JsonResponse({'success': True})
        data = {
            'id': voting.id,
            'title': voting.title,
            'description': voting.description,
            'deadline': voting.deadline.isoformat(),
            'creator': voting.creator.username,
            'created_at': voting.created_at.isoformat(),
            'participants': [p.user.username for p in voting.participants.filter(accepted=True)] + [voting.creator.username]
        }
        return JsonResponse({'voting': data})
    except Voting.DoesNotExist:
        return JsonResponse({'error': 'Voting not found'}, status=404)


def voting_detail_page(request, id):
    return render(request, "voting/index.html")


@login_required
@require_POST
def accept_invitation(request, invitation_id):
    invitation = get_object_or_404(VotingParticipant, id=invitation_id, user=request.user)
    invitation.accepted = True
    invitation.save()
    return redirect('user')