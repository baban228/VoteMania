from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.contrib import messages
from .models import User


def user(request):
    return render(request, "user/index.html")


def authentication(request):
    return render(request, "authentication/index.html")

@login_required
def logout_view(request):
    logout(request)
    return redirect('home')


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
