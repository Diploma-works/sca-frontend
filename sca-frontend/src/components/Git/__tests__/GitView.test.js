import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import GitView from '../GitView';
import { api, gitHubAPI, projectGitAPI } from '../../../utils/api';

// Mock the API modules
jest.mock('../../../utils/api', () => ({
  api: {
    projectAPI: {
      getBranches: jest.fn(),
      getBranchGraph: jest.fn(),
    },
  },
  gitHubAPI: {
    getStatus: jest.fn(),
  },
  projectGitAPI: {
    getProjectGitStatus: jest.fn(),
    getStashStatus: jest.fn(),
    createProjectCommit: jest.fn(),
    pushProjectChanges: jest.fn(),
    pullProjectChanges: jest.fn(),
    createProjectBranch: jest.fn(),
    stashProjectChanges: jest.fn(),
    stashPopProjectChanges: jest.fn(),
    resetProjectChanges: jest.fn(),
    mergeProjectBranch: jest.fn(),
    switchProjectBranch: jest.fn(),
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
    gitHubAPI.getStatus.mockResolvedValue({ connected: true });
    projectGitAPI.getProjectGitStatus.mockResolvedValue({ files: mockGitStatus });
    projectGitAPI.getStashStatus.mockResolvedValue({ hasStash: false });
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
      
      expect(screen.getByText('Loading git data...')).toBeInTheDocument();
    });

    test('displays error message when no project ID provided', async () => {
      renderWithTheme(<GitView />);
      
      await waitFor(() => {
        expect(screen.getByText(/No project selected/)).toBeInTheDocument();
      });
    });

    test('renders last commit info when commits available', async () => {
      renderWithTheme(<GitView projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Последний коммит')).toBeInTheDocument();
        expect(screen.getAllByText('Initial commit').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Test User').length).toBeGreaterThan(0);
        expect(screen.getAllByText('1234567').length).toBeGreaterThan(0);
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

      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByRole('heading', { name: 'Create Commit' })).toBeInTheDocument();
      expect(within(dialog).getByLabelText('Commit Message')).toBeInTheDocument();
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
        expect(screen.getByText(/Local Branches/)).toBeInTheDocument();
        expect(screen.getByText(/Remote Branches/)).toBeInTheDocument();
        expect(screen.getByText('main')).toBeInTheDocument();
        expect(screen.getByText('feature/test-branch')).toBeInTheDocument();
        expect(screen.getByText('origin/main')).toBeInTheDocument();
        expect(screen.getByText('origin/develop')).toBeInTheDocument();
      });
    });

    test('loads remote branches from project API', async () => {
      renderWithTheme(<GitView projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(api.projectAPI.getBranches).toHaveBeenCalledWith(mockProjectId);
      });
    });
  });

  describe('File Status Section', () => {
    test('displays file status information', async () => {
      renderWithTheme(<GitView projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.getByText(/File Status/)).toBeInTheDocument();
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
        expect(screen.getAllByText('Initial commit').length).toBeGreaterThan(0);
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
        expect(gitHubAPI.getStatus).toHaveBeenCalled();
        expect(projectGitAPI.getProjectGitStatus).toHaveBeenCalledWith(mockProjectId);
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
        expect(screen.getByText(/Project not found\. Please select a valid project from the Projects tab\./)).toBeInTheDocument();
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
        expect(projectGitAPI.getProjectGitStatus).toHaveBeenCalledTimes(2);
      });
    });

    test('keeps push/pull enabled when project is selected', async () => {
      gitHubAPI.getStatus.mockResolvedValue({ connected: false });
      
      renderWithTheme(<GitView projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /push/i })).toBeEnabled();
        expect(screen.getByRole('button', { name: /pull/i })).toBeEnabled();
        expect(screen.getByRole('button', { name: /create branch/i })).toBeEnabled();
      });
    });
  });
});
