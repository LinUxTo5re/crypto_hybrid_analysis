from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.http import JsonResponse
from rest_framework import status
import random


@api_view(['GET'])
def index(request):
    random_data = {
        "random_number": random.randint(1, 100),
        "random_string": ''.join(random.choices('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', k=10)),
        "random_boolean": random.choice([True, False]),
        "random_list": [random.randint(1, 100) for _ in range(5)]
    }
    return Response(random_data)