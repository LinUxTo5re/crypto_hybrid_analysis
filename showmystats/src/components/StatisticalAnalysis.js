import { createChart } from 'lightweight-charts';
import React, { useEffect, useRef, useState } from 'react';
import { Grid } from '@mui/material';
import LoadingIndicator from '../static/js/LoadingIndicator';
import * as endpoints from '../constants/endpoints';
import { getPriceFormatConfig } from '../utils/statisticalAnalysisUtils';

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
                scaleMargins:{
                    top: 0.3,
                    bottom: 0.1
                },
            },
            grid: {
                vertLines: {
                    color: '#D6DCDE',
                    style: 0,
                    visible: true,
                },
                horzLines: {
                    color: 'rgba(70, 130, 180, 0.5)', 
                    visible: true,
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
                const totalSeries = crypto_data['crypto_data'].reduce((acc, ikey) => acc + (ikey.hasOwnProperty('low_high_price') ? 1 : 0), 0);

                minBarRangePriceRef.current = crypto_data['crypto_data'][0]['bin_range'][0];
                maxBarRangePriceRef.current = crypto_data?.['crypto_data']?.[crypto_data['crypto_data'].length - 2]['bin_range'][1];

                numberOfSeriesRef.current = totalSeries;
                setCryptoData(crypto_data);
                console.log('crypto data:  ', crypto_data);
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
    }, [previousCryptoData]); // Only re-run when previousCryptoData changes

    // Update chart with new series data
    useEffect(() => {
        if (!cryptoData || numberOfSeriesRef.current === 0 || !chartRef.current) return;

        // Update isFullCandleSeries ref based on the number of series
        isFullCandleSeriesRef.current = (numberOfSeriesRef.current === 5);

        // Create series and set data in a single loop
        const timeStamp = cryptoData?.['crypto_data']?.[cryptoData['crypto_data'].length - 1]?.['extra_data']?.['time_stamp'] || Math.floor(Date.now() / 1000);
        
        const seriesOptionsBase = {
            wickUpColor: 'white',
            wickDownColor: 'white',
            priceFormat: getPriceFormatConfig(minBarRangePriceRef.current),
        };
        
        const updatedData = [];

        for (let i = 0; i < numberOfSeriesRef.current; i++) {
            const colors = isFullCandleSeriesRef.current ? cryptoData['crypto_data'][i]['colors'] : false;

            if (!chartRef.current) return;

            const series = chartRef.current.addCandlestickSeries({
                upColor: colors ||  'green',
                downColor: colors  || 'red',
                ...seriesOptionsBase,
                priceLineVisible: false,
            });

            let open, close, low, high;

            if (isFullCandleSeriesRef.current) {
                open= low = cryptoData['crypto_data'][i]['bin_range'][0];
                high = close = cryptoData['crypto_data'][i]['bin_range'][1];               
            } else {
                open = low = minBarRangePriceRef.current; 
                high = close = maxBarRangePriceRef.current;
            }

            const filterOHLCdata = [{ time: timeStamp, open, high, low, close }];
            series.setData(filterOHLCdata);
            updatedData.push(filterOHLCdata);
        }     

        // Update the seriesData ref without triggering a re-render
        seriesDataRef.current = updatedData;

    }, [cryptoData,]);

    return (
        <>
         <Grid container justifyContent="center" alignItems="center" style={{ position: 'relative', width: '100%', height: '300px' }} >
            {seriesDataRef.current.length > 0 ? (
                <div ref={chartContainerRef}/>
            ) : (
                <LoadingIndicator msg = {"Chart getting Load ...."}/>
            )}
        </Grid>
        </>
    );
};

export default StatisticalAnalysis;
