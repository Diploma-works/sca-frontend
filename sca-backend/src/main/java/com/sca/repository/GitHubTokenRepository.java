package com.sca.repository;

import com.sca.model.GitHubToken;
import com.sca.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GitHubTokenRepository extends JpaRepository<GitHubToken, Long> {
    Optional<GitHubToken> findByUser(User user);
    Optional<GitHubToken> findByGithubUsername(String githubUsername);
    void deleteByUser(User user);
}
