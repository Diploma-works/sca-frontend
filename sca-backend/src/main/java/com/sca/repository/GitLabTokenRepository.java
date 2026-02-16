package com.sca.repository;

import com.sca.model.GitLabToken;
import com.sca.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GitLabTokenRepository extends JpaRepository<GitLabToken, Long> {
    Optional<GitLabToken> findByUser(User user);
    void deleteByUser(User user);
}
