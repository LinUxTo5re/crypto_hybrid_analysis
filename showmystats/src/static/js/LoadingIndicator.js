import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingIndicator = ({ msg, isCircularLoadUsing = true, isParentSpaceAllowed = true, color= 'white' }) => {
    return (
        <Box
            position={isParentSpaceAllowed ? "absolute" : "relative"}
            top={isParentSpaceAllowed ? 0 : undefined}
            left={isParentSpaceAllowed ? 0 : undefined}
            right={isParentSpaceAllowed ? 0 : undefined}
            bottom={isParentSpaceAllowed ? 0 : undefined}
            display="flex"
            alignItems="center"
            justifyContent="center"
            bgcolor={isParentSpaceAllowed ? "rgba(19, 23, 34, 0.7)" : ''}
            zIndex={1000}
            padding={isParentSpaceAllowed ? undefined : 2}
        >
            <Box display="flex" flexDirection="column" alignItems="center">
                {isCircularLoadUsing && 
                    <CircularProgress color="secondary" style={{ marginBottom: '20px' }} />
                }
                <Typography variant="body1" color={color}>
                    {msg}
                </Typography>
            </Box>
        </Box>
    );
};

export default LoadingIndicator;