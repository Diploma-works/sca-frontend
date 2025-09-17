import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Typography,
  Stack,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  Commit as CommitIcon,
  Upload as PushIcon,
  Download as PullIcon,
  CallSplit as BranchIcon,
  Sync as SyncIcon,
  History as HistoryIcon,
  Info as InfoIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  SwapHoriz as SwitchIcon,
  RestoreFromTrash as ResetIcon
} from '@mui/icons-material';
import { gitHubAPI } from '../../utils/api';

const GitActions = ({ projectId }) => {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Repository state
  const [repositoryInfo, setRepositoryInfo] = useState(null);
  const [currentBranch, setCurrentBranch] = useState('main');
  const [gitStatus, setGitStatus] = useState([]);
  const [commitMessage, setCommitMessage] = useState('');
  const [branches, setBranches] = useState([]);
  const [hasStash, setHasStash] = useState(false);
  
  // Dialog states
  const [commitDialogOpen, setCommitDialogOpen] = useState(false);
  const [branchDialogOpen, setBranchDialogOpen] = useState(false);
  const [switchBranchDialogOpen, setSwitchBranchDialogOpen] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');

  useEffect(() => {
    checkGitHubConnection();
  }, []);

  useEffect(() => {
    if (connected && projectId) {
      loadRepositoryInfo();
      loadGitStatus();
      loadBranches();
      loadStashStatus();
    }
  }, [connected, projectId]);

  const checkGitHubConnection = async () => {
    try {
      setLoading(true);
      const response = await gitHubAPI.getStatus();
      setConnected(response.connected);
      setError(null);
    } catch (err) {
      console.error('Error checking GitHub connection:', err);
      setConnected(false);
      setError('Ошибка при проверке подключения GitHub');
    } finally {
      setLoading(false);
    }
  };

  const loadRepositoryInfo = async () => {
    try {
      const repoInfo = await gitHubAPI.getProjectRepositoryInfo(projectId);
      setRepositoryInfo({
        name: repoInfo.name,
        url: repoInfo.url,
        branch: repoInfo.currentBranch,
        lastCommit: repoInfo.lastCommit
      });
      setCurrentBranch(repoInfo.currentBranch);
    } catch (err) {
      console.error('Error loading repository info:', err);
      setError('Ошибка при загрузке информации о репозитории');
    }
  };

  const loadGitStatus = async () => {
    try {
      const statusData = await gitHubAPI.getProjectGitStatus(projectId);
      setGitStatus(statusData.files || []);
    } catch (err) {
      console.error('Error loading git status:', err);
      setError('Ошибка при загрузке статуса Git');
    }
  };

  const loadBranches = async () => {
    try {
      const branchesData = await gitHubAPI.getProjectBranches(projectId);
      setBranches(branchesData || []);
    } catch (err) {
      console.error('Error loading branches:', err);
      setError('Ошибка при загрузке списка веток');
    }
  };

  const loadStashStatus = async () => {
    try {
      const stashStatus = await gitHubAPI.getStashStatus(projectId);
      setHasStash(stashStatus.hasStash || false);
    } catch (err) {
      console.error('Error loading stash status:', err);
      // Не показываем ошибку пользователю, просто предполагаем что stash нет
      setHasStash(false);
    }
  };

  const handleCommit = async () => {
    if (!commitMessage.trim()) {
      setError('Введите сообщение коммита');
      return;
    }

    try {
      setLoading(true);
      await gitHubAPI.createProjectCommit(projectId, commitMessage.trim());
      setSuccess('Коммит успешно создан');
      setCommitMessage('');
      setCommitDialogOpen(false);
      loadGitStatus(); // Обновляем статус
      loadRepositoryInfo(); // Обновляем информацию о последнем коммите
    } catch (err) {
      console.error('Error creating commit:', err);
      setError('Ошибка при создании коммита: ' + (err.message || 'Неизвестная ошибка'));
    } finally {
      setLoading(false);
    }
  };

  const handlePush = async () => {
    try {
      setLoading(true);
      await gitHubAPI.pushProjectChanges(projectId, currentBranch);
      setSuccess('Изменения успешно отправлены в удаленный репозиторий');
      loadGitStatus(); // Обновляем статус
    } catch (err) {
      console.error('Error pushing changes:', err);
      setError('Ошибка при отправке изменений: ' + (err.message || 'Неизвестная ошибка'));
    } finally {
      setLoading(false);
    }
  };

  const handlePull = async () => {
    try {
      setLoading(true);
      await gitHubAPI.pullProjectChanges(projectId, currentBranch);
      setSuccess('Изменения успешно получены из удаленного репозитория');
      loadGitStatus();
      loadRepositoryInfo(); // Обновляем информацию о последнем коммите
    } catch (err) {
      console.error('Error pulling changes:', err);
      setError('Ошибка при получении изменений: ' + (err.message || 'Неизвестная ошибка'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBranch = async () => {
    if (!newBranchName.trim()) {
      setError('Введите название ветки');
      return;
    }

    try {
      setLoading(true);
      await gitHubAPI.createProjectBranch(projectId, newBranchName.trim(), currentBranch);
      setSuccess(`Ветка "${newBranchName}" успешно создана и переключена`);
      setCurrentBranch(newBranchName.trim());
      setNewBranchName('');
      setBranchDialogOpen(false);
      loadRepositoryInfo(); // Обновляем информацию о текущей ветке
      loadBranches(); // Обновляем список веток
    } catch (err) {
      console.error('Error creating branch:', err);
      setError('Ошибка при создании ветки: ' + (err.message || 'Неизвестная ошибка'));
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchBranch = async () => {
    if (!selectedBranch || selectedBranch === currentBranch) {
      setError('Выберите другую ветку для переключения');
      return;
    }

    try {
      setLoading(true);
      await gitHubAPI.switchProjectBranch(projectId, selectedBranch);
      setSuccess(`Успешно переключились на ветку "${selectedBranch}"`);
      setCurrentBranch(selectedBranch);
      setSelectedBranch('');
      setSwitchBranchDialogOpen(false);
      loadRepositoryInfo(); // Обновляем информацию о текущей ветке
      loadGitStatus(); // Обновляем статус файлов
    } catch (err) {
      console.error('Error switching branch:', err);
      setError('Ошибка при переключении ветки: ' + (err.message || 'Неизвестная ошибка'));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Вы уверены, что хотите сбросить все изменения к последнему коммиту? Это действие удалит все несохраненные изменения и нельзя отменить.')) {
      return;
    }

    try {
      setLoading(true);
      await gitHubAPI.resetProjectChanges(projectId, true); // hard reset
      setSuccess('Все изменения сброшены к последнему коммиту');
      loadGitStatus(); // Обновляем статус файлов
      loadRepositoryInfo(); // Обновляем информацию о репозитории
    } catch (err) {
      console.error('Error resetting changes:', err);
      setError('Ошибка при сбросе изменений: ' + (err.message || 'Неизвестная ошибка'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'modified': return 'warning';
      case 'added': return 'success';
      case 'deleted': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'modified': return <InfoIcon />;
      case 'added': return <AddIcon />;
      case 'deleted': return <RemoveIcon />;
      default: return <InfoIcon />;
    }
  };

  if (loading && !connected) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!connected) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          GitHub не подключен. Настройте подключение в разделе GitHub.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert 
          severity="success" 
          sx={{ mb: 2 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      {/* Repository Info */}
      {repositoryInfo && (
        <Card sx={{ mb: 2 }}>
          <CardHeader
            avatar={<GitHubIcon />}
            title={repositoryInfo.name}
            subheader={`Ветка: ${currentBranch}`}
            action={
              <Tooltip title="Обновить">
                <IconButton onClick={() => { loadRepositoryInfo(); loadGitStatus(); }}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            }
          />
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Последний коммит: {repositoryInfo.lastCommit.message}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {repositoryInfo.lastCommit.author} • {new Date(repositoryInfo.lastCommit.date).toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Git Actions */}
      <Card sx={{ mb: 2 }}>
        <CardHeader title="Действия Git" />
        <CardContent>
          <Stack spacing={1}>
            <Button
              variant="contained"
              startIcon={<CommitIcon />}
              onClick={() => setCommitDialogOpen(true)}
              disabled={gitStatus.length === 0}
              fullWidth
            >
              Коммит
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<PushIcon />}
              onClick={handlePush}
              disabled={loading}
              fullWidth
            >
              Push
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<PullIcon />}
              onClick={handlePull}
              disabled={loading}
              fullWidth
            >
              Pull
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<SwitchIcon />}
              onClick={() => setSwitchBranchDialogOpen(true)}
              disabled={loading || branches.length <= 1}
              fullWidth
              color={branches.length <= 1 ? "inherit" : "primary"}
              title={branches.length <= 1 ? "No other branches available" : "Switch to another branch"}
            >
              Switch Branch {branches.length > 1 && `(${branches.length - 1})`}
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<BranchIcon />}
              onClick={() => setBranchDialogOpen(true)}
              fullWidth
            >
              Создать ветку
            </Button>

            <Button
              variant="outlined"
              startIcon={<ResetIcon />}
              onClick={handleReset}
              disabled={loading}
              fullWidth
              color="error"
              title="Сбросить все изменения к последнему коммиту (git reset --hard)"
            >
              Reset Changes
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<SyncIcon />}
              onClick={() => { loadRepositoryInfo(); loadGitStatus(); loadBranches(); }}
              disabled={loading}
              fullWidth
            >
              Синхронизировать
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Git Status */}
      <Card>
        <CardHeader title={`Статус файлов (${gitStatus.length})`} />
        <CardContent>
          {gitStatus.length === 0 ? (
            <Typography color="text.secondary">
              Нет изменений для коммита
            </Typography>
          ) : (
            <List dense>
              {gitStatus.map((item, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    {getStatusIcon(item.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.file}
                    secondary={
                      <Chip 
                        label={item.status}
                        size="small"
                        color={getStatusColor(item.status)}
                      />
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Commit Dialog */}
      <Dialog open={commitDialogOpen} onClose={() => setCommitDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Создать коммит</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Сообщение коммита"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            placeholder="Опишите ваши изменения..."
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Будет закоммичено файлов: {gitStatus.length}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommitDialogOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleCommit} variant="contained">
            Создать коммит
          </Button>
        </DialogActions>
      </Dialog>

      {/* Switch Branch Dialog */}
      <Dialog open={switchBranchDialogOpen} onClose={() => setSwitchBranchDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Переключиться на ветку</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Выберите ветку</InputLabel>
            <Select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              label="Выберите ветку"
            >
              {branches
                .filter(branch => branch.name !== currentBranch)
                .map(branch => (
                  <MenuItem key={branch.name} value={branch.name}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BranchIcon fontSize="small" />
                      <Box>
                        <Typography variant="body2">
                          {branch.name}
                          {branch.isRemote && (
                            <Chip 
                              label="remote" 
                              size="small" 
                              color="info" 
                              sx={{ ml: 1, height: 16, fontSize: '0.7em' }}
                            />
                          )}
                        </Typography>
                        {branch.lastCommit && (
                          <Typography variant="caption" color="text.secondary">
                            {branch.lastCommit.message}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </MenuItem>
                ))
              }
            </Select>
          </FormControl>
          {selectedBranch && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Текущая ветка: <strong>{currentBranch}</strong> → <strong>{selectedBranch}</strong>
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSwitchBranchDialogOpen(false)}>
            Отмена
          </Button>
          <Button 
            onClick={handleSwitchBranch} 
            variant="contained"
            disabled={!selectedBranch || selectedBranch === currentBranch}
          >
            Переключиться
          </Button>
        </DialogActions>
      </Dialog>

      {/* Branch Dialog */}
      <Dialog open={branchDialogOpen} onClose={() => setBranchDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Создать новую ветку</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название ветки"
            fullWidth
            variant="outlined"
            value={newBranchName}
            onChange={(e) => setNewBranchName(e.target.value)}
            placeholder="feature/new-feature"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBranchDialogOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleCreateBranch} variant="contained">
            Создать
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GitActions;
