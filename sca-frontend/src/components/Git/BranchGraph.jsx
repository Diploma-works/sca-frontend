import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import './Git.css';

const BranchGraph = ({ projectId }) => {
    const [graphData, setGraphData] = useState({ commits: [], total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [limit, setLimit] = useState(50);

    useEffect(() => {
        fetchBranchGraph();
    }, [projectId, limit]);

    const fetchBranchGraph = async () => {
        try {
            setLoading(true);
            const response = await api.projectAPI.getBranchGraph(projectId, limit);
            // Ensure we have the expected structure
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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    const parseBranchRefs = (refs) => {
        if (!refs) return { branches: [], tags: [] };
        
        const branches = [];
        const tags = [];
        
        // Parse refs like "origin/main, origin/HEAD -> origin/main, tag: v1.0.0"
        const refParts = refs.split(',').map(r => r.trim());
        
        refParts.forEach(ref => {
            if (ref.startsWith('tag:')) {
                tags.push(ref.substring(4).trim());
            } else if (ref.includes('->')) {
                // Skip HEAD references
                return;
            } else if (ref.startsWith('origin/')) {
                branches.push({ name: ref, type: 'remote' });
            } else if (ref) {
                branches.push({ name: ref, type: 'local' });
            }
        });
        
        return { branches, tags };
    };

    const renderGraphSVG = (graph, commitIndex, isCommitNode = false) => {
        const CHAR_WIDTH = 20;
        const LINE_HEIGHT = 50;
        const svgWidth = Math.max(graph.length * CHAR_WIDTH, 200);
        const svgHeight = LINE_HEIGHT;
        
        // Color palette for different branches
        const branchColors = [
            '#0e639c', '#28a745', '#dc3545', '#ffc107', '#6f42c1', 
            '#fd7e14', '#20c997', '#e83e8c', '#17a2b8', '#6610f2'
        ];
        
        const elements = [];
        const chars = graph.split('');

        // Draw all graph elements (commits, lines, merges)
        // First, find all commits
        const commits = [];
        chars.forEach((char, index) => {
            if (char === '*') {
                commits.push({
                    index,
                    x: index * CHAR_WIDTH + CHAR_WIDTH / 2,
                    y: svgHeight / 2
                });
            }
        });

        // Draw connecting lines between consecutive commits if no other connections exist
        for (let i = 0; i < commits.length - 1; i++) {
            const current = commits[i];
            const next = commits[i + 1];
            
            // Check if there are connecting characters between commits
            const betweenChars = chars.slice(current.index + 1, next.index);
            const hasConnections = betweenChars.some(c => c === '|' || c === '-' || c === '/' || c === '\\');
            
            if (!hasConnections) {
                // Draw direct connection line between isolated commits
                const colorIndex = i % branchColors.length;
                const color = branchColors[colorIndex];
                
                elements.push(
                    <line
                        key={`auto-connect-${i}`}
                        x1={current.x}
                        y1={current.y}
                        x2={next.x}
                        y2={next.y}
                        stroke={color}
                        strokeWidth="2"
                        opacity="0.6"
                        strokeDasharray="3,3"
                    />
                );
            }
        }

        chars.forEach((char, index) => {
            const x = index * CHAR_WIDTH + CHAR_WIDTH / 2;
            const y = svgHeight / 2;
            
            // Determine branch color based on position
            const branchIndex = Math.floor(index / 2);
            const colorIndex = branchIndex % branchColors.length;
            const color = branchColors[colorIndex];
        
            
            switch (char) {
                case '*':
                    // Commit node - enhanced circle with glow
                    elements.push(
                        <g key={`commit-${index}`}>
                            <circle
                                cx={x}
                                cy={y}
                                r="8"
                                fill={color}
                                stroke="#fff"
                                strokeWidth="2"
                                filter="drop-shadow(0 0 3px rgba(0,0,0,0.3))"
                            />
                            <circle
                                cx={x}
                                cy={y}
                                r="4"
                                fill="#fff"
                                opacity="0.8"
                            />
                        </g>
                    );
                    break;
                case '|':
                    // Vertical line connecting commits
                    elements.push(
                        <line
                            key={`vertical-${index}`}
                            x1={x}
                            y1={0}
                            x2={x}
                            y2={svgHeight}
                            stroke={color}
                            strokeWidth="3"
                            opacity="0.8"
                        />
                    );
                    break;
                case '/':
                    // Merge line (diagonal up-right) - smooth curve
                    elements.push(
                        <path
                            key={`merge-up-${index}`}
                            d={`M ${x - CHAR_WIDTH/2} ${svgHeight} Q ${x} ${svgHeight/2} ${x + CHAR_WIDTH/2} 0`}
                            stroke={color}
                            strokeWidth="3"
                            fill="none"
                            opacity="0.8"
                        />
                    );
                    break;
                case '\\':
                    // Merge line (diagonal down-right) - smooth curve
                    elements.push(
                        <path
                            key={`merge-down-${index}`}
                            d={`M ${x - CHAR_WIDTH/2} 0 Q ${x} ${svgHeight/2} ${x + CHAR_WIDTH/2} ${svgHeight}`}
                            stroke={color}
                            strokeWidth="3"
                            fill="none"
                            opacity="0.8"
                        />
                    );
                    break;
                case '-':
                    // Horizontal line connecting commits
                    elements.push(
                        <line
                            key={`horizontal-${index}`}
                            x1={x - CHAR_WIDTH/2}
                            y1={y}
                            x2={x + CHAR_WIDTH/2}
                            y2={y}
                            stroke={color}
                            strokeWidth="3"
                            opacity="0.8"
                        />
                    );
                    break;
            }
        });

        return (
            <svg width={svgWidth} height={svgHeight} className="git-graph-svg">
                <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge> 
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                {elements}
            </svg>
        );
    };

    if (loading) {
        return <div className="branch-graph-loading">Loading branch graph...</div>;
    }

    if (error) {
        return (
            <div className="branch-graph-error">
                <p>Error: {error}</p>
                <button onClick={fetchBranchGraph} className="retry-button">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="branch-graph">
            <div className="branch-graph-header">
                <h3>Branch Graph</h3>
                <div className="graph-controls">
                    <label>
                        Show last:
                        <select 
                            value={limit} 
                            onChange={(e) => setLimit(parseInt(e.target.value))}
                        >
                            <option value={25}>25 commits</option>
                            <option value={50}>50 commits</option>
                            <option value={100}>100 commits</option>
                            <option value={200}>200 commits</option>
                        </select>
                    </label>
                </div>
            </div>

            <div className="graph-container">
                {!graphData?.commits || graphData.commits.length === 0 ? (
                    <div className="no-commits">No commits found</div>
                ) : (
                    <div className="commits-list">
                        {graphData.commits.map((commit, index) => {
                            const { branches, tags } = parseBranchRefs(commit.refs);
                            
                            return (
                                <div key={commit.hash} className="commit-row">
                                    <div className="graph-column">
                                        {renderGraphSVG(commit.graph, index, commit.graph.includes('*'))}
                                    </div>
                                    <div className="commit-info">
                                        <div className="commit-header">
                                            <span className="commit-hash" title={commit.hash}>
                                                {commit.shortHash}
                                            </span>
                                            <span className="commit-message">
                                                {commit.message}
                                            </span>
                                            {branches && branches.length > 0 && (
                                                <div className="commit-refs">
                                                    {branches.map((branch, idx) => (
                                                        <span 
                                                            key={idx} 
                                                            className={`branch-ref ${branch.type}`}
                                                        >
                                                            {branch.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            {tags && tags.length > 0 && (
                                                <div className="commit-tags">
                                                    {tags.map((tag, idx) => (
                                                        <span key={idx} className="tag-ref">
                                                            🏷️ {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="commit-meta">
                                            <span className="commit-author">
                                                👤 {commit.author}
                                            </span>
                                            <span className="commit-date">
                                                🕒 {formatDate(commit.date)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            
            <div className="graph-footer">
                <span>Showing {graphData?.commits?.length || 0} commits</span>
            </div>
        </div>
    );
};

export default BranchGraph;
