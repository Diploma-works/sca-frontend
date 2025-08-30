import React from 'react';
import { Box } from '@mui/material';

const Scheme = ({ canvasRef }) => {
    return (
        <Box
            ref={canvasRef}
            sx={{
                width: '100%',
                height: '600px',
                border: '1px solid #4b4b4b',
                position: 'relative',
                backgroundColor: '#ffffff'
            }}
        />
    );
};

export default Scheme;