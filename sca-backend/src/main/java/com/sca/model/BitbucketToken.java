package com.sca.model;

import jakarta.persistence.*;

@Entity
@Table(name = "bitbucket_tokens")
public class BitbucketToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "access_token", nullable = false)
    private String accessToken;

    @Column(name = "token_type")
    private String tokenType = "token";

    @Column(name = "scope")
    private String scope;

    @Column(name = "bitbucket_username")
    private String bitbucketUsername;

    public BitbucketToken() {}

    public BitbucketToken(User user, String accessToken, String bitbucketUsername) {
        this.user = user;
        this.accessToken = accessToken;
        this.bitbucketUsername = bitbucketUsername;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }
    public String getScope() { return scope; }
    public void setScope(String scope) { this.scope = scope; }
    public String getBitbucketUsername() { return bitbucketUsername; }
    public void setBitbucketUsername(String bitbucketUsername) { this.bitbucketUsername = bitbucketUsername; }
}
