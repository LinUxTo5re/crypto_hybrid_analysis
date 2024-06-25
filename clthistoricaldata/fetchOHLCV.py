import requests
import pandas as pd
import constants


class fetchOHLCV:
    def __init__(self, API_KEY, columns_to_keep, symbol, currency):
        self.API_KEY = API_KEY
        self.columns_to_keep = columns_to_keep
        self.symbol = symbol
        self.currency = currency
        self.limit = 500

    # keep specified columns
    def rename_df_columns(self, data):
        data.rename(columns={'volumefrom': 'basevolume', 'volumeto': 'USDTvolume'}, inplace=True)
        return data

    # Helper function to fetch data from CryptoCompare API
    async def fetch_cryptocompare_data(self, url, aggregate, limit, toTs=False):
        params = {
            'fsym': self.symbol,
            'tsym': self.currency,
            'aggregate': aggregate,
            'limit': limit,
            'api_key': self.API_KEY
        }
        if toTs:
            params['toTs'] = toTs
        response = requests.get(url, params=params)
        return response.json()

    # Fetch minute data for specified currency
    async def fetch_cryptocompare_minute_data(self, aggregate, limit, toTs=False):
        return await self.fetch_cryptocompare_data(constants.OHLCV_min_api, aggregate, limit, toTs)

    # Fetch hourly data for specified currency
    async def fetch_cryptocompare_hour_data(self, aggregate, limit, toTs=False):
        return await self.fetch_cryptocompare_data(constants.OHLCV_hour_api, aggregate, limit, toTs)

    # Fetch daily data for specified currency
    async def fetch_cryptocompare_daily_data(self, aggregate, limit, toTs=False):
        return await self.fetch_cryptocompare_data(constants.OHLCV_daily_api, aggregate, limit, toTs)

    # format dataframe column data
    def format_time(self, x):
        return int('{:.0f}'.format(x))

    # get max volume id to get higher volumed record from dataframe
    def get_max_usdt_volume(self, group):
        return group.loc[group['USDTvolume'].idxmax()]

    # find duplicate data (time) and process it
    async def process_dataframe(self, df):
        values_to_match = set(df[df.duplicated('time', keep=False)]['time'])
        filtered_data = df[df['time'].isin(values_to_match)] \
            .groupby('time', group_keys=False) \
            .apply(self.get_max_usdt_volume)

        df = df[~df['time'].isin(values_to_match)]
        df = pd.concat([df, filtered_data])
        df.reset_index(inplace=True)
        df.drop('index', axis=1, inplace=True)
        df['time'] = df['time'].apply(self.format_time)
        return df

    # fetch aggregated crypto data and concat for longer period
    async def fetch_concat_crypto_data(self, fetch_data_func, aggregate, iterations):
        toTs = False
        all_data = pd.DataFrame(columns=self.columns_to_keep)

        if fetch_data_func == self.fetch_cryptocompare_minute_data and aggregate == 5:
            self.limit = 300
        else:
            self.limit = 500

        for i in range(iterations):
            data = await fetch_data_func(aggregate, self.limit, toTs)
            toTs = data['Data']['TimeFrom']  # TimeFrom for next iteration

            if data['Response'] == 'Success' and not data['HasWarning'] and len(data['Data']['Data']) > 0:
                data = pd.DataFrame(data['Data']['Data'], columns = self.columns_to_keep)
                if all_data.empty:
                    all_data = data
                else:
                    all_data = pd.concat([all_data, data])

                if fetch_data_func == self.fetch_cryptocompare_daily_data and i == 1:
                    self.limit = 300

        if len(all_data) > 0:
            all_data = self.rename_df_columns(all_data)
            return await self.process_dataframe(all_data)
        return False