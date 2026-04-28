import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import Bitbucket from '../../components/Bitbucket/Bitbucket';

const BitbucketPage = () => {
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Контроль версий — Bitbucket
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Управление Bitbucket репозиториями и интеграция с системой контроля версий
                </Typography>
            </Box>

            <Bitbucket />
        </Container>
    );
};

export default BitbucketPage;
