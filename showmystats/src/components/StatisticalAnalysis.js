import { createChart } from 'lightweight-charts';
import React, { useEffect, useRef, useState } from 'react';
import { Grid } from '@mui/material';
import LoadingIndicator from '../static/js/LoadingIndicator';
import * as endpoints from '../constants/endpoints';
import Draggable from 'react-draggable';
import '../static/css/ResizablePopup.css';
import Fab from '@mui/material/Fab';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const StatisticalAnalysis = ({ previousCryptoData }) => {
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null); // Create a ref to store the chart instance
    const [cryptoData, setCryptoData] = useState(null);
    const liveIndexAndLastPrice = useRef(null);

    
    // Create refs for the excluded state variables
    const seriesDataRef = useRef([]);
    const numberOfSeriesRef = useRef(0);
    const minBarRangePriceRef = useRef(0);
    const maxBarRangePriceRef = useRef(0);
    const isFullCandleSeriesRef = useRef(false); 

    // Create chart instance
    useEffect(() => {
        if (!chartContainerRef.current || chartRef.current) return;

        chartRef.current = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
            layout: {
                background: { type: 'solid', color: '#131722' },
    textColor: '#d1d4dc',
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
                barSpacing: 50,
                rightOffset: 5,
                minBarSpacing: 5,
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
                    color: '#2B2B43',
                    style: 0,
                    visible: true,
                },
                horzLines: {
                    color: '#2B2B43', 
                    visible: true,
                },
            },
        });
        
    }, []); // Chart is created only once when component mounts

    const market = useRef();
    const priceFormatConfig = useRef();
    const [isLoading, setIsLoading] = useState(null);

    const handleLoader = (val) =>
    {
        setIsLoading(val);
    }

    // Fetch index and last price from gate.io
    useEffect(() => {
        market.current = previousCryptoData?.formData?.market;
        if (!market.current) return;
        
        const socket = new WebSocket(endpoints.Live_Index_Price_GateIO_WS + market.current);

        socket.addEventListener('open', () => {
            console.log('Websocket connected: Live Index price tracker')
            socket.send(JSON.stringify({action: 'subscribd', market}));
        });

        socket.addEventListener('message', (event) => {
            try {
                const index_data = JSON.parse(event.data);             
                liveIndexAndLastPrice.current = index_data;
                // if (chartRef.current) {
                //     chartRef.current.setPriceLine(index_data.last_price); // This method should be called on the series
                // }
                console.log('index data:  ', index_data);
            } catch (error) {
                console.error('candle series formation Error parsing WebSocket message:', error);
            }
        });

        socket.addEventListener('error', (error) => {
            console.error('Live Index price tracker WebSocket error:', error);
        });

        socket.addEventListener('close', (event) => {
            console.log('Live Index price tracker WebSocket connection closed:', event);
        });

        return () => {
            socket.close();
        };
    }, [previousCryptoData, ]);
    // WebSocket logic
    useEffect(() => {        
        market.current = previousCryptoData?.formData?.market;
        priceFormatConfig.current = previousCryptoData?.priceFormatConfig;

        if (!market.current) return;
        handleLoader(true);
        const socket = new WebSocket(endpoints.CCCAGG_LiveTrade_WS + market.current);

        socket.addEventListener('open', () => {
            console.log('WebSocket connected: candle series formation');
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
                console.error('candle series formation Error parsing WebSocket message:', error);
            }
        });

        socket.addEventListener('error', (error) => {
            console.error('candle series formation WebSocket error:', error);
        });

        socket.addEventListener('close', (event) => {
            console.log('candle series formation WebSocket connection closed:', event);
        });

        return () => {
            socket.close();
        };
    }, [previousCryptoData,]); // Only re-run when previousCryptoData changes

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
            priceFormat: priceFormatConfig.current,
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
                lastValueVisible : false,
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
        if(isLoading) handleLoader(false); // run once for every fresh market

    }, [cryptoData]);

    const [visible, setVisible] = useState(false); // To toggle pop-up visibility
    const [size, setSize] = useState({ width: 300, height: 200 }); // Initial size

    // Handle resizing
    const onResize = (e) => {
        const newWidth = e.clientX - e.target.parentElement.getBoundingClientRect().left;
        const newHeight = e.clientY - e.target.parentElement.getBoundingClientRect().bottom;
        if (newWidth > 100 && newHeight > 100) { // Minimum size constraints
            setSize({ width: newWidth, height: newHeight });
        }
    };

    return (
        <>
       <div style={{ position: 'relative', width: '100%', height: '500px' }}>
            {visible && (
                <Draggable>
                    <div
                        className="resizable-popup"
                        style={{
                            width: size.width,
                            height: size.height,
                            padding: '20px',
                            backgroundColor: 'rgba(255, 255, 255)',
                            border: '1px solid #ccc',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                            position: 'absolute',
                            bottom: '6%',
                            left: '1%',
                            zIndex: 1000,
                        }}
                    >
                        <h2>your data here</h2>
                        
                        {/* Resize handle */}
                        <div className="resize-handle" onMouseDown={onResize}></div>
                    </div>
                </Draggable>
            )}
            <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} >
            <Fab 
                color="secondary" 
                aria-label="add" 
                style={{
                    position: 'fixed',
                    bottom: 0,
                    right: 20,
                }}
                onClick={() => setVisible(!visible)}
            >
                <ShoppingCartIcon />
            </Fab>
                </div>
            {isLoading && (
                <LoadingIndicator 
                    msg={"Previous crypto data fetched successfully, Waiting for first 5 minute candle to be complete ...."}
                />
            )}
        </div>

        </>
    );
};

export default StatisticalAnalysis;
