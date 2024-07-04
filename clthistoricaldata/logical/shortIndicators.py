from clthistoricaldata.logical.fetchOHLCV import fetchOHLCV


# asyncio.run(fetch_historical_data())

class designIndicator:
    def __init__(self, API_KEY, symbol, currency):
        self.API_KEY = API_KEY
        self.symbol = symbol
        self.currency = currency

    # Fetch historical data (5m, 15m, 1h, 4h, 1d)
    async def get_Data_Ready_For_Indicator(self):
        columns_to_keep = ['time', 'open', 'high', 'low', 'close', 'volumefrom', 'volumeto']
        fetch = fetchOHLCV(self.API_KEY, columns_to_keep, self.symbol, self.currency)
        ohlcv_data_5m = await fetch.fetch_concat_crypto_data(fetch.fetch_cryptocompare_minute_data, 5,
                                                             1)  # 1 days data -> points-> 301
        ohlcv_data_15m = await fetch.fetch_concat_crypto_data(fetch.fetch_cryptocompare_minute_data, 15,
                                                              5)  # 5 days data -> points-> 666
        ohlcv_data_1h = await fetch.fetch_concat_crypto_data(fetch.fetch_cryptocompare_hour_data, 1,
                                                             3)  # 2 months data -> points-> 1501
        ohlcv_data_4h = await fetch.fetch_concat_crypto_data(fetch.fetch_cryptocompare_hour_data, 4,
                                                             4)  # 10 months data -> points-> 2001
        ohlcv_data_1d = await fetch.fetch_concat_crypto_data(fetch.fetch_cryptocompare_daily_data, 1,
                                                             3)  # 3 years data -> points-> 1301

        return ohlcv_data_5m, ohlcv_data_15m, ohlcv_data_1h, ohlcv_data_4h, ohlcv_data_1d

    async def EMA(self):
        pass
