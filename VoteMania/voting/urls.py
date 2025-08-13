from django.urls import path, re_path
from . import views

urlpatterns = [
    path('', views.index, name='voting'),
    path('api/votings/', views.voting_list_create, name='voting_list_create'),
    path('api/votings/<int:voting_id>/', views.voting_detail, name='voting_detail'),
    path('api/votings/<int:voting_id>/friends/', views.voting_friends, name='voting_friends'),
    path('vote/<int:id>/', views.voting_detail_page, name='voting_detail_page'),
    path('accept-invitation/<int:invitation_id>/', views.accept_invitation, name='accept_invitation'),
    re_path(r'^.*$', views.index),  # отдаёт index.html для любого вложенного пути
]

