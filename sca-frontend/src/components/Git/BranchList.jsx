import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import './Git.css';

const BranchList = ({ projectId, onBranchSelect }) => {
    const [branches, setBranches] = useState({ local: [], remote: [], current: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newBranchName, setNewBranchName] = useState('');
    const [baseBranch, setBaseBranch] = useState('');

    useEffect(() => {
        fetchBranches();
    }, [projectId]);

    const fetchBranches = async () => {
        try {
            setLoading(true);
            const response = await api.projectAPI.getBranches(projectId);
            setBranches(response);
            setError(null);
        } catch (err) {
            console.error('Error fetching branches:', err);
            setError('Failed to fetch branches: ' + (err.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const createBranch = async () => {
        if (!newBranchName.trim()) return;

        try {
            await api.projectAPI.createBranch(projectId, {
                name: newBranchName,
                fromBranch: baseBranch || branches.current
            });
            
            setShowCreateModal(false);
            setNewBranchName('');
            setBaseBranch('');
            fetchBranches();
        } catch (err) {
            console.error('Error creating branch:', err);
            setError('Failed to create branch: ' + (err.message || 'Unknown error'));
        }
    };

    const switchBranch = async (branchName) => {
        try {
            await api.projectAPI.switchBranch(projectId, {
                branchName: branchName
            });
            
            fetchBranches();
            if (onBranchSelect) {
                onBranchSelect(branchName);
            }
        } catch (err) {
            console.error('Error switching branch:', err);
            setError('Failed to switch branch: ' + (err.message || 'Unknown error'));
        }
    };

    if (loading) {
        return <div className="branch-list-loading">Loading branches...</div>;
    }

    if (error) {
        return (
            <div className="branch-list-error">
                <p>Error: {error}</p>
                <button onClick={fetchBranches} className="retry-button">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="branch-list">
            <div className="branch-list-header">
                <h3>Branches</h3>
                <button 
                    className="create-branch-button"
                    onClick={() => setShowCreateModal(true)}
                >
                    + New Branch
                </button>
            </div>

            <div className="current-branch">
                <h4>Current Branch</h4>
                <div className="branch-item current">
                    <span className="branch-icon">🌟</span>
                    <span className="branch-name">{branches.current}</span>
                </div>
            </div>

            <div className="local-branches">
                <h4>Local Branches</h4>
                {branches.local.map((branch) => (
                    <div 
                        key={branch.name} 
                        className={`branch-item ${branch.current ? 'current' : ''}`}
                        onClick={() => !branch.current && switchBranch(branch.name)}
                    >
                        <span className="branch-icon">
                            {branch.current ? '🌟' : '🌿'}
                        </span>
                        <div className="branch-info">
                            <span className="branch-name">{branch.name}</span>
                            <span className="branch-commit">{branch.commit}</span>
                            <span className="branch-message">{branch.message}</span>
                        </div>
                    </div>
                ))}
            </div>

            {branches.remote.length > 0 && (
                <div className="remote-branches">
                    <h4>Remote Branches</h4>
                    {branches.remote.map((branch) => (
                        <div key={branch.name} className="branch-item remote">
                            <span className="branch-icon">🌍</span>
                            <div className="branch-info">
                                <span className="branch-name">{branch.name}</span>
                                <span className="branch-commit">{branch.commit}</span>
                                <span className="branch-message">{branch.message}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Create New Branch</h3>
                        <div className="form-group">
                            <label>Branch Name:</label>
                            <input
                                type="text"
                                value={newBranchName}
                                onChange={(e) => setNewBranchName(e.target.value)}
                                placeholder="feature/new-feature"
                            />
                        </div>
                        <div className="form-group">
                            <label>Base Branch:</label>
                            <select
                                value={baseBranch}
                                onChange={(e) => setBaseBranch(e.target.value)}
                            >
                                <option value="">Current branch ({branches.current})</option>
                                {branches.local.map((branch) => (
                                    <option key={branch.name} value={branch.name}>
                                        {branch.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="modal-actions">
                            <button onClick={createBranch} className="create-button">
                                Create
                            </button>
                            <button 
                                onClick={() => setShowCreateModal(false)}
                                className="cancel-button"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BranchList;
