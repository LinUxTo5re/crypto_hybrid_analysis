import { createChart } from 'lightweight-charts';
import React, { useEffect, useRef, useState } from 'react';
import { Grid } from '@mui/material';
import LoadingIndicator from '../static/js/LoadingIndicator';
import * as endpoints from '../constants/endpoints';
import '../static/css/ResizablePopup.css';
import Fab from '@mui/material/Fab';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import TradePossibilitiesCart from '../static/js/TradePossibilitiesCart';
import LiveIndexPriceTracker from '../static/js/LiveIndexPriceTracker';


const StatisticalAnalysis = ({ previousCryptoData }) => {
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null); // Create a ref to store the chart instance
    const [cryptoData, setCryptoData] = useState(null);
    const [liveIndexAndLastPrice, setliveIndexAndLastPrice] = useState(null);

    
    // Create refs for the excluded state variables
    const seriesDataRef = useRef([]);
    const numberOfSeriesRef = useRef(0);
    const minBarRangePriceRef = useRef(0);
    const maxBarRangePriceRef = useRef(0);
    const isFullCandleSeriesRef = useRef(false); 
    const priceScaleId = useRef();

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

    // Fetch index and last price from gate.io (uses ws://127.0.0.1:8000/ws/index-price/<market>)
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
                setliveIndexAndLastPrice(index_data);
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

    // WebSocket logic (uses ws://127.0.0.1:8000/ws/livetrades/<market>)
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

            // Store the price scale ID of the candlestick series
            priceScaleId.current = series.priceScaleId;
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

    const [NewEMAdataFetched, setEMAdata] = useState();

    // WebSocket logic (uses ws://127.0.0.1:8000/ws/appendindicators/)
    useEffect(() => {
        if (!previousCryptoData || !chartRef.current) return;
        const socket = new WebSocket(endpoints.EMA_Append_Indicator_WS);
        
        if (isLoading !== null){
        socket.addEventListener('open', () => {
            const timeframes = ['5m', '15m', '1h', '4h', '1d'];
            const previousEMA = {
                "ticker": market.current
            };
        
            timeframes.forEach(timeframe => {
                previousEMA[timeframe] = {
                    "previous_EMA_9_data": previousCryptoData?.[`EMA_${timeframe}`]?.EMA_9?.slice(-1)[0],
                    "previous_EMA_12_data": previousCryptoData?.[`EMA_${timeframe}`]?.EMA_12?.slice(-1)[0],
                    "previous_EMA_50_data": previousCryptoData?.[`EMA_${timeframe}`]?.EMA_50?.slice(-1)[0],
                };
            });
        
            console.log('Websocket connected: appending EMA indicators');
            socket.send(previousEMA);
        });

        socket.addEventListener('message', (event) => {
            const EMADataNew = JSON.parse(event.data);
            setEMAdata(EMADataNew);
            console.log("EMA Data:  ", EMADataNew);
        });
        socket.addEventListener('error', (error) => {
            console.error('Append EMA indicator error: ', error);
        });

        socket.addEventListener('close', (event) => {
            console.log('Closed: Append  EMA indicator ', event);
        });
    }

    },[previousCryptoData,]);

    const colorsEMA = {
        '5m': {
          9: 'rgba(0, 128, 0, 1)', // dark green
          12: 'rgba(0, 128, 0, 0.7)', // green
          50: 'rgba(0, 128, 0, 0.3)' // light green
        },
        '15m': {
          9: 'rgba(255, 165, 0, 1)', // dark orange
          12: 'rgba(255, 165, 0, 0.7)', // orange
          50: 'rgba(255, 165, 0, 0.3)' // light orange
        },
        '1h': {
          9: 'rgba(128, 0, 128, 1)', // dark purple
          12: 'rgba(128, 0, 128, 0.7)', // purple
          50: 'rgba(128, 0, 128, 0.3)' // light purple
        },
        '4h': {
          9: 'rgba(0, 0, 255, 1)', // dark blue
          12: 'rgba(0, 0, 255, 0.7)', // blue
          50: 'rgba(0, 0, 255, 0.3)' // light blue
        },
        '1d': {
          9: 'rgba(255, 0, 0, 1)', // dark red
          12: 'rgba(255, 0, 0, 0.7)', // red
          50: 'rgba(255, 0, 0, 0.3)' // light red
        }
      };
    // Update EMA (uses ws://127.0.0.1:8000/ws/appendindicators/)
    useEffect(() => {
        if (!previousCryptoData && isLoading !== null && previousCryptoData.length === 0) return;

            const timestamp = isLoading ? previousCryptoData?.EMA_timeStamp : NewEMAdataFetched?.timeStamp;

            const timeframes = ['5m', '15m', '1h', '4h', '1d'];
            const emaPeriods = [9, 12, 50];
            
            const addEmaLineSeries = (emaData, timeframe, period) => {
                if (emaData && timestamp && emaData.length === timestamp.length) {
                    const mergedData = emaData.map((emaValue, index) => ({
                        value: emaValue,
                        time: isLoading ? timestamp[index]: timestamp,
                    }));
            
                    chartRef.current.addLineSeries({
                        color: colorsEMA[timeframe][period],
                        lineWidth: 1,
                        priceScaleId: priceScaleId.current,
                    }).setData(mergedData);
                }
            };
            
            if (isLoading !== null){
                timeframes.forEach((timeframe) => {
                    emaPeriods.forEach((period) => {
                        const emaData = isLoading ? previousCryptoData : NewEMAdataFetched[timeframe]?.[`ema_${period}`];
                        addEmaLineSeries(emaData, timeframe, period);
                    });
                });
            }
  
    }, [ NewEMAdataFetched, previousCryptoData]);

    const [visible, setVisible] = useState(false); // To toggle pop-up visibility

    return (
        <>
       <div style={{ position: 'relative', width: '100%', height: '500px' }}>
            {visible && (
               <TradePossibilitiesCart/>
            )}
            <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} >
            <LiveIndexPriceTracker liveIndexAndLastPrice = {liveIndexAndLastPrice}
            style={{
                position: 'fixed',
                bottom: 50,
                right: 20,
            }}
            />

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
