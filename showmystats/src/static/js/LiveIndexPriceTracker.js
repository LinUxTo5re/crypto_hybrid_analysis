import React, { useState, useEffect } from "react";
import { Box, Typography } from '@mui/material';

const LiveIndexPriceTracker = ({ liveIndexAndLastPrice }) => { // data from gate.io
    
    const [priceColor, setPriceColor] = useState('blue');
    const [indexPrice, setIndexPrice] = useState(null);
    const [lastPrice, setLastPrice] = useState(null);
    const [percentageChange, setPercentageChange] = useState(null);

    useEffect(() => {
        if (liveIndexAndLastPrice) {
            setIndexPrice(liveIndexAndLastPrice.index_price);
            setLastPrice(liveIndexAndLastPrice.last_price);
            setPercentageChange(parseFloat(liveIndexAndLastPrice.change_percentage.toFixed(2)));

            if (liveIndexAndLastPrice.change_percentage > 0) {
            setPriceColor("green");
          } else if (liveIndexAndLastPrice.change_percentage < 0) {
            setPriceColor("red");
          } else {
            setPriceColor("neutral");
          }
        }
      }, [liveIndexAndLastPrice]);

    return (
        <Box
            sx={{
                position: 'absolute',
                display: 'flex',        // Align horizontally
                flexDirection: 'row',   // Ensure boxes are in a row
                padding: '0',
                backgroundColor: 'transparent',
                zIndex: 1000,
                gap: '20px', 
            }}
        >
            {/* Percentage Change */}
            <Box
                sx={{
                    padding: '10px 5px',
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                    borderRadius: '0',
                }}
            >
                <Typography color={priceColor ? priceColor : 'blue'}>
                {priceColor !== 'blue' && (
    <span>
        {percentageChange} <strong>%</strong>
    </span>
)}
                </Typography>
            </Box>

            {/* Index Price Box */}
            <Box
                sx={{
                    padding: '10px 10px',
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                    borderRadius: '0',
                }}
            >
                <Typography color={priceColor ? priceColor : 'blue'}>
                    {priceColor !== 'blue' && (
                        <span>
                    <strong>Index Price:</strong> {indexPrice}
                        </span>
                    )}
                </Typography>
            </Box>

            {/* Last Price Box */}
            <Box
                sx={{
                    padding: '10px 10px',
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                    borderRadius: '0',
                }}
            >
                <Typography color={priceColor ? priceColor : 'blue'}>
                    {priceColor !== 'blue' && (
                        <span>
                    <strong>Last Price:</strong> {lastPrice}
                        </span>
                    )}
                </Typography>
            </Box>
        </Box>
    );
};

export default LiveIndexPriceTracker;
