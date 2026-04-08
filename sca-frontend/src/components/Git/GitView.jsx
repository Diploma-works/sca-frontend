import React, { useEffect, useState } from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Stack,
    TextField,
    Typography,
    useColorScheme
} from '@mui/material';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import {
    Add as AddIcon,
    CallSplit as BranchIcon,
    Cancel as CancelIcon,
    CheckCircle as CheckCircleIcon,
    Commit as CommitIcon,
    DeleteForever as ResetIcon,
    Download as PullIcon,
    History as HistoryIcon,
    Info as InfoIcon,
    Merge as MergeIcon,
    Restore as RestoreIcon,
    SwapHoriz as SwitchIcon,
    Sync as SyncIcon,
    Upload as PushIcon
} from '@mui/icons-material';
import { ScrollableContainer } from '@/components';
import { api, gitHubAPI } from '@/utils/api';
import './GitView.css';

const GitView = (props) => {
    const { mode } = useColorScheme();
    const [branches, setBranches] = useState({ local: [], remote: [], current: '' });
    const [graphData, setGraphData] = useState({ commits: [], total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [limit, setLimit] = useState(20);

    // Git Actions states
    const [connected, setConnected] = useState(false);
    const [gitStatus, setGitStatus] = useState([]);
    const [commitMessage, setCommitMessage] = useState('');
    const [success, setSuccess] = useState(null);
    const [commitDialogOpen, setCommitDialogOpen] = useState(false);
    const [hasStash, setHasStash] = useState(false);
    const [branchDialogOpen, setBranchDialogOpen] = useState(false);
    const [switchBranchDialogOpen, setSwitchBranchDialogOpen] = useState(false);
    const [newBranchName, setNewBranchName] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('');

    const { projectId } = props;

    console.log('GitView - Received projectId:', projectId); // Отладочная информация

    useEffect(() => {
        console.log('GitView - useEffect triggered with projectId:', projectId); // Отладочная информация
        if (projectId) {
            fetchData();
        } else {
            console.log('GitView - No projectId provided, not fetching data'); // Отладочная информация
            setLoading(false);
            setError('No project selected');
        }
    }, [projectId, limit]);

    const fetchRemoteBranches = async () => {
        if (!projectId) return;

        try {
            // Force fetch remote branches
            console.log('Fetching remote branches for project:', projectId);
            setLoading(true);
            const branchesResponse = await api.projectAPI.getBranches(projectId);
            setBranches(prev => ({
                ...prev,
                remote: branchesResponse?.remote || []
            }));
            console.log('Remote branches updated:', branchesResponse?.remote);
        } catch (err) {
            console.error('Error fetching remote branches:', err);
            setError('Failed to fetch remote branches: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchData = async () => {
        try {
            console.log('GitView - fetchData started for projectId:', projectId); // Отладочная информация
            setLoading(true);
            setError(null);

            console.log('GitView - Making API calls...'); // Отладочная информация
            const [branchesResponse, graphResponse] = await Promise.all([
                api.projectAPI.getBranches(projectId),
                api.projectAPI.getBranchGraph(projectId, limit)
            ]);

            console.log('GitView - API calls completed'); // Отладочная информация
            console.log('Branches response:', branchesResponse); // Отладочная информация
            console.log('Graph response:', graphResponse); // Отладочная информация

            // Детальное логирование веток
            console.log('Local branches count:', branchesResponse?.local?.length || 0);
            console.log('Remote branches count:', branchesResponse?.remote?.length || 0);
            console.log('Local branches:', branchesResponse?.local);
            console.log('Remote branches:', branchesResponse?.remote);

            // Извлекаем ветки из данных коммитов для более полного списка
            const extractBranchesFromCommits = (commits) => {
                if (!commits || !Array.isArray(commits)) return [];

                const branchNames = new Set();

                // Ищем merge коммиты для определения веток
                const mergeCommitIndex = commits.findIndex(c =>
                    c.message && typeof c.message === 'string' &&
                    c.message.toLowerCase().includes('merge')
                );

                if (mergeCommitIndex !== -1) {
                    const mergeCommit = commits[mergeCommitIndex];

                    // Извлекаем название ветки из сообщения merge
                    const message = mergeCommit.message.toLowerCase();
                    const branchPatterns = [
                        /merge pull request #\d+ from \w+\/(\w+)/,
                        /merge.*branch\s+'([^']+)'/,
                        /merge.*from\s+([^\s/]+)$/,
                        /merge\s+([^\s]+)\s+into/
                    ];

                    let mergedBranchName = null;
                    for (const pattern of branchPatterns) {
                        const match = message.match(pattern);
                        if (match && match[1]) {
                            mergedBranchName = match[1];
                            break;
                        }
                    }

                    if (mergedBranchName && mergedBranchName !== 'main') {
                        branchNames.add(`origin/${mergedBranchName}`);
                    }
                }

                return Array.from(branchNames).map(branchName => ({
                    name: branchName,
                    commit: 'detected',
                    message: 'Branch detected from commit history'
                }));
            };

            // Получаем дополнительные ветки из истории коммитов
            const branchesFromCommits = extractBranchesFromCommits(graphResponse?.commits || graphResponse || []);
            console.log('Branches extracted from commits:', branchesFromCommits);

            // Объединяем physical remote ветки с ветками из истории коммитов
            const existingRemoteBranches = Array.isArray(branchesResponse?.remote) ? branchesResponse.remote : [];
            const existingBranchNames = new Set(existingRemoteBranches.map(b => b.name || b));

            const additionalRemoteBranches = branchesFromCommits.filter(branch =>
                !existingBranchNames.has(branch.name)
            );

            // Убеждаемся, что структура данных корректна
            const normalizedBranches = {
                local: Array.isArray(branchesResponse?.local) ? branchesResponse.local : [],
                remote: [...existingRemoteBranches, ...additionalRemoteBranches],
                current: branchesResponse?.current || ''
            };

            console.log('Final remote branches (physical + from commits):', normalizedBranches.remote);
            console.log('Normalized branches:', normalizedBranches);
            setBranches(normalizedBranches);
            const normalizedGraph = {
                commits: graphResponse?.commits || graphResponse || [],
                total: graphResponse?.total || (graphResponse?.commits ? graphResponse.commits.length : 0)
            };
            setGraphData(normalizedGraph);
            setError(null);
            console.log('GitView - Data fetched successfully'); // Отладочная информация
        } catch (err) {
            console.error('GitView - Error fetching git data:', err); // Отладочная информация
            console.error('GitView - Error details:', {
                message: err.message,
                status: err.status,
                response: err.response
            }); // Отладочная информация

            // Проверяем, является ли это ошибкой "Project not found"
            if (err.message && err.message.includes('Project not found')) {
                setError('Project not found. Please select a valid project from the Projects tab.');
            } else {
                setError('Failed to fetch git data: ' + (err.message || 'Unknown error'));
            }
        } finally {
            console.log('GitView - fetchData completed, setting loading to false'); // Отладочная информация
            setLoading(false);
        }
    };

    // Git Actions functions
    const checkGitHubConnection = async () => {
        try {
            const response = await gitHubAPI.getStatus();
            setConnected(response.connected);
        } catch (err) {
            console.error('Error checking GitHub connection:', err);
            setConnected(false);
        }
    };

    const loadGitStatus = async () => {
        if (!projectId) return;

        try {
            const statusData = await gitHubAPI.getProjectGitStatus(projectId);
            setGitStatus(statusData.files || []);
        } catch (err) {
            console.error('Error loading git status:', err);
            setGitStatus([]);
        }
    };

    const loadStashStatus = async () => {
        if (!projectId) return;

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
            loadGitStatus();
            fetchData(); // Обновляем граф
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
            await gitHubAPI.pushProjectChanges(projectId, branches.current || 'main');
            setSuccess('Изменения успешно отправлены в удаленный репозиторий');
            loadGitStatus();
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
            await gitHubAPI.pullProjectChanges(projectId, branches.current || 'main');
            setSuccess('Изменения успешно загружены из удаленного репозитория');
            fetchData(); // Обновляем данные после pull
        } catch (err) {
            console.error('Error pulling changes:', err);
            setError('Ошибка при загрузке изменений: ' + (err.message || 'Неизвестная ошибка'));
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
            await gitHubAPI.createProjectBranch(projectId, newBranchName.trim());
            setSuccess(`Ветка "${newBranchName}" успешно создана`);
            setNewBranchName('');
            setBranchDialogOpen(false);
            fetchData(); // Обновляем список веток
        } catch (err) {
            console.error('Error creating branch:', err);
            setError('Ошибка при создании ветки: ' + (err.message || 'Неизвестная ошибка'));
        } finally {
            setLoading(false);
        }
    };

    // Additional Git Actions
    const handleStash = async () => {
        try {
            setLoading(true);
            const result = await gitHubAPI.stashProjectChanges(projectId);
            if (result.success) {
                setSuccess('Изменения успешно отложены (stashed)');
                loadGitStatus();
                loadStashStatus();
            } else {
                setError(result.message || 'Нет изменений для откладывания');
            }
        } catch (err) {
            console.error('Error stashing changes:', err);
            setError('Ошибка при откладывании изменений: ' + (err.message || 'Неизвестная ошибка'));
        } finally {
            setLoading(false);
        }
    };

    const handleStashPop = async () => {
        try {
            setLoading(true);
            const result = await gitHubAPI.stashPopProjectChanges(projectId);
            if (result.success) {
                setSuccess('Отложенные изменения успешно применены');
                loadGitStatus();
                loadStashStatus();
                fetchData();
            } else {
                setError(result.message || 'Нет отложенных изменений для применения');
            }
        } catch (err) {
            console.error('Error applying stashed changes:', err);
            setError('Ошибка при применении отложенных изменений: ' + (err.message || 'Неизвестная ошибка'));
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async () => {
        if (!window.confirm('Вы уверены, что хотите сбросить все изменения к последнему коммиту?\n\n⚠️ ВНИМАНИЕ: Это действие удалит:\n• Все измененные tracked файлы\n• Все untracked файлы\n• Все staged изменения\n\nЭто действие необратимо!')) {
            return;
        }

        try {
            setLoading(true);
            await gitHubAPI.resetProjectChanges(projectId, true); // hard reset
            setSuccess('Все изменения сброшены к последнему коммиту');
            loadGitStatus();
            fetchData();
        } catch (err) {
            console.error('Error resetting changes:', err);
            setError('Ошибка при сбросе изменений: ' + (err.message || 'Неизвестная ошибка'));
        } finally {
            setLoading(false);
        }
    };

    const handleMergeBranch = async () => {
        const branchToMerge = prompt('Введите название ветки для слияния:');
        if (!branchToMerge?.trim()) {
            return;
        }

        try {
            setLoading(true);
            await gitHubAPI.mergeProjectBranch(projectId, branchToMerge.trim());
            setSuccess(`Ветка "${branchToMerge}" успешно объединена с текущей веткой`);
            fetchData();
        } catch (err) {
            console.error('Error merging branch:', err);
            setError('Ошибка при слиянии ветки: ' + (err.message || 'Неизвестная ошибка'));
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'added':
            case 'A':
                return <AddIcon color="success"/>;
            case 'modified':
            case 'M':
                return <InfoIcon color="info"/>;
            case 'deleted':
            case 'D':
                return <CancelIcon color="error"/>;
            default:
                return <CheckCircleIcon/>;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'added':
            case 'A':
                return 'success';
            case 'modified':
            case 'M':
                return 'info';
            case 'deleted':
            case 'D':
                return 'error';
            default:
                return 'default';
        }
    };

    // Load Git Actions data when component mounts
    useEffect(() => {
        if (projectId) {
            checkGitHubConnection();
            loadGitStatus();
            loadStashStatus();
        }
    }, [projectId]);

    const switchBranch = async (branchName) => {
        try {
            await api.projectAPI.switchBranch(projectId, { branchName });
            fetchData();
        } catch (err) {
            console.error('Error switching branch:', err);
            setError('Failed to switch branch: ' + (err.message || 'Unknown error'));
        }
    };

    const handleSwitchBranch = async () => {
        if (!selectedBranch || selectedBranch === branches.current) {
            setError('Выберите другую ветку для переключения');
            return;
        }

        try {
            setLoading(true);
            await gitHubAPI.switchProjectBranch(projectId, selectedBranch);
            setSuccess(`Успешно переключились на ветку "${selectedBranch}"`);
            setSelectedBranch('');
            setSwitchBranchDialogOpen(false);
            fetchData(); // Обновляем данные
            loadGitStatus(); // Обновляем статус
        } catch (err) {
            console.error('Error switching branch:', err);
            setError('Ошибка при переключении ветки: ' + (err.message || 'Неизвестная ошибка'));
        } finally {
            setLoading(false);
        }
    };

    const parseCommitData = (commits, branchesData) => {
        if (!commits || !Array.isArray(commits) || commits.length === 0) {
            return { commits: [], totalBranches: 1 };
        }

        console.log('Parsing commits:', commits);
        console.log('Branches data:', branchesData);

        // Анализируем Git граф символы для правильного определения структуры веток
        const allBranches = new Set(['main']); // Всегда есть main ветка
        const branchMap = new Map();
        branchMap.set('main', 0);
        let nextTrack = 1;

        // Анализируем Git граф из commit.graph для определения активных веток
        commits.forEach((commit, index) => {
            if (commit.graph) {
                console.log(`Commit ${index}: ${commit.shortHash} - Graph: "${commit.graph}"`);
            }
        });

        // Определяем ветки из refs информации и устанавливаем фиксированные треки
        branchMap.set('main', 0); // main всегда трек 0

        commits.forEach((commit, index) => {
            if (commit.refs && commit.refs.trim()) {
                const refs = commit.refs.split(',').map(ref => ref.trim());
                refs.forEach(ref => {
                    // Извлекаем имена веток из refs
                    if (ref.includes('->')) {
                        // HEAD -> branch_name или origin/branch -> branch
                        const parts = ref.split('->').map(p => p.trim());
                        if (parts.length > 1) {
                            const branchName = parts[1];
                            if (branchName && !branchName.includes('tag:') && !branchName.includes('origin/HEAD')) {
                                allBranches.add(branchName);
                                if (!branchMap.has(branchName)) {
                                    branchMap.set(branchName, branchName === 'main' ? 0 : nextTrack++);
                                }
                            }
                        }
                    } else if (!ref.includes('tag:') && !ref.includes('origin/HEAD')) {
                        // Простое имя ветки
                        const branchName = ref.replace('origin/', '').trim();
                        if (branchName && branchName !== 'HEAD' && branchName.length > 0) {
                            allBranches.add(branchName);
                            if (!branchMap.has(branchName)) {
                                branchMap.set(branchName, branchName === 'main' ? 0 : nextTrack++);
                            }
                        }
                    }
                });
            }
        });

        // Ищем merge коммиты для определения дополнительных веток
        commits.forEach((commit, index) => {
            if (commit.message && typeof commit.message === 'string' &&
                commit.message.toLowerCase().includes('merge')) {
                console.log('Found merge commit:', commit);

                // Извлекаем название ветки из сообщения merge
                const message = commit.message.toLowerCase();
                const branchPatterns = [
                    /merge pull request #\d+ from \w+\/(\w+)/,
                    /merge.*branch\s+'([^']+)'/,
                    /merge.*from\s+([^\s/]+)$/,
                    /merge\s+([^\s]+)\s+into/
                ];

                let mergedBranchName = null;
                for (const pattern of branchPatterns) {
                    const match = message.match(pattern);
                    if (match && match[1]) {
                        mergedBranchName = match[1];
                        break;
                    }
                }

                if (mergedBranchName && !branchMap.has(mergedBranchName)) {
                    allBranches.add(mergedBranchName);
                    branchMap.set(mergedBranchName, nextTrack++);
                    console.log(`Detected merged branch from message: ${mergedBranchName}`);
                }
            }
        });

        console.log('All detected branches:', Array.from(allBranches));
        console.log('Branch to track mapping:', Array.from(branchMap.entries()));

        // Анализируем коммиты и назначаем им правильные треки на основе граф символов
        const parsedCommits = commits.map((commit, index) => {
            let branchTrack = 0; // По умолчанию main
            let branchName = 'main';

            // Анализируем graph символы для определения трека
            if (commit.graph) {
                const graph = commit.graph;

                // Улучшенная логика определения трека по граф символам
                // Считаем количество символов до * включая пробелы и |
                // Примеры:
                // "* " -> track 0 (main)
                // "| * " -> track 1 (feature branch) 
                // "| | * " -> track 2 (another branch)
                // "*   " merge commit в main -> track 0
                // "|\  " -> track 0 (после merge)

                let trackPosition = 0;
                const asteriskIndex = graph.indexOf('*');

                if (asteriskIndex !== -1) {
                    // Подсчитываем количество | символов перед *
                    const beforeAsterisk = graph.substring(0, asteriskIndex);
                    trackPosition = (beforeAsterisk.match(/\|/g) || []).length;

                    // Особый случай для merge коммитов
                    if (graph.includes('*   ') || graph.includes('*  ')) {
                        // Merge коммит всегда в основной ветке (track 0)
                        trackPosition = 0;
                    }
                }

                branchTrack = trackPosition;
                console.log(`Graph "${graph}" -> track ${trackPosition} (asterisk at ${asteriskIndex})`);
            }

            // Определяем имя ветки приоритетно по refs, затем по граф позиции
            if (commit.refs && commit.refs.trim()) {
                const refs = commit.refs.split(',').map(ref => ref.trim());

                // Ищем текущую ветку (HEAD -> branch) - это самый точный индикатор
                const headRef = refs.find(ref => ref.includes('HEAD ->'));
                if (headRef) {
                    const match = headRef.match(/HEAD\s*->\s*([^\s,]+)/);
                    if (match && match[1]) {
                        branchName = match[1];
                        branchTrack = branchMap.get(branchName) || 0;
                    }
                } else {
                    // Ищем любую не-tag ветку в refs
                    const branchRefs = refs.filter(ref =>
                        !ref.includes('tag:') &&
                        !ref.includes('origin/HEAD') &&
                        ref.trim().length > 0
                    );

                    if (branchRefs.length > 0) {
                        // Приоритет: main > остальные ветки
                        let selectedRef = branchRefs.find(ref => ref.includes('main')) || branchRefs[0];
                        let cleanBranchName = selectedRef.replace('origin/', '').trim();

                        if (cleanBranchName) {
                            branchName = cleanBranchName;
                            branchTrack = branchMap.get(branchName) || 0;
                        }
                    }
                }
            } else {
                // Если нет refs, пытаемся определить по граф позиции и merge commit'ам
                if (branchTrack > 0) {
                    // Ищем merge commit чтобы определить имя ветки
                    let foundBranchName = null;

                    // Проверяем ближайшие merge commit'ы
                    for (let i = Math.max(0, index - 3); i <= Math.min(commits.length - 1, index + 3); i++) {
                        const nearCommit = commits[i];
                        if (nearCommit.message && nearCommit.message.toLowerCase().includes('merge')) {
                            const mergeMessage = nearCommit.message.toLowerCase();
                            const branchPatterns = [
                                /merge pull request #\d+ from \w+\/(\w+)/,
                                /merge.*branch\s+'([^']+)'/,
                                /merge.*from\s+([^\s/]+)$/
                            ];

                            for (const pattern of branchPatterns) {
                                const match = mergeMessage.match(pattern);
                                if (match && match[1]) {
                                    foundBranchName = match[1];
                                    break;
                                }
                            }
                            if (foundBranchName) break;
                        }
                    }

                    if (foundBranchName) {
                        branchName = foundBranchName;
                        allBranches.add(branchName);
                        if (!branchMap.has(branchName)) {
                            branchMap.set(branchName, branchTrack);
                        }
                    } else {
                        // Fallback: создаем generic имя ветки
                        branchName = `feature-track-${branchTrack}`;
                        allBranches.add(branchName);
                        branchMap.set(branchName, branchTrack);
                    }
                } else {
                    // track 0 без refs = main
                    branchName = 'main';
                    branchTrack = 0;
                }
            }

            console.log(`Commit ${index}: ${commit.shortHash} -> track ${branchTrack} (${branchName})`);

            return {
                ...commit,
                id: commit.shortHash || commit.hash?.substring(0, 7) || `commit-${index}`,
                branchTrack: branchTrack,
                date: new Date(commit.date || Date.now()),
                branches: [branchName],
                branchName: branchName,
                author: commit.author || 'Unknown',
                message: commit.message || 'No message'
            };
        });

        console.log('Final branch mapping:', Array.from(branchMap.entries()));
        console.log('Total branches detected:', allBranches.size);
        console.log('All branches:', Array.from(allBranches));
        console.log('Parsed commits with correct tracks:', parsedCommits.map(c => ({
            id: c.id,
            branchTrack: c.branchTrack,
            branchName: c.branchName,
            message: c.message?.substring(0, 50)
        })));

        // Проверяем, что у нас есть коммиты с разными branchTrack
        const uniqueTracks = [...new Set(parsedCommits.map(c => c.branchTrack))];
        console.log('Unique branch tracks:', uniqueTracks);
        console.log('Should render', uniqueTracks.length, 'visual tracks');

        return {
            commits: parsedCommits,
            totalBranches: allBranches.size
        };
    };

    const getBranchColor = (track) => {
        const colors = [
            '#3b82f6', // blue
            '#10b981', // emerald  
            '#f59e0b', // amber
            '#ef4444', // red
            '#8b5cf6', // violet
            '#06b6d4', // cyan
            '#84cc16'  // lime
        ];
        return colors[track % colors.length];
    };

    const renderBranchItem = (branch, isLocal = true) => {
        // Извлекаем имя ветки из объекта или используем как строку
        const branchName = typeof branch === 'object' ? (branch.name || branch.current || String(branch)) : String(branch);
        const branchKey = typeof branch === 'object' ? (branch.name || branch.current || JSON.stringify(branch)) : String(branch);

        return (
            <Box
                key={branchKey}
                sx={(theme) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1,
                    borderRadius: 1,
                    backgroundColor: branchName === branches.current ?
                        theme.palette.primary.main + '20' : 'transparent', // TODO: what's 20???
                })}
            >
                <Box
                    sx={(theme) => ({
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: branchName === branches.current ?
                            theme.vars.palette.primary.main : theme.vars.palette.text.secondary,
                        mr: 1
                    })}
                />
                <Typography
                    variant="body2"
                    sx={(theme) => ({
                        fontFamily: 'monospace',
                        fontWeight: branchName === branches.current ? 600 : 400,
                        color: branchName === branches.current ?
                            theme.vars.palette.primary.main : theme.vars.palette.text.primary
                    })}
                >
                    {branchName}
                </Typography>
                {branchName === branches.current && (
                    <Chip
                        label="current"
                        size="small"
                        color="primary"
                        sx={{ ml: 'auto', height: 20, fontSize: '0.7rem' }}
                    />
                )}
                {!isLocal && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                        remote
                    </Typography>
                )}
            </Box>
        );
    };

    // Константы для синхронизации высоты элементов
    const COMMIT_ITEM_HEIGHT = 72; // Высота одного элемента коммита (включая отступы)
    const COMMIT_ITEM_PADDING = 8; // Отступы между элементами

    const renderCommitGraph = (commits) => {
        if (!commits.length) return null;

        const { totalBranches } = parseCommitData(graphData.commits, branches);
        const TRACK_WIDTH = 20;
        const LEFT_MARGIN = 10;
        const GRAPH_WIDTH = Math.max(80, LEFT_MARGIN + totalBranches * TRACK_WIDTH + 15);

        return (
            <Box
                sx={(theme) => ({
                    width: GRAPH_WIDTH,
                    minHeight: commits.length * (COMMIT_ITEM_HEIGHT + COMMIT_ITEM_PADDING),
                    position: 'relative',
                    borderRight: `1px solid ${theme.vars.palette.divider}`,
                    backgroundColor: 'background.default',
                })}
            >
                <svg
                    width={GRAPH_WIDTH}
                    height={commits.length * (COMMIT_ITEM_HEIGHT + COMMIT_ITEM_PADDING)}
                    style={{ background: 'transparent', display: 'block' }}
                >
                    {/* Branch track lines */}
                    {Array.from({ length: totalBranches }).map((_, track) => (
                        <line
                            key={`branch-${track}`}
                            x1={LEFT_MARGIN + track * TRACK_WIDTH}
                            y1="0"
                            x2={LEFT_MARGIN + track * TRACK_WIDTH}
                            y2={commits.length * (COMMIT_ITEM_HEIGHT + COMMIT_ITEM_PADDING)}
                            stroke={getBranchColor(track)}
                            strokeWidth="2"
                            opacity="0.3"
                        />
                    ))}

                    {/* Commit nodes and connections */}
                    {commits.map((commit, index) => {
                        // Позиционируем точку в середине элемента коммита
                        const y = (COMMIT_ITEM_HEIGHT + COMMIT_ITEM_PADDING) * index + COMMIT_ITEM_HEIGHT / 2;
                        const x = LEFT_MARGIN + commit.branchTrack * TRACK_WIDTH;

                        return (
                            <g key={commit.fullHash || index}>
                                {/* Connection lines */}
                                {index < commits.length - 1 && (
                                    <>
                                        {/* Основная линия соединения */}
                                        <line
                                            x1={x}
                                            y1={y}
                                            x2={LEFT_MARGIN + commits[index + 1].branchTrack * TRACK_WIDTH}
                                            y2={(COMMIT_ITEM_HEIGHT + COMMIT_ITEM_PADDING) * (index + 1) + COMMIT_ITEM_HEIGHT / 2}
                                            stroke={getBranchColor(commit.branchTrack)}
                                            strokeWidth="2"
                                            opacity="0.8"
                                        />

                                        {/* Merge/branch curves */}
                                        {commit.branchTrack !== commits[index + 1].branchTrack && (
                                            <path
                                                d={`M ${x} ${y} 
                                                    C ${x} ${y + 15} 
                                                      ${LEFT_MARGIN + commits[index + 1].branchTrack * TRACK_WIDTH} ${y + 25} 
                                                      ${LEFT_MARGIN + commits[index + 1].branchTrack * TRACK_WIDTH} ${(COMMIT_ITEM_HEIGHT + COMMIT_ITEM_PADDING) * (index + 1) + COMMIT_ITEM_HEIGHT / 2}`}
                                                stroke={getBranchColor(commits[index + 1].branchTrack)}
                                                strokeWidth="2"
                                                fill="none"
                                                opacity="0.7"
                                                strokeDasharray={commit.message.toLowerCase().includes('merge') ? "0" : "4,2"}
                                            />
                                        )}
                                    </>
                                )}

                                {/* Commit node */}
                                <circle
                                    cx={x}
                                    cy={y}
                                    r={commit.message.toLowerCase().includes('merge') ? 7 : 5}
                                    fill={getBranchColor(commit.branchTrack)}
                                    stroke={mode === 'dark' ? '#1e293b' : '#ffffff'}
                                    strokeWidth="2"
                                />

                                {/* Merge indicator */}
                                {commit.message.toLowerCase().includes('merge') && (
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r="3"
                                        fill={mode === 'dark' ? '#1e293b' : '#ffffff'}
                                    />
                                )}
                            </g>
                        );
                    })}
                </svg>
            </Box>
        );
    };

    const renderCommitList = (commits) => {
        return (
            <Box sx={{ flex: 1 }}>
                {commits.map((commit, index) => (
                    <Box
                        key={commit.fullHash || index}
                        sx={(theme) => ({
                            height: COMMIT_ITEM_HEIGHT,
                            mb: COMMIT_ITEM_PADDING / 8, // Небольшой отступ между элементами
                            p: 1.5,
                            borderRadius: 1,
                            border: `1px solid ${theme.vars.palette.divider}`,
                            backgroundColor: 'background.paper',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            '&:hover': {
                                backgroundColor: 'action.hover',
                            },
                        })}
                    >
                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                            <Box
                                sx={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    backgroundColor: getBranchColor(commit.branchTrack),
                                }}
                            />
                            <Typography
                                variant="caption"
                                sx={{
                                    fontFamily: 'monospace',
                                    backgroundColor: 'action.selected',
                                    px: 0.5,
                                    py: 0.25,
                                    borderRadius: 0.5,
                                }}
                            >
                                {commit.id}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {commit.date.toLocaleDateString()}
                            </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                            {commit.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {commit.author}
                        </Typography>
                    </Box>
                ))}
            </Box>
        );
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height={200}>
                <Typography>Loading git data...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={2} textAlign="center">
                <Typography color="error" gutterBottom variant="body2">
                    ⚠️ {error}
                </Typography>
                {error.includes('Project not found') && (
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                        The selected project may have been deleted or you don't have access to it.
                        Please select the "logistic" project from the Projects tab to view Git data.
                    </Typography>
                )}
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 2 }}>
                    <button onClick={fetchData} style={{
                        padding: '6px 12px',
                        border: 'none',
                        borderRadius: '4px',
                        backgroundColor: 'primary.main',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                    }}>
                        🔄 Retry
                    </button>
                    {error.includes('Project not found') && (
                        <Typography
                            variant="caption"
                            sx={{
                                padding: '6px 12px',
                                backgroundColor: 'info.main',
                                color: 'white',
                                borderRadius: '4px',
                                cursor: 'default',
                                fontSize: '0.875rem'
                            }}
                        >
                            📁 Select "logistic" project
                        </Typography>
                    )}
                </Box>
            </Box>
        );
    }

    return (
        <ScrollableContainer style={{ flex: 1 }}>
            {/* Last Commit Info */}
            {graphData.commits && graphData.commits.length > 0 && (
                <Box sx={(theme) => ({
                    p: 2,
                    backgroundColor: 'background.paper',
                    borderBottom: `1px solid ${theme.vars.palette.divider}`,
                    mb: 2
                })}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Последний коммит
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                        <CommitIcon fontSize="small" color="action"/>
                        <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                            {graphData.commits[0].message || 'No message'}
                        </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={2} mt={1}>
                        <Typography variant="caption" color="text.secondary">
                            {graphData.commits[0].author || 'Unknown'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {graphData.commits[0].date ? new Date(graphData.commits[0].date).toLocaleString() : ''}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                            {graphData.commits[0].shortHash || graphData.commits[0].hash?.substring(0, 7)}
                        </Typography>
                    </Box>
                </Box>
            )}

            {/* Success/Error Messages */}
            {success && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            )}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Git Actions Section */}
            <Accordion
                defaultExpanded
                elevation={0}
                square
                disableGutters
                sx={{
                    '&::before': { display: 'none' },
                    backgroundColor: 'transparent',
                }}
            >
                <AccordionSummary
                    expandIcon={<KeyboardArrowRightRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }}/>}
                    sx={{
                        px: 1,
                        py: 4 / 8,
                        minHeight: 0,
                        '& .MuiAccordionSummary-expandIconWrapper': {
                            width: 16,
                            order: -1,
                            justifyContent: 'center',
                            transition: 'none',
                            '&.Mui-expanded': {
                                transform: 'rotate(90deg)',
                            },
                        },
                        '& .MuiAccordionSummary-content': {
                            m: 0,
                            gap: 1,
                            minWidth: 0,
                        },
                    }}
                >
                    <Typography noWrap variant="button" pl={1}>
                        Git Actions
                    </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{
                    py: 1,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1,
                }}>
                    <Stack spacing={1} sx={{ width: '100%' }}>
                        <Button
                            variant="outlined"
                            startIcon={<CommitIcon/>}
                            onClick={() => setCommitDialogOpen(true)}
                            disabled={loading || !connected || gitStatus.length === 0}
                            fullWidth
                        >
                            Commit ({gitStatus.length})
                        </Button>

                        <Button
                            variant="outlined"
                            startIcon={<PushIcon/>}
                            onClick={handlePush}
                            disabled={loading || !connected}
                            fullWidth
                        >
                            Push
                        </Button>

                        <Button
                            variant="outlined"
                            startIcon={<PullIcon/>}
                            onClick={handlePull}
                            disabled={loading || !connected}
                            fullWidth
                        >
                            Pull
                        </Button>

                        <Button
                            variant="outlined"
                            startIcon={<SwitchIcon/>}
                            onClick={() => setSwitchBranchDialogOpen(true)}
                            disabled={loading || !connected || branches.local.length <= 1}
                            fullWidth
                            color={branches.local.length <= 1 ? "inherit" : "primary"}
                            title={branches.local.length <= 1 ? "No other local branches available" : "Switch to another branch"}
                        >
                            Switch Branch {branches.local.length > 1 && `(${branches.local.length - 1})`}
                        </Button>

                        <Button
                            variant="outlined"
                            startIcon={<BranchIcon/>}
                            onClick={() => setBranchDialogOpen(true)}
                            disabled={loading || !connected}
                            fullWidth
                        >
                            Create Branch
                        </Button>

                        <Button
                            variant="outlined"
                            startIcon={<MergeIcon/>}
                            onClick={handleMergeBranch}
                            disabled={loading || !connected}
                            fullWidth
                        >
                            Merge Branch
                        </Button>

                        <Button
                            variant="outlined"
                            startIcon={<RestoreIcon/>}
                            onClick={handleStash}
                            disabled={loading || !connected || gitStatus.length === 0}
                            fullWidth
                            title={gitStatus.length === 0 ? "No changes to stash" : "Stash current changes"}
                        >
                            Stash Changes
                        </Button>

                        <Button
                            variant="outlined"
                            startIcon={<HistoryIcon/>}
                            onClick={handleStashPop}
                            disabled={loading || !connected || !hasStash}
                            fullWidth
                            color={hasStash ? "primary" : "inherit"}
                            title={hasStash ? "Apply stashed changes" : "No stash available"}
                        >
                            Apply Stash
                        </Button>

                        <Button
                            variant="outlined"
                            startIcon={<ResetIcon/>}
                            onClick={handleReset}
                            disabled={loading || !connected}
                            fullWidth
                            color="error"
                        >
                            Reset Changes
                        </Button>

                        <Button
                            variant="outlined"
                            startIcon={<SyncIcon/>}
                            onClick={() => {
                                fetchData();
                                loadGitStatus();
                                setSuccess('Данные Git обновлены');
                            }}
                            disabled={loading}
                            fullWidth
                            title="Refresh Git data (branches, commits, file status)"
                        >
                            Refresh Data
                        </Button>
                    </Stack>
                </AccordionDetails>
            </Accordion>

            {/* File Status Section */}
            <Accordion
                defaultExpanded
                elevation={0}
                square
                disableGutters
                sx={{
                    '&::before': { display: 'none' },
                    backgroundColor: 'transparent',
                }}
            >
                <AccordionSummary
                    expandIcon={<KeyboardArrowRightRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }}/>}
                    sx={{
                        px: 1,
                        py: 4 / 8,
                        minHeight: 0,
                        '& .MuiAccordionSummary-expandIconWrapper': {
                            width: 16,
                            order: -1,
                            justifyContent: 'center',
                            transition: 'none',
                            '&.Mui-expanded': {
                                transform: 'rotate(90deg)',
                            },
                        },
                        '& .MuiAccordionSummary-content': {
                            m: 0,
                            gap: 1,
                            minWidth: 0,
                        },
                    }}
                >
                    <Typography noWrap variant="button" pl={1}>
                        File Status ({gitStatus.length})
                    </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{
                    py: 1,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1,
                }}>
                    {gitStatus.length === 0 ? (
                        <Typography color="text.secondary" variant="body2" sx={{ p: 1 }}>
                            No changes to commit
                        </Typography>
                    ) : (
                        <List dense sx={{ width: '100%' }}>
                            {gitStatus.map((item, index) => (
                                <ListItem key={index} sx={{ px: 1 }}>
                                    <ListItemIcon sx={{ minWidth: 36 }}>
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
                </AccordionDetails>
            </Accordion>

            {/* Branches Section */}
            <Accordion
                defaultExpanded
                elevation={0}
                square
                disableGutters
                sx={{
                    '&::before': { display: 'none' },
                    backgroundColor: 'transparent',
                }}
            >
                <AccordionSummary
                    expandIcon={<KeyboardArrowRightRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }}/>}
                    sx={{
                        px: 1,
                        py: 4 / 8,
                        minHeight: 0,
                        '& .MuiAccordionSummary-expandIconWrapper': {
                            width: 16,
                            order: -1,
                            justifyContent: 'center',
                            transition: 'none',
                            '&.Mui-expanded': {
                                transform: 'rotate(90deg)',
                            },
                        },
                        '& .MuiAccordionSummary-content': {
                            m: 0,
                            gap: 1,
                            minWidth: 0,
                        },
                    }}
                >
                    <Typography noWrap variant="button" pl={1}>
                        Branches
                    </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{
                    py: 1,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1,
                }}>
                    <Stack spacing={1} sx={{ width: '100%' }}>
                        {branches.local.length > 0 && (
                            <>
                                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ px: 1 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                                        Local Branches ({branches.local.length})
                                    </Typography>
                                    {/* Кнопка обновления локальных веток удалена */}
                                </Box>
                                {branches.local.map(branch => renderBranchItem(branch, true))}
                            </>
                        )}

                        {branches.remote.length > 0 ? (
                            <>
                                {branches.local.length > 0 && <Divider sx={{ my: 1 }}/>}
                                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ px: 1 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                                        Remote Branches ({branches.remote.length})
                                    </Typography>
                                    {/* Кнопка обновления remote веток удалена */}
                                </Box>
                                {branches.remote.map(branch => renderBranchItem(branch, false))}
                            </>
                        ) : (
                            <>
                                {branches.local.length > 0 && <Divider sx={{ my: 1 }}/>}
                                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ px: 1 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Remote Branches (0) - No remote branches found
                                    </Typography>
                                    {/* Кнопка обновления remote веток (🔄🌐) удалена */}
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ px: 1, fontStyle: 'italic' }}>
                                    Try clicking the refresh button to fetch all remote branches.
                                </Typography>
                            </>
                        )}
                    </Stack>
                </AccordionDetails>
            </Accordion>

            {/* History Section */}
            <Accordion
                defaultExpanded
                elevation={0}
                square
                disableGutters
                sx={{
                    '&::before': { display: 'none' },
                    backgroundColor: 'transparent',
                }}
            >
                <AccordionSummary
                    expandIcon={<KeyboardArrowRightRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }}/>}
                    sx={{
                        px: 1,
                        py: 4 / 8,
                        minHeight: 0,
                        '& .MuiAccordionSummary-expandIconWrapper': {
                            width: 16,
                            order: -1,
                            justifyContent: 'center',
                            transition: 'none',
                            '&.Mui-expanded': {
                                transform: 'rotate(90deg)',
                            },
                        },
                        '& .MuiAccordionSummary-content': {
                            m: 0,
                            gap: 1,
                            minWidth: 0,
                        },
                    }}
                >
                    <Typography noWrap variant="button" pl={1}>
                        History
                    </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 2 }}>
                    {(() => {
                        const { commits } = parseCommitData(graphData.commits, branches);
                        return (
                            <Box sx={{ display: 'flex', height: '100%' }}>
                                {/* Visual Graph */}
                                {renderCommitGraph(commits)}
                                {/* Commit List */}
                                {renderCommitList(commits)}
                            </Box>
                        );
                    })()}
                </AccordionDetails>
            </Accordion>

            {/* Commit Dialog */}
            <Dialog open={commitDialogOpen} onClose={() => setCommitDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create Commit</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Commit Message"
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        value={commitMessage}
                        onChange={(e) => setCommitMessage(e.target.value)}
                        placeholder="Describe your changes..."
                        sx={{ mt: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Files to commit: {gitStatus.length}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCommitDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleCommit} variant="contained" disabled={loading || !commitMessage.trim()}>
                        {loading ? <CircularProgress size={20}/> : 'Create Commit'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Branch Dialog */}
            <Dialog open={branchDialogOpen} onClose={() => setBranchDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Branch</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Branch Name"
                        fullWidth
                        variant="outlined"
                        value={newBranchName}
                        onChange={(e) => setNewBranchName(e.target.value)}
                        placeholder="feature/new-feature"
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setBranchDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreateBranch} variant="contained"
                            disabled={loading || !newBranchName.trim()}>
                        {loading ? <CircularProgress size={20}/> : 'Create Branch'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Switch Branch Dialog */}
            <Dialog open={switchBranchDialogOpen} onClose={() => setSwitchBranchDialogOpen(false)} maxWidth="sm"
                    fullWidth>
                <DialogTitle>Переключиться на ветку</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Текущая ветка: <strong>{branches.current}</strong>
                        </Typography>
                        <Alert severity="info" sx={{ mb: 2 }}>
                            💡 Переключение возможно только на локальные ветки. Для работы с remote ветками сначала
                            создайте локальную копию.
                        </Alert>
                        <TextField
                            select
                            fullWidth
                            label="Выберите ветку"
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                            SelectProps={{ native: true }}
                        >
                            <option value="">-- Выберите ветку --</option>
                            {branches.local
                                .filter(branch => {
                                    // Извлекаем имя ветки из объекта или используем как строку
                                    const branchName = typeof branch === 'object' ? (branch.name || branch.current || String(branch)) : String(branch);
                                    return branchName !== branches.current;
                                })
                                .map(branch => {
                                    // Извлекаем имя ветки из объекта или используем как строку  
                                    const branchName = typeof branch === 'object' ? (branch.name || branch.current || String(branch)) : String(branch);
                                    return (
                                        <option key={branchName} value={branchName}>
                                            {branchName}
                                        </option>
                                    );
                                })
                            }
                        </TextField>
                        {selectedBranch && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Переключение: <strong>{branches.current}</strong> → <strong>{selectedBranch}</strong>
                            </Typography>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSwitchBranchDialogOpen(false)}>
                        Отмена
                    </Button>
                    <Button
                        onClick={handleSwitchBranch}
                        variant="contained"
                        disabled={loading || !selectedBranch || selectedBranch === branches.current}
                    >
                        {loading ? <CircularProgress size={20}/> : 'Переключиться'}
                    </Button>
                </DialogActions>
            </Dialog>
        </ScrollableContainer>
    );
};

export default GitView;
