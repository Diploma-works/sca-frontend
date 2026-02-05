import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Grid,
  IconButton,
  Chip,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Folder as FolderIcon,
  GitHub as GitHubIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Launch as LaunchIcon
} from '@mui/icons-material';
import { projectsAPI } from '../../utils/api';
import { useNavigate } from "react-router-dom";

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: ''
  });
  const [cloneForm, setCloneForm] = useState({
    gitUrl: '',
    branch: 'main',
    name: ''
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsAPI.getUserProjects();
      setProjects(data);
      setError(null);
    } catch (err) {
      setError('Ошибка при загрузке проектов: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    try {
      // Отладочная информация
      console.log('Создание проекта:', createForm);
      
      // Проверяем токен
      const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
      };
      
      const token = getCookie('_auth') || getCookie('auth') || getCookie('token');
      console.log('Токен из cookies:', token);
      console.log('localStorage token:', localStorage.getItem('token'));
      
      const testResponse = await fetch('http://localhost:8080/api/projects', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Тест API ответ:', testResponse.status, testResponse.statusText);
      
      const newProject = await projectsAPI.createProject(createForm);
      setProjects([...projects, newProject]);
      setCreateDialogOpen(false);
      setCreateForm({ name: '', description: '' });
      setError(null);
    } catch (err) {
      console.error('Ошибка создания проекта:', err);
      setError('Ошибка при создании проекта: ' + err.message);
    }
  };

  const handleCloneProject = async () => {
    try {
      const newProject = await projectsAPI.cloneFromGitHub(
        cloneForm.gitUrl,
        cloneForm.branch,
        cloneForm.name
      );
      setProjects([...projects, newProject]);
      setCloneDialogOpen(false);
      setCloneForm({ gitUrl: '', branch: 'main', name: '' });
      setError(null);
    } catch (err) {
      setError('Ошибка при клонировании проекта: ' + err.message);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот проект?')) {
      try {
        await projectsAPI.deleteProject(projectId);
        setProjects(projects.filter(p => p.id !== projectId));
        setError(null);
      } catch (err) {
        setError('Ошибка при удалении проекта: ' + err.message);
      }
    }
  };

  const handleOpenProject = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  const getProjectTypeIcon = (type) => {
    switch (type) {
      case 'GITHUB':
        return <GitHubIcon />;
      default:
        return <FolderIcon />;
    }
  };

  const getProjectTypeLabel = (type) => {
    switch (type) {
      case 'LOCAL':
        return 'Локальный';
      case 'GITHUB':
        return 'GitHub';
      case 'GITLAB':
        return 'GitLab';
      case 'BITBUCKET':
        return 'Bitbucket';
      default:
        return 'Неизвестно';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Мои проекты
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<GitHubIcon />}
            onClick={() => setCloneDialogOpen(true)}
          >
            Клонировать из Git
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Создать проект
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {projects.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <FolderIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              У вас пока нет проектов
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Создайте новый проект или клонируйте существующий из Git
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="outlined"
                startIcon={<GitHubIcon />}
                onClick={() => setCloneDialogOpen(true)}
              >
                Клонировать из Git
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
              >
                Создать проект
              </Button>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    {getProjectTypeIcon(project.type)}
                    <Typography variant="h6" component="h2" ml={1} noWrap>
                      {project.name}
                    </Typography>
                  </Box>
                  
                  <Chip
                    label={getProjectTypeLabel(project.type)}
                    size="small"
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                  
                  {project.description && (
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {project.description}
                    </Typography>
                  )}
                  
                  <Typography variant="caption" color="text.secondary">
                    Создан: {new Date(project.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
                
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<LaunchIcon />}
                    onClick={() => handleOpenProject(project.id)}
                  >
                    Открыть
                  </Button>
                  <Box sx={{ flexGrow: 1 }} />
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteProject(project.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Диалог создания проекта */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Создать новый проект</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название проекта"
            fullWidth
            variant="outlined"
            value={createForm.name}
            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Описание (необязательно)"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={createForm.description}
            onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Отмена</Button>
          <Button
            onClick={handleCreateProject}
            variant="contained"
            disabled={!createForm.name.trim()}
          >
            Создать
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог клонирования из Git */}
      <Dialog open={cloneDialogOpen} onClose={() => setCloneDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Клонировать проект из Git</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Git URL"
            placeholder="https://github.com/username/repository.git"
            fullWidth
            variant="outlined"
            value={cloneForm.gitUrl}
            onChange={(e) => setCloneForm({ ...cloneForm, gitUrl: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Ветка"
            fullWidth
            variant="outlined"
            value={cloneForm.branch}
            onChange={(e) => setCloneForm({ ...cloneForm, branch: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Название проекта"
            fullWidth
            variant="outlined"
            value={cloneForm.name}
            onChange={(e) => setCloneForm({ ...cloneForm, name: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCloneDialogOpen(false)}>Отмена</Button>
          <Button
            onClick={handleCloneProject}
            variant="contained"
            disabled={!cloneForm.gitUrl.trim() || !cloneForm.name.trim()}
          >
            Клонировать
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Projects; 