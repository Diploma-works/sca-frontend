import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import GitView from '../GitView';
import { api, gitHubAPI } from '../../../utils/api';

// Mock the API modules
jest.mock('../../../utils/api', () => ({
  api: {
    projectAPI: {
      getBranches: jest.fn(),
      getBranchGraph: jest.fn(),
    },
  },
  gitHubAPI: {
    checkGitHubConnection: jest.fn(),
    getGitStatus: jest.fn(),
    getRemoteBranches: jest.fn(),
    createProjectCommit: jest.fn(),
    pushProjectChanges: jest.fn(),
    pullProjectChanges: jest.fn(),
    createProjectBranch: jest.fn(),
    stashProjectChanges: jest.fn(),
    stashPopProjectChanges: jest.fn(),
    resetProjectChanges: jest.fn(),
    mergeProjectBranch: jest.fn(),
    createProjectTag: jest.fn(),
  },
}));

// Mock ScrollableContainer
jest.mock('../../ScrollableContainer', () => {
  return function MockScrollableContainer({ children, ...props }) {
    return <div data-testid="scrollable-container" {...props}>{children}</div>;
  };
});

const mockTheme = createTheme();

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={mockTheme}>
      {component}
    </ThemeProvider>
  );
};

describe('GitView Component', () => {
  const mockProjectId = 'test-project-1';
  
  const mockBranchesData = {
    local: ['main', 'feature/test-branch'],
    remote: ['origin/main', 'origin/develop'],
    current: 'main'
  };

  const mockGraphData = {
    commits: [
      {
        hash: '1234567890abcdef',
        shortHash: '1234567',
        message: 'Initial commit',
        author: 'Test User',
        date: '2025-09-09T10:00:00Z',
        branchTrack: 0
      },
      {
        hash: 'abcdef1234567890',
        shortHash: 'abcdef1',
        message: 'Add new feature',
        author: 'Test User 2',
        date: '2025-09-08T15:30:00Z',
        branchTrack: 1
      }
    ],
    total: 2
  };

  const mockGitStatus = [
    { file: 'src/test.js', status: 'modified' },
    { file: 'README.md', status: 'added' }
  ];

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup default mock implementations
    api.projectAPI.getBranches.mockResolvedValue(mockBranchesData);
    api.projectAPI.getBranchGraph.mockResolvedValue(mockGraphData);
    gitHubAPI.checkGitHubConnection.mockResolvedValue(true);
    gitHubAPI.getGitStatus.mockResolvedValue(mockGitStatus);
    gitHubAPI.getRemoteBranches.mockResolvedValue(['origin/feature/remote-only']);
  });

  describe('Rendering', () => {
    test('renders GitView component with project ID', async () => {
      renderWithTheme(<GitView projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('scrollable-container')).toBeInTheDocument();
      });
    });

    test('shows loading state initially', () => {
      renderWithTheme(<GitView projectId={mockProjectId} />);
      
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    test('displays error message when no project ID provided', async () => {
      renderWithTheme(<GitView />);
      
      await waitFor(() => {
        expect(screen.getByText('No project selected')).toBeInTheDocument();
      });
    });

    test('renders last commit info when commits available', async () => {
      renderWithTheme(<GitView projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Последний коммит')).toBeInTheDocument();
        expect(screen.getByText('Initial commit')).toBeInTheDocument();
        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('1234567')).toBeInTheDocument();
      });
    });
  });

  describe('Git Actions', () => {
    test('renders all git action buttons', async () => {
      renderWithTheme(<GitView projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /commit/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /push/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /pull/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /create branch/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /merge branch/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /stash changes/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /apply stash/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /create tag/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /reset changes/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
      });
    });

    test('commit button shows correct count', async () => {
      renderWithTheme(<GitView projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Commit (2)')).toBeInTheDocument();
      });
    });

    test('opens commit dialog when commit button clicked', async () => {
      renderWithTheme(<GitView projectId={mockProjectId} />);
      
      await waitFor(() => {
        const commitButton = screen.getByRole('button', { name: /commit/i });
        fireEvent.click(commitButton);
      });

      expect(screen.getByText('Create Commit')).toBeInTheDocument();
      expect(screen.getByLabelText('Commit Message')).toBeInTheDocument();
    });

    test('opens branch creation dialog when create branch clicked', async () => {
      renderWithTheme(<GitView projectId={mockProjectId} />);
      
      await waitFor(() => {
        const createBranchButton = screen.getByRole('button', { name: /create branch/i });
        fireEvent.click(createBranchButton);
      });

      expect(screen.getByText('Create New Branch')).toBeInTheDocument();
      expect(screen.getByLabelText('Branch Name')).toBeInTheDocument();
    });
  });

  describe('Branches Section', () => {
    test('displays local and remote branches', async () => {
      renderWithTheme(<GitView projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Local Branches')).toBeInTheDocument();
        expect(screen.getByText('Remote Branches')).toBeInTheDocument();
        expect(screen.getByText('main')).toBeInTheDocument();
        expect(screen.getByText('feature/test-branch')).toBeInTheDocument();
        expect(screen.getByText('origin/main')).toBeInTheDocument();
        expect(screen.getByText('origin/develop')).toBeInTheDocument();
      });
    });

    test('includes additional remote branches from API', async () => {
      renderWithTheme(<GitView projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(gitHubAPI.getRemoteBranches).toHaveBeenCalledWith(mockProjectId);
      });
    });
  });

  describe('File Status Section', () => {
    test('displays file status information', async () => {
      renderWithTheme(<GitView projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.getByText('File Status')).toBeInTheDocument();
        expect(screen.getByText('src/test.js')).toBeInTheDocument();
        expect(screen.getByText('README.md')).toBeInTheDocument();
      });
    });
  });

  describe('History Section', () => {
    test('renders commit history with proper styling', async () => {
      renderWithTheme(<GitView projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.getByText('History')).toBeInTheDocument();
        expect(screen.getByText('Initial commit')).toBeInTheDocument();
        expect(screen.getByText('Add new feature')).toBeInTheDocument();
      });
    });
  });

  describe('API Integration', () => {
    test('calls necessary APIs on component mount', async () => {
      renderWithTheme(<GitView projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(api.projectAPI.getBranches).toHaveBeenCalledWith(mockProjectId);
        expect(api.projectAPI.getBranchGraph).toHaveBeenCalledWith(mockProjectId, 20);
        expect(gitHubAPI.checkGitHubConnection).toHaveBeenCalledWith(mockProjectId);
        expect(gitHubAPI.getGitStatus).toHaveBeenCalledWith(mockProjectId);
      });
    });

    test('handles API errors gracefully', async () => {
      api.projectAPI.getBranches.mockRejectedValue(new Error('Network error'));
      
      renderWithTheme(<GitView projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Failed to fetch git data/)).toBeInTheDocument();
      });
    });

    test('shows project not found error correctly', async () => {
      api.projectAPI.getBranches.mockRejectedValue(new Error('Project not found'));
      
      renderWithTheme(<GitView projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Project not found. Please select a valid project from the Projects tab.')).toBeInTheDocument();
      });
    });
  });

  describe('Interactive Actions', () => {
    test('refresh button updates data', async () => {
      renderWithTheme(<GitView projectId={mockProjectId} />);
      
      await waitFor(() => {
        const refreshButton = screen.getByRole('button', { name: /refresh/i });
        fireEvent.click(refreshButton);
      });

      // Should call APIs again
      await waitFor(() => {
        expect(api.projectAPI.getBranches).toHaveBeenCalledTimes(2);
        expect(api.projectAPI.getBranchGraph).toHaveBeenCalledTimes(2);
        expect(gitHubAPI.getGitStatus).toHaveBeenCalledTimes(2);
      });
    });

    test('disables buttons when not connected', async () => {
      gitHubAPI.checkGitHubConnection.mockResolvedValue(false);
      
      renderWithTheme(<GitView projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /push/i })).toBeDisabled();
        expect(screen.getByRole('button', { name: /pull/i })).toBeDisabled();
        expect(screen.getByRole('button', { name: /create branch/i })).toBeDisabled();
      });
    });
  });
});
