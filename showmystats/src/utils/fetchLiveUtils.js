import React, { useEffect } from 'react';
import { io } from 'socket.io-client';
import * as endpoints from '../constants/endpoints';

// export const fetchLiveTrades = () => 
// {
//     useEffect(() => {
//         const socket = io(endpoints.CCCAGG_LiveTrade_WS);

//         // connet and send message to ws
//         socket.on('connect', () => {
//             console.log('Live-Trade socket connected');

//             const market = "BTC";

//             socket.emit('livetrades', market);

//         });

//         // Handle incoming msg
//         socket.on('message', (data) => {
//             console.log(data);
//         });

//          // Handle errors
//          socket.on('connect_error', (error) => {
//             console.error('Socket error:', error);
//         });

//         // Cleanup function to disconnect the socket when the component unmounts
//         return () => {
//             socket.disconnect();
//         };

//     }, []);
// }