from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from .models import User
from .form import CustomUserChangeForm

def user(request):
    return render(request, "user/index.html")


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
