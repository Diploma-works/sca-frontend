import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Stack, 
    Typography, 
    useTheme, 
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Chip,
    Divider,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField
} from '@mui/material';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import {
    Commit as CommitIcon,
    Upload as PushIcon,
    Download as PullIcon,
    CallSplit as BranchIcon,
    Sync as SyncIcon,
    Add as AddIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Info as InfoIcon,
    Restore as RestoreIcon,
    DeleteForever as ResetIcon,
    Merge as MergeIcon,
    History as HistoryIcon,
    SwapHoriz as SwitchIcon
} from '@mui/icons-material';
import ScrollableContainer from '../ScrollableContainer';
import { api, gitHubAPI, projectGitAPI } from '../../utils/api';
import './GitView.css';

const GitView = (props) => {
    const theme = useTheme();
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

    useEffect(() => {
        if (projectId) {
            fetchData();
        } else {
            setLoading(false);
            setError('No project selected');
        }
    }, [projectId, limit]);

    const fetchRemoteBranches = async () => {
        if (!projectId) return;
        
        try {
            setLoading(true);
            const branchesResponse = await api.projectAPI.getBranches(projectId);
            setBranches(prev => ({
                ...prev,
                remote: branchesResponse?.remote || []
            }));
        } catch (err) {
            console.error('Error fetching remote branches:', err);
            setError('Failed to fetch remote branches: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const [branchesResponse, graphResponse] = await Promise.all([
                api.projectAPI.getBranches(projectId),
                api.projectAPI.getBranchGraph(projectId, limit)
            ]);
            
            const extractBranchesFromCommits = (commits) => {
                if (!commits || !Array.isArray(commits)) return [];
                
                const branchNames = new Set();
                
                const mergeCommitIndex = commits.findIndex(c => 
                    c.message && typeof c.message === 'string' && 
                    c.message.toLowerCase().includes('merge')
                );
                
                if (mergeCommitIndex !== -1) {
                    const mergeCommit = commits[mergeCommitIndex];
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
            
            const branchesFromCommits = extractBranchesFromCommits(graphResponse?.commits || graphResponse || []);
            
            const existingRemoteBranches = Array.isArray(branchesResponse?.remote) ? branchesResponse.remote : [];
            const existingBranchNames = new Set(existingRemoteBranches.map(b => b.name || b));
            
            const additionalRemoteBranches = branchesFromCommits.filter(branch => 
                !existingBranchNames.has(branch.name)
            );
            
            const normalizedBranches = {
                local: Array.isArray(branchesResponse?.local) ? branchesResponse.local : [],
                remote: [...existingRemoteBranches, ...additionalRemoteBranches],
                current: branchesResponse?.current || ''
            };
            
            setBranches(normalizedBranches);
            const normalizedGraph = {
                commits: graphResponse?.commits || graphResponse || [],
                total: graphResponse?.total || (graphResponse?.commits ? graphResponse.commits.length : 0)
            };
            setGraphData(normalizedGraph);
            setError(null);
        } catch (err) {
            console.error('Error fetching git data:', err);
            if (err.message && err.message.includes('Project not found')) {
                setError('Project not found. Please select a valid project from the Projects tab.');
            } else {
                setError('Failed to fetch git data: ' + (err.message || 'Unknown error'));
            }
        } finally {
            setLoading(false);
        }
    };

    // Git Actions functions
    const checkGitHubConnection = async () => {
        try {
            const response = await gitHubAPI.getStatus();
            setConnected(!!response.connected || !!projectId);
        } catch (err) {
            console.error('Error checking GitHub connection:', err);
            setConnected(!!projectId);
        }
    };

    const loadGitStatus = async () => {
        if (!projectId) return;
        
        try {
            const statusData = await projectGitAPI.getProjectGitStatus(projectId);
            setGitStatus(statusData.files || []);
        } catch (err) {
            console.error('Error loading git status:', err);
            setGitStatus([]);
        }
    };

    const loadStashStatus = async () => {
        if (!projectId) return;
        
        try {
            const stashStatus = await projectGitAPI.getStashStatus(projectId);
            setHasStash(stashStatus.hasStash || false);
        } catch (err) {
            console.error('Error loading stash status:', err);
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
            await projectGitAPI.createProjectCommit(projectId, commitMessage.trim());
            setSuccess('Коммит успешно создан');
            setCommitMessage('');
            setCommitDialogOpen(false);
            loadGitStatus();
            fetchData();
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
            await projectGitAPI.pushProjectChanges(projectId, branches.current || 'main');
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
            await projectGitAPI.pullProjectChanges(projectId, branches.current || 'main');
            setSuccess('Изменения успешно загружены из удаленного репозитория');
            fetchData();
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
            await projectGitAPI.createProjectBranch(projectId, newBranchName.trim());
            setSuccess(`Ветка "${newBranchName}" успешно создана`);
            setNewBranchName('');
            setBranchDialogOpen(false);
            fetchData();
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
            const result = await projectGitAPI.stashProjectChanges(projectId);
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
            const result = await projectGitAPI.stashPopProjectChanges(projectId);
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
            await projectGitAPI.resetProjectChanges(projectId, true); // hard reset
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
            await projectGitAPI.mergeProjectBranch(projectId, branchToMerge.trim());
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
                return <AddIcon color="success" />;
            case 'modified':
            case 'M':
                return <InfoIcon color="info" />;
            case 'deleted':
            case 'D':
                return <CancelIcon color="error" />;
            default:
                return <CheckCircleIcon />;
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

    useEffect(() => {
        if (projectId) {
            setConnected(true);
            checkGitHubConnection();
            loadGitStatus();
            loadStashStatus();
        } else {
            setConnected(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            await projectGitAPI.switchProjectBranch(projectId, selectedBranch);
            setSuccess(`Успешно переключились на ветку "${selectedBranch}"`);
            setSelectedBranch('');
            setSwitchBranchDialogOpen(false);
            fetchData();
            loadGitStatus();
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
        
        const allBranches = new Set(['main']);
        const branchMap = new Map();
        branchMap.set('main', 0);
        let nextTrack = 1;
        
        commits.forEach((commit, index) => {
            if (commit.refs && commit.refs.trim()) {
                const refs = commit.refs.split(',').map(ref => ref.trim());
                refs.forEach(ref => {
                    if (ref.includes('->')) {
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
        
        commits.forEach((commit, index) => {
            if (commit.message && typeof commit.message === 'string' && 
                commit.message.toLowerCase().includes('merge')) {
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
                }
            }
        });
        
        const parsedCommits = commits.map((commit, index) => {
            let branchTrack = 0;
            let branchName = 'main';
            
            if (commit.graph) {
                const graph = commit.graph;
                let trackPosition = 0;
                const asteriskIndex = graph.indexOf('*');
                
                if (asteriskIndex !== -1) {
                    const beforeAsterisk = graph.substring(0, asteriskIndex);
                    trackPosition = (beforeAsterisk.match(/\|/g) || []).length;
                    
                    if (graph.includes('*   ') || graph.includes('*  ')) {
                        trackPosition = 0;
                    }
                }
                
                branchTrack = trackPosition;
            }
            
            if (commit.refs && commit.refs.trim()) {
                const refs = commit.refs.split(',').map(ref => ref.trim());
                
                const headRef = refs.find(ref => ref.includes('HEAD ->'));
                if (headRef) {
                    const match = headRef.match(/HEAD\s*->\s*([^\s,]+)/);
                    if (match && match[1]) {
                        branchName = match[1];
                        branchTrack = branchMap.get(branchName) || 0;
                    }
                } else {
                    const branchRefs = refs.filter(ref => 
                        !ref.includes('tag:') && 
                        !ref.includes('origin/HEAD') && 
                        ref.trim().length > 0
                    );
                    
                    if (branchRefs.length > 0) {
                        let selectedRef = branchRefs.find(ref => ref.includes('main')) || branchRefs[0];
                        let cleanBranchName = selectedRef.replace('origin/', '').trim();
                        
                        if (cleanBranchName) {
                            branchName = cleanBranchName;
                            branchTrack = branchMap.get(branchName) || 0;
                        }
                    }
                }
            } else {
                if (branchTrack > 0) {
                    let foundBranchName = null;
                    
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
                        branchName = `feature-track-${branchTrack}`;
                        allBranches.add(branchName);
                        branchMap.set(branchName, branchTrack);
                    }
                } else {
                    branchName = 'main';
                    branchTrack = 0;
                }
            }
            
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
            
        return { 
            commits: parsedCommits, 
            totalBranches: allBranches.size
        };
    };

    const getBranchColor = (track) => {
        const colors = [
            '#3b82f6',
            '#10b981',
            '#f59e0b',
            '#ef4444',
            '#8b5cf6',
            '#06b6d4',
            '#84cc16'
        ];
        return colors[track % colors.length];
    };

    const renderBranchItem = (branch, isLocal = true) => {
        const branchName = typeof branch === 'object' ? (branch.name || branch.current || String(branch)) : String(branch);
        const branchKey = typeof branch === 'object' ? (branch.name || branch.current || JSON.stringify(branch)) : String(branch);
        
        return (
            <Box
                key={branchKey}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1,
                    borderRadius: 1,
                    backgroundColor: branchName === branches.current ? 
                        theme.palette.primary.main + '20' : 'transparent',
                }}
            >
                <Box
                    sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: branchName === branches.current ? 
                            theme.palette.primary.main : theme.palette.text.secondary,
                        mr: 1
                    }}
                />
                <Typography 
                    variant="body2" 
                    sx={{ 
                        fontFamily: 'monospace',
                        fontWeight: branchName === branches.current ? 600 : 400,
                        color: branchName === branches.current ? 
                            theme.palette.primary.main : theme.palette.text.primary
                    }}
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

    const COMMIT_ITEM_HEIGHT = 72;
    const COMMIT_ITEM_PADDING = 8;
    
    const renderCommitGraph = (commits) => {
        if (!commits.length) return null;

        const { totalBranches } = parseCommitData(graphData.commits, branches);
        const TRACK_WIDTH = 20;
        const LEFT_MARGIN = 10;
        const GRAPH_WIDTH = Math.max(80, LEFT_MARGIN + totalBranches * TRACK_WIDTH + 15);

        return (
            <Box 
                sx={{ 
                    width: GRAPH_WIDTH,
                    minHeight: commits.length * (COMMIT_ITEM_HEIGHT + COMMIT_ITEM_PADDING),
                    position: 'relative',
                    borderRight: `1px solid ${theme.palette.divider}`,
                    backgroundColor: theme.palette.background.default,
                }}
            >
                <svg 
                    width={GRAPH_WIDTH}
                    height={commits.length * (COMMIT_ITEM_HEIGHT + COMMIT_ITEM_PADDING)}
                    style={{ background: 'transparent', display: 'block' }}
                >
                    {/* Branch track lines */}
                    {Array.from({length: totalBranches}).map((_, track) => (
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
                                    stroke={theme.palette.mode === 'dark' ? '#1e293b' : '#ffffff'}
                                    strokeWidth="2"
                                />
                                
                                {/* Merge indicator */}
                                {commit.message.toLowerCase().includes('merge') && (
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r="3"
                                        fill={theme.palette.mode === 'dark' ? '#1e293b' : '#ffffff'}
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
                        sx={{
                            height: COMMIT_ITEM_HEIGHT,
                            mb: COMMIT_ITEM_PADDING / 8, // Небольшой отступ между элементами
                            p: 1.5,
                            borderRadius: 1,
                            border: `1px solid ${theme.palette.divider}`,
                            backgroundColor: theme.palette.background.paper,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            '&:hover': {
                                backgroundColor: theme.palette.action.hover,
                            },
                        }}
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
                                    backgroundColor: theme.palette.action.selected,
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
                        backgroundColor: theme.palette.primary.main,
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
                                backgroundColor: theme.palette.info.main,
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
                <Box sx={{ 
                    p: 2, 
                    backgroundColor: theme.palette.background.paper,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    mb: 2
                }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Последний коммит
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                        <CommitIcon fontSize="small" color="action" />
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
                    expandIcon={<KeyboardArrowRightRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />}
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
                            startIcon={<CommitIcon />}
                            onClick={() => setCommitDialogOpen(true)}
                            disabled={loading || !connected || gitStatus.length === 0}
                            fullWidth
                        >
                            Commit ({gitStatus.length})
                        </Button>
                        
                        <Button
                            variant="outlined"
                            startIcon={<PushIcon />}
                            onClick={handlePush}
                            disabled={loading || !connected}
                            fullWidth
                        >
                            Push
                        </Button>
                        
                        <Button
                            variant="outlined"
                            startIcon={<PullIcon />}
                            onClick={handlePull}
                            disabled={loading || !connected}
                            fullWidth
                        >
                            Pull
                        </Button>
                        
                        <Button
                            variant="outlined"
                            startIcon={<SwitchIcon />}
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
                            startIcon={<BranchIcon />}
                            onClick={() => setBranchDialogOpen(true)}
                            disabled={loading || !connected}
                            fullWidth
                        >
                            Create Branch
                        </Button>
                        
                        <Button
                            variant="outlined"
                            startIcon={<MergeIcon />}
                            onClick={handleMergeBranch}
                            disabled={loading || !connected}
                            fullWidth
                        >
                            Merge Branch
                        </Button>

                        <Button
                            variant="outlined"
                            startIcon={<RestoreIcon />}
                            onClick={handleStash}
                            disabled={loading || !connected || gitStatus.length === 0}
                            fullWidth
                            title={gitStatus.length === 0 ? "No changes to stash" : "Stash current changes"}
                        >
                            Stash Changes
                        </Button>

                        <Button
                            variant="outlined"
                            startIcon={<HistoryIcon />}
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
                            startIcon={<ResetIcon />}
                            onClick={handleReset}
                            disabled={loading || !connected}
                            fullWidth
                            color="error"
                        >
                            Reset Changes
                        </Button>
                        
                        <Button
                            variant="outlined"
                            startIcon={<SyncIcon />}
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
                    expandIcon={<KeyboardArrowRightRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />}
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
                        expandIcon={<KeyboardArrowRightRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />}
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
                                    {branches.local.length > 0 && <Divider sx={{ my: 1 }} />}
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
                                    {branches.local.length > 0 && <Divider sx={{ my: 1 }} />}
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
                        expandIcon={<KeyboardArrowRightRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />}
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
                        {loading ? <CircularProgress size={20} /> : 'Create Commit'}
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
                    <Button onClick={handleCreateBranch} variant="contained" disabled={loading || !newBranchName.trim()}>
                        {loading ? <CircularProgress size={20} /> : 'Create Branch'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Switch Branch Dialog */}
            <Dialog open={switchBranchDialogOpen} onClose={() => setSwitchBranchDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Переключиться на ветку</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Текущая ветка: <strong>{branches.current}</strong>
                        </Typography>
                        <Alert severity="info" sx={{ mb: 2 }}>
                            💡 Переключение возможно только на локальные ветки. Для работы с remote ветками сначала создайте локальную копию.
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
                        {loading ? <CircularProgress size={20} /> : 'Переключиться'}
                    </Button>
                </DialogActions>
            </Dialog>
        </ScrollableContainer>
    );
};

export default GitView;
