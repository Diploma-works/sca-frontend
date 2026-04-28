import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import GitView from '../GitView';
import { api, gitHubAPI, projectGitAPI } from '../../../utils/api';

// Mock the API modules for integration tests
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
    gitHubAPI.getStatus.mockResolvedValue({ connected: true });
    projectGitAPI.getProjectGitStatus.mockResolvedValue({ files: mockGitStatus });
    projectGitAPI.getStashStatus.mockResolvedValue({ hasStash: true });
    projectGitAPI.createProjectCommit.mockResolvedValue({ success: true });
    projectGitAPI.pushProjectChanges.mockResolvedValue({ success: true });
    projectGitAPI.pullProjectChanges.mockResolvedValue({ success: true });
    projectGitAPI.createProjectBranch.mockResolvedValue({ success: true });
    projectGitAPI.stashProjectChanges.mockResolvedValue({ success: true });
    projectGitAPI.stashPopProjectChanges.mockResolvedValue({ success: true });
    projectGitAPI.resetProjectChanges.mockResolvedValue({ success: true });
    projectGitAPI.mergeProjectBranch.mockResolvedValue({ success: true });
  });

  describe('Full Component Workflow', () => {
    test('complete git workflow - load, commit, push, pull', async () => {
      renderWithTheme(<GitView projectId={mockProjectId} />);
      
      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Последний коммит')).toBeInTheDocument();
        expect(screen.getAllByText('Integration test commit').length).toBeGreaterThan(0);
      });

      // Verify all sections are loaded
      expect(screen.getByText('Git Actions')).toBeInTheDocument();
  expect(screen.getByText(/File Status/i)).toBeInTheDocument();
  expect(screen.getAllByText(/Branches/i).length).toBeGreaterThan(0);
  expect(screen.getByText(/History/i)).toBeInTheDocument();

      // Test commit workflow
      const commitButton = screen.getByRole('button', { name: /commit/i });
      fireEvent.click(commitButton);
      
      const commitDialog = screen.getByRole('dialog');
  expect(within(commitDialog).getByRole('heading', { name: 'Create Commit' })).toBeInTheDocument();
      const commitMessageInput = within(commitDialog).getByLabelText('Commit Message');
      fireEvent.change(commitMessageInput, { target: { value: 'Integration test commit message' } });
      
      const createCommitButton = within(commitDialog).getByRole('button', { name: /create commit/i });
      fireEvent.click(createCommitButton);
      
      await waitFor(() => {
        expect(projectGitAPI.createProjectCommit).toHaveBeenCalledWith(
          mockProjectId, 
          'Integration test commit message'
        );
        expect(screen.getByText('Коммит успешно создан')).toBeInTheDocument();
      });

      // Test push
      const pushButton = screen.getByRole('button', { name: /push/i });
      fireEvent.click(pushButton);
      
      await waitFor(() => {
        expect(projectGitAPI.pushProjectChanges).toHaveBeenCalledWith(mockProjectId, 'main');
        expect(screen.getByText('Изменения успешно отправлены в удаленный репозиторий')).toBeInTheDocument();
      });

      // Test pull
      const pullButton = screen.getByRole('button', { name: /pull/i });
      fireEvent.click(pullButton);
      
      await waitFor(() => {
        expect(projectGitAPI.pullProjectChanges).toHaveBeenCalledWith(mockProjectId, 'main');
      });
    });

    test('branch creation and management workflow', async () => {
      renderWithTheme(<GitView projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Git Actions')).toBeInTheDocument();
      });

      // Test branch creation
      const createBranchButton = screen.getByRole('button', { name: /create branch/i });
      fireEvent.click(createBranchButton);
      
      expect(screen.getByText('Create New Branch')).toBeInTheDocument();
      
      const branchDialog = screen.getByRole('dialog');
      const branchNameInput = within(branchDialog).getByLabelText('Branch Name');
      fireEvent.change(branchNameInput, { target: { value: 'feature/integration-new-branch' } });
      
      const createButton = within(branchDialog).getByRole('button', { name: /create branch/i });
      fireEvent.click(createButton);
      
      await waitFor(() => {
        expect(projectGitAPI.createProjectBranch).toHaveBeenCalledWith(
          mockProjectId, 
          'feature/integration-new-branch'
        );
        expect(screen.getByText('Ветка "feature/integration-new-branch" успешно создана')).toBeInTheDocument();
      });

      // Test merge branch
      const mergeBranchButton = screen.getByRole('button', { name: /merge branch/i });
      fireEvent.click(mergeBranchButton);
      
      await waitFor(() => {
        expect(projectGitAPI.mergeProjectBranch).toHaveBeenCalledWith(mockProjectId, 'test-input');
      });
    });

    test('stash operations workflow', async () => {
      renderWithTheme(<GitView projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Git Actions')).toBeInTheDocument();
      });

      // Test stash changes
      const stashButton = screen.getByRole('button', { name: /stash changes/i });
      fireEvent.click(stashButton);
      
      await waitFor(() => {
        expect(projectGitAPI.stashProjectChanges).toHaveBeenCalledWith(mockProjectId);
        expect(screen.getByText('Изменения успешно отложены (stashed)')).toBeInTheDocument();
      });

      // Test apply stash
      const applyStashButton = screen.getByRole('button', { name: /apply stash/i });
      fireEvent.click(applyStashButton);
      
      await waitFor(() => {
        expect(projectGitAPI.stashPopProjectChanges).toHaveBeenCalledWith(mockProjectId);
        expect(screen.getByText('Отложенные изменения успешно применены')).toBeInTheDocument();
      });
    });

    test('dangerous operations with confirmations', async () => {
      renderWithTheme(<GitView projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Git Actions')).toBeInTheDocument();
      });

      // Test reset changes (dangerous operation)
      const resetButton = screen.getByRole('button', { name: /reset changes/i });
      fireEvent.click(resetButton);
      
      expect(global.confirm).toHaveBeenCalled();
      
      await waitFor(() => {
        expect(projectGitAPI.resetProjectChanges).toHaveBeenCalledWith(mockProjectId, true);
        expect(screen.getByText('Все изменения сброшены к последнему коммиту')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling Integration', () => {
    test('handles network errors gracefully across all actions', async () => {
      projectGitAPI.createProjectCommit.mockRejectedValue(new Error('Network connection failed'));
      
      renderWithTheme(<GitView projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Git Actions')).toBeInTheDocument();
      });

      const commitButton = screen.getByRole('button', { name: /commit/i });
      fireEvent.click(commitButton);
      
      const commitDialog = screen.getByRole('dialog');
      const commitMessageInput = within(commitDialog).getByLabelText('Commit Message');
      fireEvent.change(commitMessageInput, { target: { value: 'Test commit' } });
      
      const createCommitButton = within(commitDialog).getByRole('button', { name: /create commit/i });
      fireEvent.click(createCommitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Ошибка при создании коммита: Network connection failed/i)).toBeInTheDocument();
      });
    });

    test('handles API timeout scenarios', async () => {
      projectGitAPI.pushProjectChanges.mockRejectedValue(new Error('Request timeout'));
      
      renderWithTheme(<GitView projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Git Actions')).toBeInTheDocument();
      });

      const pushButton = screen.getByRole('button', { name: /push/i });
      fireEvent.click(pushButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Ошибка при отправке изменений: Request timeout/i)).toBeInTheDocument();
      });
    });
  });

  describe('Real-time Data Updates', () => {
    test('refresh updates all data sections', async () => {
      renderWithTheme(<GitView projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Git Actions')).toBeInTheDocument();
      });

      // Clear previous calls
      jest.clearAllMocks();

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);
      
      await waitFor(() => {
        expect(api.projectAPI.getBranches).toHaveBeenCalledWith(mockProjectId);
        expect(api.projectAPI.getBranchGraph).toHaveBeenCalledWith(mockProjectId, 20);
        expect(projectGitAPI.getProjectGitStatus).toHaveBeenCalledWith(mockProjectId);
      });
    });

    test('automatic data refresh after successful operations', async () => {
      renderWithTheme(<GitView projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Git Actions')).toBeInTheDocument();
      });

      // Clear initial API calls
      jest.clearAllMocks();

      // Perform commit operation
      const commitButton = screen.getByRole('button', { name: /commit/i });
      fireEvent.click(commitButton);
      
      const commitDialog = screen.getByRole('dialog');
      const commitMessageInput = within(commitDialog).getByLabelText('Commit Message');
      fireEvent.change(commitMessageInput, { target: { value: 'Auto refresh test' } });
      
      const createCommitButton = within(commitDialog).getByRole('button', { name: /create commit/i });
      fireEvent.click(createCommitButton);
      
      // Verify that data refresh happened after commit
      await waitFor(() => {
        expect(projectGitAPI.getProjectGitStatus).toHaveBeenCalled();
        expect(api.projectAPI.getBranches).toHaveBeenCalled();
        expect(api.projectAPI.getBranchGraph).toHaveBeenCalled();
      });
    });
  });

  describe('Performance and Loading States', () => {
    test('handles delayed commit operation and completes successfully', async () => {
      let resolveCommit;
      projectGitAPI.createProjectCommit.mockImplementation(() => 
        new Promise(resolve => { resolveCommit = resolve; })
      );
      
      renderWithTheme(<GitView projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Git Actions')).toBeInTheDocument();
      });

      const commitButton = screen.getByRole('button', { name: /commit/i });
  fireEvent.click(commitButton);
      
  const commitDialog = screen.getByRole('dialog');
  const commitMessageInput = within(commitDialog).getByLabelText('Commit Message');
  fireEvent.change(commitMessageInput, { target: { value: 'Loading test' } });
      
  const createCommitButton = within(commitDialog).getByRole('button', { name: /create commit/i });
  fireEvent.click(createCommitButton);
      
      await waitFor(() => {
        expect(projectGitAPI.createProjectCommit).toHaveBeenCalledWith(mockProjectId, 'Loading test');
      });
      
      // Resolve the promise
      resolveCommit({ success: true });
      
      await waitFor(() => {
        expect(screen.getByText('Коммит успешно создан')).toBeInTheDocument();
      });
    });
  });
});
