import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import GitView from '../GitView';
import { api, gitHubAPI } from '../../../utils/api';

// Mock the API modules for integration tests
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

// Mock confirm dialog
global.confirm = jest.fn();
global.prompt = jest.fn();

const mockTheme = createTheme();

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={mockTheme}>
      {component}
    </ThemeProvider>
  );
};

describe('GitView Integration Tests', () => {
  const mockProjectId = 'integration-test-project';
  
  const mockBranchesData = {
    local: ['main', 'feature/integration-test'],
    remote: ['origin/main', 'origin/develop'],
    current: 'main'
  };

  const mockGraphData = {
    commits: [
      {
        hash: '1234567890abcdef',
        shortHash: '1234567',
        message: 'Integration test commit',
        author: 'Integration Tester',
        date: '2025-09-09T10:00:00Z',
        branchTrack: 0
      }
    ],
    total: 1
  };

  const mockGitStatus = [
    { file: 'integration-test.js', status: 'modified' },
    { file: 'test-file.md', status: 'added' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    global.confirm.mockReturnValue(true);
    global.prompt.mockReturnValue('test-input');
    
    // Setup successful API responses
    api.projectAPI.getBranches.mockResolvedValue(mockBranchesData);
    api.projectAPI.getBranchGraph.mockResolvedValue(mockGraphData);
    gitHubAPI.checkGitHubConnection.mockResolvedValue(true);
    gitHubAPI.getGitStatus.mockResolvedValue(mockGitStatus);
    gitHubAPI.getRemoteBranches.mockResolvedValue(['origin/feature/remote-integration']);
    gitHubAPI.createProjectCommit.mockResolvedValue({ success: true });
    gitHubAPI.pushProjectChanges.mockResolvedValue({ success: true });
    gitHubAPI.pullProjectChanges.mockResolvedValue({ success: true });
    gitHubAPI.createProjectBranch.mockResolvedValue({ success: true });
    gitHubAPI.stashProjectChanges.mockResolvedValue({ success: true });
    gitHubAPI.stashPopProjectChanges.mockResolvedValue({ success: true });
    gitHubAPI.resetProjectChanges.mockResolvedValue({ success: true });
    gitHubAPI.mergeProjectBranch.mockResolvedValue({ success: true });
    gitHubAPI.createProjectTag.mockResolvedValue({ success: true });
  });

  describe('Full Component Workflow', () => {
    test('complete git workflow - load, commit, push, pull', async () => {
      const user = userEvent.setup();
      
      renderWithTheme(<GitView projectId={mockProjectId} />);
      
      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Последний коммит')).toBeInTheDocument();
        expect(screen.getByText('Integration test commit')).toBeInTheDocument();
      });

      // Verify all sections are loaded
      expect(screen.getByText('Git Actions')).toBeInTheDocument();
      expect(screen.getByText('File Status')).toBeInTheDocument();
      expect(screen.getByText('Branches')).toBeInTheDocument();
      expect(screen.getByText('History')).toBeInTheDocument();

      // Test commit workflow
      const commitButton = screen.getByRole('button', { name: /commit/i });
      await user.click(commitButton);
      
      expect(screen.getByText('Create Commit')).toBeInTheDocument();
      
      const commitMessageInput = screen.getByLabelText('Commit Message');
      await user.type(commitMessageInput, 'Integration test commit message');
      
      const createCommitButton = screen.getByRole('button', { name: 'Create' });
      await user.click(createCommitButton);
      
      await waitFor(() => {
        expect(gitHubAPI.createProjectCommit).toHaveBeenCalledWith(
          mockProjectId, 
          'Integration test commit message'
        );
        expect(screen.getByText('Коммит успешно создан')).toBeInTheDocument();
      });

      // Test push
      const pushButton = screen.getByRole('button', { name: /push/i });
      await user.click(pushButton);
      
      await waitFor(() => {
        expect(gitHubAPI.pushProjectChanges).toHaveBeenCalledWith(mockProjectId, 'main');
        expect(screen.getByText('Изменения успешно отправлены в удаленный репозиторий')).toBeInTheDocument();
      });

      // Test pull
      const pullButton = screen.getByRole('button', { name: /pull/i });
      await user.click(pullButton);
      
      await waitFor(() => {
        expect(gitHubAPI.pullProjectChanges).toHaveBeenCalledWith(mockProjectId, 'main');
      });
    });

    test('branch creation and management workflow', async () => {
      const user = userEvent.setup();
      
      renderWithTheme(<GitView projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Git Actions')).toBeInTheDocument();
      });

      // Test branch creation
      const createBranchButton = screen.getByRole('button', { name: /create branch/i });
      await user.click(createBranchButton);
      
      expect(screen.getByText('Create New Branch')).toBeInTheDocument();
      
      const branchNameInput = screen.getByLabelText('Branch Name');
      await user.type(branchNameInput, 'feature/integration-new-branch');
      
      const createButton = screen.getByRole('button', { name: 'Create' });
      await user.click(createButton);
      
      await waitFor(() => {
        expect(gitHubAPI.createProjectBranch).toHaveBeenCalledWith(
          mockProjectId, 
          'feature/integration-new-branch'
        );
        expect(screen.getByText('Ветка "feature/integration-new-branch" успешно создана')).toBeInTheDocument();
      });

      // Test merge branch
      const mergeBranchButton = screen.getByRole('button', { name: /merge branch/i });
      await user.click(mergeBranchButton);
      
      await waitFor(() => {
        expect(gitHubAPI.mergeProjectBranch).toHaveBeenCalledWith(mockProjectId, 'test-input');
      });
    });

    test('stash operations workflow', async () => {
      const user = userEvent.setup();
      
      renderWithTheme(<GitView projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Git Actions')).toBeInTheDocument();
      });

      // Test stash changes
      const stashButton = screen.getByRole('button', { name: /stash changes/i });
      await user.click(stashButton);
      
      await waitFor(() => {
        expect(gitHubAPI.stashProjectChanges).toHaveBeenCalledWith(mockProjectId);
        expect(screen.getByText('Изменения успешно отложены (stashed)')).toBeInTheDocument();
      });

      // Test apply stash
      const applyStashButton = screen.getByRole('button', { name: /apply stash/i });
      await user.click(applyStashButton);
      
      await waitFor(() => {
        expect(gitHubAPI.stashPopProjectChanges).toHaveBeenCalledWith(mockProjectId);
        expect(screen.getByText('Отложенные изменения успешно применены')).toBeInTheDocument();
      });
    });

    test('dangerous operations with confirmations', async () => {
      const user = userEvent.setup();
      
      renderWithTheme(<GitView projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Git Actions')).toBeInTheDocument();
      });

      // Test reset changes (dangerous operation)
      const resetButton = screen.getByRole('button', { name: /reset changes/i });
      await user.click(resetButton);
      
      expect(global.confirm).toHaveBeenCalledWith(
        'Вы уверены, что хотите сбросить все изменения? Это действие нельзя отменить.'
      );
      
      await waitFor(() => {
        expect(gitHubAPI.resetProjectChanges).toHaveBeenCalledWith(mockProjectId);
        expect(screen.getByText('Изменения успешно сброшены')).toBeInTheDocument();
      });
    });

    test('tag creation workflow', async () => {
      const user = userEvent.setup();
      global.prompt
        .mockReturnValueOnce('v1.0.0') // tag name
        .mockReturnValueOnce('Release version 1.0.0'); // tag message
      
      renderWithTheme(<GitView projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Git Actions')).toBeInTheDocument();
      });

      const createTagButton = screen.getByRole('button', { name: /create tag/i });
      await user.click(createTagButton);
      
      await waitFor(() => {
        expect(gitHubAPI.createProjectTag).toHaveBeenCalledWith(
          mockProjectId, 
          'v1.0.0', 
          'Release version 1.0.0'
        );
        expect(screen.getByText('Тег "v1.0.0" успешно создан')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling Integration', () => {
    test('handles network errors gracefully across all actions', async () => {
      const user = userEvent.setup();
      gitHubAPI.createProjectCommit.mockRejectedValue(new Error('Network connection failed'));
      
      renderWithTheme(<GitView projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Git Actions')).toBeInTheDocument();
      });

      const commitButton = screen.getByRole('button', { name: /commit/i });
      await user.click(commitButton);
      
      const commitMessageInput = screen.getByLabelText('Commit Message');
      await user.type(commitMessageInput, 'Test commit');
      
      const createCommitButton = screen.getByRole('button', { name: 'Create' });
      await user.click(createCommitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Ошибка при создании коммита: Network connection failed')).toBeInTheDocument();
      });
    });

    test('handles API timeout scenarios', async () => {
      const user = userEvent.setup();
      gitHubAPI.pushProjectChanges.mockRejectedValue(new Error('Request timeout'));
      
      renderWithTheme(<GitView projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Git Actions')).toBeInTheDocument();
      });

      const pushButton = screen.getByRole('button', { name: /push/i });
      await user.click(pushButton);
      
      await waitFor(() => {
        expect(screen.getByText('Ошибка при отправке изменений: Request timeout')).toBeInTheDocument();
      });
    });
  });

  describe('Real-time Data Updates', () => {
    test('refresh updates all data sections', async () => {
      const user = userEvent.setup();
      
      renderWithTheme(<GitView projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Git Actions')).toBeInTheDocument();
      });

      // Clear previous calls
      jest.clearAllMocks();

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);
      
      await waitFor(() => {
        expect(api.projectAPI.getBranches).toHaveBeenCalledWith(mockProjectId);
        expect(api.projectAPI.getBranchGraph).toHaveBeenCalledWith(mockProjectId, 20);
        expect(gitHubAPI.getGitStatus).toHaveBeenCalledWith(mockProjectId);
      });
    });

    test('automatic data refresh after successful operations', async () => {
      const user = userEvent.setup();
      
      renderWithTheme(<GitView projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Git Actions')).toBeInTheDocument();
      });

      // Clear initial API calls
      jest.clearAllMocks();

      // Perform commit operation
      const commitButton = screen.getByRole('button', { name: /commit/i });
      await user.click(commitButton);
      
      const commitMessageInput = screen.getByLabelText('Commit Message');
      await user.type(commitMessageInput, 'Auto refresh test');
      
      const createCommitButton = screen.getByRole('button', { name: 'Create' });
      await user.click(createCommitButton);
      
      // Verify that data refresh happened after commit
      await waitFor(() => {
        expect(gitHubAPI.getGitStatus).toHaveBeenCalled();
        expect(api.projectAPI.getBranches).toHaveBeenCalled();
        expect(api.projectAPI.getBranchGraph).toHaveBeenCalled();
      });
    });
  });

  describe('Performance and Loading States', () => {
    test('shows loading states during operations', async () => {
      const user = userEvent.setup();
      let resolveCommit;
      gitHubAPI.createProjectCommit.mockImplementation(() => 
        new Promise(resolve => { resolveCommit = resolve; })
      );
      
      renderWithTheme(<GitView projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Git Actions')).toBeInTheDocument();
      });

      const commitButton = screen.getByRole('button', { name: /commit/i });
      await user.click(commitButton);
      
      const commitMessageInput = screen.getByLabelText('Commit Message');
      await user.type(commitMessageInput, 'Loading test');
      
      const createCommitButton = screen.getByRole('button', { name: 'Create' });
      await user.click(createCommitButton);
      
      // Should show loading state
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      
      // Resolve the promise
      resolveCommit({ success: true });
      
      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      });
    });
  });
});
