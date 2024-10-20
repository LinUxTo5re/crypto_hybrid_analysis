from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('histdata', views.fetch_historical_data, name='historical_data'),
    path('api/submit/', views.submit_data, name='submit_data'),
    path('api/priceformat', views.fetch_precision, name='price_format')
]

# http://127.0.0.1:8000/histdata?market=floki&tf=1h&isml=false
# http://localhost:8000/api/submit/{formdata}