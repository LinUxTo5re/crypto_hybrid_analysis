from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.http import JsonResponse
from rest_framework import status
from .shortIndicators import designIndicator
import random
from clthistoricaldata.constants import API_KEY
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from asgiref.sync import sync_to_async


@require_GET
async def fetch_historical_data(request):
    load = designIndicator(API_KEY, 'BTC', 'USDT')
    data = await load.get_Data_Ready_For_Indicator()
    return JsonResponse(data)


@api_view(['GET'])
def index(request):
    random_data = {
        "random_number": random.randint(1, 100),
        "random_string": ''.join(random.choices('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', k=10)),
        "random_boolean": random.choice([True, False]),
        "random_list": [random.randint(1, 100) for _ in range(5)]
    }
    return Response(random_data)
