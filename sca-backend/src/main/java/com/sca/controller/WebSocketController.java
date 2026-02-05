package com.sca.controller;

import com.sca.model.CodeProblem;
import com.sca.model.Project;
import com.sca.service.CodeAnalysisService;
import com.sca.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@Controller
public class WebSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private CodeAnalysisService codeAnalysisService;

    @Autowired
    private ProjectService projectService;

    /**
     * Обработка запроса на анализ кода
     */
    @MessageMapping("/analyze")
    @SendTo("/topic/analysis")
    public void analyzeCode(AnalysisRequest request) {
        try {
            // Получаем проект
            Project project = projectService.getProjectById(request.getProjectId(), request.getUser());
            
            // Запускаем анализ асинхронно
            CompletableFuture<List<CodeProblem>> analysisFuture = codeAnalysisService.analyzeProject(project);
            
            // Отправляем уведомление о начале анализа
            messagingTemplate.convertAndSendToUser(
                    request.getUser().getUsername(),
                    "/queue/analysis-status",
                    new AnalysisStatus("STARTED", "Analysis started")
            );
            
            // Обрабатываем результаты
            analysisFuture.thenAccept(problems -> {
                // Сохраняем проблемы в БД
                projectService.saveProblems(project, problems);
                
                // Отправляем результаты
                messagingTemplate.convertAndSendToUser(
                        request.getUser().getUsername(),
                        "/queue/analysis-results",
                        new AnalysisResults(problems, project.getId())
                );
                
                // Отправляем уведомление о завершении
                messagingTemplate.convertAndSendToUser(
                        request.getUser().getUsername(),
                        "/queue/analysis-status",
                        new AnalysisStatus("COMPLETED", "Analysis completed")
                );
            }).exceptionally(throwable -> {
                // Отправляем уведомление об ошибке
                messagingTemplate.convertAndSendToUser(
                        request.getUser().getUsername(),
                        "/queue/analysis-status",
                        new AnalysisStatus("ERROR", "Analysis failed: " + throwable.getMessage())
                );
                return null;
            });
            
        } catch (Exception e) {
            messagingTemplate.convertAndSendToUser(
                    request.getUser().getUsername(),
                    "/queue/analysis-status",
                    new AnalysisStatus("ERROR", "Analysis failed: " + e.getMessage())
            );
        }
    }

    /**
     * Обработка запроса на получение проблем проекта
     */
    @MessageMapping("/problems")
    @SendTo("/topic/problems")
    public void getProblems(ProblemsRequest request) {
        try {
            Project project = projectService.getProjectById(request.getProjectId(), request.getUser());
            List<CodeProblem> problems = projectService.getProblemsByProject(project);
            
            messagingTemplate.convertAndSendToUser(
                    request.getUser().getUsername(),
                    "/queue/problems",
                    new ProblemsResponse(problems, project.getId())
            );
            
        } catch (Exception e) {
            messagingTemplate.convertAndSendToUser(
                    request.getUser().getUsername(),
                    "/queue/error",
                    new ErrorResponse("Failed to get problems: " + e.getMessage())
            );
        }
    }

    /**
     * Обработка запроса на обновление файла
     */
    @MessageMapping("/file/update")
    @SendTo("/topic/file-update")
    public void updateFile(FileUpdateRequest request) {
        try {
            // Обновляем файл
            projectService.updateFile(request.getProjectId(), request.getFilePath(), request.getContent(), request.getUser());
            
            // Отправляем подтверждение
            messagingTemplate.convertAndSendToUser(
                    request.getUser().getUsername(),
                    "/queue/file-updated",
                    new FileUpdateResponse(request.getFilePath(), "File updated successfully")
            );
            
        } catch (Exception e) {
            messagingTemplate.convertAndSendToUser(
                    request.getUser().getUsername(),
                    "/queue/error",
                    new ErrorResponse("Failed to update file: " + e.getMessage())
            );
        }
    }

    // Внутренние классы для сообщений
    public static class AnalysisRequest {
        private Long projectId;
        private com.sca.model.User user;
        
        // Getters and setters
        public Long getProjectId() { return projectId; }
        public void setProjectId(Long projectId) { this.projectId = projectId; }
        public com.sca.model.User getUser() { return user; }
        public void setUser(com.sca.model.User user) { this.user = user; }
    }

    public static class AnalysisStatus {
        private String status;
        private String message;
        
        public AnalysisStatus(String status, String message) {
            this.status = status;
            this.message = message;
        }
        
        // Getters and setters
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    public static class AnalysisResults {
        private List<CodeProblem> problems;
        private Long projectId;
        
        public AnalysisResults(List<CodeProblem> problems, Long projectId) {
            this.problems = problems;
            this.projectId = projectId;
        }
        
        // Getters and setters
        public List<CodeProblem> getProblems() { return problems; }
        public void setProblems(List<CodeProblem> problems) { this.problems = problems; }
        public Long getProjectId() { return projectId; }
        public void setProjectId(Long projectId) { this.projectId = projectId; }
    }

    public static class ProblemsRequest {
        private Long projectId;
        private com.sca.model.User user;
        
        // Getters and setters
        public Long getProjectId() { return projectId; }
        public void setProjectId(Long projectId) { this.projectId = projectId; }
        public com.sca.model.User getUser() { return user; }
        public void setUser(com.sca.model.User user) { this.user = user; }
    }

    public static class ProblemsResponse {
        private List<CodeProblem> problems;
        private Long projectId;
        
        public ProblemsResponse(List<CodeProblem> problems, Long projectId) {
            this.problems = problems;
            this.projectId = projectId;
        }
        
        // Getters and setters
        public List<CodeProblem> getProblems() { return problems; }
        public void setProblems(List<CodeProblem> problems) { this.problems = problems; }
        public Long getProjectId() { return projectId; }
        public void setProjectId(Long projectId) { this.projectId = projectId; }
    }

    public static class FileUpdateRequest {
        private Long projectId;
        private String filePath;
        private String content;
        private com.sca.model.User user;
        
        // Getters and setters
        public Long getProjectId() { return projectId; }
        public void setProjectId(Long projectId) { this.projectId = projectId; }
        public String getFilePath() { return filePath; }
        public void setFilePath(String filePath) { this.filePath = filePath; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public com.sca.model.User getUser() { return user; }
        public void setUser(com.sca.model.User user) { this.user = user; }
    }

    public static class FileUpdateResponse {
        private String filePath;
        private String message;
        
        public FileUpdateResponse(String filePath, String message) {
            this.filePath = filePath;
            this.message = message;
        }
        
        // Getters and setters
        public String getFilePath() { return filePath; }
        public void setFilePath(String filePath) { this.filePath = filePath; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    public static class ErrorResponse {
        private String error;
        
        public ErrorResponse(String error) {
            this.error = error;
        }
        
        // Getters and setters
        public String getError() { return error; }
        public void setError(String error) { this.error = error; }
    }
} 