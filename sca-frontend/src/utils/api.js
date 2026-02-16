import { Client } from '@stomp/stompjs';
// --- STOMP WebSocket API ---

const API_BASE_URL = 'http://localhost:8080/api';

// Ensure fetch sends cookies by default so cookie-based auth (react-auth-kit) is included.
// We wrap the global fetch once to add credentials: 'include' when running in browser.
if (typeof window !== 'undefined' && window.fetch) {
  const _origFetch = window.fetch.bind(window);
  window.fetch = (url, options = {}) => {
    const opts = { credentials: 'include', ...options };
    return _origFetch(url, opts);
  };
}

// Alternative function to get token from react-auth-kit
const getTokenFromAuthKit = () => {
  try {
    // Try to get token from react-auth-kit store
    const authStore = JSON.parse(localStorage.getItem('react-auth-kit-store'));
    if (authStore && authStore.auth && authStore.auth.token) {
      console.log('Token from react-auth-kit store:', authStore.auth.token);
      return authStore.auth.token;
    }
  } catch (error) {
    console.error('Error getting token from react-auth-kit store:', error);
  }
  return null;
};

// Utility function to get auth headers
const getAuthHeaders = () => {
  // Получаем токен из react-auth-kit
  const getAuthToken = () => {
    try {
      // First try react-auth-kit store from localStorage
      const authStore = JSON.parse(localStorage.getItem('react-auth-kit-store') || '{}');
      if (authStore && authStore.auth && authStore.auth.token) {
        console.log('Using token from react-auth-kit localStorage store');
        return authStore.auth.token;
      }

      // Then try react-auth-kit cookie
      const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
      };
      
      const authCookie = getCookie('_auth');
      console.log('=== DEBUG TOKEN ===');
      console.log('All cookies:', document.cookie);
      console.log('_auth cookie:', authCookie);
      
      if (authCookie) {
        // Декодируем URL-encoded cookie
        const decodedCookie = decodeURIComponent(authCookie);
        console.log('Decoded cookie:', decodedCookie);
        
        try {
          // Парсим JSON из cookie
          const cookieData = JSON.parse(decodedCookie);
          console.log('Parsed cookie data:', cookieData);
          
          // Извлекаем токен из структуры react-auth-kit
          const token = cookieData.auth?.token || cookieData.token;
          console.log('Extracted token from cookie:', token);
          return token;
        } catch (parseError) {
          console.error('Error parsing cookie:', parseError);
          // Если не удается распарсить, используем как есть
          return decodedCookie;
        }
      }
      
      // Fallback к localStorage
      const localToken = localStorage.getItem('token');
      console.log('Fallback localStorage token:', localToken);
      return localToken;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };
  
  const token = getAuthToken();
  console.log('Final token for headers:', token);
  
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Utility function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Utility function to handle text responses (for file content)
const handleTextResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.text();
};

// Auth API functions
export const authAPI = {
  // Login user
  login: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    });
    return handleResponse(response);
  },

  // Register user
  register: async (username, password, email, fullName = null) => {
    const requestBody = { username, password, email };
    if (fullName) {
      requestBody.fullName = fullName;
    }
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    return handleResponse(response);
  },

  // Refresh token
  refresh: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Logout
  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get current user
  me: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Verify token
  verify: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Project API functions
