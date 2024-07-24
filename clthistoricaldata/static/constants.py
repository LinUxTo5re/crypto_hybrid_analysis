# API_KEY
API_KEY = '639cd853ea00148b49fcafce5e106c7fd71db198e8f3d5ee672554de6cfbaa7e'

# Historical minute data api
OHLCV_min_api = 'https://min-api.cryptocompare.com/data/v2/histominute'

# Historical hour data api
OHLCV_hour_api = 'https://min-api.cryptocompare.com/data/v2/histohour'

# Historical daily data api
OHLCV_daily_api = 'https://min-api.cryptocompare.com/data/v2/histoday'

quote_currency = 'USDT'
indicators_tf = ['5m','15m','4h','1d', '1h']

url_mapping = {
    'm': OHLCV_min_api,
    'h': OHLCV_hour_api,
    'd': OHLCV_daily_api
}
