package com.sca.repository;

import com.sca.model.GitHubToken;
import com.sca.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class GitHubTokenRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private GitHubTokenRepository gitHubTokenRepository;

    private User testUser;
    private GitHubToken testToken;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setPassword("password");
        testUser.setEmail("test@example.com");
        testUser = entityManager.persistAndFlush(testUser);

        testToken = new GitHubToken();
        testToken.setUser(testUser);
        testToken.setAccessToken("ghp_test_token");
        testToken.setGithubUsername("testuser");
    }

    @Test
    void testSaveAndFindByUser() {
        // Save
        GitHubToken savedToken = gitHubTokenRepository.save(testToken);
        assertNotNull(savedToken.getId());

        // Find by user
        Optional<GitHubToken> foundToken = gitHubTokenRepository.findByUser(testUser);
        assertTrue(foundToken.isPresent());
        assertEquals(testToken.getAccessToken(), foundToken.get().getAccessToken());
        assertEquals(testToken.getGithubUsername(), foundToken.get().getGithubUsername());
    }

    @Test
    void testFindByGithubUsername() {
        // Save
        gitHubTokenRepository.save(testToken);

        // Find by GitHub username
        Optional<GitHubToken> foundToken = gitHubTokenRepository.findByGithubUsername("testuser");
        assertTrue(foundToken.isPresent());
        assertEquals(testToken.getAccessToken(), foundToken.get().getAccessToken());
    }

    @Test
    void testDeleteByUser() {
        // Save
        gitHubTokenRepository.save(testToken);
        
        // Verify it exists
        Optional<GitHubToken> foundToken = gitHubTokenRepository.findByUser(testUser);
        assertTrue(foundToken.isPresent());

        // Delete
        gitHubTokenRepository.deleteByUser(testUser);

        // Verify it's deleted
        Optional<GitHubToken> deletedToken = gitHubTokenRepository.findByUser(testUser);
        assertFalse(deletedToken.isPresent());
    }

    @Test
    void testFindByUser_NotFound() {
        User anotherUser = new User();
        anotherUser.setUsername("anotheruser");
        anotherUser.setPassword("password");
        anotherUser.setEmail("another@example.com");
        anotherUser = entityManager.persistAndFlush(anotherUser);

        Optional<GitHubToken> foundToken = gitHubTokenRepository.findByUser(anotherUser);
        assertFalse(foundToken.isPresent());
    }

    @Test
    void testFindByGithubUsername_NotFound() {
        Optional<GitHubToken> foundToken = gitHubTokenRepository.findByGithubUsername("nonexistent");
        assertFalse(foundToken.isPresent());
    }
}
