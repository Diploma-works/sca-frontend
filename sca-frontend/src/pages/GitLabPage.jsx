import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import GitLab from '../components/GitLab/GitLab';

const GitLabPage = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Контроль версий — GitLab
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Управление GitLab репозиториями и интеграция с системой контроля версий
        </Typography>
      </Box>
      <GitLab />
    </Container>
  );
};

export default GitLabPage;
