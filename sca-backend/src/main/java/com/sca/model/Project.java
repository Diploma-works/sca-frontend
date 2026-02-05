package com.sca.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "projects")
public class Project {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    @Size(max = 100)
    private String name;
    
    @Size(max = 500)
    private String description;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User owner;
    
    @Enumerated(EnumType.STRING)
    private ProjectType type = ProjectType.LOCAL;
    
    @Size(max = 200)
    private String gitUrl;
    
    @Size(max = 50)
    private String gitBranch = "main";
    
    @Size(max = 100)
    private String workspacePath;
    
    @Enumerated(EnumType.STRING)
    private ProjectStatus status = ProjectStatus.ACTIVE;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "last_accessed")
    private LocalDateTime lastAccessed;
    
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProjectFile> files = new ArrayList<>();
    
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CodeProblem> problems = new ArrayList<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Constructors
    public Project() {}
    
    public Project(String name, User owner) {
        this.name = name;
        this.owner = owner;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public User getOwner() {
        return owner;
    }
    
    public void setOwner(User owner) {
        this.owner = owner;
    }
    
    public ProjectType getType() {
        return type;
    }
    
    public void setType(ProjectType type) {
        this.type = type;
    }
    
    public String getGitUrl() {
        return gitUrl;
    }
    
    public void setGitUrl(String gitUrl) {
        this.gitUrl = gitUrl;
    }
    
    public String getGitBranch() {
        return gitBranch;
    }
    
    public void setGitBranch(String gitBranch) {
        this.gitBranch = gitBranch;
    }
    
    public String getWorkspacePath() {
        return workspacePath;
    }
    
    public void setWorkspacePath(String workspacePath) {
        this.workspacePath = workspacePath;
    }
    
    public ProjectStatus getStatus() {
        return status;
    }
    
    public void setStatus(ProjectStatus status) {
        this.status = status;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public LocalDateTime getLastAccessed() {
        return lastAccessed;
    }
    
    public void setLastAccessed(LocalDateTime lastAccessed) {
        this.lastAccessed = lastAccessed;
    }
    
    public List<ProjectFile> getFiles() {
        return files;
    }
    
    public void setFiles(List<ProjectFile> files) {
        this.files = files;
    }
    
    public List<CodeProblem> getProblems() {
        return problems;
    }
    
    public void setProblems(List<CodeProblem> problems) {
        this.problems = problems;
    }
    
    public enum ProjectType {
        LOCAL, GITHUB, GITLAB, BITBUCKET
    }
    
    public enum ProjectStatus {
        ACTIVE, ARCHIVED, DELETED
    }
} 