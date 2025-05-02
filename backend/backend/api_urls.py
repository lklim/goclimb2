from django.urls import path
from . import views  # Assuming views.py is in the same directory

urlpatterns = [
    path('api/home', views.home_api, name='home-api'),
    path('api/hi', views.hi_api, name='hi-api'),
]
