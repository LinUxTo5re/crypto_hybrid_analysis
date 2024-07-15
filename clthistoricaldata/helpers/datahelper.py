# calculate ema for new data
async def calculate_ema(previous_ema, new_price, n):
    alpha = 2 / (n + 1)
    new_ema = (new_price * alpha) + (previous_ema * (1 - alpha))
    return new_ema

# format dataframe column data
def format_time(x):
    return int('{:.0f}'.format(x))

# keep specified columns
def rename_df_columns(data):
    data.rename(columns={'volumefrom': 'basevolume', 'volumeto': 'USDTvolume'}, inplace=True)
    return data

# get max volume id to get higher volumed record from dataframe
def get_max_usdt_volume(group):
    return group.loc[group['USDTvolume'].idxmax()]

# return EMA indicator value only for dataframe
async def filter_ema_indicator_data(ohlcv_data, is5min):
    if is5min:
        return ohlcv_data[['time', 'EMA_9','EMA_12','EMA_50','basevolume']]
    
    return ohlcv_data[['time', 'EMA_9','EMA_12','EMA_50']]
    