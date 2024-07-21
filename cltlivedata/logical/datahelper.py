import datetime
import logging

# Get an instance of a logger for the 'clthistoricaldata' app
logger = logging.getLogger('cltlivedata')

# find UNIX timestamp for timeframes
async def find_or_check_interval(timestamp, timeframe, isCheck=False):
    try:
        dt = datetime.datetime.fromtimestamp(timestamp, tz=datetime.timezone.utc)
        
        if isCheck:
            if timeframe == '5m':
                is_valid = (dt.minute % 5 == 0 and dt.second == 0 and dt.microsecond == 0)
            elif timeframe == '15m':
                is_valid = (dt.minute % 15 == 0 and dt.second == 0 and dt.microsecond == 0)
            elif timeframe == '1h':
                is_valid = (dt.minute == 0 and dt.second == 0 and dt.microsecond == 0)
            elif timeframe == '4h':
                is_valid = (dt.hour % 4 == 0 and dt.minute == 0 and dt.second == 0 and dt.microsecond == 0)
            elif timeframe == '1d':
                is_valid = (dt.hour == 0 and dt.minute == 0 and dt.second == 0 and dt.microsecond == 0)
            else:
                raise ValueError("Invalid timeframe")
            return is_valid
        else:
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
            f"filterLiveData's find_next_interval({timestamp}) raised warning. \n Exception: {e}\n")
        return int(datetime.datetime.now().timestamp())