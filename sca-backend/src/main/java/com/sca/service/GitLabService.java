package com.sca.service;

import com.sca.model.GitLabToken;
import com.sca.model.User;
import com.sca.repository.GitLabTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class GitLabService {

    @Autowired
    private GitLabTokenRepository gitLabTokenRepository;

    private final RestTemplate rest = new RestTemplate();

    @Autowired
    private ProjectService projectService;

    private static final Logger logger = LoggerFactory.getLogger(GitLabService.class);

    public GitLabToken saveUserToken(User user, String accessToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + accessToken);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> resp = rest.exchange("https://gitlab.com/api/v4/user", HttpMethod.GET, entity, Map.class);
            if (!resp.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("Недействительный GitLab токен");
            }

            Map body = resp.getBody();
            String username = body != null ? (String) body.get("username") : null;

            gitLabTokenRepository.deleteByUser(user);

            GitLabToken token = new GitLabToken(user, accessToken, username != null ? username : "");
            return gitLabTokenRepository.save(token);
        } catch (Exception e) {
            throw new RuntimeException("Недействительный GitLab токен", e);
        }
    }

    public Optional<GitLabToken> getUserToken(User user) {
        return gitLabTokenRepository.findByUser(user);
    }

    public boolean isTokenValid(User user) {
        try {
            logger.debug("Checking GitLab token validity for user {}", user != null ? user.getUsername() : "<anonymous>");
            Optional<GitLabToken> tokenOpt = getUserToken(user);
            if (tokenOpt.isEmpty()) return false;
            String token = tokenOpt.get().getAccessToken();
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + token);
            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<Map> resp = rest.exchange("https://gitlab.com/api/v4/user", HttpMethod.GET, entity, Map.class);
            return resp.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            return false;
        }
    }

    public List<Map> getUserRepositories(User user) {
        try {
            Optional<GitLabToken> tokenOpt = getUserToken(user);
            if (tokenOpt.isEmpty()) throw new RuntimeException("GitLab токен не найден");
            String token = tokenOpt.get().getAccessToken();
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + token);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            String url = "https://gitlab.com/api/v4/projects?membership=true&per_page=100";
            ResponseEntity<List> resp = rest.exchange(url, HttpMethod.GET, entity, List.class);
            return resp.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при получении репозиториев GitLab", e);
        }
    }

    public List<Map> getRepositoryBranches(User user, String owner, String repo) {
        try {
            Optional<GitLabToken> tokenOpt = getUserToken(user);
            if (tokenOpt.isEmpty()) throw new RuntimeException("GitLab токен не найден");
            String token = tokenOpt.get().getAccessToken();
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + token);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            String projectPath = URLEncoder.encode(owner + "/" + repo, StandardCharsets.UTF_8);
            String url = "https://gitlab.com/api/v4/projects/" + projectPath + "/repository/branches";
            ResponseEntity<List> resp = rest.exchange(url, HttpMethod.GET, entity, List.class);
            return resp.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при получении веток GitLab", e);
        }
    }

    public String cloneRepository(User user, String owner, String repo, String targetPath) {
        try {
            Optional<GitLabToken> tokenOpt = getUserToken(user);
            if (tokenOpt.isEmpty()) throw new RuntimeException("GitLab токен не найден");
            String token = tokenOpt.get().getAccessToken();
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + token);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            String projectPath = URLEncoder.encode(owner + "/" + repo, StandardCharsets.UTF_8);
            String url = "https://gitlab.com/api/v4/projects/" + projectPath;
            ResponseEntity<Map> resp = rest.exchange(url, HttpMethod.GET, entity, Map.class);
            Map body = resp.getBody();
            if (body == null) throw new RuntimeException("Не удалось получить данные репозитория");

            String cloneUrl = body.containsKey("http_url_to_repo") ? (String) body.get("http_url_to_repo") : (String) body.get("ssh_url_to_repo");
            String defaultBranch = body.containsKey("default_branch") ? (String) body.get("default_branch") : "main";

            if (cloneUrl == null || cloneUrl.isBlank()) {
                throw new RuntimeException("Не удалось получить URL репозитория");
            }

            String normalizedTarget = (targetPath == null) ? "" : targetPath;
            if (normalizedTarget.startsWith("/")) normalizedTarget = normalizedTarget.substring(1);

            logger.info("GitLab clone request for {}/{} (default branch: {}), targetPath: {}", owner, repo, defaultBranch, normalizedTarget);

            String authenticatedCloneUrl = cloneUrl;
            if (cloneUrl.startsWith("https://")) {
                String encodedToken = URLEncoder.encode(token, StandardCharsets.UTF_8);
                authenticatedCloneUrl = cloneUrl.replaceFirst("^https://", "https://oauth2:" + encodedToken + "@");
            }

            try {
                String projectName = normalizedTarget;
                if (projectName == null || projectName.isBlank()) projectName = repo;

                if (projectName.contains("/")) {
                    projectName = projectName.substring(projectName.lastIndexOf('/') + 1);
                }

                projectService.cloneFromGitLab(authenticatedCloneUrl, defaultBranch, projectName, user);
            } catch (Exception ex) {
                logger.error("Error while performing server-side git clone for {}/{}: {}", owner, repo, ex.getMessage(), ex);
                throw ex;
            }

            return cloneUrl;
        } catch (Exception e) {
            try {
                String msg = e.getMessage();
                if (msg == null) msg = "";

                msg = msg.replaceAll("oauth2:[^@\\s]+@", "oauth2:[REDACTED]@");
                msg = msg.replaceAll("x-token-auth:[^@\\s]+@", "x-token-auth:[REDACTED]@");
                msg = msg.replaceAll("https?://[^@\\s]+@", "https://[REDACTED]@");

                throw new RuntimeException("Ошибка при клонировании репозитория GitLab: " + msg);
            } catch (RuntimeException rex) {
                throw new RuntimeException("Ошибка при клонировании репозитория GitLab", e);
            }
        }
    }

    @Transactional
    public void removeUserToken(User user) {
        gitLabTokenRepository.deleteByUser(user);
    }
}
