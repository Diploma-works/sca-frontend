package com.sca.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sca.model.GitHubRepository;
import com.sca.model.GitHubToken;
import com.sca.model.User;
import com.sca.service.GitHubService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(GitHubController.class)
class GitHubControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GitHubService gitHubService;

    @Autowired
    private ObjectMapper objectMapper;

    private User testUser;
    private GitHubToken testToken;
    private GitHubRepository testRepo;

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

        testRepo = new GitHubRepository();
        testRepo.setId(12345L);
        testRepo.setName("test-repo");
        testRepo.setFullName("testuser/test-repo");
        testRepo.setDescription("Test repository");
        testRepo.setHtmlUrl("https://github.com/testuser/test-repo");
        testRepo.setCloneUrl("https://github.com/testuser/test-repo.git");
    }

    @Test
    @WithMockUser
    void testSaveToken_Success() throws Exception {
        // Arrange
        when(gitHubService.saveUserToken(any(User.class), eq("valid_token")))
                .thenReturn(testToken);

        Map<String, String> request = Map.of("token", "valid_token");

        // Act & Assert
        mockMvc.perform(post("/github/token")
                        .with(user(testUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Токен успешно сохранен"))
                .andExpect(jsonPath("$.githubUsername").value("testuser"));

        verify(gitHubService).saveUserToken(any(User.class), eq("valid_token"));
    }

    @Test
    @WithMockUser
    void testSaveToken_EmptyToken() throws Exception {
        // Arrange
        Map<String, String> request = Map.of("token", "");

        // Act & Assert
        mockMvc.perform(post("/github/token")
                        .with(user(testUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Токен не может быть пустым"));
    }

    @Test
    @WithMockUser
    void testSaveToken_InvalidToken() throws Exception {
        // Arrange
        when(gitHubService.saveUserToken(any(User.class), eq("invalid_token")))
                .thenThrow(new RuntimeException("Недействительный GitHub токен"));

        Map<String, String> request = Map.of("token", "invalid_token");

        // Act & Assert
        mockMvc.perform(post("/github/token")
                        .with(user(testUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Недействительный GitHub токен"));
    }

    @Test
    @WithMockUser
    void testGetStatus_Connected() throws Exception {
        // Arrange
        when(gitHubService.getUserToken(any(User.class))).thenReturn(Optional.of(testToken));
        when(gitHubService.isTokenValid(any(User.class))).thenReturn(true);

        // Act & Assert
        mockMvc.perform(get("/github/status")
                        .with(user(testUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.connected").value(true))
                .andExpect(jsonPath("$.githubUsername").value("testuser"))
                .andExpect(jsonPath("$.message").value("Подключение активно"));
    }

    @Test
    @WithMockUser
    void testGetStatus_NotConnected() throws Exception {
        // Arrange
        when(gitHubService.getUserToken(any(User.class))).thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(get("/github/status")
                        .with(user(testUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.connected").value(false))
                .andExpect(jsonPath("$.message").value("GitHub токен не настроен"));
    }

    @Test
    @WithMockUser
    void testGetRepositories_Success() throws Exception {
        // Arrange
        List<GitHubRepository> repositories = Arrays.asList(testRepo);
        when(gitHubService.getUserRepositories(any(User.class))).thenReturn(repositories);

        // Act & Assert
        mockMvc.perform(get("/github/repositories")
                        .with(user(testUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").value("test-repo"))
                .andExpect(jsonPath("$[0].fullName").value("testuser/test-repo"));
    }

    @Test
    @WithMockUser
    void testGetRepository_Success() throws Exception {
        // Arrange
        when(gitHubService.getRepository(any(User.class), eq("testuser"), eq("test-repo")))
                .thenReturn(testRepo);

        // Act & Assert
        mockMvc.perform(get("/github/repositories/testuser/test-repo")
                        .with(user(testUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("test-repo"))
                .andExpect(jsonPath("$.fullName").value("testuser/test-repo"));
    }

    @Test
    @WithMockUser
    void testCreateRepository_Success() throws Exception {
        // Arrange
        when(gitHubService.createRepository(any(User.class), eq("new-repo"), eq("New repository"), eq(false)))
                .thenReturn(testRepo);

        Map<String, Object> request = Map.of(
                "name", "new-repo",
                "description", "New repository",
                "private", false
        );

        // Act & Assert
        mockMvc.perform(post("/github/repositories")
                        .with(user(testUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("test-repo"));
    }

    @Test
    @WithMockUser
    void testCreateRepository_EmptyName() throws Exception {
        // Arrange
        Map<String, Object> request = Map.of(
                "name", "",
                "description", "New repository"
        );

        // Act & Assert
        mockMvc.perform(post("/github/repositories")
                        .with(user(testUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Имя репозитория не может быть пустым"));
    }

    @Test
    @WithMockUser
    void testRemoveToken_Success() throws Exception {
        // Act & Assert
        mockMvc.perform(delete("/github/token")
                        .with(user(testUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Токен успешно удален"));

        verify(gitHubService).removeUserToken(any(User.class));
    }
}
