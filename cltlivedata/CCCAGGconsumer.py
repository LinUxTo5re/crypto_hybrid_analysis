import requests
import pandas as pd
from datetime import datetime, timedelta, timezone
import numpy as np
import json
from channels.generic.websocket import AsyncWebsocketConsumer
import websockets
from .constants import CCCAGG_URL, live_bars_channel
from .filterLiveData import filterLiveData


class LiveDataIndexConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        await self.channel_layer.group_send(
            live_bars_channel,
            {
                "type": "group.message",
                "live_5mins_bar": None
            }
        )

    async def disconnect(self, code):
        await self.channel_layer.group_discard(live_bars_channel, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        try:
            received_data = json.loads(text_data)
            ticker = received_data.get('ticker')
            # timeframe = received_data.get('tf') -> default keeping 5 for now
            async with websockets.connect(CCCAGG_URL) as ws:
                payload = {
                    "action": "SubAdd",
                    "subs": [f"5~CCCAGG~{ticker}~USDT"],
                }
                await ws.send(json.dumps(payload))
            try:
                five_minute_window_start = 0
                five_minute_window_end = 0
                bar = {}

                async for message in ws:
                    data = json.loads(message)
                    if data.get('TYPE') == 5 and data.get("MARKET") == "CCCAGG":
                        timestamp = datetime.fromtimestamp(message["LASTUPDATE"])
                        current_minute = timestamp.minute

                        if len(bar) > 0 and current_minute >= five_minute_window_end:
                            bins_bar = await filterLiveData.modify_dict_create_bins(json.loads(bar))
                            await self.channel_layer.group_send(
                                live_bars_channel,
                                {
                                    "type": "group.message",
                                    "live_5mins_bar": json.dumps(bins_bar),
                                })
                            await self.send(text_data=json.dumps({"crypto_data": json.loads(bins_bar)}))

                        if (
                                five_minute_window_start == 0 and five_minute_window_start < current_minute) or current_minute >= five_minute_window_end:
                            five_minute_window_start = current_minute
                            five_minute_window_end = (current_minute // 5) * 5
                            bar = {}

                        five_minute_key = timestamp.strftime("%Y-%m-%d %H:%M")
                        bar = await filterLiveData.filter_dict_columns(message, bar, five_minute_key)

            except Exception as e:
                print(f"Error: {e}")
        except Exception as e:
            print(f"Error: {e}")

        # called after connect() to send historical data

    async def group_message(self, event):
        live_5mins_bar = event.get('live_5mins_bar')

        if live_5mins_bar is None:
            live_5mins_bar = ''

        await self.send(text_data=json.dumps({"live_5mins_bar": live_5mins_bar}))
