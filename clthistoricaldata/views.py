from rest_framework.response import Response
from rest_framework.decorators import api_view
from clthistoricaldata.logical.fetchTimeframes import designTimeframes
import random
from clthistoricaldata.static.constants import API_KEY
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from clthistoricaldata.static.constants import quote_currency, indicators_tf
from clthistoricaldata.logical.mlhistdata import designMLmodel
from clthistoricaldata.logical.shortIndicators import designIndicator
import logging
import json
from clthistoricaldata.helpers.apiUtils import fetchDataForPriceFormat

# Get an instance of a logger for the 'clthistoricaldata' app
logger = logging.getLogger('clthistoricaldata')

@require_GET
async def fetch_historical_data(request):
    market = request.GET.get('market', 'BTC')
    timeframe = request.GET.get('tf', '5m')
    isML = request.GET.get('isml', 'false').lower() == 'true'

    if not timeframe in indicators_tf:
        return JsonResponse({"message": "provide correct time frame", "timeframes": indicators_tf}, safe=False)
    
    load = designTimeframes(API_KEY, market.upper(), quote_currency, timeframe, isML)
    data = await load.get_Data_Ready_For_Indicator_ml()

    if isML:
        mlmodel = designMLmodel()
        ohlcv_data = await mlmodel.ML_Indication(data)
    else:
        designIndicators = designIndicator(data, timeframe)
        ohlcv_data = await designIndicators.Indicators_Indication()
        
    ohlcv_data = ohlcv_data.fillna(value=0)
    json_data = ohlcv_data.to_dict(orient='records')

    if not json_data:
        json_data = {"message" : "No data avaialbe, something went wrong."}
        logger.warning("NO DATA AVAILABLE, DEBUG AND CHECK CODE")
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

@api_view(['POST'])
def submit_data(request):
    if request.method == 'POST':
        print("ReactJS called success....")
        return JsonResponse({'message': 'Data received successfully!'}, status=200)
    else:
        return JsonResponse({'message': "error" }, status = 404) 

@api_view(['GET'])
def fetch_precision(request):
    market = request.GET.get('market', 'BTC')
    return JsonResponse({"price": fetchDataForPriceFormat(market.upper())}, safe=False)

"""
note: instead of calling one endpoint for all timeframe indicator creation,
call separate endpoints for each timeframe which will enhanch performance in a way that
no single tf need to wait for another tf to be complete and same for ui to wait for
all tf fetch data and pass to endpoint.
just create separate endpoint for each tf and let them load thier resp. indicator on ui

-------think about it while calling endpoit from ui---------
"""