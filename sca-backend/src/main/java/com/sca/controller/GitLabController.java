package com.sca.controller;

import com.sca.model.GitLabToken;
import com.sca.model.User;
import com.sca.service.GitLabService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/gitlab")
@CrossOrigin(origins = {"http://localhost:3000", "https://diploma-works.github.io"})
public class GitLabController {

    @Autowired
    private GitLabService gitLabService;

    @PostMapping("/token")
    public ResponseEntity<?> saveToken(@AuthenticationPrincipal User user,
                                       @Valid @RequestBody Map<String, String> request) {
        try {
            if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            String accessToken = request.get("token");
            if (accessToken == null || accessToken.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Токен не может быть пустым"));
            }

            GitLabToken token = gitLabService.saveUserToken(user, accessToken);
            return ResponseEntity.ok(Map.of("message", "Токен успешно сохранен", "gitlabUsername", token.getGitlabUsername()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/status")
    public ResponseEntity<?> getStatus(@AuthenticationPrincipal User user) {
        try {
            if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            var tokenOpt = gitLabService.getUserToken(user);
            if (tokenOpt.isEmpty()) {
                return ResponseEntity.ok(Map.of("connected", false, "message", "GitLab токен не настроен"));
            }

            boolean isValid = gitLabService.isTokenValid(user);
            return ResponseEntity.ok(Map.of("connected", isValid, "gitlabUsername", tokenOpt.get().getGitlabUsername(), "message", isValid ? "Подключение активно" : "Токен недействителен"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/repositories")
    public ResponseEntity<?> getRepositories(@AuthenticationPrincipal User user) {
        try {
            List<Map> repos = gitLabService.getUserRepositories(user);
            return ResponseEntity.ok(repos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/repositories/{owner}/{repo}/branches")
    public ResponseEntity<?> getRepositoryBranches(@AuthenticationPrincipal User user,
                                                   @PathVariable String owner,
                                                   @PathVariable String repo) {
        try {
            List<Map> branches = gitLabService.getRepositoryBranches(user, owner, repo);
            return ResponseEntity.ok(branches);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/repositories/{owner}/{repo}/clone")
    public ResponseEntity<?> cloneRepository(@AuthenticationPrincipal User user,
                                             @PathVariable String owner,
                                             @PathVariable String repo,
                                             @RequestBody Map<String, String> request) {
        try {
            String targetPath = request.get("targetPath");
            String cloneUrl = gitLabService.cloneRepository(user, owner, repo, targetPath);
            return ResponseEntity.ok(Map.of("message", "Репозиторий готов к клонированию", "cloneUrl", cloneUrl));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/token")
    public ResponseEntity<?> removeToken(@AuthenticationPrincipal User user) {
        try {
            if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            gitLabService.removeUserToken(user);
            return ResponseEntity.ok(Map.of("message", "Токен успешно удален"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
