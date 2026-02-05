package com.sca.service;

import com.sca.model.*;
import com.sca.repository.GitHubTokenRepository;
import org.kohsuke.github.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class GitHubService {

    @Autowired
    private GitHubTokenRepository gitHubTokenRepository;

    /**
     * Сохранить токен пользователя
     */
    public GitHubToken saveUserToken(User user, String accessToken) {
        try {
            // Проверяем токен
            GitHub github = new GitHubBuilder().withOAuthToken(accessToken).build();
            GHUser githubUser = github.getMyself();
            
            // Удаляем старый токен если есть
            gitHubTokenRepository.deleteByUser(user);
            
            // Сохраняем новый токен
            GitHubToken token = new GitHubToken(user, accessToken, githubUser.getLogin());
            return gitHubTokenRepository.save(token);
        } catch (IOException e) {
            throw new RuntimeException("Недействительный GitHub токен", e);
        }
    }

    /**
     * Получить токен пользователя
     */
    public Optional<GitHubToken> getUserToken(User user) {
        return gitHubTokenRepository.findByUser(user);
    }

    /**
     * Получить GitHub клиент для пользователя
     */
    private GitHub getGitHubClient(User user) throws IOException {
        Optional<GitHubToken> tokenOpt = getUserToken(user);
        if (tokenOpt.isEmpty()) {
            throw new RuntimeException("GitHub токен не найден. Необходимо настроить интеграцию с GitHub.");
        }
        
        return new GitHubBuilder().withOAuthToken(tokenOpt.get().getAccessToken()).build();
    }

    /**
     * Получить список репозиториев пользователя
     */
    public List<GitHubRepository> getUserRepositories(User user) {
        try {
            GitHub github = getGitHubClient(user);
            List<GitHubRepository> repositories = new ArrayList<>();
            
            for (GHRepository repo : github.getMyself().listRepositories()) {
                GitHubRepository gitRepo = mapToGitHubRepository(repo);
                repositories.add(gitRepo);
            }
            
            return repositories;
        } catch (IOException e) {
            throw new RuntimeException("Ошибка при получении репозиториев", e);
        }
    }

    /**
     * Получить информацию о репозитории
     */
    public GitHubRepository getRepository(User user, String owner, String repoName) {
        try {
            GitHub github = getGitHubClient(user);
            GHRepository repo = github.getRepository(owner + "/" + repoName);
            return mapToGitHubRepository(repo);
        } catch (IOException e) {
            throw new RuntimeException("Ошибка при получении репозитория", e);
        }
    }

    /**
     * Получить список веток репозитория
     */
    public List<GitHubBranch> getRepositoryBranches(User user, String owner, String repoName) {
        try {
            GitHub github = getGitHubClient(user);
            GHRepository repo = github.getRepository(owner + "/" + repoName);
            List<GitHubBranch> branches = new ArrayList<>();
            
            for (GHBranch branch : repo.getBranches().values()) {
                GitHubBranch gitBranch = new GitHubBranch();
                gitBranch.setName(branch.getName());
                gitBranch.setSha(branch.getSHA1());
                gitBranch.setProtected(branch.isProtected());
                branches.add(gitBranch);
            }
            
            return branches;
        } catch (IOException e) {
            throw new RuntimeException("Ошибка при получении веток репозитория", e);
        }
    }

    /**
     * Клонировать репозиторий
     */
    public String cloneRepository(User user, String owner, String repoName, String targetPath) {
        try {
            GitHub github = getGitHubClient(user);
            GHRepository repo = github.getRepository(owner + "/" + repoName);
            
            // Здесь можно добавить логику клонирования с помощью JGit или системных команд
            // Пока возвращаем URL для клонирования
            return repo.getHttpTransportUrl();
        } catch (IOException e) {
            throw new RuntimeException("Ошибка при клонировании репозитория", e);
        }
    }

    /**
     * Создать новый репозиторий
     */
    public GitHubRepository createRepository(User user, String name, String description, boolean isPrivate) {
        try {
            GitHub github = getGitHubClient(user);
            GHCreateRepositoryBuilder builder = github.createRepository(name);
            
            if (description != null && !description.isEmpty()) {
                builder.description(description);
            }
            
            builder.private_(isPrivate);
            GHRepository repo = builder.create();
            
            return mapToGitHubRepository(repo);
        } catch (IOException e) {
            throw new RuntimeException("Ошибка при создании репозитория", e);
        }
    }

    /**
     * Удалить токен пользователя
     */
    public void removeUserToken(User user) {
        gitHubTokenRepository.deleteByUser(user);
    }

    /**
     * Проверить валидность токена
     */
    public boolean isTokenValid(User user) {
        try {
            GitHub github = getGitHubClient(user);
            github.getMyself(); // Попытка обращения к API
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Маппинг GHRepository в GitHubRepository
     */
    private GitHubRepository mapToGitHubRepository(GHRepository repo) throws IOException {
        GitHubRepository gitRepo = new GitHubRepository();
        gitRepo.setId(repo.getId());
        gitRepo.setName(repo.getName());
        gitRepo.setFullName(repo.getFullName());
        gitRepo.setDescription(repo.getDescription());
        gitRepo.setHtmlUrl(repo.getHtmlUrl().toString());
        gitRepo.setCloneUrl(repo.getHttpTransportUrl());
        gitRepo.setDefaultBranch(repo.getDefaultBranch());
        gitRepo.setPrivate(repo.isPrivate());
        gitRepo.setFork(repo.isFork());
        
        if (repo.getCreatedAt() != null) {
            gitRepo.setCreatedAt(repo.getCreatedAt().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime());
        }
        if (repo.getUpdatedAt() != null) {
            gitRepo.setUpdatedAt(repo.getUpdatedAt().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime());
        }
        
        gitRepo.setLanguage(repo.getLanguage());
        gitRepo.setStargazersCount(repo.getStargazersCount());
        gitRepo.setForksCount(repo.getForksCount());
        gitRepo.setOpenIssuesCount(repo.getOpenIssueCount());
        
        return gitRepo;
    }
}
