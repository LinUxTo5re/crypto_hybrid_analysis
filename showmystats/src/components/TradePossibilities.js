import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../constants/endpoints';

//In this file, we'll add two columns which will show trade possibilities
// of each trading strategy and ml model in 1 to 5 scale
// 1 - no trade oppo.
// 5 - great oppo. for trade
function TradePossibilities()
{
    return (
    <h1> TradePossibilities </h1>
    )
}

export default TradePossibilities;