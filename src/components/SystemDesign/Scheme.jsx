import React from 'react';
import { Box } from '@mui/material';

const Scheme = ({ canvasRef }) => {
    return (
        <Box
            ref={canvasRef}
            sx={(theme) => ({
                width: '100%',
                height: '600px',
                border: '1px solid',
                borderColor: 'divider',
                position: 'relative',
                backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#e8e8e8'
            })}
        />
    );
};

export default Scheme;