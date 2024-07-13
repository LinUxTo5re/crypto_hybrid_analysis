import datetime
import json
from channels.generic.websocket import AsyncWebsocketConsumer
import websockets
from cltlivedata.static.constants import CCCAGG_URL, live_bars_channel, API_KEY, quote_currency
from cltlivedata.logical.filterLiveData import filterLiveData
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
        await self.channel_layer.group_send(
            live_bars_channel,
            {
                "type": "group.message",
                "live_5mins_bar": None
            }
        )
        logger.info(f"Connection opened for {self.channel_name} \n")

    # disconnect websocket connection
    async def disconnect(self, code=None):
        logger.info(f"Conncection closed for {self.channel_name} \n")
        await self.channel_layer.group_discard(live_bars_channel, self.channel_name)

    # fetch-process-send websocket data to endpoint
    async def receive(self, text_data=None, bytes_data=None):
        CCCAGG = CCCAGG_URL + API_KEY
        while True:
            try:
                async with websockets.connect(CCCAGG) as ws:

                    payload = {
                        "action": "SubAdd",
                        "subs": [f"{input_timeframe}~CCCAGG~{input_ticker.upper()}~{quote_currency}"]
                    }
                    await ws.send(json.dumps(payload))

                    try:
                        timestamp_start = timestamp_current = last_timestamp = next_5_min_timestamp = 0
                        trade_data = []
                        filterLiveData_helper = filterLiveData()
                        
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
                                            next_5_min_timestamp = await filterLiveData_helper.find_next_5_min_interval(timestamp_start)
                                            print(f"start: {datetime.datetime.fromtimestamp(timestamp_start, tz=datetime.timezone.utc)} next_5: {datetime.datetime.utcfromtimestamp(next_5_min_timestamp)}")

                                        if all([timestamp_current,
                                            next_5_min_timestamp]) and timestamp_current > next_5_min_timestamp:
                                        # 5-min candle data fetched
                                            candle_volume_regions = await filterLiveData_helper.process_trade_data(
                                                trade_data=trade_data)
                                            await self.channel_layer.group_send(
                                                live_bars_channel,
                                                {
                                                    "type": "group.message",
                                                    "live_5mins_bar": json.dumps(candle_volume_regions),
                                                })
                                            await self.send(text_data=json.dumps({"crypto_data": candle_volume_regions}))

                                            trade_data = []
                                            timestamp_start = 0
                                            logger.info(
                                                f"CCCAGGconsumer's receive() executed. \n message: Fetched live tick data till {timestamp_current}\n")
                                        else:
                                            if not timestamp_current:
                                                data['LASTUPDATE'] = last_timestamp
                                            trade_data.append(await filterLiveData_helper.filter_dict_columns(data))
                                            print(f"\n {last_timestamp}: {data}")

                            except Exception as e:
                                logger.error(
                                    f"CCCAGGconsumer's receive() raised error while passing to trade_data JSON. \n "
                                    f"Exception: {e}")
                                active_sockets = []
                                print(timestamp_current)
                                await self.send(text_data=json.dumps({"test'": data}))

                    except websockets.exceptions.ConnectionClosedError as e:
                        logger.error(f"CCCAGGconsumer's receive() raised ConnectionClosedError error while connecting with websocket. \n Exception: {e}")
                        await asyncio.sleep(2)

                    except asyncio.exceptions.IncompleteReadError as e:
                        logger.error(f"CCCAGGconsumer's receive() raised IncompleteReadError error while connecting with websocket. \n Exception: {e}")
                        await asyncio.sleep(2)

                    except Exception as e:
                        logger.error(f"CCCAGGconsumer's receive() raised error while receving last tick. \n Exception: {e}")


            except TimeoutError as terror:
                logger.error(f"CCCAGGconsumer's receive() raised Timeout error while connecting with websocket. \n Exception: {e}")
                await asyncio.sleep(5)

            except Exception as e:
                logger.error(f"CCCAGGconsumer's receive() raised error while connecting with websocket. \n Exception: {e}")
                await asyncio.sleep(5)

    # called after connect() to send historical data
    async def group_message(self, event):
        live_5mins_bar = event.get('live_5mins_bar')

        if live_5mins_bar is None:
            live_5mins_bar = ''

        await self.send(text_data=json.dumps({"live_5mins_bar": live_5mins_bar}))
