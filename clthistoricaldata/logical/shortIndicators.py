import talib
from clthistoricaldata.helpers.datahelper import filter_ema_indicator_data

class designIndicator:

    def __init__(self, ohlcv_data, timeframe):
        self.ohlcv_data = ohlcv_data
        self.timeframe = timeframe

    async def Indicators_Indication(self):
        await self.EMA_Indication()        
        if self.timeframe == '5m':  
            # add code to remove unwated data from df like columns 
            return await filter_ema_indicator_data(self.ohlcv_data, True)  
              
        # add code to remove unwated data from df like columns 
        return await filter_ema_indicator_data(self.ohlcv_data, False)
    

    # create EMA for 9/12/50 period
    async def EMA_Indication(self):
        self.ohlcv_data['EMA_9'] = talib.EMA(self.ohlcv_data['weighted_volume_price'], timeperiod=9)
        self.ohlcv_data['EMA_12'] = talib.EMA(self.ohlcv_data['weighted_volume_price'], timeperiod=12)
        self.ohlcv_data['EMA_50'] = talib.EMA(self.ohlcv_data['weighted_volume_price'], timeperiod=50)
    
    # return volume for 5 minute timeframe
    async def VOL_Indication(self):
        pass
