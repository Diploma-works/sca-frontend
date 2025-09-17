import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import './BranchList.css';

const BranchList = ({ projectId, isDarkMode = true }) => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentBranch, setCurrentBranch] = useState('main');
  const [newBranchName, setNewBranchName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    const fetchBranches = async () => {
      if (!projectId) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await api.projectAPI.getBranches(projectId);
        setBranches(response.branches || []);
        setCurrentBranch(response.currentBranch || 'main');
      } catch (err) {
        setError('Failed to fetch branches: ' + (err.message || 'Unknown error'));
        console.error('Error fetching branches:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, [projectId]);

  const handleCreateBranch = async (e) => {
    e.preventDefault();
    if (!newBranchName.trim()) return;

    try {
      setLoading(true);
      await api.projectAPI.createBranch(projectId, {
        name: newBranchName.trim(),
        fromBranch: currentBranch
      });
      
      // Refresh branches list
      const response = await api.projectAPI.getBranches(projectId);
      setBranches(response.branches || []);
      setNewBranchName('');
      setShowCreateForm(false);
    } catch (err) {
      setError('Failed to create branch: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchBranch = async (branchName) => {
    try {
      setLoading(true);
      await api.projectAPI.switchBranch(projectId, {
        branchName: branchName
      });
      setCurrentBranch(branchName);
    } catch (err) {
      setError('Failed to switch branch: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (loading && branches.length === 0) {
    return (
      <div className={`branch-list ${isDarkMode ? 'dark' : 'light'}`}>
        <div className="loading">Loading branches...</div>
      </div>
    );
  }

  return (
    <div className={`branch-list ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="branch-list-header">
        <h3>Git Branches</h3>
        <button 
          className="create-branch-btn"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          + New Branch
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {showCreateForm && (
        <form className="create-branch-form" onSubmit={handleCreateBranch}>
          <input
            type="text"
            placeholder="Branch name"
            value={newBranchName}
            onChange={(e) => setNewBranchName(e.target.value)}
            autoFocus
          />
          <div className="form-buttons">
            <button type="submit" disabled={!newBranchName.trim() || loading}>
              Create
            </button>
            <button type="button" onClick={() => setShowCreateForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="branches-container">
        {branches.length === 0 ? (
          <div className="no-branches">No branches found</div>
        ) : (
          branches.map((branch) => (
            <div 
              key={branch.name} 
              className={`branch-item ${branch.name === currentBranch ? 'current' : ''}`}
            >
              <div className="branch-info">
                <span className="branch-name">{branch.name}</span>
                {branch.name === currentBranch && (
                  <span className="current-indicator">Current</span>
                )}
              </div>
              <div className="branch-meta">
                <span className="commit-count">{branch.commitCount || 0} commits</span>
                {branch.lastCommit && (
                  <span className="last-commit">
                    Last: {new Date(branch.lastCommit).toLocaleDateString()}
                  </span>
                )}
              </div>
              {branch.name !== currentBranch && (
                <button 
                  className="switch-btn"
                  onClick={() => handleSwitchBranch(branch.name)}
                  disabled={loading}
                >
                  Switch
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BranchList;