import { createChart } from 'lightweight-charts';
import React, { useEffect, useRef, useState } from 'react';
import * as endpoints from '../constants/endpoints';

const StatisticalAnalysis = ({ previousCryptoData }) => {
    const chartContainerRef = useRef(null);
    const [cryptoData, setCryptoData] = useState();
    const [numberOfSeries, setNumberOfSeries] = useState(0);
    const [seriesData, setSeriesData] = useState([]); // Initialize as an empty array
    const chartRef = useRef(null); // Create a ref to store the chart instance

    useEffect(() => {
        const market = previousCryptoData['formData']['market'];
        const socket = new WebSocket(endpoints.CCCAGG_LiveTrade_WS + market);

        socket.addEventListener('open', () => {
            console.log('WebSocket connected');
            socket.send(JSON.stringify({ action: 'subscribe', market }));
        });

        socket.addEventListener('message', (event) => {
            try {
                const crypto_data = JSON.parse(event.data);
                console.log('Message from server:', crypto_data);

                if (typeof crypto_data === 'object' && !Array.isArray(crypto_data)) {
                    const cryptoDataValues = Object.values(crypto_data);
                    let totalSeries = cryptoDataValues[0].reduce((acc, ikey) => {
                        return acc + (ikey.hasOwnProperty('low_high_price') ? 1 : 0);
                    }, 0);

                    setNumberOfSeries(totalSeries);
                    setCryptoData(crypto_data);
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        });

        socket.addEventListener('error', (error) => {
            console.error('WebSocket error:', error);
        });

        return () => {
            socket.close(); // Close WebSocket on unmount
        };
    }, [previousCryptoData]); // Depend on previousCryptoData

    useEffect(() => {
        if (!chartContainerRef.current) return; // Safety check

        // Create the chart only once when the component mounts
        if (!chartRef.current) {
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
        }

        const priceFormatConfig = {
            type: 'price',
            precision: 8,
            minMove: 0.00000001,
        };

        const seriesArray = []; // Initialize inside useEffect to avoid stale closures

        for (let i = 0; i < numberOfSeries; i++) { // setting colors for each candle series
            const seriesOptions = {
                upColor: cryptoData['crypto_data'][i]['colors'],
                downColor: cryptoData['crypto_data'][i]['colors'],
                wickUpColor: 'white',
                wickDownColor: 'white',
                priceFormat: priceFormatConfig,
            };
            const series = chartRef.current.addCandlestickSeries(seriesOptions);
            seriesArray.push(series);
        }

        // Update series data when cryptoData changes
        if (cryptoData) {
            const handlingTimeStampSafely =
                cryptoData?.['crypto_data']?.[cryptoData['crypto_data'].length - 1]?.['extra_data']?.['time_stamp'] ||
                Math.floor(Date.now() / 1000);

            setSeriesData((prev) => {
                const updatedData = [...prev];

                for (let i = 0; i < numberOfSeries; i++) {
                    if (cryptoData['crypto_data'][i]['low_high_price'] === i + 1) {
                        const filterOHLCdata = {
                            time: handlingTimeStampSafely,
                            open: cryptoData['crypto_data'][i]['bin_range'][0], // open == low
                            high: cryptoData['crypto_data'][i]['bin_range'][1], // high == close
                            low: cryptoData['crypto_data'][i]['bin_range'][0],
                            close: cryptoData['crypto_data'][i]['bin_range'][1],
                        };
                        updatedData[i] = [...(updatedData[i] || []), filterOHLCdata]; // Append new data
                        seriesArray[i].setData(updatedData[i]); // Update each series with new data
                    }
                }
                return updatedData;
            });
        }

        return () => {
            // Cleanup not needed for chart since it's stored in ref
        };
    }, [cryptoData, numberOfSeries]); // depend on cryptoData and numberOfSeries

    useEffect(() => {
        // write logic here to store cryptodata into dynamodb
        // it will write (24*60)/5 = 288 rows for single day.
    },[seriesData]);

    return (
        <div ref={chartContainerRef} style={{ position: 'relative', width: '100%', height: '300px' }} />
    );
};

export default StatisticalAnalysis;
