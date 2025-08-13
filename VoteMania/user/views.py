from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect,  get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.db.models import Q
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import json
from django.db import models
import datetime
from django.utils import timezone


from .models import User, FriendRequest, Friendship
from .form import CustomUserChangeForm, UserSearchForm

@login_required
def user(request):
    user = request.user
    # Получаем список друзей
    friends = User.objects.filter(friends_with__user=user)

    # Получаем список входящих запросов на добавление в друзья
    friend_requests = FriendRequest.objects.filter(to_user=user)

    # Получаем список исходящих запросов на добавление в друзья
    sent_requests = FriendRequest.objects.filter(from_user=user)

    # Получаем голосования, где пользователь — создатель или участник
    from voting.models import Voting, VotingParticipant
    my_votings = Voting.objects.filter(
        models.Q(creator=user) |
        models.Q(participants__user=user)
    ).distinct().order_by('-created_at')
    my_votings_count = my_votings.count()

    # Приглашения на голосование, которые пользователь ещё не принял
    voting_invitations = VotingParticipant.objects.filter(user=user, invited_by_creator=True, accepted=False)

    context = {
        'friends': friends,
        'friend_requests': friend_requests,
        'sent_requests': sent_requests,
        'my_votings': my_votings,
        'my_votings_count': my_votings_count,
        'now': timezone.now(),
        'voting_invitations': voting_invitations,
        # ... другие данные профиля ...
    }
    # Убедитесь, что используете правильный путь к шаблону
    return render(request, 'user/index.html', context)


def authentication(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        user = authenticate(request, username=email, password=password)

        if user is not None:
            login(request, user)
            messages.success(request, 'Вы успешно вошли в систему!')
            return redirect('user')
        else:
            messages.error(request, 'Неверный email или пароль.')

    return render(request, "authentication/index.html")


@login_required
def profile_view(request):
    context = {
        # 'votings': votings, # Передаем данные, если они нужны в шаблоне
    }
    return render(request, 'user/index.html', context)


@login_required
def logout_view(request):
    logout(request)
    return redirect('home')


@login_required
def edit_profile_view(request):
    if request.method == 'POST':
        # Создаем форму с данными из запроса и файлами
        form = CustomUserChangeForm(request.POST, request.FILES, instance=request.user)
        if form.is_valid():
            # Сохраняем изменения в базе данных
            form.save()
            messages.success(request, 'Профиль успешно обновлен!')
            # Перенаправляем обратно на страницу профиля
            return redirect('user')
        else:
            # Если форма не валидна, показываем ошибки
            messages.error(request, 'Пожалуйста, исправьте ошибки в форме.')
    else:
        # Для GET запроса показываем форму с текущими данными пользователя
        form = CustomUserChangeForm(instance=request.user)

    return render(request, 'user/edit_user.html', {'form': form})


def register_view(request):
    if request.method == 'POST':
        # Получаем данные из формы
        username = request.POST.get('username')
        email = request.POST.get('email')
        telegram = request.POST.get('telegram') or None
        password1 = request.POST.get('password1')
        password2 = request.POST.get('password2')

        # Валидация данных
        errors = []

        # Проверка существующего email
        if User.objects.filter(email=email).exists():
            errors.append('Пользователь с таким email уже существует')

        # Проверка паролей
        if password1 != password2:
            errors.append('Пароли не совпадают')

        if len(password1) < 8:
            errors.append('Пароль должен содержать минимум 8 символов')


        if errors:
            for error in errors:
                messages.error(request, error)
            return render(request, 'register/index.html', {
                'form_data': {
                    'username': username,
                    'email': email,
                    'telegram': telegram
                }
            })

        # Создание пользователя
        try:
            # Используем встроенный метод создания пользователя
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password1
            )

            # Устанавливаем дополнительные поля
            user.telegram_username = telegram
            user.save()

            messages.success(request, 'Регистрация успешна! Теперь вы можете войти.')
            return redirect('authentication')

        except Exception as e:
            messages.error(request, f'Ошибка при регистрации: {str(e)}')
            return render(request, 'register/index.html', {
                'form_data': {
                    'username': username,
                    'email': email,
                    'telegram': telegram
                }
            })

    return render(request, 'register/index.html')


