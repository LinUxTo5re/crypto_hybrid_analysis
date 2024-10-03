import React, { useEffect } from 'react';
import { io } from 'socket.io-client';
import * as endpoints from '../constants/endpoints';

// export const cccaggAppendIndicator = (previous_EMA_data) => {
//     useEffect(() => {
//         const socket = io(endpoints.CCCAGG_AppendIndicators_WS);

//         // Handle the connection event
//         socket.on('connect', () => {
//             console.log('Socket connected');

//             // Prepare the message
//             const message = {
//                 ticker: 'ETH',
//                 '5m': {
//                     previous_EMA_9_data: 123,
//                     previous_EMA_12_data: 125,
//                     previous_EMA_50_data: 122
//                 },
//                 '15m': {
//                     previous_EMA_9_data: 145,
//                     previous_EMA_12_data: 133,
//                     previous_EMA_50_data: 142
//                 },
//                 '1h': {
//                     previous_EMA_9_data: 156,
//                     previous_EMA_12_data: 134,
//                     previous_EMA_50_data: 154
//                 },
//                 '4h': {
//                     previous_EMA_9_data: 132,
//                     previous_EMA_12_data: 125,
//                     previous_EMA_50_data: 149
//                 },
//                 '1d': {
//                     previous_EMA_9_data: 148,
//                     previous_EMA_12_data: 136,
//                     previous_EMA_50_data: 153
//                 }
//             };

//             // Send the message
//             socket.emit('appendIndicators', message);
//         });

//         // Handle incoming messages
//         socket.on('message', (data) => {
//             console.log('Message from server:', data);
//         });

//         // Handle errors
//         socket.on('connect_error', (error) => {
//             console.error('Socket error:', error);
//         });

//         // Cleanup function to disconnect the socket when the component unmounts
//         return () => {
//             socket.disconnect();
//         };
//     }, []);

// };
