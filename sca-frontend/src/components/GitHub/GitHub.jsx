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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  IconButton,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  Add as AddIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  Star as StarIcon,
  CallSplit as ForkIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { gitHubAPI } from '../../utils/api';

const GitHub = () => {
  const [connected, setConnected] = useState(false);
  const [githubUsername, setGithubUsername] = useState('');
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dialogs state
  const [tokenDialogOpen, setTokenDialogOpen] = useState(false);
  const [createRepoDialogOpen, setCreateRepoDialogOpen] = useState(false);
  const [branchesDialogOpen, setBranchesDialogOpen] = useState(false);
  
  // Forms state
  const [token, setToken] = useState('');
  const [newRepo, setNewRepo] = useState({
    name: '',
    description: '',
    private: false
  });
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    checkGitHubStatus();
  }, []);

  const checkGitHubStatus = async () => {
    try {
      setLoading(true);
      const status = await gitHubAPI.getStatus();
      setConnected(status.connected);
      setGithubUsername(status.githubUsername || '');
      
      if (status.connected) {
        await fetchRepositories();
      }
      setError(null);
    } catch (err) {
      setError('Ошибка при проверке статуса GitHub: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRepositories = async () => {
    try {
      const repos = await gitHubAPI.getRepositories();
      setRepositories(repos);
    } catch (err) {
      setError('Ошибка при загрузке репозиториев: ' + err.message);
    }
  };

  const handleSaveToken = async () => {
    try {
      setLoading(true);
      await gitHubAPI.saveToken(token);
      setTokenDialogOpen(false);
      setToken('');
      await checkGitHubStatus();
      setError(null);
    } catch (err) {
      setError('Ошибка при сохранении токена: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveToken = async () => {
    try {
      setLoading(true);
      await gitHubAPI.removeToken();
      setConnected(false);
      setGithubUsername('');
      setRepositories([]);
      setError(null);
    } catch (err) {
      setError('Ошибка при удалении токена: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRepository = async () => {
    try {
      setLoading(true);
      await gitHubAPI.createRepository(newRepo.name, newRepo.description, newRepo.private);
      setCreateRepoDialogOpen(false);
      setNewRepo({ name: '', description: '', private: false });
      await fetchRepositories();
      setError(null);
    } catch (err) {
      setError('Ошибка при создании репозитория: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShowBranches = async (repo) => {
    try {
      setSelectedRepo(repo);
      setLoading(true);
      const [owner, repoName] = repo.fullName.split('/');
      const branchList = await gitHubAPI.getRepositoryBranches(owner, repoName);
      setBranches(branchList);
      setBranchesDialogOpen(true);
      setError(null);
    } catch (err) {
      setError('Ошибка при загрузке веток: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCloneRepository = async (repo) => {
    try {
      setLoading(true);
      const [owner, repoName] = repo.fullName.split('/');
      const result = await gitHubAPI.cloneRepository(owner, repoName, `/projects/${repoName}`);
      setError(null);
      // TODO: Добавить логику фактического клонирования
      alert(`Репозиторий готов к клонированию: ${result.cloneUrl}`);
    } catch (err) {
      setError('Ошибка при клонировании: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !connected) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={200}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* GitHub Connection Status */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2}>
            <GitHubIcon />
            <Box flex={1}>
              <Typography variant="h6">
                GitHub Integration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {connected 
                  ? `Подключен как: ${githubUsername}` 
                  : 'Не подключен к GitHub'
                }
              </Typography>
            </Box>
            <Chip 
              label={connected ? 'Подключен' : 'Не подключен'} 
              color={connected ? 'success' : 'default'}
            />
          </Stack>
        </CardContent>
        <CardActions>
          {connected ? (
            <>
              <Button 
                startIcon={<RefreshIcon />} 
                onClick={checkGitHubStatus}
                disabled={loading}
              >
                Обновить
              </Button>
              <Button 
                startIcon={<SettingsIcon />} 
                onClick={() => setTokenDialogOpen(true)}
              >
                Настройки
              </Button>
              <Button 
                startIcon={<DeleteIcon />} 
                color="error"
                onClick={handleRemoveToken}
                disabled={loading}
              >
                Отключить
              </Button>
            </>
          ) : (
            <Button 
              startIcon={<GitHubIcon />} 
              variant="contained"
              onClick={() => setTokenDialogOpen(true)}
            >
              Подключить GitHub
            </Button>
          )}
        </CardActions>
      </Card>

      {/* Repositories List */}
      {connected && (
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">
                Репозитории ({repositories.length})
              </Typography>
              <Button
                startIcon={<AddIcon />}
                variant="outlined"
                onClick={() => setCreateRepoDialogOpen(true)}
                disabled={loading}
              >
                Создать репозиторий
              </Button>
            </Stack>

            {repositories.length === 0 ? (
              <Typography color="text.secondary" textAlign="center" py={4}>
                Репозитории не найдены
              </Typography>
            ) : (
              <List>
                {repositories.map((repo, index) => (
                  <React.Fragment key={repo.id}>
                    <ListItem disablePadding>
                      <ListItemButton onClick={() => handleShowBranches(repo)}>
                        <ListItemIcon>
                          {repo.private ? <LockIcon /> : <PublicIcon />}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Typography variant="subtitle1">
                                {repo.name}
                              </Typography>
                              {repo.fork && (
                                <Chip label="Fork" size="small" variant="outlined" />
                              )}
                            </Stack>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {repo.description || 'Описание отсутствует'}
                              </Typography>
                              <Stack direction="row" spacing={2} mt={1}>
                                {repo.language && (
                                  <Typography variant="caption">
                                    {repo.language}
                                  </Typography>
                                )}
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                  <StarIcon fontSize="small" />
                                  <Typography variant="caption">
                                    {repo.stargazersCount}
                                  </Typography>
                                </Stack>
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                  <ForkIcon fontSize="small" />
                                  <Typography variant="caption">
                                    {repo.forksCount}
                                  </Typography>
                                </Stack>
                              </Stack>
                            </Box>
                          }
                        />
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCloneRepository(repo);
                          }}
                          disabled={loading}
                        >
                          <DownloadIcon />
                        </IconButton>
                      </ListItemButton>
                    </ListItem>
                    {index < repositories.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      )}

      {/* Token Dialog */}
      <Dialog open={tokenDialogOpen} onClose={() => setTokenDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {connected ? 'Обновить GitHub токен' : 'Подключить GitHub'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Personal Access Token"
            type="password"
            fullWidth
            variant="outlined"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ghp_..."
            helperText="Получите токен в GitHub Settings → Developer settings → Personal access tokens"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTokenDialogOpen(false)}>
            Отмена
          </Button>
          <Button 
            onClick={handleSaveToken} 
            variant="contained"
            disabled={!token.trim() || loading}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Repository Dialog */}
      <Dialog open={createRepoDialogOpen} onClose={() => setCreateRepoDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Создать новый репозиторий</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название репозитория"
            fullWidth
            variant="outlined"
            value={newRepo.name}
            onChange={(e) => setNewRepo({...newRepo, name: e.target.value})}
          />
          <TextField
            margin="dense"
            label="Описание"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={newRepo.description}
            onChange={(e) => setNewRepo({...newRepo, description: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateRepoDialogOpen(false)}>
            Отмена
          </Button>
          <Button 
            onClick={handleCreateRepository} 
            variant="contained"
            disabled={!newRepo.name.trim() || loading}
          >
            Создать
          </Button>
        </DialogActions>
      </Dialog>

      {/* Branches Dialog */}
      <Dialog open={branchesDialogOpen} onClose={() => setBranchesDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Ветки репозитория {selectedRepo?.name}
        </DialogTitle>
        <DialogContent>
          <List>
            {branches.map((branch) => (
              <ListItem key={branch.name}>
                <ListItemIcon>
                  <FolderOpenIcon />
                </ListItemIcon>
                <ListItemText
                  primary={branch.name}
                  secondary={branch.sha.substring(0, 7)}
                />
                {branch.protected && (
                  <Chip label="Protected" size="small" color="warning" />
                )}
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBranchesDialogOpen(false)}>
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GitHub;
