import pandas as pd
import datetime
from collections import defaultdict
import logging
from cltlivedata.static.constants import colors

# Get an instance of a logger for the 'clthistoricaldata' app
logger = logging.getLogger('cltlivedata')


class filterLiveData:
    def __init__(self):
        pass

    # filter json data 
    async def filter_dict_columns(self, message):
        return {
            'timestamp': message.get('LASTUPDATE'),
            'median': message.get('MEDIAN'),
            'volume': message.get('LASTVOLUME'),
        }

    # Function to process and analyze data
    async def process_trade_data(self, trade_data):
        try:
            logger.info(f"filterLiveData's process_trade_data() started. \n")
            df = pd.DataFrame(trade_data)
            df['timestamp'] = pd.to_datetime(df['timestamp'], unit='s')
            df.set_index('timestamp', inplace=True)

            # Create 5 bins for each 5-minute interval
            bins = 5
            bin_labels, bin_edges = pd.cut(df['median'], bins=bins, retbins=True, labels=False)

            # Find the sum of volume within each bin
            bin_volumes = defaultdict(float)
            for i, row in enumerate(df.iterrows()):
                bin_label = bin_labels.iloc[i]
                bin_volumes[bin_label] += row[1]['volume']

            # Calculate the total volume
            total_volume = sum(bin_volumes.values())

            # Calculate the percentage of total volume for each bin
            bin_percentages = {bin_label: volume / total_volume * 100 for bin_label, volume in bin_volumes.items()}

            # Format bin percentages to 2 decimal places
            formatted_bin_percentages = {bin_label: f"{percentage:.2f}" for bin_label, percentage in
                                         bin_percentages.items()}

            # Prepare data for the DataFrame
            bin_ranges = [(bin_edges[i], bin_edges[i + 1]) for i in range(len(bin_edges) - 1)]

            if all(len(lst) == 5 for lst in [bin_percentages, bin_ranges, formatted_bin_percentages]):
                try:
                    data = {
                        'low_high_price': [i for i in range(1, bins + 1)],
                        'bin_range': bin_ranges,
                        'bin_volume': [bin_volumes[i] for i in range(bins)],
                        'bin_percentage': [formatted_bin_percentages[i] for i in range(bins)]
                    }
                except Exception as e:
                    logger.error(f"filterLiveData's process_trade_data(): length mismatch for give data. Lenghts are- "
                                 f"bin_volume: {len(bin_volumes)}, formatted_bin_"
                                 f"percentages: {len(formatted_bin_percentages)}, bin_ranges: {len(bin_ranges)}, "
                                 f"bins: {len(bins)}\n Exception: {e}")
                    return dict()

                result_df = pd.DataFrame(data)
                result_df['bin_percentage'] = result_df['bin_percentage'].astype(float)
                result_df.sort_values(by='bin_percentage', ascending=False, inplace=True)
                result_df['colors'] = colors
                result_df.sort_values(by='low_high_price', ascending=True, inplace=True)
                result_df['bin_volume'] = result_df['bin_volume'].astype(float)
                logger.info(
                    f"filterLiveData's process_trade_data() executed. \n message: processed data successfully\n")

                return result_df.to_dict(orient='records')
            else:
                logger.warning(f"filterLiveData's process_trade_data() raised warning that lenght is less than 5. "
                               f"check deeply it.")
                return dict()

        except Exception as e:
            logger.error(f"filterLiveData's process_trade_data() raised error. \n Exception: {e}")
            return dict()

    # find UNIX timestamp of 5 mins
    async def find_next_5_min_interval(self, timestamp):
        try:
            dt = datetime.datetime.utcfromtimestamp(timestamp)

            # Calculate the number of seconds to add to reach the next 5-minute boundary
            seconds_to_next_5_min = (5 - (dt.minute % 5)) * 60 - dt.second

            # Calculate the next 5-minute interval datetime
            next_5_min_dt = dt + datetime.timedelta(seconds=seconds_to_next_5_min)

            # Convert the datetime back to a UNIX timestamp
            next_5_min_timestamp = int(next_5_min_dt.timestamp())

            return next_5_min_timestamp
        except Exception as e:
            logger.warning(
                f"filterLiveData's find_next_5_min_interval({timestamp}) raised warning. \n Exception: {e}\n")
            return int(datetime.datetime.now().timestamp())
