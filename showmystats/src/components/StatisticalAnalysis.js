import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(...registerables);

function StatisticalAnalysis() {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [],
    });

    const [isDataForBar, SetisDataForBar] = useState(false);

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {
                        return `${tooltipItem.dataset.label}: ${tooltipItem.raw}%`;
                    },
                },
            },
            title: {
                display: true,
                text: 'Candle With Most Traded Area',
            },
        },
        scales: {
            x: {
                type: 'time', // Set x-axis to time type
                time: {
                    unit: 'minute', // Customize this based on your time intervals
                },
                stacked: true,
                title: {
                    display: true,
                    text: 'Timestamp',
                },
            },
            y: {
                beginAtZero: false, // Start from the lowest price range
                stacked: true,
                title: {
                    display: true,
                    text: 'Price Range',
                },
            },
        },
    };

    useEffect(() => {
        const market = 'KAS';
        const socket = new WebSocket(`ws://localhost:8000/ws/livetrades/${market}`);

        socket.addEventListener('open', () => {
            console.log('WebSocket connected');
            socket.send(JSON.stringify({ action: 'subscribe', market }));
        });

        socket.addEventListener('message', (event) => {
            const crypto_data = JSON.parse(event.data);
            console.log('Message from server:', crypto_data);
            updateChartData(crypto_data);
        });

        socket.addEventListener('error', (error) => {
            console.error('WebSocket error:', error);
        });

        return () => {
            socket.close();
        };
    }, []); // Empty dependency array to run only once on mount

    const updateChartData = (cryptoData) => {
        const newLabels = [];
        const newDatasets = [];

        if (typeof cryptoData === 'object' && !Array.isArray(cryptoData)) {
            cryptoData = Object.values(cryptoData); // Convert object values to an array
        }

        const time_stamp = cryptoData[0][cryptoData[0].length - 1].extra_data.time_stamp;
        newLabels.push(new Date(time_stamp * 1000)); // Convert timestamp to Date object

        cryptoData[0].forEach((dataPoint) => {
            if (dataPoint.bin_range && dataPoint.bin_percentage && dataPoint.colors) {
                const { bin_range, bin_percentage, colors } = dataPoint;

                // Create a new dataset for each bin
                newDatasets.push({
                    label: `Price Range ${dataPoint.low_high_price}`,
                    data: [bin_percentage], // Percentage for the height of the bar
                    backgroundColor: colors,
                    barPercentage: 1.0, // Control bar width
                    base: bin_range[0], // Starting price of the range (y-axis)
                    stack: 'Stack 0', // Stack identifier
                    minBarLength: 1, // Minimum bar length
                });

                SetisDataForBar(true);
            }
        });

        setChartData({
            labels: newLabels,
            datasets: newDatasets,
        });
        console.log(`chart Data: ${chartData}`);
    };

    return (
        <>
            {isDataForBar && (
                <Bar
                    data={{
                        labels: chartData.labels,
                        datasets: chartData.datasets,
                    }}
                    options={options}
                />
            )}
        </>
    );
}

export default StatisticalAnalysis;
