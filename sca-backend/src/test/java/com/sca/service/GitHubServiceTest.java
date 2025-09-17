package com.sca.service;

import com.sca.model.GitHubRepository;
import com.sca.model.GitHubToken;
import com.sca.model.User;
import com.sca.repository.GitHubTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GitHubServiceTest {

    @Mock
    private GitHubTokenRepository gitHubTokenRepository;

    @InjectMocks
    private GitHubService gitHubService;

    private User testUser;
    private GitHubToken testToken;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");

        testToken = new GitHubToken();
        testToken.setId(1L);
        testToken.setUser(testUser);
        testToken.setAccessToken("ghp_test_token");
        testToken.setGithubUsername("testuser");
    }

    @Test
    void testGetUserToken_WhenTokenExists() {
        // Arrange
        when(gitHubTokenRepository.findByUser(testUser)).thenReturn(Optional.of(testToken));

        // Act
        Optional<GitHubToken> result = gitHubService.getUserToken(testUser);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(testToken.getAccessToken(), result.get().getAccessToken());
        verify(gitHubTokenRepository).findByUser(testUser);
    }

    @Test
    void testGetUserToken_WhenTokenNotExists() {
        // Arrange
        when(gitHubTokenRepository.findByUser(testUser)).thenReturn(Optional.empty());

        // Act
        Optional<GitHubToken> result = gitHubService.getUserToken(testUser);

        // Assert
        assertFalse(result.isPresent());
        verify(gitHubTokenRepository).findByUser(testUser);
    }

    @Test
    void testRemoveUserToken() {
        // Act
        gitHubService.removeUserToken(testUser);

        // Assert
        verify(gitHubTokenRepository).deleteByUser(testUser);
    }

    @Test
    void testSaveUserToken_WithInvalidToken() {
        // Arrange
        String invalidToken = "invalid_token";

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            gitHubService.saveUserToken(testUser, invalidToken);
        });

        assertEquals("Недействительный GitHub токен", exception.getMessage());
    }

    @Test
    void testGetUserRepositories_WithoutToken() {
        // Arrange
        when(gitHubTokenRepository.findByUser(testUser)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            gitHubService.getUserRepositories(testUser);
        });

        assertTrue(exception.getMessage().contains("GitHub токен не найден"));
    }

    @Test
    void testGetRepository_WithoutToken() {
        // Arrange
        when(gitHubTokenRepository.findByUser(testUser)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            gitHubService.getRepository(testUser, "owner", "repo");
        });

        assertTrue(exception.getMessage().contains("GitHub токен не найден"));
    }

    @Test
    void testGetRepositoryBranches_WithoutToken() {
        // Arrange
        when(gitHubTokenRepository.findByUser(testUser)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            gitHubService.getRepositoryBranches(testUser, "owner", "repo");
        });

        assertTrue(exception.getMessage().contains("GitHub токен не найден"));
    }

    @Test
    void testCloneRepository_WithoutToken() {
        // Arrange
        when(gitHubTokenRepository.findByUser(testUser)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            gitHubService.cloneRepository(testUser, "owner", "repo", "/path");
        });

        assertTrue(exception.getMessage().contains("GitHub токен не найден"));
    }

    @Test
    void testCreateRepository_WithoutToken() {
        // Arrange
        when(gitHubTokenRepository.findByUser(testUser)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            gitHubService.createRepository(testUser, "test-repo", "Test description", false);
        });

        assertTrue(exception.getMessage().contains("GitHub токен не найден"));
    }

    @Test
    void testIsTokenValid_WithoutToken() {
        // Arrange
        when(gitHubTokenRepository.findByUser(testUser)).thenReturn(Optional.empty());

        // Act
        boolean result = gitHubService.isTokenValid(testUser);

        // Assert
        assertFalse(result);
    }
}
