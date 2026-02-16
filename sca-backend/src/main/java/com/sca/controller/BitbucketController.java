package com.sca.controller;

import com.sca.model.BitbucketToken;
import com.sca.model.User;
import com.sca.service.BitbucketService;
import com.sca.service.ProjectGitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bitbucket")
@CrossOrigin(origins = {"http://localhost:3000", "https://diploma-works.github.io"})
public class BitbucketController {

    @Autowired
    private BitbucketService bitbucketService;

    @Autowired
    private ProjectGitService projectGitService;

    @PostMapping("/token")
    public ResponseEntity<?> saveToken(@AuthenticationPrincipal User user,
                                       @Valid @RequestBody Map<String, String> request) {
        try {
            if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            String accessToken = request.get("token");
            String usernameForBasic = request.get("username");
            if (accessToken == null || accessToken.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Токен не может быть пустым"));
            }

            BitbucketToken token = bitbucketService.saveUserToken(user, accessToken, usernameForBasic);
            return ResponseEntity.ok(Map.of("message", "Токен успешно сохранен", "bitbucketUsername", token.getBitbucketUsername()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/status")
    public ResponseEntity<?> getStatus(@AuthenticationPrincipal User user) {
        try {
            if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            var tokenOpt = bitbucketService.getUserToken(user);
            if (tokenOpt.isEmpty()) {
                return ResponseEntity.ok(Map.of("connected", false, "message", "Bitbucket токен не настроен"));
            }

            boolean isValid = bitbucketService.isTokenValid(user);
            return ResponseEntity.ok(Map.of("connected", isValid, "bitbucketUsername", tokenOpt.get().getBitbucketUsername(), "message", isValid ? "Подключение активно" : "Токен недействителен"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/repositories")
    public ResponseEntity<?> getRepositories(@AuthenticationPrincipal User user) {
        try {
            List<Map> repos = bitbucketService.getUserRepositories(user);
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
            List<Map> branches = bitbucketService.getRepositoryBranches(user, owner, repo);
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
            String cloneUrl = bitbucketService.cloneRepository(user, owner, repo, targetPath);
            return ResponseEntity.ok(Map.of("message", "Репозиторий готов к клонированию", "cloneUrl", cloneUrl));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/token")
    public ResponseEntity<?> removeToken(@AuthenticationPrincipal User user) {
        try {
            if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            bitbucketService.removeUserToken(user);
            return ResponseEntity.ok(Map.of("message", "Токен успешно удален"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // --- SSH key management for Bitbucket git operations (push/pull over SSH) ---
    @GetMapping("/ssh-key/status")
    public ResponseEntity<?> getSshKeyStatus(@AuthenticationPrincipal User user) {
        try {
            if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            return ResponseEntity.ok(projectGitService.getBitbucketSshKeyStatus(user));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/ssh-key")
    public ResponseEntity<?> saveSshKey(@AuthenticationPrincipal User user, @RequestBody Map<String, String> request) {
        try {
            if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            String privateKey = request.get("privateKey");
            return ResponseEntity.ok(projectGitService.saveBitbucketSshPrivateKey(user, privateKey));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/ssh-key")
    public ResponseEntity<?> removeSshKey(@AuthenticationPrincipal User user) {
        try {
            if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            return ResponseEntity.ok(projectGitService.removeBitbucketSshPrivateKey(user));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/ssh-key/test")
    public ResponseEntity<?> testSsh(@AuthenticationPrincipal User user) {
        try {
            if (user == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            return ResponseEntity.ok(projectGitService.testBitbucketSsh(user));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
