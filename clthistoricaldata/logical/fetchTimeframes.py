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
            async def find_custom_volume(data, i):
                    current = data[i]

                    if (i - 2) < 0 or (i + 2) >= len(data):
                        prev1 = prev2 = next1 = next2 = current
                    else:
                        prev1 = data[i - 1]
                        prev2 = data[i - 2]
                        next1 = data[i + 1]
                        next2 = data[i + 2]
                    return (i + prev1 + prev2 + next1 + next2)/5
            
            async def handle_Volume(data):
                handledBaseVolumeForVolumeEMA = []

                for i in range(len(data)):
                    if i == 0: 
                        handledBaseVolumeForVolumeEMA.append(data['basevolume'][i])
                        continue
                    if data['basevolume'][i] > data['basevolume'][i-1]:
                        handledBaseVolumeForVolumeEMA.append(data['basevolume'][i])
                    else:     
                        volume_ema = await find_custom_volume(data['basevolume'], i)
                        handledBaseVolumeForVolumeEMA.append((data['basevolume'][i-1] + volume_ema) / 2)
                return handledBaseVolumeForVolumeEMA
            
            async def apply_VolumeEMA(data):
                weighted_volume_price = []
                base_volume_mean = data['basevolume'].mean()
                for i in range(len(data)):
                    if data['basevolume'][i] < data['handledBaseVolumeForVolumeEMA'][i]:
                        volumeW = 0.2 * data['handledBaseVolumeForVolumeEMA'][i]
                    else:
                        volumeW = 0.2 * base_volume_mean

                    # Initialize weights
                    weights = {
                        'hightW': 0.2 * data['high'][i],
                        'lowW': 0.2 * data['low'][i],
                        'openW': 0.1 * data['open'][i],
                        'closeW': 0.2 * data['close'][i]
                    }

                    # Adjust weights based on open and close values
                    if data['open'][i] > data['close'][i]:
                        weights['hightW'] = 0.3 * data['high'][i]
                        weights['lowW'] = 0.2 * data['low'][i]
                    else:
                        weights['lowW'] = 0.3 * data['low'][i]

                    weighted_volume_price.append((weights['hightW'] + weights['lowW'] +
                                                weights['closeW'] + weights['openW']) / volumeW)
                    
                return weighted_volume_price
            # Helper function to fetch and process data
            async def fetch_and_process(fetch_method, time_interval, days):
                data = await fetch.fetch_concat_crypto_data(fetch_method, time_interval, days)
                if self.isML:
                    return data            
                                
                handledBaseVolumeForVolumeEMA = await handle_Volume(data)
                data['handledBaseVolumeForVolumeEMA'] = handledBaseVolumeForVolumeEMA

                # Calculate volumeW based on basevolume and handledBaseVolumeForVolumeEMA

                
                weighted_volume_price  = await apply_VolumeEMA(data)
                data['weighted_volume_price'] = weighted_volume_price
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

