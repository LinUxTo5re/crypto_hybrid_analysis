import datetime
import json
from channels.generic.websocket import AsyncWebsocketConsumer
import websockets
from cltlivedata.static.constants import append_data_channel
from cltlivedata.logical.filterLiveData import filterLiveData
import cltlivedata.logical.datahelper as helper
import logging
import asyncio

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
        pass

    async def append_data(self, event):
        is5minscandle = event.get('is5minscandle')
        timestamp_current = event.get('timestamp_current') # it's next_5_min_timestamp
        result = 'hello weboscket buddy.... '
        await self.send(json.dumps({'result': result}))
        # write code here to calculate new price of indicator or just pass
        # new data to indicator w.r.t tf
    