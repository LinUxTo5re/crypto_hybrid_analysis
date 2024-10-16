import { createChart } from 'lightweight-charts';
import React, { useEffect, useRef, useState } from 'react';
import * as endpoints from '../constants/endpoints';

const StatisticalAnalysis = ({ previousCryptoData }) => {
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null); // Create a ref to store the chart instance
    const [cryptoData, setCryptoData] = useState(null);
    
    // Create refs for the excluded state variables
    const seriesDataRef = useRef([]);
    const numberOfSeriesRef = useRef(0);
    const minBarRangePriceRef = useRef(0);
    const maxBarRangePriceRef = useRef(0);
    const isFullCandleSeriesRef = useRef(false); // Change to useRef

    // Create chart instance
    useEffect(() => {
        if (!chartContainerRef.current || chartRef.current) return;

        chartRef.current = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 300,
            layout: {
                textColor: 'black',
                background: { type: 'solid', color: 'white' },
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
                barSpacing: 100,
                rightOffset: 5,
                minBarSpacing: 50,
                ticksVisible: true,
            },
            rightPriceScale: {
                visible: true,
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.1,
                },
            },
        });
    }, []); // Chart is created only once when component mounts
    
    // WebSocket logic
    useEffect(() => {
        const market = previousCryptoData?.formData?.market;
        if (!market) return;

        const socket = new WebSocket(endpoints.CCCAGG_LiveTrade_WS + market);

        socket.addEventListener('open', () => {
            console.log('WebSocket connected');
            socket.send(JSON.stringify({ action: 'subscribe', market }));
        });

        socket.addEventListener('message', (event) => {
            try {
                const crypto_data = JSON.parse(event.data);
                if (crypto_data && typeof crypto_data === 'object' && !Array.isArray(crypto_data)) {
                    const cryptoDataValues = Object.values(crypto_data);
                    const totalSeries = cryptoDataValues[0].reduce((acc, ikey) => acc + (ikey.hasOwnProperty('low_high_price') ? 1 : 0), 0);

                    for (let i = 0; i < cryptoDataValues[0].length; i++) {
                        if (cryptoDataValues[0][i]['low_high_price'] === 1) {
                            minBarRangePriceRef.current = cryptoDataValues[0][i]['bin_range'][0];
                            continue;
                        }

                        if (cryptoDataValues[0][i]['low_high_price'] === cryptoDataValues[0].length - 1) {
                            maxBarRangePriceRef.current = cryptoDataValues[0][i]['bin_range'][1];
                            break;
                        }
                    }

                    numberOfSeriesRef.current = totalSeries;
                    setCryptoData(crypto_data);
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        });

        socket.addEventListener('error', (error) => {
            console.error('WebSocket error:', error);
        });

        socket.addEventListener('close', (event) => {
            console.log('WebSocket connection closed:', event);
        });

        return () => {
            socket.close(); // Close WebSocket on unmount
        };
    }, [previousCryptoData]); // Only re-run when `previousCryptoData` changes

    // Update chart with new series data
    useEffect(() => {
        if (!cryptoData || numberOfSeriesRef.current === 0 || !chartRef.current) return;
    
        const priceFormatConfig = {
            type: 'price',
            precision: 8,
            minMove: 0.00000001,
        };
    
        const seriesArray = [];

        // Update isFullCandleSeries ref based on the number of series
        isFullCandleSeriesRef.current = (numberOfSeriesRef.current === 5);

        const totalPriceRange = maxBarRangePriceRef.current - minBarRangePriceRef.current;

        // Create series and set data in a single loop
        const timeStamp = cryptoData?.['crypto_data']?.[cryptoData['crypto_data'].length - 1]?.['extra_data']?.['time_stamp'] || Math.floor(Date.now() / 1000);
        
        const seriesOptionsBase = {
            wickUpColor: isFullCandleSeriesRef.current ? 'white' : 'black',
            wickDownColor: isFullCandleSeriesRef.current ? 'white' : 'black',
            priceFormat: priceFormatConfig,
        };

        // Array to store the updated series data
        const updatedData = [];
        let cumulativeOpen = minBarRangePriceRef.current; // Start with the minimum bar range price
        
        for (let i = 0; i < numberOfSeriesRef.current; i++) {
            const colors = isFullCandleSeriesRef.current ? cryptoData['crypto_data'][i]['colors'] : false;
            const seriesOptions = {
                ...seriesOptionsBase,
                upColor: colors || 'green',
                downColor: colors || 'red',
            };
        
            if (!chartRef.current) return;
        
            const series = chartRef.current.addCandlestickSeries(seriesOptions);
        
            let open, close, low, high;
        
            if (isFullCandleSeriesRef.current) {
                const binRange = cryptoData['crypto_data'][i]['bin_range'];
                const rangeLow = i === 0 ? minBarRangePriceRef.current : cumulativeOpen; // Use cumulativeOpen for subsequent candles
                const rangeHigh = binRange[1];
        
                // Calculate the percentage size of the candle based on its range
                const candleSizePercentage = (rangeHigh - rangeLow) / totalPriceRange;
        
                // Adjust open and close based on relative size
                open = cumulativeOpen; // Start open at the cumulative open
                close = open + (totalPriceRange * candleSizePercentage); // Calculate close based on percentage
        
                // Update cumulativeOpen for the next candle
                cumulativeOpen = close; 
            } else {
                open = close = low = high = minBarRangePriceRef.current; // All values are the same when not using full candle series
            }
        
            low = Math.min(open, close);
            high = Math.max(open, close);
        
            const filterOHLCdata = { time: timeStamp, open, high, low, close };
            const newData = [...(seriesDataRef.current[i] || []), filterOHLCdata];
            series.setData(newData);
            updatedData.push(newData);
        }     
            
        // Update the seriesData ref without triggering a re-render
        seriesDataRef.current = updatedData;
    
    }, [cryptoData,]); // Reduced dependency array

    return (
        <>
            {/* {seriesDataRef.current.length > 0 && ( */}
                <div ref={chartContainerRef} style={{ position: 'relative', width: '100%', height: '300px' }} />
            {/* )} */}
        </>
    );
};

export default StatisticalAnalysis;
