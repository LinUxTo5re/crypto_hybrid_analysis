import { createChart } from 'lightweight-charts';
import React, { useEffect, useRef } from 'react';

const StatisticalAnalysis = () => {
    const chartContainerRef = useRef(null);

    useEffect(() => {
        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 300,
            layout: 
            { 
                textColor: 'black',
                 background:
                  { type: 'solid', 
                    color: 'white' 
                }
            },
            // Control time scale and spacing
            timeScale: {
                timeVisible: true,
                secondsVisible: false, // Show seconds if necessary
                barSpacing: 100, // More space between candles
                minBarSpacing: 10, // Prevents candles from getting too compressed
                rightOffset: 5,  // Adds extra space to the right of the last candle
                minBarSpacing: 50,
                ticksVisible: true,            
            },
            rightPriceScale: {
                visible: true,
                // Adjust the scale to accommodate small decimal values
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.1,
                },
            },
            
        });
        const priceFormatConfig = {
            type: 'price',
            precision: 8, // Show up to 8 decimal places
            minMove: 0.00000001, // Smallest price increment
        };

        const series1 = chart.addCandlestickSeries({
            upColor: 'green',
            downColor: 'red',
             wickUpColor: 'white', 
             wickDownColor: 'white',
            priceFormat: priceFormatConfig,

        });

        const series2 = chart.addCandlestickSeries({
            upColor: 'blue',
            downColor: 'orange',
            wickUpColor: 'white', 
            wickDownColor: 'white',
            priceFormat: priceFormatConfig,

        });

        const series3 = chart.addCandlestickSeries({
            upColor: 'green',
            downColor: 'red',
            wickUpColor: 'white', 
             wickDownColor: 'white',
            priceFormat: priceFormatConfig,

        });

        const series4 = chart.addCandlestickSeries({
            upColor: 'blue',
            downColor: 'orange',
            wickUpColor: 'white', 
             wickDownColor: 'white',
            priceFormat: priceFormatConfig,

        });
        const data1 = [
            { time: 1696208400, open: 0.00000055, high:  0.00000065, low:  0.00000055, close:  0.00000065 },  // Upward movement
            { time: 1696208700, open:  0.00000065, high:  0.00000068, low:  0.00000056, close:  0.00000056 },  // Downward movement
        ];
        
        const data2 = [
            { time: 1696208400, open:  0.00000065, high:  0.00000075, low:  0.00000065, close:  0.00000075 },  // Upward movement
            { time: 1696208700, open:  0.00000056, high:  0.00000056, low:  0.00000054, close:  0.00000054 },  // Downward movement
            ];
        
        const data3 = [
            { time: 1696208400, open:  0.00000075, high:  0.00000085, low:  0.00000075, close:  0.00000085 },  // Upward movement
            { time: 1696208700, open:  0.00000054, high:  0.00000054, low:  0.00000050, close:  0.00000050 },  // Downward movement
            ];
        
        const data4 = [
            { time: 1696208400, open:  0.00000085, high:  0.00000095, low:  0.00000085, close:  0.00000095 },  // Upward movement
            { time: 1696208700, open:  0.00000050, high:  0.00000050, low:  0.00000035, close:  0.00000035 },  // Downward movement
            ];
        

        series1.setData(data1);
        series2.setData(data2);
        series3.setData(data3);
        series4.setData(data4);
        chart.timeScale().fitContent();



        return () => {
            chart.remove();
        };
    }, []);

    return <div ref={chartContainerRef} style={{ position: 'relative', width: '100%', height: '300px' }} />;
};

export default StatisticalAnalysis;
