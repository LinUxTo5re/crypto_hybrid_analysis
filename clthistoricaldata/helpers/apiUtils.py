import requests
from clthistoricaldata.static.constants import Gate_Contract_url, Gate_headers, quote_currency

def fetchDataForPriceFormat(market):
    response = requests.request('GET',Gate_Contract_url + market +'_'+quote_currency, headers=Gate_headers)
    if  response.status_code == 200:
        return float(response.json()['mark_price_round'])
    else: 
        return False