@login_required
def search_users_view(request):
    """
    Страница поиска пользователей.
    """
    form = UserSearchForm(request.GET or None)
    users = []
    if form and form.is_valid():
        query = form.cleaned_data['query']
        if query:
            # Ищем пользователей по username или email (или другим полям)
            # Исключаем текущего пользователя из результатов
            users = User.objects.filter(
                Q(username__icontains=query) |
                Q(email__icontains=query)
            ).exclude(id=request.user.id)

    context = {
        'form': form,
        'users': users,
    }
    # Убедитесь, что используете правильный путь к шаблону
    return render(request, 'user/search_friends.html', context)


@login_required
@require_http_methods(["POST"])
def send_friend_request_view(request, user_id):
    """
    Отправить запрос на добавление в друзья.
    """
    to_user = get_object_or_404(User, id=user_id)

    # Проверки
    if to_user == request.user:
        messages.error(request, "Вы не можете добавить себя в друзья.")
        return redirect('search_users')  # Или другой URL

    # Проверяем, существует ли уже запрос
    if FriendRequest.objects.filter(from_user=request.user, to_user=to_user).exists():
        messages.info(request, "Запрос на добавление в друзья уже отправлен.")
    # Проверяем, не являются ли они уже друзьями (через существование Friendship в обе стороны)
    elif Friendship.objects.filter(user=request.user, friend=to_user).exists():
        messages.info(request, "Вы уже являетесь друзьями с этим пользователем.")
    else:
        # Создаем запрос
        FriendRequest.objects.create(from_user=request.user, to_user=to_user)
        messages.success(request, f"Запрос на добавление в друзья отправлен пользователю {to_user.username}.")

    return redirect('search_users')  # Или другой URL


@login_required
@require_http_methods(["POST"])
@csrf_exempt  # <-- Добавьте этот декоратор
def respond_to_friend_request_view(request, request_id):
    """
    Принять или отклонить запрос на добавление в друзья.
    """
    # Проверяем CSRF-токен вручную, если не используем @csrf_exempt
    # Но для API-подобных endpoints часто используют @csrf_exempt + токен в заголовке
    # Или просто @csrf_exempt если проверка делается другим способом.
    # В данном случае, так как это AJAX, мы можем просто отключить проверку для этого endpoint.
    # ВАЖНО: Убедитесь, что доступ к этому endpoint ограничен для авторизованных пользователей (@login_required)

    friend_request = get_object_or_404(FriendRequest, id=request_id, to_user=request.user)

    try:
        # Для POST запросов с JSON данными, используйте request.body
        # Для стандартных форм данных, используйте request.POST
        # В вашем случае, данные отправляются как JSON
        data = json.loads(request.body)
        action = data.get('action')  # 'accept' или 'reject'
    except (json.JSONDecodeError, KeyError):
        # Возвращаем JSON ответ для AJAX запроса
        return JsonResponse({'success': False, 'message': 'Неверный запрос.'}, status=400)

    if action == 'accept':
        friend_request.accept()
        messages.success(request, f"Запрос от {friend_request.from_user.username} принят. Вы теперь друзья!")
        # Возвращаем JSON ответ для AJAX запроса
        return JsonResponse({'success': True, 'message': 'Запрос принят!', 'action': 'accept'})
    elif action == 'reject':
        friend_request.reject()
        messages.info(request, f"Запрос от {friend_request.from_user.username} отклонен.")
        # Возвращаем JSON ответ для AJAX запроса
        return JsonResponse({'success': True, 'message': 'Запрос отклонен.', 'action': 'reject'})
    else:
        # Возвращаем JSON ответ для AJAX запроса
        return JsonResponse({'success': False, 'message': 'Неверное действие.'}, status=400)


@login_required
def current_user_api(request):
    user = request.user
    return JsonResponse({
        'username': user.username,
        'email': user.email,
        'avatar': user.avatar.url if user.avatar else None
    })