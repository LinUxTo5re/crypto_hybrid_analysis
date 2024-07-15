from clthistoricaldata.logical.fetchOHLCV import fetchOHLCV
from time import sleep
import logging
import pandas as pd

# Get an instance of a logger for the 'clthistoricaldata' app
logger = logging.getLogger('clthistoricaldata')

# asyncio.run(fetch_historical_data())

class designTimeframes:
    def __init__(self, API_KEY, symbol, currency, timeframe, isML):
        self.API_KEY = API_KEY
        self.symbol = symbol
        self.currency = currency
        self.timeframe = timeframe
        self.ohlcv_data =  []
        self.isML = isML
        
    # Fetch historical data (5m, 15m, 1h, 4h, 1d)
    async def get_Data_Ready_For_Indicator_ml(self):
        columns_to_keep = ['time', 'open', 'high', 'low', 'close', 'volumefrom', 'volumeto']
        fetch = fetchOHLCV(self.API_KEY, columns_to_keep, self.symbol, self.currency)
        
        try:
            # Helper function to fetch and process data
            async def fetch_and_process(fetch_method, time_interval, days):
                data = await fetch.fetch_concat_crypto_data(fetch_method, time_interval, days)
                if self.isML:
                    return data
                
                weighted_close_price = (data['high'] + data['low'] + 2 * data['close']) / 4
                data['weighted_close'] = weighted_close_price
                return data
            
            try:
                if self.timeframe == '5m':
                    self.ohlcv_data = await fetch_and_process(fetch.fetch_cryptocompare_minute_data, 5, 1)   # 1 day data
                elif self.timeframe == '15m':
                    self.ohlcv_data = await fetch_and_process(fetch.fetch_cryptocompare_minute_data, 15, 5)  # 5 days data
                elif self.timeframe == '4h':
                    self.ohlcv_data = await fetch_and_process(fetch.fetch_cryptocompare_hour_data, 4, 4)      # 10 months data
                elif self.timeframe == '1d':
                    self.ohlcv_data = await fetch_and_process(fetch.fetch_cryptocompare_daily_data, 1, 3)     # 3 years data
                elif self.timeframe == '1h': # ML TimeFrames (1h, 4h, 1d)
                    self.ohlcv_data = await fetch_and_process(fetch.fetch_cryptocompare_hour_data, 1, 3)  # 2 months data -> points-> 1501 	 
           
            except Exception as e:
                logger.error(f"get_Data_Ready_For_Indicator() raised error. \n Exception: {e}")
                return pd.DataFrame()
            
            logger.info(f"get_Data_Ready_For_Indicator() executed successfully. \n message: indicator created successfully. ")

            return self.ohlcv_data

        except Exception as e:
            logger.warning(f"get_Data_Ready_For_Indicator() raised warning. \n Exception: {e}")
            return pd.DataFrame()

