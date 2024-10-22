from channels.generic.websocket import AsyncWebsocketConsumer
from cltlivedata.static.constants import index_price_ws, quote_currency
import websockets
import json
import logging
import asyncio

# Get an instance of a logger for the 'clthistoricaldata' app
logger = logging.getLogger('cltlivedata')

class LiveIndexPriceTrackerConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        self.input_ticker = self.scope['path'].split('/')[-1].upper()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data=None, bytes_data=None):
        while True:
            try:
                async with websockets.connect(index_price_ws) as ws:
                    payload = {
                        "channel" : "futures.tickers",
                        "event": "subscribe", 
                        "payload" : [self.input_ticker.upper() + '_' + quote_currency.upper()]
                    }
                    await ws.send(json.dumps(payload))

                    try:
                        async for message in ws: 
                            data = json.loads(message)
                            if isinstance(data['result'], list):    
                                index_price = float(data['result'][0].get('index_price', 0))
                                last_price = float(data['result'][0].get('last', 0))
                                if index_price:
                                    await self.send(text_data=json.dumps({"index_price": index_price,
                                                                          "last_price" : last_price}))
                    except Exception as e:
                        logger.error(f"LiveIndexPriceTrackerConsumer's receive() raised error. \n Exception: {e}")
                        await asyncio.sleep(2)
            except Exception as e:
                        logger.error(f"LiveIndexPriceTrackerConsumer's receive() raised error while connecting with websocket. \n Exception: {e}")
                        await asyncio.sleep(2)