import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import './BranchGraph.css';

const BranchGraph = ({ projectId, isDarkMode = true }) => {
  const [graphData, setGraphData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [limit, setLimit] = useState(50);

  useEffect(() => {
    const fetchBranchGraph = async () => {
      if (!projectId) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await api.projectAPI.getBranchGraph(projectId, limit);
        setGraphData(response.commits || []);
      } catch (err) {
        setError('Failed to fetch branch graph: ' + (err.message || 'Unknown error'));
        console.error('Error fetching branch graph:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBranchGraph();
  }, [projectId, limit]);

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
  };

  const formatCommitMessage = (message) => {
    if (!message) return 'No message';
    return message.length > 60 ? message.substring(0, 60) + '...' : message;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getBranchColor = (branchName) => {
    const colors = [
      '#0e639c', '#d63384', '#fd7e14', '#198754', '#6f42c1',
      '#dc3545', '#20c997', '#ffc107', '#6610f2', '#e83e8c'
    ];
    let hash = 0;
    for (let i = 0; i < branchName.length; i++) {
      hash = branchName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (loading) {
    return (
      <div className={`branch-graph ${isDarkMode ? 'dark' : 'light'}`}>
        <div className="loading">Loading branch graph...</div>
      </div>
    );
  }

  return (
    <div className={`branch-graph ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="graph-header">
        <h3>Git Commit Graph</h3>
        <div className="graph-controls">
          <label>Show commits:</label>
          <select value={limit} onChange={(e) => handleLimitChange(Number(e.target.value))}>
            <option value={25}>Last 25</option>
            <option value={50}>Last 50</option>
            <option value={100}>Last 100</option>
            <option value={200}>Last 200</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="graph-container">
        {graphData.length === 0 ? (
          <div className="no-commits">No commits found</div>
        ) : (
          <div className="commits-timeline">
            {graphData.map((commit, index) => (
              <div key={commit.hash || index} className="commit-item">
                <div className="commit-line">
                  <div 
                    className="commit-dot" 
                    style={{ backgroundColor: getBranchColor(commit.branch || 'main') }}
                  ></div>
                  {index < graphData.length - 1 && (
                    <div 
                      className="commit-connector"
                      style={{ backgroundColor: getBranchColor(commit.branch || 'main') }}
                    ></div>
                  )}
                </div>
                <div className="commit-content">
                  <div className="commit-header">
                    <span className="commit-hash">
                      {commit.hash ? commit.hash.substring(0, 7) : 'unknown'}
                    </span>
                    <span 
                      className="commit-branch"
                      style={{ color: getBranchColor(commit.branch || 'main') }}
                    >
                      {commit.branch || 'main'}
                    </span>
                    <span className="commit-date">
                      {formatDate(commit.date)}
                    </span>
                  </div>
                  <div className="commit-message">
                    {formatCommitMessage(commit.message)}
                  </div>
                  <div className="commit-author">
                    {commit.author || 'Unknown Author'}
                  </div>
                  {commit.stats && (
                    <div className="commit-stats">
                      <span className="additions">+{commit.stats.additions || 0}</span>
                      <span className="deletions">-{commit.stats.deletions || 0}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchGraph;
