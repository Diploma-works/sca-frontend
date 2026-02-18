package com.sca.service;

import com.sca.model.BitbucketToken;
import com.sca.model.User;
import com.sca.repository.BitbucketTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Autowired;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class BitbucketService {

    private static final Logger logger = LoggerFactory.getLogger(BitbucketService.class);

    @Autowired
    private BitbucketTokenRepository bitbucketTokenRepository;

    private final RestTemplate rest = new RestTemplate();

    @Autowired
    private ProjectService projectService;

    @Transactional
    public BitbucketToken saveUserToken(User user, String accessToken, String usernameForBasic) {
        try {
            logger.debug("Attempting Bitbucket validation using Bearer token for user {}", user.getUsername());
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.set("Authorization", "Bearer " + accessToken);
                HttpEntity<String> entity = new HttpEntity<>(headers);

                ResponseEntity<Map> resp = rest.exchange("https://api.bitbucket.org/2.0/user", HttpMethod.GET, entity, Map.class);
                logger.debug("Bitbucket /user response status (Bearer): {}", resp.getStatusCodeValue());
                if (resp.getStatusCode().is2xxSuccessful()) {
                    Map body = resp.getBody();
                    String username = body != null ? (String) body.get("username") : null;
                    bitbucketTokenRepository.deleteByUser(user);
                    BitbucketToken token = new BitbucketToken(user, accessToken, username != null ? username : "");
                    logger.info("Saved Bitbucket token for user {} as Bearer (bitbucket username={})", user.getUsername(), username);
                    return bitbucketTokenRepository.save(token);
                }
            } catch (Exception ignored) {
                logger.debug("Bearer validation failed: {}", ignored.getMessage());
            }

            if (usernameForBasic != null && !usernameForBasic.isBlank()) {
                try {
                    logger.debug("Attempting Bitbucket validation using Basic auth with username {} for user {}", usernameForBasic, user.getUsername());
                    HttpHeaders headers = new HttpHeaders();
                    String creds = usernameForBasic + ":" + accessToken;
                    String basic = java.util.Base64.getEncoder().encodeToString(creds.getBytes(java.nio.charset.StandardCharsets.UTF_8));
                    headers.set("Authorization", "Basic " + basic);
                    HttpEntity<String> entity = new HttpEntity<>(headers);

                    ResponseEntity<Map> resp = rest.exchange("https://api.bitbucket.org/2.0/user", HttpMethod.GET, entity, Map.class);
                    logger.debug("Bitbucket /user response status (Basic): {}", resp.getStatusCodeValue());
                    if (resp.getStatusCode().is2xxSuccessful()) {
                        Map body = resp.getBody();
                        String returnedUsername = body != null ? (String) body.get("username") : null;
                        // store the actual credential (usernameForBasic) that was used to authenticate
                        bitbucketTokenRepository.deleteByUser(user);
                        BitbucketToken token = new BitbucketToken(user, accessToken, usernameForBasic);
                        logger.info("Saved Bitbucket token for user {} using Basic auth (credential username={} returned bitbucket username={})",
                                user.getUsername(), usernameForBasic, returnedUsername);
                        return bitbucketTokenRepository.save(token);
                    }
                } catch (Exception e) {
                    logger.debug("Basic auth validation failed: {}", e.getMessage());
                }
            }

            throw new RuntimeException("Недействительный Bitbucket токен");
        } catch (Exception e) {
            throw new RuntimeException("Недействительный Bitbucket токен", e);
        }
    }

    public Optional<BitbucketToken> getUserToken(User user) {
        return bitbucketTokenRepository.findByUser(user);
    }

    public boolean isTokenValid(User user) {
        try {
            Optional<BitbucketToken> tokenOpt = getUserToken(user);
            if (tokenOpt.isEmpty()) return false;
            String token = tokenOpt.get().getAccessToken();
            logger.debug("Validating stored Bitbucket token for user {}: trying Bearer", user.getUsername());
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.set("Authorization", "Bearer " + token);
                HttpEntity<String> entity = new HttpEntity<>(headers);
                ResponseEntity<Map> resp = rest.exchange("https://api.bitbucket.org/2.0/user", HttpMethod.GET, entity, Map.class);
                if (resp.getStatusCode().is2xxSuccessful()) return true;
            } catch (Exception ignored) {
                logger.debug("Bearer check failed: {}", ignored.getMessage());
            }

            try {
                logger.debug("Validating stored Bitbucket token for user {}: trying Basic", user.getUsername());
                String username = tokenOpt.get().getBitbucketUsername();
                if (username == null || username.isBlank()) return false;
                HttpHeaders headers = new HttpHeaders();
                String creds = username + ":" + token;
                String basic = java.util.Base64.getEncoder().encodeToString(creds.getBytes(java.nio.charset.StandardCharsets.UTF_8));
                headers.set("Authorization", "Basic " + basic);
                HttpEntity<String> entity = new HttpEntity<>(headers);
                ResponseEntity<Map> resp = rest.exchange("https://api.bitbucket.org/2.0/user", HttpMethod.GET, entity, Map.class);
                return resp.getStatusCode().is2xxSuccessful();
            } catch (Exception e) {
                logger.debug("Basic check failed: {}", e.getMessage());
                return false;
            }
        } catch (Exception e) {
            return false;
        }
    }

    public List<Map> getUserRepositories(User user) {
        try {
            Optional<BitbucketToken> tokenOpt = getUserToken(user);
            if (tokenOpt.isEmpty()) throw new RuntimeException("Bitbucket токен не найден");
            String token = tokenOpt.get().getAccessToken();
            String url = "https://api.bitbucket.org/2.0/repositories?role=member";

            logger.debug("Fetching repositories for user {}: trying Bearer", user.getUsername());
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.set("Authorization", "Bearer " + token);
                HttpEntity<String> entity = new HttpEntity<>(headers);
                ResponseEntity<Map> resp = rest.exchange(url, HttpMethod.GET, entity, Map.class);
                Map data = resp.getBody();
                if (data != null && data.containsKey("values")) {
                    return (List<Map>) data.get("values");
                }
                return List.of();
            } catch (Exception ignored) {
                logger.debug("Bearer fetch repos failed: {}", ignored.getMessage());
            }

            String username = tokenOpt.get().getBitbucketUsername();
            if (username == null || username.isBlank()) throw new RuntimeException("Bitbucket токен не найден");
            HttpHeaders headers = new HttpHeaders();
            String creds = username + ":" + token;
            String basic = java.util.Base64.getEncoder().encodeToString(creds.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            headers.set("Authorization", "Basic " + basic);
            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<Map> resp = rest.exchange(url, HttpMethod.GET, entity, Map.class);
            Map data = resp.getBody();
            if (data != null && data.containsKey("values")) {
                return (List<Map>) data.get("values");
            }
            return List.of();
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при получении репозиториев Bitbucket", e);
        }
    }

    public List<Map> getRepositoryBranches(User user, String owner, String repo) {
        try {
            Optional<BitbucketToken> tokenOpt = getUserToken(user);
            if (tokenOpt.isEmpty()) throw new RuntimeException("Bitbucket токен не найден");
            String token = tokenOpt.get().getAccessToken();
            String url = "https://api.bitbucket.org/2.0/repositories/" + URLEncoder.encode(owner, StandardCharsets.UTF_8) + "/" + URLEncoder.encode(repo, StandardCharsets.UTF_8) + "/refs/branches";
            logger.debug("Fetching branches for {}/{}: trying Bearer", owner, repo);
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.set("Authorization", "Bearer " + token);
                HttpEntity<String> entity = new HttpEntity<>(headers);
                ResponseEntity<Map> resp = rest.exchange(url, HttpMethod.GET, entity, Map.class);
                Map data = resp.getBody();
                if (data != null && data.containsKey("values")) {
                    return (List<Map>) data.get("values");
                }
                return List.of();
            } catch (Exception ignored) {
                logger.debug("Bearer fetch branches failed: {}", ignored.getMessage());
            }

            logger.debug("Fetching branches for {}/{}: trying Basic", owner, repo);
            String username = tokenOpt.get().getBitbucketUsername();
            if (username == null || username.isBlank()) throw new RuntimeException("Bitbucket токен не найден");
            HttpHeaders headers = new HttpHeaders();
            String creds = username + ":" + token;
            String basic = java.util.Base64.getEncoder().encodeToString(creds.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            headers.set("Authorization", "Basic " + basic);
            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<Map> resp = rest.exchange(url, HttpMethod.GET, entity, Map.class);
            Map data = resp.getBody();
            if (data != null && data.containsKey("values")) {
                return (List<Map>) data.get("values");
            }
            return List.of();
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при получении веток Bitbucket", e);
        }
    }

    public String cloneRepository(User user, String owner, String repo, String targetPath) {
        try {
            Optional<BitbucketToken> tokenOpt = getUserToken(user);
            if (tokenOpt.isEmpty()) {
                throw new RuntimeException("Bitbucket токен не найден");
            }

            BitbucketToken tokenEntity = tokenOpt.get();
            String token = tokenEntity.getAccessToken();
            String username = tokenEntity.getBitbucketUsername();

            if (username == null || username.isBlank()) {
                throw new RuntimeException("Bitbucket username не сохранён");
            }

            String apiUrl =
                    "https://api.bitbucket.org/2.0/repositories/"
                            + URLEncoder.encode(owner, StandardCharsets.UTF_8)
                            + "/"
                            + URLEncoder.encode(repo, StandardCharsets.UTF_8);

            Map body = null;
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setBearerAuth(token);
                HttpEntity<String> entity = new HttpEntity<>(headers);
                ResponseEntity<Map> resp = rest.exchange(apiUrl, HttpMethod.GET, entity, Map.class);
                body = resp.getBody();
            } catch (org.springframework.web.client.HttpClientErrorException ex) {
                if (ex.getStatusCode() == HttpStatus.UNAUTHORIZED || ex.getStatusCode() == HttpStatus.FORBIDDEN) {
                    logger.debug("Bitbucket repo API Bearer failed ({}). Falling back to Basic.", ex.getStatusCode().value());
                } else {
                    throw ex;
                }
            }

            if (body == null) {
                String creds = username + ":" + token;
                String basic = java.util.Base64.getEncoder().encodeToString(creds.getBytes(java.nio.charset.StandardCharsets.UTF_8));
                HttpHeaders headers = new HttpHeaders();
                headers.set("Authorization", "Basic " + basic);
                HttpEntity<String> entity = new HttpEntity<>(headers);
                ResponseEntity<Map> resp = rest.exchange(apiUrl, HttpMethod.GET, entity, Map.class);
                body = resp.getBody();
            }

            if (body == null) {
                throw new RuntimeException("Пустой ответ Bitbucket API");
            }

            String cloneUrl = extractHttpsCloneUrl(body);
            if (cloneUrl == null) {
                throw new RuntimeException("Не удалось получить HTTPS clone URL");
            }

            String defaultBranch = "main";
            if (body.containsKey("mainbranch") && body.get("mainbranch") instanceof Map) {
                Map mb = (Map) body.get("mainbranch");
                Object name = mb.get("name");
                if (name instanceof String) {
                    defaultBranch = (String) name;
                }
            }

            String normalizedTarget = (targetPath == null) ? "" : targetPath;
            if (normalizedTarget.startsWith("/")) {
                normalizedTarget = normalizedTarget.substring(1);
            }

            String embeddedCloneUrl = embedTokenIntoCloneUrl(cloneUrl, token);

            logger.info(
                    "Cloning Bitbucket repository {} {}/{} (branch: {}, targetPath: {})",
                    embeddedCloneUrl, owner, repo, defaultBranch, normalizedTarget
            );

        String projectName = normalizedTarget;
        if (projectName == null || projectName.isBlank()) projectName = repo;
        if (projectName.contains("/")) {
        projectName = projectName.substring(projectName.lastIndexOf('/') + 1);
        }

        projectService.cloneFromBitbucket(
            embeddedCloneUrl,
            defaultBranch,
            projectName,
            user
        );

            return cloneUrl; // возвращаем оригинальный URL без токена

        } catch (Exception e) {
            logger.error(
                    "Ошибка при клонировании репозитория Bitbucket {}/{}: {}",
                    owner, repo, e.getMessage(), e
            );
            throw new RuntimeException(
                    "Ошибка при клонировании репозитория Bitbucket: " + e.getMessage(), e
            );
        }
    }

    private String extractHttpsCloneUrl(Map body) {
        if (!body.containsKey("links")) return null;

        Map links = (Map) body.get("links");
        if (!links.containsKey("clone")) return null;

        List clones = (List) links.get("clone");
        if (clones.isEmpty()) return null;

        String fallback = null;

        for (Object c : clones) {
            if (!(c instanceof Map)) continue;
            Map cm = (Map) c;

            Object name = cm.get("name");
            Object href = cm.get("href");

            if (href instanceof String) {
                String hrefStr = (String) href;

                if ("https".equalsIgnoreCase(String.valueOf(name))) {
                    return hrefStr;
                }

                if (hrefStr.startsWith("https://") && fallback == null) {
                    fallback = hrefStr;
                }
            }
        }

        return fallback;
    }

    private String embedTokenIntoCloneUrl(String cloneUrl, String token) {
        if (cloneUrl == null) {
            return null;
        }

        String encodedToken = URLEncoder.encode(token, StandardCharsets.UTF_8);

        if (cloneUrl.matches("^https://[^/]+@.+")) {
            return cloneUrl.replaceFirst(
                    "^(https://[^/@]+)@",
                    "$1:" + encodedToken + "@"
            );
        }

        return cloneUrl.replaceFirst(
                "^https://",
                "https://x-token-auth:" + encodedToken + "@"
        );
    }


    public void removeUserToken(User user) {
        deleteTokenTransactional(user);
    }

    @Transactional
    protected void deleteTokenTransactional(User user) {
        bitbucketTokenRepository.deleteByUser(user);
    }
}
