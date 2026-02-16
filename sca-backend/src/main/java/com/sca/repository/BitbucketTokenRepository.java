package com.sca.repository;

import com.sca.model.BitbucketToken;
import com.sca.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BitbucketTokenRepository extends JpaRepository<BitbucketToken, Long> {
    Optional<BitbucketToken> findByUser(User user);
    void deleteByUser(User user);
}
