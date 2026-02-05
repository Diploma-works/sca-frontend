import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { api } from '../../utils/api';
import './ModernBranchGraph.css';

const ModernBranchGraph = ({ projectId }) => {
    const theme = useTheme();
    const [graphData, setGraphData] = useState({ commits: [], total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCommit, setSelectedCommit] = useState(null);
    const [limit, setLimit] = useState(20);
    
    // Refs for scroll synchronization
    const commitsPanelRef = React.useRef(null);
    const graphPanelRef = React.useRef(null);

    useEffect(() => {
        if (projectId) {
            fetchBranchGraph();
        }
    }, [projectId, limit]);

    const fetchBranchGraph = async () => {
        try {
            setLoading(true);
            const response = await api.projectAPI.getBranchGraph(projectId, limit);
            const normalizedResponse = {
                commits: response?.commits || response || [],
                total: response?.total || (response?.commits ? response.commits.length : 0)
            };
            setGraphData(normalizedResponse);
            setError(null);
        } catch (err) {
            console.error('Error fetching branch graph:', err);
            setError('Failed to fetch branch graph: ' + (err.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    // Синхронизация скролла между панелями
    const handleScroll = (e) => {
        if (commitsPanelRef.current && graphPanelRef.current) {
            const scrollTop = e.target.scrollTop;
            if (e.target === commitsPanelRef.current) {
                graphPanelRef.current.scrollTop = scrollTop;
            } else if (e.target === graphPanelRef.current) {
                commitsPanelRef.current.scrollTop = scrollTop;
            }
        }
    };

    const parseCommitData = (commits) => {
        if (!commits || !Array.isArray(commits)) return [];
        
        // First pass: collect all unique branches
        const allBranches = new Set();
        const parsedCommits = commits.map((commit, index) => {
            // Parse commit information
            let hash = '';
            let message = '';
            let author = '';
            let date = '';
            let refs = '';

            if (typeof commit === 'string') {
                const parts = commit.split(' ');
                hash = parts[0] || '';
                message = parts.slice(1, -3).join(' ') || '';
                author = parts[parts.length - 3] || '';
                date = parts[parts.length - 2] || '';
                refs = parts[parts.length - 1] || '';
            } else if (typeof commit === 'object') {
                hash = commit.hash || commit.id || '';
                message = commit.message || '';
                author = commit.author || '';
                date = commit.date || commit.timestamp || '';
                refs = commit.refs || '';
            }

            const branches = [];
            const tags = [];
            
            if (refs && refs !== 'null') {
                const refParts = refs.split(',').map(r => r.trim());
                refParts.forEach(ref => {
                    if (ref.includes('origin/') && !ref.includes('->')) {
                        const branchName = ref.replace('origin/', '');
                        branches.push(branchName);
                        allBranches.add(branchName);
                    } else if (ref.startsWith('tag:')) {
                        tags.push(ref.substring(4).trim());
                    }
                });
            }

            // If no branches found, assume main branch
            if (branches.length === 0) {
                branches.push('main');
                allBranches.add('main');
            }

            return {
                id: hash.substring(0, 7),
                fullHash: hash,
                message: message || 'No message',
                author: author || 'Unknown',
                date: date ? new Date(date) : new Date(),
                branches,
                tags,
                index
            };
        });

        // Second pass: assign branch tracks based on actual branches
        const branchTrackMap = {};
        Array.from(allBranches).forEach((branch, index) => {
            branchTrackMap[branch] = index;
        });

        return {
            commits: parsedCommits.map(commit => ({
                ...commit,
                branchTrack: branchTrackMap[commit.branches[0]] || 0
            })),
            totalBranches: allBranches.size
        };
    };

    const formatDate = (date) => {
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
        return `${Math.ceil(diffDays / 365)} years ago`;
    };

    const getBranchColor = (track) => {
        const colors = [
            '#3b82f6', // blue
            '#10b981', // emerald  
            '#f59e0b', // amber
            '#ef4444', // red
            '#8b5cf6', // violet
            '#06b6d4', // cyan
            '#f97316', // orange
            '#84cc16'  // lime
        ];
        return colors[track % colors.length];
    };

    const renderCommitGraph = () => {
        const { commits, totalBranches } = parseCommitData(graphData.commits);
        if (!commits.length) return null;

        const COMMIT_HEIGHT = 120; // Increased to match CSS

        return (
            <div className="git-layout">
                {/* Left Panel - Git Graph */}
                <div className="graph-panel">
                    <div className="graph-canvas" ref={graphPanelRef} onScroll={handleScroll}>
                        <svg 
                            width={Math.max(200, 80 + totalBranches * 40)} 
                            height={commits.length * COMMIT_HEIGHT + 60} 
                            className="branch-network-svg"
                        >
                            <defs>
                                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                                    <feMerge> 
                                        <feMergeNode in="coloredBlur"/>
                                        <feMergeNode in="SourceGraphic"/>
                                    </feMerge>
                                </filter>
                            </defs>
                            
                            {/* Branch track lines */}
                            {Array.from({length: Math.max(totalBranches, 1)}).map((_, track) => (
                                <line
                                    key={`branch-${track}`}
                                    x1={40 + track * 40}
                                    y1="0"
                                    x2={40 + track * 40}
                                    y2={commits.length * COMMIT_HEIGHT + 60}
                                    stroke={getBranchColor(track)}
                                    strokeWidth="2"
                                    opacity="0.3"
                                />
                            ))}
                            
                            {/* Commit nodes and connections */}
                            {commits.map((commit, index) => {
                                const y = 30 + index * COMMIT_HEIGHT + COMMIT_HEIGHT / 2;
                                const x = 40 + commit.branchTrack * 40;
                                
                                return (
                                    <g key={commit.fullHash || index}>
                                        {/* Connection lines */}
                                        {index < commits.length - 1 && (
                                            <line
                                                x1={x}
                                                y1={y}
                                                x2={40 + commits[index + 1].branchTrack * 40}
                                                y2={30 + (index + 1) * COMMIT_HEIGHT + COMMIT_HEIGHT / 2}
                                                stroke={getBranchColor(commit.branchTrack)}
                                                strokeWidth="3"
                                                opacity="0.8"
                                            />
                                        )}
                                        
                                        {/* Merge curves */}
                                        {commit.message.toLowerCase().includes('merge') && index > 0 && (
                                            <path
                                                d={`M ${40 + ((commit.branchTrack + 1) % 3) * 40} ${y - COMMIT_HEIGHT/2} Q ${x - 20} ${y - COMMIT_HEIGHT/4} ${x} ${y}`}
                                                stroke={getBranchColor((commit.branchTrack + 1) % 3)}
                                                strokeWidth="2"
                                                fill="none"
                                                opacity="0.6"
                                            />
                                        )}
                                        
                                        {/* Commit node */}
                                        <circle
                                            cx={x}
                                            cy={y}
                                            r="8"
                                            fill={getBranchColor(commit.branchTrack)}
                                            stroke="#ffffff"
                                            strokeWidth="3"
                                            filter="url(#glow)"
                                            className="commit-node-clickable"
                                            onClick={() => setSelectedCommit(commit)}
                                        />
                                        
                                        {/* Inner circle */}
                                        <circle
                                            cx={x}
                                            cy={y}
                                            r="4"
                                            fill="#ffffff"
                                            opacity="0.9"
                                            onClick={() => setSelectedCommit(commit)}
                                        />
                                        
                                        {/* Selection indicator */}
                                        {selectedCommit?.id === commit.id && (
                                            <circle
                                                cx={x}
                                                cy={y}
                                                r="12"
                                                fill="none"
                                                stroke="#3b82f6"
                                                strokeWidth="2"
                                                strokeDasharray="4,4"
                                                opacity="0.8"
                                            >
                                                <animateTransform
                                                    attributeName="transform"
                                                    attributeType="XML"
                                                    type="rotate"
                                                    from={`0 ${x} ${y}`}
                                                    to={`360 ${x} ${y}`}
                                                    dur="2s"
                                                    repeatCount="indefinite"
                                                />
                                            </circle>
                                        )}
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                </div>

                {/* Right Panel - Commits List */}
                <div className="commits-panel">
                    <div className="commits-list" ref={commitsPanelRef} onScroll={handleScroll}>
                        {commits.map((commit, index) => (
                            <div 
                                key={commit.fullHash || index}
                                className={`commit-item ${selectedCommit?.id === commit.id ? 'selected' : ''}`}
                                onClick={() => setSelectedCommit(commit)}
                            >
                                <div 
                                    className="branch-indicator"
                                    style={{ backgroundColor: getBranchColor(commit.branchTrack) }}
                                ></div>
                                
                                <div className="commit-content">
                                    <div className="commit-item-header">
                                        <div className="commit-hash-container">
                                            <span className="commit-hash">{commit.id}</span>
                                            {commit.message.toLowerCase().includes('merge') && (
                                                <span className="merge-badge">MERGE</span>
                                            )}
                                        </div>
                                        <span className="commit-date">{formatDate(commit.date)}</span>
                                    </div>
                                    
                                    <div className="commit-message">{commit.message}</div>
                                    
                                    <div className="commit-meta">
                                        <span className="commit-author">👤 {commit.author}</span>
                                        {commit.branches.length > 0 && (
                                            <div className="commit-branches">
                                                {commit.branches.map(branch => (
                                                    <span key={branch} className="branch-tag">
                                                        🌿 {branch}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        {commit.tags.length > 0 && (
                                            <div className="commit-tags">
                                                {commit.tags.map(tag => (
                                                    <span key={tag} className="tag-badge">
                                                        🏷️ {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className={`modern-graph-container ${theme.palette.mode === 'dark' ? 'dark-theme' : ''}`}>
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <span>Loading git history...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`modern-graph-container ${theme.palette.mode === 'dark' ? 'dark-theme' : ''}`}>
                <div className="error-message">
                    <div className="error-icon">⚠️</div>
                    <div className="error-text">{error}</div>
                    <button onClick={fetchBranchGraph} className="retry-button">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`modern-graph-container ${theme.palette.mode === 'dark' ? 'dark-theme' : ''}`}>
            <div className="graph-header">
                <h3>Git History</h3>
                <div className="graph-controls">
                    <select 
                        value={limit} 
                        onChange={(e) => setLimit(Number(e.target.value))}
                        className="limit-select"
                    >
                        <option value={10}>10 commits</option>
                        <option value={20}>20 commits</option>
                        <option value={50}>50 commits</option>
                        <option value={100}>100 commits</option>
                    </select>
                    <button onClick={fetchBranchGraph} className="refresh-button">
                        🔄 Refresh
                    </button>
                </div>
            </div>

            {renderCommitGraph()}

            {selectedCommit && (
                <div className="commit-details-panel">
                    <div className="panel-header">
                        <h4>Commit Details</h4>
                        <button 
                            onClick={() => setSelectedCommit(null)}
                            className="close-button"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="panel-content">
                        <div className="detail-row">
                            <strong>Hash:</strong> {selectedCommit.fullHash}
                        </div>
                        <div className="detail-row">
                            <strong>Message:</strong> {selectedCommit.message}
                        </div>
                        <div className="detail-row">
                            <strong>Author:</strong> {selectedCommit.author}
                        </div>
                        <div className="detail-row">
                            <strong>Date:</strong> {selectedCommit.date.toLocaleString()}
                        </div>
                        {selectedCommit.branches.length > 0 && (
                            <div className="detail-row">
                                <strong>Branches:</strong> {selectedCommit.branches.join(', ')}
                            </div>
                        )}
                        {selectedCommit.tags.length > 0 && (
                            <div className="detail-row">
                                <strong>Tags:</strong> {selectedCommit.tags.join(', ')}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModernBranchGraph;
