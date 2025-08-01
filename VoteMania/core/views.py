from django.shortcuts import render
from django.http import HttpResponseNotFound
# Create your views here.


def index(request):
    return render(request, "core/index.html")


def page_not_found(request, exception):
    return render(request, "Not_Found/index.html", status=404)