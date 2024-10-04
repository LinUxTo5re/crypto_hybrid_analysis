import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import * as endpoints from '../constants/endpoints';

Chart.register(...registerables);

function StatisticalAnalysis({ previousCryptoData }) {
    const [chartData, setChartData] = useState({
        labels: ["temp"],
        datasets: [
            {
                data: [15],
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
            {
                data: [5],
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
            },
            {
                data: [40],
                backgroundColor: 'rgba(255, 206, 86, 0.5)',
            },
            {
                data: [10],
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
            },
            {
                data: [20],
                backgroundColor: 'rgba(153, 102, 255, 0.5)',
            },
        ],
    });

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                display: false,
            },
            title: {
                display: true,
                text: 'Candle With Most Traded Area',
            },
        },
        scales: {
            x: {
                stacked: true,
            },
            y: {
                stacked: true,
            },
        },
    };
       useEffect(() => {
        const market = 'KAS';
    // Create a WebSocket connection
    const socket = new WebSocket(`ws://localhost:8000/ws/livetrades/${market}`);

    // Connection opened
    socket.addEventListener('open', (event) => {
        console.log('WebSocket connected');
        // You can send a message if needed
        socket.send(JSON.stringify({ action: 'subscribe', market }));
    });

    // Listen for messages
    socket.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        console.log('Message from server:', data);
        // Update your chart data or state here
        updateChartData(data);
    });

    // Handle errors
    socket.addEventListener('error', (error) => {
        console.error('WebSocket error:', error);
    });

    // Cleanup function to close the socket when the component unmounts
    return () => {
        socket.close();
    };}, [chartData]);

    const updateChartData = (newData) => {
        setChartData((prevData) => {
            const updatedDatasets = prevData.datasets.map((dataset, index) => ({
                ...dataset,
                data: [...dataset.data, newData[index]], // Add new data to each dataset
            }));
            return { ...prevData, datasets: updatedDatasets };
        });
    };


    return <Bar data={chartData} options={options} />;

}

export default StatisticalAnalysis;
