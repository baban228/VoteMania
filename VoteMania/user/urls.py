from django.urls import path
from . import views

urlpatterns = [
    path('', views.user, name='user'),
    path('register/', views.register, name='register'),
    path('authentication/', views.authentication, name='authentication'),
    path('logout/', views.logout_view, name='logout')
]

