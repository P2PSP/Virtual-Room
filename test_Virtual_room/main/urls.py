from django.views.generic import RedirectView
from django.http import HttpResponseRedirect,Http404,HttpResponse, JsonResponse

from django.views.decorators.csrf import csrf_exempt

from django.conf.urls import url, include
from django.contrib import admin
from . import views


urlpatterns = [
    url(r'^welcome/$', views.home_page, name='home_page'),
    url(r'^new/', views.main_room, name='main_room'),
]

