import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';


const LoadingIndicator = ({msg , isCircularLoadUsing = true}) => {
    return (
        <Box display="flex" alignItems="center">
            {isCircularLoadUsing && 
            <CircularProgress color="secondary" />
            }
            <Typography variant="body1" style={{ marginLeft: '10px' }}>
                {msg}
            </Typography>
        </Box>
    );
};

export default LoadingIndicator;