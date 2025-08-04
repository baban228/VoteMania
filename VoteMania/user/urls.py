from django.urls import path
from . import views

urlpatterns = [
    path('', views.user, name='user'),
    path('edit/', views.edit_profile_view, name='edit_profile'),
    path('register/', views.register_view, name='register'),
    path('authentication/', views.authentication, name='authentication'),
    path('logout/', views.logout_view, name='logout')
]

