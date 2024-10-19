import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';


const LoadingIndicator = ({msg}) => {
    return (
        <Box display="flex" alignItems="center">
            <CircularProgress color="secondary" />
            <Typography variant="body1" style={{ marginLeft: '10px' }}>
                {msg}
            </Typography>
        </Box>
    );
};

export default LoadingIndicator;