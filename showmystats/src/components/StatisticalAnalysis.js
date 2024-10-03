import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../constants/endpoints';
import io from 'socket.io-client';

// In this file, we'll show real time screening of
// statistical and math calculation
// such as volume and indicators as a stat charts

function StatisticalAnalysis({previousCryptoData})
{
    return (
    <h1> hello world from StatisticalAnalysis </h1>
    )
}

export default StatisticalAnalysis;