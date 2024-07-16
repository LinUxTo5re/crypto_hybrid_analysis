import datetime
import logging

# Get an instance of a logger for the 'clthistoricaldata' app
logger = logging.getLogger('cltlivedata')
# find UNIX timestamp for timeframes
async def find_next_interval(self, timestamp, timeframe):
    try:
        dt = datetime.datetime.fromtimestamp(timestamp, tz=datetime.timezone.utc)
            
            # Determine the delta based on the timeframe
        if timeframe == '5m':
            delta = datetime.timedelta(minutes=5 - (dt.minute % 5), seconds=-dt.second, microseconds=-dt.microsecond)
        elif timeframe == '15m':
            delta = datetime.timedelta(minutes=15 - (dt.minute % 15), seconds=-dt.second, microseconds=-dt.microsecond)
        elif timeframe == '1h':
            delta = datetime.timedelta(hours=1, minutes=-dt.minute, seconds=-dt.second, microseconds=-dt.microsecond)
        elif timeframe == '4h':
            delta = datetime.timedelta(hours=4 - (dt.hour % 4), minutes=-dt.minute, seconds=-dt.second, microseconds=-dt.microsecond)
        elif timeframe == '1d':
            delta = datetime.timedelta(days=1, hours=-dt.hour, minutes=-dt.minute, seconds=-dt.second, microseconds=-dt.microsecond)
        else:
            raise ValueError("Invalid timeframe")

        next_interval_dt = dt + delta

        # Convert the datetime back to a UNIX timestamp
        next_interval_timestamp = int(next_interval_dt.timestamp())

        return next_interval_timestamp
    except Exception as e:
        logger.warning(
            f"filterLiveData's find_next_5_min_interval({timestamp}) raised warning. \n Exception: {e}\n")
        return int(datetime.datetime.now().timestamp())