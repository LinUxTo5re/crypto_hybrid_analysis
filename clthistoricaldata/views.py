from rest_framework.response import Response
from rest_framework.decorators import api_view
from clthistoricaldata.logical.shortIndicators import designIndicator
import random
from clthistoricaldata.static.constants import API_KEY
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from clthistoricaldata.static.constants import quote_currency


@require_GET
async def fetch_historical_data(request):
    market = request.GET.get('market', 'BTC')
    load = designIndicator(API_KEY, market, quote_currency)
    data = await load.get_Data_Ready_For_Indicator()
    # data = {"message" : "hello buddy"}
    json_data = data.to_dict(orient='records')
    return JsonResponse(json_data, safe=False)


@api_view(['GET'])
def index(request):
    random_data = {
        "random_number": random.randint(1, 100),
        "random_string": ''.join(random.choices('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', k=10)),
        "random_boolean": random.choice([True, False]),
        "random_list": [random.randint(1, 100) for _ in range(5)]
    }
    return Response(random_data)

"""
note: instead of calling one endpoint for all timeframe indicator creation,
call separate endpoints for each timeframe which will enhanch performance in a way that
no single tf need to wait for another tf to be complete and same for ui to wait for
all tf fetch data and pass to endpoint.
just create separate endpoint for each tf and let them load thier resp. indicator on ui

-------think about it while calling endpoit from ui---------
"""