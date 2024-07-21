import datetime
import json
from channels.generic.websocket import AsyncWebsocketConsumer
import websockets
from cltlivedata.static.constants import CCCAGG_URL, live_bars_channel, API_KEY, quote_currency, append_data_channel
from cltlivedata.logical.filterLiveData import filterLiveData
import cltlivedata.logical.datahelper as helper
import logging
import asyncio

# Get an instance of a logger for the 'clthistoricaldata' app
logger = logging.getLogger('cltlivedata')

# globals
input_ticker = input_timeframe = ''


# class fetch live CCCAGG data 
class LiveDataIndexConsumer(AsyncWebsocketConsumer):

    # establish websocket connection
    async def connect(self):
        global input_ticker, input_timeframe
        await self.accept()
        input_ticker = self.scope['path'].split('/')[-1]
        input_timeframe = 5  # default
        logger.info(f"Connection opened for {self.channel_name} \n")

    # disconnect websocket connection
    async def disconnect(self, code=None):
        logger.info(f"Conncection closed for {self.channel_name} \n")

    # fetch-process-send websocket data to endpoint
    async def receive(self, text_data=None, bytes_data=None):
        CCCAGG = CCCAGG_URL + API_KEY
        timestamp_start = timestamp_current = last_timestamp = next_5_min_timestamp = 0
        trade_data = []
        filterLiveData_helper = filterLiveData()

        while True:
            try:
                async with websockets.connect(CCCAGG) as ws:

                    payload = {
                        "action": "SubAdd",
                        "subs": [f"{input_timeframe}~CCCAGG~{input_ticker.upper()}~{quote_currency}"]
                    }
                    await ws.send(json.dumps(payload))

                    try:                        
                        async for message in ws:
                            data = json.loads(message)
                            last_timestamp = timestamp_current  # backup timestamp
                            timestamp_current = data.get('LASTUPDATE', 0)
                            logger.info(
                                f"CCCAGGconsumer's receive() started. \n message: Fetching live tick data from {timestamp_current}\n")
                            
                            try:
                                if data.get('TYPE') == '5':
                                    if all(key not in data for key in ('LASTMARKET', 'TOPTIERVOLUME24HOUR', 'MKTCAPPENALTY')):
                                        if not timestamp_start:
                                            timestamp_start = data.get('LASTUPDATE', int(datetime.datetime.now().timestamp()))
                                            next_5_min_timestamp = await helper.find_or_check_interval(timestamp=timestamp_start, timeframe='5m')
                                            # print(f"start: {datetime.datetime.fromtimestamp(timestamp_start, tz=datetime.timezone.utc)} next_5: {datetime.datetime.utcfromtimestamp(next_5_min_timestamp)}")
                                            
                                        if all([timestamp_current,
                                            next_5_min_timestamp]) and timestamp_current > next_5_min_timestamp:
                                        # 5-min candle data fetched
                                            candle_volume_regions = await filterLiveData_helper.process_trade_data(
                                                trade_data=trade_data)
                                            
                                            await self.send(text_data=json.dumps({"crypto_data": candle_volume_regions}))

                                            await self.channel_layer.group_send(
                                                    append_data_channel,
                                                    {
                                                        'type': 'append_data',
                                                        'ticker': input_ticker.upper(),
                                                        'timestamp_current': next_5_min_timestamp
                                                    }
                                                ) # notify appendINDconsumer to append data
                                            
                                            trade_data = []
                                            timestamp_start = 0
                                            logger.info(
                                                f"CCCAGGconsumer's receive() executed. \n message: Fetched live tick data till {timestamp_current}\n")
                                        else:
                                            if not timestamp_current:
                                                data['LASTUPDATE'] = last_timestamp
                                            trade_data.append(await filterLiveData_helper.filter_dict_columns(data))
                                            print(f"\n {data}") # remove code

                            except Exception as e:
                                logger.error(
                                    f"CCCAGGconsumer's receive() raised error while passing to trade_data JSON. \n "
                                    f"Exception: {e}")

                    except websockets.exceptions.ConnectionClosedError as connclosederror:
                        logger.error(f"CCCAGGconsumer's receive() raised ConnectionClosedError error while connecting with websocket. \n Exception: {connclosederror}")
                        await asyncio.sleep(2)

                    except asyncio.exceptions.IncompleteReadError as readerror:
                        logger.error(f"CCCAGGconsumer's receive() raised IncompleteReadError error while connecting with websocket. \n Exception: {readerror}")
                        await asyncio.sleep(2)

                    except Exception as e:
                        logger.error(f"CCCAGGconsumer's receive() raised error while receving last tick. \n Exception: {e}")


            except TimeoutError as terror:
                logger.error(f"CCCAGGconsumer's receive() raised Timeout error while connecting with websocket. \n Exception: {terror}")
                await asyncio.sleep(5)

            except Exception as e:
                logger.error(f"CCCAGGconsumer's receive() raised error while connecting with websocket. \n Exception: {e}")
                await asyncio.sleep(5)
