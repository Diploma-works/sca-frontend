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
  Storage as GitLabIcon,
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
import { gitLabAPI } from '../../utils/api';

const GitLab = () => {
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState('');
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
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      setLoading(true);
      const status = await gitLabAPI.getStatus();
      setConnected(status.connected);
      setUsername(status.username || '');
      if (status.connected) await fetchRepositories();
      setError(null);
    } catch (err) {
      setError('Ошибка при проверке статуса GitLab: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRepositories = async () => {
    try {
      const repos = await gitLabAPI.getRepositories();
      setRepositories(repos);
    } catch (err) {
      setError('Ошибка при загрузке репозиториев: ' + err.message);
    }
  };

  const handleSaveToken = async () => {
    try {
      setLoading(true);
      await gitLabAPI.saveToken(token);
      setTokenDialogOpen(false);
      setToken('');
      await checkStatus();
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
      await gitLabAPI.removeToken();
      setConnected(false);
      setUsername('');
      setRepositories([]);
      setError(null);
    } catch (err) {
      setError('Ошибка при удалении токена: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShowBranches = async (repo) => {
    try {
      setSelectedRepo(repo);
      setLoading(true);
      // derive full name from possible API fields (backend may return different keys)
      const fullName = repo.fullName || repo.full_name || repo.path_with_namespace || `${repo.namespace?.full_path || ''}/${repo.path || repo.name || ''}`;
      if (!fullName || !fullName.includes('/')) {
        throw new Error('Невозможно определить имя репозитория');
      }
      const [owner, repoName] = fullName.split('/');
      const branchList = await gitLabAPI.getRepositoryBranches(owner, repoName);
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
      
      // Получаем URL для клонирования из объекта репозитория
      const gitUrl = repo.http_url_to_repo || repo.ssh_url_to_repo;
      if (!gitUrl) {
        throw new Error('URL репозитория не найден');
      }
      
      // Получаем имя проекта
      const projectName = repo.name || repo.path;
      if (!projectName) {
        throw new Error('Имя репозитория не найдено');
      }
      
      // Получаем ветку по умолчанию
      const defaultBranch = repo.default_branch || 'main';
      
      // Вызываем новый API для клонирования
      const result = await gitLabAPI.cloneRepository(
        null, // owner не нужен для нового API
        projectName,
        null, // targetPath не нужен
        gitUrl,
        defaultBranch
      );
      
      setError(null);
      alert(`Проект успешно клонирован: ${result.name}`);
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

      {/* GitLab Connection Status */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2}>
            <GitLabIcon />
            <Box flex={1}>
              <Typography variant="h6">
                GitLab Integration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {connected 
                  ? `Подключен как: ${username}` 
                  : 'Не подключен к GitLab'
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
                onClick={checkStatus}
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
              startIcon={<GitLabIcon />} 
              variant="contained"
              onClick={() => setTokenDialogOpen(true)}
            >
              Подключить GitLab
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
          {connected ? 'Обновить GitLab токен' : 'Подключить GitLab'}
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
            placeholder="glpat_..."
            helperText="Получите токен в GitLab → User Settings → Access Tokens"
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
                  secondary={branch.sha?.substring(0, 7)}
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

export default GitLab;
