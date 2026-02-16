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
  Cloud as BitbucketIcon,
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
import { bitbucketAPI } from '../../utils/api';

const Bitbucket = () => {
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState('');
  const [tokenUsername, setTokenUsername] = useState('');
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

  // SSH key state (for git push/pull)
  const [sshConfigured, setSshConfigured] = useState(false);
  const [sshKeyLoading, setSshKeyLoading] = useState(false);
  const [sshPrivateKey, setSshPrivateKey] = useState('');
  const [sshTestOutput, setSshTestOutput] = useState(null);

  useEffect(() => {
    checkStatus();
    checkSshStatus();
  }, []);

  const checkSshStatus = async () => {
    try {
      const status = await bitbucketAPI.getSshKeyStatus();
      setSshConfigured(Boolean(status.configured));
    } catch (err) {
      // Not fatal for the page
      console.warn('Failed to load Bitbucket SSH key status:', err);
    }
  };

  const checkStatus = async () => {
    try {
      setLoading(true);
      const status = await bitbucketAPI.getStatus();
      setConnected(status.connected);
      setUsername(status.username || '');
      if (status.connected) await fetchRepositories();
      setError(null);
    } catch (err) {
      setError('Ошибка при проверке статуса Bitbucket: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRepositories = async () => {
    try {
      const repos = await bitbucketAPI.getRepositories();
      setRepositories(repos);
    } catch (err) {
      setError('Ошибка при загрузке репозиториев: ' + err.message);
    }
  };

  const handleSaveToken = async () => {
    try {
      setLoading(true);
      // If user provided a username (for App password), send it along
      await bitbucketAPI.saveToken(token, tokenUsername && tokenUsername.trim() ? tokenUsername.trim() : null);
      setTokenDialogOpen(false);
      setToken('');
      setTokenUsername('');
      await checkStatus();
      setError(null);
    } catch (err) {
      setError('Ошибка при сохранении токена: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSshKey = async () => {
    try {
      setSshKeyLoading(true);
      setSshTestOutput(null);
      await bitbucketAPI.saveSshKey(sshPrivateKey);
      setSshPrivateKey('');
      await checkSshStatus();
      setError(null);
    } catch (err) {
      setError('Ошибка при сохранении SSH ключа: ' + err.message);
    } finally {
      setSshKeyLoading(false);
    }
  };

  const handleRemoveSshKey = async () => {
    try {
      setSshKeyLoading(true);
      setSshTestOutput(null);
      await bitbucketAPI.removeSshKey();
      await checkSshStatus();
      setError(null);
    } catch (err) {
      setError('Ошибка при удалении SSH ключа: ' + err.message);
    } finally {
      setSshKeyLoading(false);
    }
  };

  const handleTestSsh = async () => {
    try {
      setSshKeyLoading(true);
      const res = await bitbucketAPI.testSsh();
      setSshTestOutput(res.output || res.error || JSON.stringify(res));
      // if backend returns {success:false,...} it still is 200; show output
      await checkSshStatus();
      setError(null);
    } catch (err) {
      setSshTestOutput(null);
      setError('Ошибка при проверке SSH: ' + err.message);
    } finally {
      setSshKeyLoading(false);
    }
  };

  const handleRemoveToken = async () => {
    try {
      setLoading(true);
      await bitbucketAPI.removeToken();
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
      // derive full name from possible API fields (backend may return snake_case)
      const fullName = repo.fullName || repo.full_name || repo.path_with_namespace || `${repo.owner?.username || ''}/${repo.name || ''}`;
      if (!fullName || !fullName.includes('/')) {
        throw new Error('Невозможно определить имя репозитория');
      }
      const [owner, repoName] = fullName.split('/');
      const branchList = await bitbucketAPI.getRepositoryBranches(owner, repoName);
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
      const fullName = repo.fullName || repo.full_name || repo.path_with_namespace || `${repo.owner?.username || ''}/${repo.name || ''}`;
      if (!fullName || !fullName.includes('/')) {
        throw new Error('Невозможно определить имя репозитория для клонирования');
      }
      const [owner, repoName] = fullName.split('/');
      const result = await bitbucketAPI.cloneRepository(owner, repoName, `/projects/${repoName}`);
      setError(null);
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

      {/* Bitbucket Connection Status */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2}>
            <BitbucketIcon />
            <Box flex={1}>
              <Typography variant="h6">
                Bitbucket Integration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {connected 
                  ? `Подключен как: ${username}` 
                  : 'Не подключен к Bitbucket'
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
              startIcon={<BitbucketIcon />} 
              variant="contained"
              onClick={() => setTokenDialogOpen(true)}
            >
              Подключить Bitbucket
            </Button>
          )}
        </CardActions>
      </Card>

      {/* SSH setup card */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2}>
            <BitbucketIcon />
            <Box flex={1}>
              <Typography variant="h6">Bitbucket Git (SSH)</Typography>
              <Typography variant="body2" color="text.secondary">
                OAuth API token подходит для API (список репозиториев/ветки), но для git push/pull используется SSH ключ.
              </Typography>
            </Box>
            <Chip
              label={sshConfigured ? 'SSH настроен' : 'SSH не настроен'}
              color={sshConfigured ? 'success' : 'default'}
            />
          </Stack>

          <TextField
            margin="dense"
            label="SSH private key (PEM)"
            multiline
            minRows={6}
            fullWidth
            value={sshPrivateKey}
            onChange={(e) => setSshPrivateKey(e.target.value)}
            placeholder="-----BEGIN OPENSSH PRIVATE KEY-----\n...\n-----END OPENSSH PRIVATE KEY-----"
            helperText="Ключ сохраняется на диске сервера в workspace пользователя. Рекомендуется отдельный ключ для Bitbucket."
            sx={{ mt: 2 }}
          />

          {sshTestOutput && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {sshTestOutput}
              </Typography>
            </Alert>
          )}
        </CardContent>
        <CardActions>
          <Button onClick={checkSshStatus} startIcon={<RefreshIcon />} disabled={sshKeyLoading}>
            Обновить статус
          </Button>
          <Button onClick={handleTestSsh} disabled={sshKeyLoading || !sshConfigured}>
            Тест SSH
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveSshKey}
            disabled={sshKeyLoading || !sshPrivateKey.trim()}
          >
            Сохранить ключ
          </Button>
          <Button
            color="error"
            onClick={handleRemoveSshKey}
            disabled={sshKeyLoading || !sshConfigured}
          >
            Удалить ключ
          </Button>
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
                  <React.Fragment key={repo.uuid || repo.id}>
                    <ListItem disablePadding>
                      <ListItemButton onClick={() => handleShowBranches(repo)}>
                        <ListItemIcon>
                          {repo.is_private ? <LockIcon /> : <PublicIcon />}
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
          {connected ? 'Обновить Bitbucket токен' : 'Подключить Bitbucket'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="App password or token"
            type="password"
            fullWidth
            variant="outlined"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="bbp_..."
            helperText="OAuth token используется для API (репозитории/ветки). Для git push/pull используйте SSH ключ (см. блок выше)."
          />
          <TextField
            margin="dense"
            label="Bitbucket username (optional)"
            type="text"
            fullWidth
            variant="outlined"
            value={tokenUsername}
            onChange={(e) => setTokenUsername(e.target.value)}
            placeholder="Только если используете App password"
            helperText="Оставьте пустым для OAuth token; укажите username для App password (username:app_password)"
            sx={{ mt: 2 }}
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
                  secondary={branch.target?.hash?.substring(0, 7)}
                />
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

export default Bitbucket;
