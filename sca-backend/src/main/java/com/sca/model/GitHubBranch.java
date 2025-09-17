package com.sca.model;

public class GitHubBranch {
    private String name;
    private String sha;
    private boolean isProtected;
    private String url;

    public GitHubBranch() {}

    public GitHubBranch(String name, String sha) {
        this.name = name;
        this.sha = sha;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSha() {
        return sha;
    }

    public void setSha(String sha) {
        this.sha = sha;
    }

    public boolean isProtected() {
        return isProtected;
    }

    public void setProtected(boolean isProtected) {
        this.isProtected = isProtected;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }
}
