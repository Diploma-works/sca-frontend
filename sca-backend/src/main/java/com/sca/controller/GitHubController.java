package com.sca.controller;

import com.sca.model.*;
import com.sca.service.GitHubService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/github")
@CrossOrigin(origins = {"http://localhost:3000", "https://diploma-works.github.io"})
public class GitHubController {

    @Autowired
    private GitHubService gitHubService;

    /**
     * Сохранить персональный токен GitHub
     */
    @PostMapping("/token")
    public ResponseEntity<?> saveToken(@AuthenticationPrincipal User user,
                                     @Valid @RequestBody Map<String, String> request) {
        try {
            String accessToken = request.get("token");
            if (accessToken == null || accessToken.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Токен не может быть пустым"));
            }

            GitHubToken token = gitHubService.saveUserToken(user, accessToken);
            return ResponseEntity.ok(Map.of(
                "message", "Токен успешно сохранен",
                "githubUsername", token.getGithubUsername()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Проверить статус интеграции с GitHub
     */
    @GetMapping("/status")
    public ResponseEntity<?> getStatus(@AuthenticationPrincipal User user) {
        try {
            var tokenOpt = gitHubService.getUserToken(user);
            if (tokenOpt.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                    "connected", false,
                    "message", "GitHub токен не настроен"
                ));
            }

            boolean isValid = gitHubService.isTokenValid(user);
            return ResponseEntity.ok(Map.of(
                "connected", isValid,
                "githubUsername", tokenOpt.get().getGithubUsername(),
                "message", isValid ? "Подключение активно" : "Токен недействителен"
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Получить список репозиториев пользователя
     */
    @GetMapping("/repositories")
    public ResponseEntity<?> getRepositories(@AuthenticationPrincipal User user) {
        try {
            List<GitHubRepository> repositories = gitHubService.getUserRepositories(user);
            return ResponseEntity.ok(repositories);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Получить информацию о конкретном репозитории
     */
    @GetMapping("/repositories/{owner}/{repo}")
    public ResponseEntity<?> getRepository(@AuthenticationPrincipal User user,
                                         @PathVariable String owner,
                                         @PathVariable String repo) {
        try {
            GitHubRepository repository = gitHubService.getRepository(user, owner, repo);
            return ResponseEntity.ok(repository);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Получить список веток репозитория
     */
    @GetMapping("/repositories/{owner}/{repo}/branches")
    public ResponseEntity<?> getRepositoryBranches(@AuthenticationPrincipal User user,
                                                  @PathVariable String owner,
                                                  @PathVariable String repo) {
        try {
            List<GitHubBranch> branches = gitHubService.getRepositoryBranches(user, owner, repo);
            return ResponseEntity.ok(branches);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Клонировать репозиторий
     */
    @PostMapping("/repositories/{owner}/{repo}/clone")
    public ResponseEntity<?> cloneRepository(@AuthenticationPrincipal User user,
                                           @PathVariable String owner,
                                           @PathVariable String repo,
                                           @RequestBody Map<String, String> request) {
        try {
            String targetPath = request.get("targetPath");
            String cloneUrl = gitHubService.cloneRepository(user, owner, repo, targetPath);
            return ResponseEntity.ok(Map.of(
                "message", "Репозиторий готов к клонированию",
                "cloneUrl", cloneUrl
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Создать новый репозиторий
     */
    @PostMapping("/repositories")
    public ResponseEntity<?> createRepository(@AuthenticationPrincipal User user,
                                            @Valid @RequestBody Map<String, Object> request) {
        try {
            String name = (String) request.get("name");
            String description = (String) request.get("description");
            boolean isPrivate = (Boolean) request.getOrDefault("private", false);

            if (name == null || name.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Имя репозитория не может быть пустым"));
            }

            GitHubRepository repository = gitHubService.createRepository(user, name, description, isPrivate);
            return ResponseEntity.ok(repository);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Удалить токен GitHub
     */
    @DeleteMapping("/token")
    public ResponseEntity<?> removeToken(@AuthenticationPrincipal User user) {
        try {
            gitHubService.removeUserToken(user);
            return ResponseEntity.ok(Map.of("message", "Токен успешно удален"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
