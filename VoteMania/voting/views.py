from django.shortcuts import render, redirect, get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST, require_http_methods
from django.utils import timezone
from .models import Voting, VotingParticipant, Link, Vote
from user.models import User, Friendship
import json
from django.db import models
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

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
                'avatar': voting.creator.avatar.url if hasattr(voting.creator, 'avatar') and voting.creator.avatar else '',
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
                'avatar': u.avatar.url if hasattr(u, 'avatar') and u.avatar else '',
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
                'avatar': f.avatar.url if hasattr(f, 'avatar') and f.avatar else '',
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
                'deadline': v.deadline.isoformat() if hasattr(v.deadline, 'isoformat') else str(v.deadline),
                'creator': v.creator.username,
                'created_at': v.created_at.isoformat() if hasattr(v.created_at, 'isoformat') else str(v.created_at),
                'participants': participants
            })
        return JsonResponse({'votings': data})
    elif request.method == 'POST':
        try:
            body = json.loads(request.body)
            logger.info(f"Received body: {body}")
            
            # Парсим дату правильно
            deadline_str = body['deadline']
            logger.info(f"Deadline string: {deadline_str}")
            
            if isinstance(deadline_str, str):
                # Если строка, парсим как ISO формат
                if deadline_str.endswith('Z'):
                    deadline_str = deadline_str[:-1] + '+00:00'
                deadline = datetime.fromisoformat(deadline_str)
            else:
                # Если уже datetime объект
                deadline = deadline_str
            
            logger.info(f"Parsed deadline: {deadline}")
            
            voting = Voting.objects.create(
                title=body['title'],
                description=body.get('description', ''),
                deadline=deadline,
                creator=request.user
            )
            logger.info(f"Created voting: {voting.id}")
            
            # Добавить создателя в участники
            VotingParticipant.objects.create(voting=voting, user=request.user, accepted=True)
            
            # Добавить других участников, если есть
            for username in body.get('participants', []):
                if username != request.user.username:
                    try:
                        user = User.objects.get(username=username)
                        VotingParticipant.objects.create(
                            voting=voting,
                            user=user,
                            invited_by_creator=True,
                            accepted=False
                        )
                    except User.DoesNotExist:
                        continue
            return JsonResponse({'success': True, 'id': voting.id})
        except Exception as e:
            logger.error(f"Error creating voting: {str(e)}")
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
        
        # Получаем ссылки для голосования
        links = voting.links.all()
        links_data = []
        for link in links:
            links_data.append({
                'id': link.id,
                'url': link.url
            })
        
        data = {
            'id': voting.id,
            'title': voting.title,
            'description': voting.description,
            'deadline': voting.deadline.isoformat() if hasattr(voting.deadline, 'isoformat') else str(voting.deadline),
            'creator': voting.creator.username,
            'created_at': voting.created_at.isoformat() if hasattr(voting.created_at, 'isoformat') else str(voting.created_at),
            'participants': [p.user.username for p in voting.participants.filter(accepted=True)] + [voting.creator.username],
            'links': links_data
        }
        return JsonResponse({'voting': data})
    except Voting.DoesNotExist:
        return JsonResponse({'error': 'Voting not found'}, status=404)
    except Exception as e:
        logger.error(f"Error in voting_detail: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


def voting_detail_page(request, id):
    return render(request, "voting/index.html")


@login_required
@require_POST
def accept_invitation(request, invitation_id):
    invitation = get_object_or_404(VotingParticipant, id=invitation_id, user=request.user)
    invitation.accepted = True
    invitation.save()
    return redirect('user')


# НОВЫЕ ФУНКЦИИ ДЛЯ ССЫЛОК И ГОЛОСОВАНИЯ

@login_required
@csrf_exempt
@require_http_methods(["POST"])
def add_link(request, voting_id):
    try:
        voting = Voting.objects.get(id=voting_id)
        # Проверяем, что пользователь участник голосования
        if (request.user != voting.creator and 
            not VotingParticipant.objects.filter(voting=voting, user=request.user, accepted=True).exists()):
            return JsonResponse({'error': 'Access denied'}, status=403)
        
        data = json.loads(request.body)
        url = data.get('url')
        
        if not url:
            return JsonResponse({'error': 'URL is required'}, status=400)
        
        # Создаем новую ссылку
        link = Link.objects.create(voting=voting, url=url)
        
        return JsonResponse({
            'success': True,
            'link_id': link.id
        })
    except Voting.DoesNotExist:
        return JsonResponse({'error': 'Voting not found'}, status=404)
    except Exception as e:
        logger.error(f"Error adding link: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@login_required
@csrf_exempt
@require_http_methods(["POST"])
def vote(request, voting_id):
    try:
        voting = Voting.objects.get(id=voting_id)
        # Проверяем, что пользователь участник голосования
        if (request.user != voting.creator and 
            not VotingParticipant.objects.filter(voting=voting, user=request.user, accepted=True).exists()):
            return JsonResponse({'error': 'Access denied'}, status=403)
        
        data = json.loads(request.body)
        link_id = data.get('link_id')
        vote_type = data.get('vote')  # 'for' или 'against'
        
        if not link_id or vote_type not in ['for', 'against']:
            return JsonResponse({'error': 'Invalid data'}, status=400)
        
        link = Link.objects.get(id=link_id, voting=voting)
        user = request.user
        
        # Создаем или обновляем голос
        vote_obj, created = Vote.objects.update_or_create(
            link=link,
            user=user,
            defaults={'vote_type': vote_type}
        )
        
        # Получаем текущие результаты
        results = {
            'for': Vote.objects.filter(link=link, vote_type='for').count(),
            'against': Vote.objects.filter(link=link, vote_type='against').count()
        }
        
        return JsonResponse({
            'success': True,
            'results': results
        })
    except (Voting.DoesNotExist, Link.DoesNotExist):
        return JsonResponse({'error': 'Not found'}, status=404)
    except Exception as e:
        logger.error(f"Error voting: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@login_required
@require_http_methods(["GET"])
def get_votes(request, voting_id):
    try:
        voting = Voting.objects.get(id=voting_id)
        # Проверяем, что пользователь участник голосования
        if (request.user != voting.creator and 
            not VotingParticipant.objects.filter(voting=voting, user=request.user, accepted=True).exists()):
            return JsonResponse({'error': 'Access denied'}, status=403)
        
        user = request.user
        
        # Получаем все результаты
        results = {}
        user_votes = {}
        
        links = Link.objects.filter(voting=voting)
        for link in links:
            results[link.id] = {
                'for': Vote.objects.filter(link=link, vote_type='for').count(),
                'against': Vote.objects.filter(link=link, vote_type='against').count()
            }
            
            # Получаем голос текущего пользователя
            try:
                user_vote = Vote.objects.get(link=link, user=user)
                user_votes[link.id] = user_vote.vote_type
            except Vote.DoesNotExist:
                user_votes[link.id] = None
        
        return JsonResponse({
            'results': results,
            'user_votes': user_votes
        })
    except Voting.DoesNotExist:
        return JsonResponse({'error': 'Voting not found'}, status=404)
    except Exception as e:
        logger.error(f"Error getting votes: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)