package com.sca.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@Entity
@Table(name = "code_problems")
public class CodeProblem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    @Size(max = 500)
    private String description;
    
    @Size(max = 1000)
    private String solution;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_id")
    private ProjectFile file;
    
    @Size(max = 255)
    private String filePath;
    
    private Integer startLine;
    
    private Integer endLine;
    
    private Integer startColumn;
    
    private Integer endColumn;
    
    @Enumerated(EnumType.STRING)
    private ProblemSeverity severity = ProblemSeverity.WARNING;
    
    @Enumerated(EnumType.STRING)
    private ProblemType type = ProblemType.CODE_SMELL;
    
    @Size(max = 100)
    private String ruleId;
    
    @Size(max = 100)
    private String category;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
    
    private boolean resolved = false;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    // Constructors
    public CodeProblem() {}
    
    public CodeProblem(String description, Project project) {
        this.description = description;
        this.project = project;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getSolution() {
        return solution;
    }
    
    public void setSolution(String solution) {
        this.solution = solution;
    }
    
    public Project getProject() {
        return project;
    }
    
    public void setProject(Project project) {
        this.project = project;
    }
    
    public ProjectFile getFile() {
        return file;
    }
    
    public void setFile(ProjectFile file) {
        this.file = file;
    }
    
    public String getFilePath() {
        return filePath;
    }
    
    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }
    
    public Integer getStartLine() {
        return startLine;
    }
    
    public void setStartLine(Integer startLine) {
        this.startLine = startLine;
    }
    
    public Integer getEndLine() {
        return endLine;
    }
    
    public void setEndLine(Integer endLine) {
        this.endLine = endLine;
    }
    
    public Integer getStartColumn() {
        return startColumn;
    }
    
    public void setStartColumn(Integer startColumn) {
        this.startColumn = startColumn;
    }
    
    public Integer getEndColumn() {
        return endColumn;
    }
    
    public void setEndColumn(Integer endColumn) {
        this.endColumn = endColumn;
    }
    
    public ProblemSeverity getSeverity() {
        return severity;
    }
    
    public void setSeverity(ProblemSeverity severity) {
        this.severity = severity;
    }
    
    public ProblemType getType() {
        return type;
    }
    
    public void setType(ProblemType type) {
        this.type = type;
    }
    
    public String getRuleId() {
        return ruleId;
    }
    
    public void setRuleId(String ruleId) {
        this.ruleId = ruleId;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }
    
    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }
    
    public boolean isResolved() {
        return resolved;
    }
    
    public void setResolved(boolean resolved) {
        this.resolved = resolved;
        if (resolved && this.resolvedAt == null) {
            this.resolvedAt = LocalDateTime.now();
        }
    }
    
    public enum ProblemSeverity {
        INFO, WARNING, ERROR, CRITICAL
    }
    
    public enum ProblemType {
        BUG, VULNERABILITY, CODE_SMELL, SECURITY_HOTSPOT
    }
} 