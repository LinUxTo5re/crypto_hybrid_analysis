# from websocket import create_connection

# # Create the WebSocket connection
# ws = create_connection("wss://fx-ws.gateio.ws/v4/ws/usdt")

# # Send the subscription message to the WebSocket
# ws.send('{"channel" : "futures.tickers","event": "subscribe", "payload" : ["BTC_USDT"]}')

# # Continuously listen for messages
# try:
#     price = 0.0
#     while True:
#         result = ws.recv()  # Receive the next message
#         if float(data['result'][0].get('mark_price', 0)) != price:
#                 print(f"Price: {float(data['result'][0].get('mark_price', 0))}")
#                 price = float(data['result'][0].get('mark_price', 0))

# except KeyboardInterrupt:
#     print("Terminating connection...")
# finally:
#     ws.close()  # Ensure the WebSocket connection is properly closed
