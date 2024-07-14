import pandas as pd
import datetime
from collections import defaultdict
import logging
from cltlivedata.static.constants import colors, bin_keys_set

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
            unique_bins = []
            bins = 5
            bin_labels, bin_edges = pd.cut(df['median'], bins=bins, retbins=True, labels=False)

            # Handle NaN values in bin_labels by setting them to 5
            # 5 - handles - nan values
            bin_labels = bin_labels.fillna(5).astype(int)

            # Check if bin_labels has exactly 5 unique values
            unique_bins = bin_labels.unique()

            missing_keys = bin_keys_set - set(unique_bins) # find missing key and remove bin_ranges resp.

            # Find the sum of volume within each bin
            bin_volumes = defaultdict(float)
            for i in range(len(unique_bins)):
                bin_volumes[unique_bins[i]] = df[(df['median'] > bin_edges[i]) & (df['median'] < bin_edges[i+1])]['volume'].sum()
            
            # Calculate the total volume
            total_volume = sum(bin_volumes.values())

            unhandled_volume = bin_volumes.get('5', 0)
            
            # Remove the entry with key 5 if it exists
            if 5 in bin_volumes:
                del bin_volumes[5]
                unique_bins = unique_bins[unique_bins != 5]
                
            # Find the key with the maximum value
            max_key = max(bin_volumes, key=bin_volumes.get)

            # assign if any unhandled volume to max valued key
            bin_volumes[max_key] += unhandled_volume + (df['volume'].sum() - total_volume)
            
            # Calculate the total volume
            total_volume = sum(bin_volumes.values())

            # Calculate the percentage of total volume for each bin
            bin_percentages = {bin_label: volume / total_volume * 100 for bin_label, volume in bin_volumes.items()}

            # Format bin percentages to 2 decimal places
            formatted_bin_percentages = {bin_label: f"{percentage:.2f}" for bin_label, percentage in
                                         bin_percentages.items()}

            # Prepare data for the DataFrame
            bin_ranges = [(bin_edges[i], bin_edges[i + 1]) for i in range(len(bin_edges) - 1)]

            # Remove items from bin_ranges based on the missing keys
            filtered_bin_ranges = [bin_ranges[i] for i in range(len(bin_ranges)) if i not in missing_keys]

            if all(len(lst) == len(unique_bins) for lst in [bin_volumes, filtered_bin_ranges, formatted_bin_percentages]):
                try:
                    data = {
                        'low_high_price': [i for i in range(1, len(unique_bins) + 1)],
                        'bin_range': bin_ranges,
                        'bin_volume': [bin_volumes[i] for i in range(len(unique_bins))],
                        'bin_percentage': [formatted_bin_percentages[i] for i in range(len(unique_bins))]
                    }
                except Exception as e:
                    logger.error(f"filterLiveData's process_trade_data(): length mismatch for give data. Lenghts are- "
                                 f"bin_volume: {len(bin_volumes)}, formatted_bin_"
                                 f"percentages: {len(formatted_bin_percentages)}, bin_ranges: {len(bin_ranges)}, "
                                 f"bins: {len(unique_bins)}\n Exception: {e}")
                    return dict()

                result_df = pd.DataFrame(data)
                result_df['bin_percentage'] = result_df['bin_percentage'].astype(float)
                result_df.sort_values(by='bin_percentage', ascending=False, inplace=True)
                result_df['colors'] = colors[:len(unique_bins)]
                result_df.sort_values(by='low_high_price', ascending=True, inplace=True)
                result_df['bin_volume'] = result_df['bin_volume'].astype(float)
                logger.info(
                    f"filterLiveData's process_trade_data() executed. \n message: processed data successfully\n")

                return result_df.to_dict(orient='records')
            else:
                logger.warning(f"filterLiveData's process_trade_data() raised warning that length is less than 5. "
                               f"check deeply it.")
                return dict()

        except Exception as e:
            logger.error(f"filterLiveData's process_trade_data() raised error. \n Exception: {e}")
            return dict()

    # find UNIX timestamp of 5 mins
    async def find_next_5_min_interval(self, timestamp):
        try:
            dt = datetime.datetime.fromtimestamp(timestamp, tz=datetime.timezone.utc)

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
