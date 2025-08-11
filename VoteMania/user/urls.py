from django.urls import path
from . import views

urlpatterns = [
    path('', views.user, name='user'),
    path('edit/', views.edit_profile_view, name='edit_profile'),
    path('search/', views.search_users_view, name='search_users'),
    path('friend-request/send/<int:user_id>/', views.send_friend_request_view, name='send_friend_request'),
    path('friend-request/respond/<int:request_id>/', views.respond_to_friend_request_view, name='respond_to_friend_request'),
    path('register/', views.register_view, name='register'),
    path('authentication/', views.authentication, name='authentication'),
    path('logout/', views.logout_view, name='logout'),
    path('api/current/', views.current_user_api, name='current_user_api')
]

