import talib
from clthistoricaldata.helpers.datahelper import calculate_ema, filter_ema_indicator_data

class designIndicator:

    def __init__(self):
        pass

    #await self.EMA_Indication()
    async def EMA_Indication(self, ohlcv_data):
        ohlcv_data['EMA_9'] = talib.EMA(ohlcv_data['weighted_close'], timeperiod=9)
        ohlcv_data['EMA_12'] = talib.EMA(ohlcv_data['weighted_close'], timeperiod=12)
        ohlcv_data['EMA_50'] = talib.EMA(ohlcv_data['weighted_close'], timeperiod=50)
        # add code to remove unwated data from df like columns 
        return await filter_ema_indicator_data(ohlcv_data)
