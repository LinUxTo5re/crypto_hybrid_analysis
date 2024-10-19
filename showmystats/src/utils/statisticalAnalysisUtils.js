export const getPriceFormatConfig = (price)  => {
    let priceFormatConfig = {
        type: 'price',
        precision: 2, // default precision
        minMove: 1,   // default minMove
    };

    // Define the price ranges and corresponding minMove and precision
    const ranges = [
        { min: 0.000000001, max: 0.00000001, minMove: 0.00000001, precision: 8 },
        { min: 0.00000001, max: 0.0000001, minMove: 0.0000001, precision: 6 },
        { min: 0.0000001, max: 0.000001, minMove: 0.000001, precision: 4 },
        { min: 0.00001, max: 0.0001, minMove: 0.00001, precision: 3 },
        { min: 0.001, max: 0.01, minMove: 0.01, precision: 3 },
        { min: 0.01, max: 0.1, minMove: 0.1, precision: 2 },
        { min: 1, max: 99, minMove: 0.1, precision: 2 },
        { min: 100, max: 999, minMove: 1, precision: 2 },
        { min: 1000, max: 10000, minMove: 5, precision: 2 },
        { min: 10000, max: Infinity, minMove: 10, precision: 2 }
    ];

    // Check which range the price falls into
    for (const range of ranges) {
        if (price >= range.min && price < range.max) {
            priceFormatConfig.minMove = range.minMove;
            priceFormatConfig.precision = range.precision;
            break;
        }
    }

    return priceFormatConfig;
}
