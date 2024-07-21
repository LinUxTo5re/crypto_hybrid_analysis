import datetime
import json
from channels.generic.websocket import AsyncWebsocketConsumer
import websockets
from cltlivedata.static.constants import append_data_channel, API_KEY, quote_currency
from cltlivedata.logical.filterLiveData import filterLiveData
import cltlivedata.logical.datahelper as helper
import logging
import asyncio
from clthistoricaldata.logical.fetchOHLCV import fetchOHLCV as ohlcvdata
from clthistoricaldata.static.constants import url_mapping
from common.appendIndicatorsWithLive import calculate_ema
from time import sleep

# Get an instance of a logger for the 'clthistoricaldata' app
logger = logging.getLogger('cltlivedata')

'''
assume we've 3 timeframes then each websocket call will subscribe for each
timeframe indivisually. that will help to avoid dependancy and make code robust
'''

'''
for this websocket we'll maintain 2-way communicatin where UI will send last indicators price and timestamp
and in response, websocket will send new_ema price with timestamp to match on react js
and then we can append array of those prices on 
react js function. it'll keep going forever.
**use react to append existing ema dataset.
'''

class AppendIndicatorsValuesConsumer(AsyncWebsocketConsumer):

    # establish websocket connection
    async def connect(self):
        await self.channel_layer.group_add(
            append_data_channel,
            self.channel_name
        )
        await self.accept()

    # disconnect websocket connection
    async def disconnect(self, code):
        await self.channel_layer.group_discard(
            append_data_channel,
            self.channel_name
        )

    # get last OHLCV data of each timeframe and then pass it to indicator for next activity
    async def receive(self, text_data=None, bytes_data=None):
        try:
            logger.info(
                f"AppendIndicatorsValuesConsumer's receive() started. \n message: appending indicators data\n")
            received_data = json.loads(text_data)
            # self.timeframe = received_data.get('timeframe')
            self.ticker = received_data.get('ticker')
            self.previous_EMA_9_data = received_data.get('previous_EMA_9_data')
            self.previous_EMA_12_data = received_data.get('previous_EMA_12_data')
            self.previous_EMA_50_data = received_data.get('previous_EMA_50_data')
        
        except Exception as e:
            logger.error(
                f"AppendIndicatorsValuesConsumer's receive() raised error while appending data. \n "
                f"Exception: {e}")

    # append data on group_channel notify by CCCAGGconsumer.py
    async def append_data(self, event):
        input_ticker = event.get('ticker')
        timestamp_current = event.get('timestamp_current') # it's next_5_min_timestamp
        indicator_return_dict = dict()
        getOHLCV = ohlcvdata(API_KEY=API_KEY, columns_to_keep=[], symbol=input_ticker, currency=quote_currency)

        try:
            logger.info(
                f"AppendIndicatorsValuesConsumer's append_data() started. \n message: appending indicators data at {timestamp_current}\n")
                # next_timestamp = await helper.find_next_interval(timestamp=timestamp_current, timeframe=tf)
            valid_tf_to_append_data = [
             tf for tf in ['5m', '15m', '1h', '4h', '1d'] 
                 if await helper.find_or_check_interval(timestamp=timestamp_current, timeframe=tf, isCheck=True)
            ]
            for tf in valid_tf_to_append_data:
                time_digit = int(''.join(filter(str.isdigit, tf)))
                time_char = ''.join(filter(str.isalpha, tf))
                    
                try:
                    url = url_mapping.get(time_char)
                    response = await getOHLCV.fetch_cryptocompare_data(url=url, aggregate=time_digit, limit =5)
                    response_data_dict = {data['time']: data for data in response.get('Data', {}).get('Data', [])}

                    if timestamp_current in response_data_dict.keys():
                        ohlcv_data = response_data_dict[timestamp_current]
                        ema_data = dict()

                        for ema_period, last_ema_data in [(9,self.previous_EMA_9_data), (12, self.previous_EMA_12_data), (50,self.previous_EMA_50_data)]:
                            weighted_close_price = (ohlcv_data['high'] + ohlcv_data['low'] + 2 * ohlcv_data['close']) / 4
                            new_ema = await calculate_ema(previous_ema=last_ema_data, new_price=weighted_close_price, ema_period=ema_period)
                            ema_data[str(ema_period)] = new_ema
                                
                        indicator_return_dict[tf] = {
                            'ema_9': ema_data.get('9'),
                            'ema_12': ema_data.get('12'),
                            'ema_50': ema_data.get('50'),
                            'timestamp': ohlcv_data.get('time')
                        }

                        # we use UTC timestamp, so don't be confuse if you get 1h data when indian time is 14:30, cuz' at that time UTC will be 09:00
                        if tf == '5m': # return baseVolume for 5 minutes candle
                            indicator_return_dict[tf]['baseVolume'] = ohlcv_data.get('volumefrom', 0)
                            if indicator_return_dict[tf]['baseVolume'] == 0:
                                while not indicator_return_dict[tf]['baseVolume'] == 0: #  handle it properly, can't block other tf's call
                                    sleep(10) # awaiting for 10 seconds
                                    response = await getOHLCV.fetch_cryptocompare_data(url=url, aggregate=5, limit =3)
                                    response_data_dict = {data['time']: data for data in response.get('Data', {}).get('Data', [])}
                                    ohlcv_data = response_data_dict[timestamp_current]
                                    indicator_return_dict[tf]['baseVolume'] = ohlcv_data.get('volumefrom', 0)
                    
                except Exception as e:
                    logger.error(
                        f"AppendIndicatorsValuesConsumer's append_data() raised error while appending data. \n "
                        f"Exception: {e}")

                                            
        except Exception as e:
            logger.error(
                f"AppendIndicatorsValuesConsumer's append_data() raised error while appending data. \n "
                f"Exception: {e}")
            
        else: # execute if try executed without raising exception
            logger.info(
                f"AppendIndicatorsValuesConsumer's append_data() executed successfully.\n")
            await self.send(json.dumps(indicator_return_dict))

        finally: # execute anyway after try-except
            logger.info(
                f"AppendIndicatorsValuesConsumer's append_data() executed.\n")

    