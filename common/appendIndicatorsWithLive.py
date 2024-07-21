# calculate ema for new data
async def calculate_ema(previous_ema, new_price, ema_period):
    alpha = 2 / (ema_period + 1)
    new_ema = (new_price * alpha) + (previous_ema * (1 - alpha))
    return new_ema
