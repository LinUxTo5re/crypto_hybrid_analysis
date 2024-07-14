from clthistoricaldata.logical.fetchOHLCV import fetchOHLCV
from time import sleep
import talib
import logging

# Get an instance of a logger for the 'clthistoricaldata' app
logger = logging.getLogger('clthistoricaldata')

# asyncio.run(fetch_historical_data())

class designIndicator:
    def __init__(self, API_KEY, symbol, currency):
        self.API_KEY = API_KEY
        self.symbol = symbol
        self.currency = currency
        self.ohlcv_data_5m = self.ohlcv_data_15m = self.ohlcv_data_1h = self.ohlcv_data_4h = self.ohlcv_data_1d = []
        self.ema_outputs = {}
        
    # Fetch historical data (5m, 15m, 1h, 4h, 1d)
    async def get_Data_Ready_For_Indicator(self):
        try:
            columns_to_keep = ['time', 'open', 'high', 'low', 'close', 'volumefrom', 'volumeto']
            fetch = fetchOHLCV(self.API_KEY, columns_to_keep, self.symbol, self.currency)
            
            # Helper function to fetch and process data
            async def fetch_and_process(fetch_method, time_interval, days):
                data = await fetch.fetch_concat_crypto_data(fetch_method, time_interval, days)
                weighted_close_price = (data['high'] + data['low'] + 2 * data['close']) / 4
                data['weighted_close'] = weighted_close_price
                return data

            self.ohlcv_data_5m = await fetch_and_process(fetch.fetch_cryptocompare_minute_data, 5, 1)   # 1 day data
            self.ohlcv_data_15m = await fetch_and_process(fetch.fetch_cryptocompare_minute_data, 15, 5)  # 5 days data
            self.ohlcv_data_1h = await fetch_and_process(fetch.fetch_cryptocompare_hour_data, 1, 3)      # 2 months data
            self.ohlcv_data_4h = await fetch_and_process(fetch.fetch_cryptocompare_hour_data, 4, 4)      # 10 months data
            self.ohlcv_data_1d = await fetch_and_process(fetch.fetch_cryptocompare_daily_data, 1, 3)     # 3 years data

            await self.EMA_Indication()
            # add code to remove unwated data from df like columns 
            return self.ohlcv_data_5m
        except Exception as e:
            logger.warning(f"get_Data_Ready_For_Indicator() raised warning. \n Exception: {e}")


        #await self.EMA_Indication()

    async def EMA_Indication(self):
        for timeframe, data in {'5m': self.ohlcv_data_5m, '15m': self.ohlcv_data_15m, '4h': self.ohlcv_data_4h, '1d': self.ohlcv_data_1d}.items():
            data['EMA_9'] = talib.EMA(data['weighted_close'], timeperiod=9)
            data['EMA_12'] = talib.EMA(data['weighted_close'], timeperiod=12)
            data['EMA_50'] = talib.EMA(data['weighted_close'], timeperiod=50)
        print("")
