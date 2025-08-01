from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect


def user(request):
    return render(request, "user/index.html")


def authentication(request):
    return render(request, "authentication/index.html")


def register(request):
    return render(request, "register/index.html")


@login_required
def logout_view(request):
    logout(request)
    return redirect('home')