from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('histdata', views.fetch_historical_data, name='historical_data')
]
