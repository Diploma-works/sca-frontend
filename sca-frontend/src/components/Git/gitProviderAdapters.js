import { gitHubAPI, gitLabAPI, bitbucketAPI, projectGitAPI } from '../../utils/api';

/**
 * @typedef {'github' | 'gitlab' | 'bitbucket'} GitProvider
 */

const notSupported = (provider, feature) => {
  const err = new Error(`${provider}: feature not supported: ${feature}`);
  err.code = 'NOT_SUPPORTED';
  throw err;
};

const wrapError = (provider, action, err) => {
  const msg = err?.message || 'Неизвестная ошибка';
  const e = new Error(`[${provider}] ${action}: ${msg}`);
  e.cause = err;
  return e;
};

const githubAdapter = {
  provider: 'github',
  getConnectionStatus: async () => {
    const s = await gitHubAPI.getStatus();
    return { ...s, connected: !!s?.connected };
  },
  getProjectRepositoryInfo: (projectId) => projectGitAPI.getProjectRepositoryInfo(projectId),
  getProjectGitStatus: (projectId) => projectGitAPI.getProjectGitStatus(projectId),
  getProjectBranches: (projectId) => projectGitAPI.getProjectBranches(projectId),
  createProjectCommit: (projectId, message) => projectGitAPI.createProjectCommit(projectId, message),
  pushProjectChanges: (projectId, branch) => projectGitAPI.pushProjectChanges(projectId, branch),
  pullProjectChanges: (projectId, branch) => projectGitAPI.pullProjectChanges(projectId, branch),
  createProjectBranch: (projectId, branchName, fromBranch) => projectGitAPI.createProjectBranch(projectId, branchName, fromBranch),
  switchProjectBranch: (projectId, branchName) => projectGitAPI.switchProjectBranch(projectId, branchName),
  resetProjectChanges: (projectId, hard) => projectGitAPI.resetProjectChanges(projectId, hard),
  getStashStatus: (projectId) => projectGitAPI.getStashStatus(projectId),
  stashProjectChanges: (projectId, message) => projectGitAPI.stashProjectChanges(projectId, message),
  stashPopProjectChanges: (projectId) => projectGitAPI.stashPopProjectChanges(projectId),
};

const genericGitAdapter = (provider) => ({
  provider,
  getConnectionStatus: async () => {
    if (provider === 'gitlab') {
      const s = await gitLabAPI.getStatus();
      return { ...s, connected: !!s?.connected };
    }
    if (provider === 'bitbucket') {
      const s = await bitbucketAPI.getStatus();
      return { ...s, connected: !!s?.connected };
    }
    return notSupported(provider, 'getConnectionStatus');
  },
  // Project-level git operations are provider-agnostic (work on cloned workspace repo)
  getProjectRepositoryInfo: (projectId) => projectGitAPI.getProjectRepositoryInfo(projectId),
  getProjectGitStatus: (projectId) => projectGitAPI.getProjectGitStatus(projectId),
  getProjectBranches: (projectId) => projectGitAPI.getProjectBranches(projectId),
  createProjectCommit: (projectId, message) => projectGitAPI.createProjectCommit(projectId, message),
  pushProjectChanges: (projectId, branch) => projectGitAPI.pushProjectChanges(projectId, branch),
  pullProjectChanges: (projectId, branch) => projectGitAPI.pullProjectChanges(projectId, branch),
  createProjectBranch: (projectId, branchName, fromBranch) => projectGitAPI.createProjectBranch(projectId, branchName, fromBranch),
  switchProjectBranch: (projectId, branchName) => projectGitAPI.switchProjectBranch(projectId, branchName),
  resetProjectChanges: (projectId, hard) => projectGitAPI.resetProjectChanges(projectId, hard),
  getStashStatus: (projectId) => projectGitAPI.getStashStatus(projectId),
  stashProjectChanges: (projectId, message) => projectGitAPI.stashProjectChanges(projectId, message),
  stashPopProjectChanges: (projectId) => projectGitAPI.stashPopProjectChanges(projectId),
});

export const getGitProviderAdapter = (provider) => {
  switch (provider) {
    case 'github':
      return githubAdapter;
    case 'gitlab':
      return genericGitAdapter('gitlab');
    case 'bitbucket':
      return genericGitAdapter('bitbucket');
    default:
      throw new Error(`Unknown git provider: ${provider}`);
  }
};

export const safeCall = async (provider, actionName, fn) => {
  try {
    return await fn();
  } catch (err) {
    throw wrapError(provider, actionName, err);
  }
};
