CCCAGG_URL = "wss://streamer.cryptocompare.com/v2?api_key="
columns_to_keep_live_data = ['PRICE','MEDIAN', 'LASTVOLUME', 'LASTTRADEID', 'LASTUPDATE']
live_bars_channel = 'live_bars_channel'

# API_KEY
API_KEY = '639cd853ea00148b49fcafce5e106c7fd71db198e8f3d5ee672554de6cfbaa7e'

colors = ['#38761d', '#6aa84f', '#93c47d', '#b6d7a8', '#d9ead3'] # bar colors high -> low
quote_currency = 'USDT'
bin_keys_set = {0,1,2,3,4} # 5 would be to handle NaN values
append_data_channel = "append_data"

ema_tf_mapping = {
    '5m': 'EMA_5m',
    '15m': 'EMA_15m',
    '1h': 'EMA_1h',
    '4h': 'EMA_4h',
    '1d': 'EMA_1d'
}