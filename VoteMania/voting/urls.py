from django.urls import path, re_path
from . import views

urlpatterns = [
    path('', views.index, name='voting'),
    path('api/votings/', views.voting_list_create, name='voting_list_create'),
    path('api/votings/<int:voting_id>/', views.voting_detail, name='voting_detail'),
    re_path(r'^(.*)$', views.index),  # отдаёт index.html для любого вложенного пути
]

