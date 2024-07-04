import json
import pandas as pd
from datetime import datetime, timedelta


class filterLiveData:
    def __init__(self):
        pass

    async def filter_dict_columns(self, message, bar, five_minute_key):
        bar[five_minute_key] = {
            'price': message['PRICE'],
            'median': message['MEDIAN'],
            'volume': message['LASTVOLUME'],
            'lasttradeid': message['LASTTRADEID'],
            'lastupdate': message['LASTUPDATE']
        }
        return bar

    async def modify_dict_create_bins(self, bar):
        data = []
        for key, bar_data in bar.items():
            clean_bar_data = {k: v for k, v in bar_data.items()}
            data.append(clean_bar_data)

        bar_df = pd.DataFrame(data)
        bar_df.sort_values(by='lastupdate', inplace=True)

        bin_width = (bar_df.tail(1)['price'] - bar_df.head(1)['head']) / (5 - 1)
        bins = [bar_df.head(1)['price'] + i * bin_width for i in range(5)]
        counts, bins = pd.cut(bar_df['price'], bins=bins, retbins=True)
        binned_data = pd.DataFrame({'bin_start': bins[:-1], 'bin_end': bins[1:]})
        binned_data['volume'] = bar_df.groupby(counts)['volume'].sum()
        binned_data['median_range'] = (binned_data['bin_start'] + binned_data['bin_end']) / 2
        total_volume = binned_data['volume'].sum()
        if total_volume > 0:
            binned_data['percentage'] = (binned_data['volume'] / total_volume) * 100
        else:
            binned_data['percentage'] = 0

        return json.dumps(binned_data)
