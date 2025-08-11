from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from .models import Voting, VotingParticipant
import json


def index(request):
    return render(request, "voting/index.html")


@login_required
@csrf_exempt
def voting_list_create(request):
    if request.method == 'GET':
        votings = Voting.objects.all().order_by('-created_at')
        data = [
            {
                'id': v.id,
                'title': v.title,
                'description': v.description,
                'deadline': v.deadline.isoformat(),
                'creator': v.creator.username,
                'created_at': v.created_at.isoformat(),
                'participants': [p.user.username for p in v.participants.all()]
            }
            for v in votings
        ]
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
            voting.delete()
            return JsonResponse({'success': True})
        data = {
            'id': voting.id,
            'title': voting.title,
            'description': voting.description,
            'deadline': voting.deadline.isoformat(),
            'creator': voting.creator.username,
            'created_at': voting.created_at.isoformat(),
            'participants': [p.user.username for p in voting.participants.all()]
        }
        return JsonResponse({'voting': data})
    except Voting.DoesNotExist:
        return JsonResponse({'error': 'Voting not found'}, status=404)