export const projectAPI = {
  // Get all projects for current user
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Update project
  update: async (id, updates) => {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    return handleResponse(response);
  },

  // Delete project
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Git API functions
  // Get branches for project
  getBranches: async (projectId) => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/git/branches`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get branch graph for project
  getBranchGraph: async (projectId, limit = 50) => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/git/graph?limit=${limit}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  // Create new branch
  createBranch: async (projectId, branchData) => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/git/branches`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(branchData)
    });
    return handleResponse(response);
  },

  // Switch branch
  switchBranch: async (projectId, branchData) => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/git/branches/switch`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(branchData)
    });
    return handleResponse(response);
  }

};

// GitLab API functions (proxy endpoints expected on backend)
export const gitLabAPI = {
  saveToken: async (token) => {
    const response = await fetch(`${API_BASE_URL}/gitlab/token`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ token })
    });
    return handleResponse(response);
  },
  getStatus: async () => {
    const response = await fetch(`${API_BASE_URL}/gitlab/status`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  getRepositories: async () => {
    const response = await fetch(`${API_BASE_URL}/gitlab/repositories`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  getRepositoryBranches: async (owner, repo) => {
    const response = await fetch(`${API_BASE_URL}/gitlab/repositories/${owner}/${repo}/branches`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  cloneRepository: async (owner, repo, targetPath, gitUrl, branch = 'main') => {
    // Использует новый endpoint для клонирования через ProjectController
    const projectName = repo.replace(/\.git$/, ''); // Удаляем .git если есть
    const response = await fetch(`${API_BASE_URL}/projects/clone/gitlab`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        gitUrl: gitUrl,
        branch: branch,
        name: projectName
      })
    });
    return handleResponse(response);
  },
  createRepository: async (name, description, isPrivate = false) => {
    const response = await fetch(`${API_BASE_URL}/gitlab/repositories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, description, private: isPrivate })
    });
    return handleResponse(response);
  },
  removeToken: async () => {
    const response = await fetch(`${API_BASE_URL}/gitlab/token`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Bitbucket API functions (proxy endpoints expected on backend)
export const bitbucketAPI = {
  // token: the token or app password
  // username: optional Bitbucket username when using app password (Basic auth)
  saveToken: async (token, username = null) => {
    const body = { token };
    if (username) body.username = username;
    const response = await fetch(`${API_BASE_URL}/bitbucket/token`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    });
    return handleResponse(response);
  },
  getStatus: async () => {
    const response = await fetch(`${API_BASE_URL}/bitbucket/status`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  getRepositories: async () => {
    const response = await fetch(`${API_BASE_URL}/bitbucket/repositories`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  getRepositoryBranches: async (owner, repo) => {
    const response = await fetch(`${API_BASE_URL}/bitbucket/repositories/${owner}/${repo}/branches`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  cloneRepository: async (owner, repo, targetPath) => {
    const response = await fetch(`${API_BASE_URL}/bitbucket/repositories/${owner}/${repo}/clone`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ targetPath })
    });
    return handleResponse(response);
  },
  createRepository: async (name, description, isPrivate = false) => {
    const response = await fetch(`${API_BASE_URL}/bitbucket/repositories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, description, private: isPrivate })
    });
    return handleResponse(response);
  },
  removeToken: async () => {
    const response = await fetch(`${API_BASE_URL}/bitbucket/token`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // --- SSH key management (for git push/pull over SSH) ---
  getSshKeyStatus: async () => {
    const response = await fetch(`${API_BASE_URL}/bitbucket/ssh-key/status`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  saveSshKey: async (privateKey) => {
    const response = await fetch(`${API_BASE_URL}/bitbucket/ssh-key`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ privateKey })
    });
    return handleResponse(response);
  },
  removeSshKey: async () => {
    const response = await fetch(`${API_BASE_URL}/bitbucket/ssh-key`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  testSsh: async () => {
    const response = await fetch(`${API_BASE_URL}/bitbucket/ssh-key/test`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};
 

// For backward compatibility with Projects component
export const projectsAPI = {
  getUserProjects: () => projectAPI.getAll(),
  createProject: (projectData) => projectAPI.create(projectData.name, projectData.description, projectData.workspacePath),
  updateProject: (id, updates) => projectAPI.update(id, updates),
  deleteProject: (id) => projectAPI.delete(id),
  getProject: (id) => projectAPI.getById(id),
  cloneFromGitHub: async (gitUrl, branch = 'main', projectName) => {
    const response = await fetch(`${API_BASE_URL}/projects/clone`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ gitUrl, branch, name: projectName })
    });
    return handleResponse(response);
  }
};

// WebSocket API
export const websocketAPI = {
  client: null,
  connected: false,
  
  connect: (username) => {
    if (websocketAPI.client) {
      websocketAPI.client.deactivate();
    }
    
    websocketAPI.client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      connectHeaders: {
        'Authorization': `Bearer ${getAuthHeaders().Authorization?.split(' ')[1] || ''}`
      },
      debug: function (str) {
        console.log('STOMP Debug:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    websocketAPI.client.onConnect = function (frame) {
      console.log('Connected: ' + frame);
      websocketAPI.connected = true;
    };

    websocketAPI.client.onWebSocketError = function (error) {
      console.error('Error with websocket', error);
      websocketAPI.connected = false;
    };

    websocketAPI.client.onStompError = function (frame) {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
      websocketAPI.connected = false;
    };

    websocketAPI.client.activate();
    return websocketAPI.client;
  },

  disconnect: () => {
    if (websocketAPI.client) {
      websocketAPI.client.deactivate();
      websocketAPI.connected = false;
    }
  },

  subscribeToProblems: (projectId, callback) => {
    if (websocketAPI.client && websocketAPI.connected) {
      return websocketAPI.client.subscribe(`/topic/problems/${projectId}`, callback);
    }
  },

  subscribeToFileUpdates: (projectId, callback) => {
    if (websocketAPI.client && websocketAPI.connected) {
      return websocketAPI.client.subscribe(`/topic/file-updates/${projectId}`, callback);
    }
  },
  
  sendProblemsRequest: (projectId, user) => {
    if (websocketAPI.client && websocketAPI.connected) {
      websocketAPI.client.publish({
        destination: '/app/problems',
        body: JSON.stringify({ projectId, user })
      });
    }
  },
  sendFileUpdateRequest: (projectId, filePath, content, user) => {
    if (websocketAPI.client && websocketAPI.connected) {
      websocketAPI.client.publish({
        destination: '/app/file/update',
        body: JSON.stringify({ projectId, filePath, content, user })
      });
    }
  }
};

// File operations API functions
export const fileAPI = {
  // Create new file
  createFileRequest: async (projectId, filePath) => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/files`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ filePath })
    });
    return handleResponse(response);
  },

  // Get file content
  getFileContent: async (projectId, filePath) => {
    // Кодируем каждый сегмент пути отдельно для корректной обработки
    const encodedFilePath = filePath.split('/').map(segment => encodeURIComponent(segment)).join('/');
    console.log('Original filePath:', filePath);
    console.log('Encoded filePath:', encodedFilePath);
    
    const url = `${API_BASE_URL}/projects/${projectId}/files/${encodedFilePath}`;
    console.log('Full request URL:', url);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('API response data:', data);
      console.log('Content length:', data.content ? data.content.length : 'No content');
      
      return data.content || '';
    } catch (error) {
      console.error('Error in getFileContent:', error);
      throw error;
    }
  },

  // Update file content via REST API
  updateFileContent: async (projectId, filePath, content) => {
    console.log('Saving file:', projectId, filePath, 'content length:', content.length);
    
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/files/${filePath}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ content })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Get project structure
  getProjectStructure: async (projectId) => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/structure`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get problems for project
  getProblems: async (projectId) => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/problems`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get statistics for project
  getStatistics: async (projectId) => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/statistics`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Delete file
  deleteFile: async (projectId, filePath) => {
    // Кодируем каждый сегмент пути отдельно для корректной обработки
    const encodedFilePath = filePath.split('/').map(segment => encodeURIComponent(segment)).join('/');
    console.log('Deleting file:', filePath, 'encoded:', encodedFilePath);
    
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/files/${encodedFilePath}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Rename file
  renameFile: async (projectId, oldPath, newName) => {
    // Кодируем каждый сегмент пути отдельно для корректной обработки
    const encodedFilePath = oldPath.split('/').map(segment => encodeURIComponent(segment)).join('/');
    console.log('Renaming file:', oldPath, 'to', newName);
    
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/files/rename/${encodedFilePath}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ newName })
    });
    return handleResponse(response);
  },

  // Create folder
  createFolder: async (projectId, folderPath) => {
    console.log('Creating folder:', folderPath);
    
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/folders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ folderPath })
    });
    return handleResponse(response);
  }
};

// Analysis API functions
export const analysisAPI = {
  // Get analysis results for project
  getAnalysisResults: async (projectId) => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/analysis`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Run analysis on project
  runAnalysis: async (projectId) => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/analysis`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// GitHub API functions
export const gitHubAPI = {
  // Save GitHub token
  saveToken: async (token) => {
    const response = await fetch(`${API_BASE_URL}/github/token`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ token })
    });
    return handleResponse(response);
  },

  // Get GitHub connection status
  getStatus: async () => {
    const response = await fetch(`${API_BASE_URL}/github/status`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get user repositories
  getRepositories: async () => {
    const response = await fetch(`${API_BASE_URL}/github/repositories`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get specific repository
  getRepository: async (owner, repo) => {
    const response = await fetch(`${API_BASE_URL}/github/repositories/${owner}/${repo}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get repository branches
  getRepositoryBranches: async (owner, repo) => {
    const response = await fetch(`${API_BASE_URL}/github/repositories/${owner}/${repo}/branches`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Clone repository
  cloneRepository: async (owner, repo, targetPath) => {
    const response = await fetch(`${API_BASE_URL}/github/repositories/${owner}/${repo}/clone`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ targetPath })
    });
    return handleResponse(response);
  },

  // Create repository
  createRepository: async (name, description, isPrivate = false) => {
    const response = await fetch(`${API_BASE_URL}/github/repositories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        name, 
        description, 
        private: isPrivate 
      })
    });
    return handleResponse(response);
  },

  // Remove GitHub token
  removeToken: async () => {
    const response = await fetch(`${API_BASE_URL}/github/token`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Git operations for specific project
  // NOTE: project-level git operations were moved to projectGitAPI below.
};

// Project Git API functions (provider-agnostic; operates on already cloned workspace repos)
export const projectGitAPI = {
  getProjectRepositoryInfo: async (projectId) => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/git/info`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getProjectGitStatus: async (projectId) => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/git/status`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  createProjectCommit: async (projectId, message, files = []) => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/git/commit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message, files }),
    });
    return handleResponse(response);
  },

  pushProjectChanges: async (projectId, branch = 'main') => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/git/push`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ branch }),
    });
    return handleResponse(response);
  },

  pullProjectChanges: async (projectId, branch = 'main') => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/git/pull`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ branch }),
    });
    return handleResponse(response);
  },

  createProjectBranch: async (projectId, branchName, fromBranch = 'main') => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/git/branches`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name: branchName, from: fromBranch }),
    });
    return handleResponse(response);
  },

  switchProjectBranch: async (projectId, branchName) => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/git/branches/${branchName}/checkout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getProjectBranches: async (projectId) => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/git/branches`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  syncProject: async (projectId) => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/git/sync`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  stashProjectChanges: async (projectId, message = 'WIP') => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/git/stash`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message }),
    });
    return handleResponse(response);
  },

  stashPopProjectChanges: async (projectId) => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/git/stash/pop`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getStashStatus: async (projectId) => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/git/stash/status`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  resetProjectChanges: async (projectId, hard = false) => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/git/reset`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ hard }),
    });
    return handleResponse(response);
  },

  mergeProjectBranch: async (projectId, sourceBranch, targetBranch = 'main') => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/git/merge`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ source: sourceBranch, target: targetBranch }),
    });
    return handleResponse(response);
  },

  createProjectTag: async (projectId, tagName, message = '') => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/git/tags`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name: tagName, message }),
    });
    return handleResponse(response);
  },
};

// Combined API export
const api = {
  authAPI,
  projectAPI,
  projectsAPI,
  analysisAPI,
  gitHubAPI,
  projectGitAPI,
  websocketAPI,
  fileAPI
};

export { api };

export default {
  auth: authAPI,
  project: projectAPI,
  projects: projectsAPI,
  analysis: analysisAPI,
  github: gitHubAPI,
  projectGit: projectGitAPI,
  websocket: websocketAPI,
  file: fileAPI,
};
