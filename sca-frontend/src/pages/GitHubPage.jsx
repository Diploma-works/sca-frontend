import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { GitHub } from '../components/GitHub';

const GitHubPage = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Контроль версий
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Управление GitHub репозиториями и интеграция с системой контроля версий
        </Typography>
      </Box>
      
      <GitHub />
    </Container>
  );
};

export default GitHubPage;
