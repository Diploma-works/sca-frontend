package com.sca.controller;

import com.sca.model.Project;
import com.sca.model.User;
import com.sca.service.ProjectService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import org.springframework.web.servlet.HandlerMapping;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/projects")
@CrossOrigin(origins = {"http://localhost:3000", "https://diploma-works.github.io"})
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    /**
     * Получить все проекты пользователя
     */
    @GetMapping
    public ResponseEntity<List<Project>> getUserProjects(@AuthenticationPrincipal User user) {
        try {
            // Отладочная информация
            System.out.println("=== GET USER PROJECTS ===");
            System.out.println("User from @AuthenticationPrincipal: " + (user != null ? user.getUsername() : "NULL"));
            System.out.println("User object: " + user);
            
            if (user == null) {
                System.err.println("User is null in getUserProjects");
                return ResponseEntity.status(401).build();
            }
            
            List<Project> projects = projectService.getProjectsByUser(user);
            System.out.println("Found " + projects.size() + " projects for user " + user.getUsername());
            return ResponseEntity.ok(projects);
        } catch (Exception e) {
            System.err.println("Exception in getUserProjects: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Получить проект по ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Project> getProject(@PathVariable Long id, @AuthenticationPrincipal User user) {
        try {
            Project project = projectService.getProjectById(id, user);
            return ResponseEntity.ok(project);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Создать новый проект
     */
    @PostMapping
    public ResponseEntity<?> createProject(@Valid @RequestBody Project project, 
                                         @AuthenticationPrincipal User user) {
        try {
            // Отладочная информация
            System.out.println("Creating project: " + project.getName());
            System.out.println("User from @AuthenticationPrincipal: " + (user != null ? user.getUsername() : "NULL"));
            
            if (user == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Пользователь не аутентифицирован");
                return ResponseEntity.status(401).body(error);
            }
            
            project.setOwner(user);
            Project createdProject = projectService.createProject(project);
            return ResponseEntity.ok(createdProject);
        } catch (RuntimeException e) {
            System.err.println("RuntimeException in createProject: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            System.err.println("Exception in createProject: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Обновить проект
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProject(@PathVariable Long id, 
                                         @Valid @RequestBody Project project,
                                         @AuthenticationPrincipal User user) {
        try {
            Project updatedProject = projectService.updateProject(id, project, user);
            return ResponseEntity.ok(updatedProject);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Удалить проект
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable Long id, @AuthenticationPrincipal User user) {
        try {
            projectService.deleteProject(id, user);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Получить статистику проекта
     */
    @GetMapping("/{id}/statistics")
    public ResponseEntity<Map<String, Object>> getProjectStatistics(@PathVariable Long id,
                                                                   @AuthenticationPrincipal User user) {
        try {
            Map<String, Object> statistics = projectService.getProjectStatistics(id, user);
            return ResponseEntity.ok(statistics);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Создать файл в проекте
     */
    @PostMapping("/{projectId}/files")
    public ResponseEntity<?> createFile(@PathVariable Long projectId,
                                        @RequestBody Map<String, String> body,
                                        @AuthenticationPrincipal User user) {
        String filePath = body.get("filePath");
        if (filePath == null || filePath.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "filePath is required"));
        }
        try {
            // Создаём пустой файл
            projectService.updateFile(projectId, filePath, "", user);
            return ResponseEntity.ok(Map.of("message", "File created", "filePath", filePath));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
    @GetMapping("/{id}/structure")
    public ResponseEntity<?> getProjectStructure(@PathVariable Long id, @AuthenticationPrincipal User user) {
        try {
            Object structure = projectService.getProjectStructure(id, user);
            return ResponseEntity.ok(structure);
        } catch (RuntimeException e) {
            // Подробный вывод ошибки в консоль
            System.err.println("Ошибка при получении структуры проекта: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Неизвестная ошибка: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{projectId}/files/**")
    public ResponseEntity<?> getFileContent(@PathVariable Long projectId,
                                            @AuthenticationPrincipal User user,
                                            HttpServletRequest request) {
        try {
            Project project = projectService.getProjectById(projectId, user);

            // Получаем полный path после /files/
            String pathWithinHandler = (String) request.getAttribute(
                    HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE
            );
            String bestMatchPattern = (String) request.getAttribute(
                    HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE
            );
            String relativePath = new AntPathMatcher().extractPathWithinPattern(bestMatchPattern, pathWithinHandler);

            java.nio.file.Path filePath = java.nio.file.Paths.get(project.getWorkspacePath(), relativePath);
            System.err.println(filePath);

            if (!java.nio.file.Files.exists(filePath)) {
                return ResponseEntity.status(404).body(Map.of("error", "Файл не найден"));
            }

            String content = java.nio.file.Files.readString(filePath);
            return ResponseEntity.ok(Map.of("filePath", relativePath, "content", content));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Сохранить содержимое файла в проекте
     */
    @PutMapping("/{projectId}/files/**")
    public ResponseEntity<?> saveFileContent(@PathVariable Long projectId,
                                           @RequestBody Map<String, String> body,
                                           @AuthenticationPrincipal User user,
                                           HttpServletRequest request) {
        try {
            System.out.println("=== SAVE FILE CONTENT ===");
            System.out.println("Project ID: " + projectId);
            System.out.println("User: " + (user != null ? user.getUsername() : "NULL"));
            
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
            }
            
            // Получаем полный path после /files/
            String requestUri = request.getRequestURI();
            System.out.println("Request URI: " + requestUri);
            
            String projectsPattern = "/api/projects/" + projectId + "/files/";
            int filesIndex = requestUri.indexOf(projectsPattern);
            if (filesIndex == -1) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid file path"));
            }
            
            String relativePath = requestUri.substring(filesIndex + projectsPattern.length());
            System.out.println("Relative path: " + relativePath);
            
            String content = body.get("content");
            if (content == null) {
                content = "";
            }
            
            System.out.println("Content length: " + content.length());
            
            projectService.updateFile(projectId, relativePath, content, user);
            return ResponseEntity.ok(Map.of("message", "File saved successfully", "filePath", relativePath));
            
        } catch (Exception e) {
            System.err.println("Error saving file: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Клонировать проект из GitHub репозитория
     */
    @PostMapping(value = "/clone", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> cloneFromGitHub(@RequestBody Map<String, String> cloneData,
                                           @AuthenticationPrincipal User user) {
        try {
            System.out.println("=== CLONE FROM GITHUB ===");
            System.out.println("User: " + (user != null ? user.getUsername() : "NULL"));
            System.out.println("Request body received: " + cloneData);
            System.out.println("Request body class: " + (cloneData != null ? cloneData.getClass().getName() : "NULL"));
            System.out.println("Request body size: " + (cloneData != null ? cloneData.size() : 0));
            
            if (cloneData != null) {
                cloneData.forEach((key, value) -> System.out.println("  " + key + " = " + value));
            }
            
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
            }
            
            String gitUrl = cloneData.get("gitUrl");
            String branch = cloneData.getOrDefault("branch", "main");
            String projectName = cloneData.get("name");
            
            System.out.println("Extracted values:");
            System.out.println("  gitUrl: " + gitUrl);
            System.out.println("  branch: " + branch);
            System.out.println("  projectName: " + projectName);
            
            if (gitUrl == null || gitUrl.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Git URL is required"));
            }
            
            if (projectName == null || projectName.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Project name is required"));
            }
            
            Project clonedProject = projectService.cloneFromGitHub(gitUrl, branch, projectName, user);
            System.out.println("Successfully cloned project: " + clonedProject.getName());
            return ResponseEntity.ok(clonedProject);
            
        } catch (Exception e) {
            System.err.println("Error cloning from GitHub: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to clone repository: " + e.getMessage()));
        }
    }

    /**
     * Удалить файл
     */
    @DeleteMapping("/{id}/files/**")
    public ResponseEntity<?> deleteFile(@PathVariable Long id, 
                                      @AuthenticationPrincipal User user,
                                      HttpServletRequest request) {
        try {
            System.out.println("=== DELETE FILE ===");
            System.out.println("Project ID: " + id);
            System.out.println("User: " + (user != null ? user.getUsername() : "NULL"));
            
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Пользователь не аутентифицирован"));
            }
            
            // Извлечение пути файла из URL
            String path = (String) request.getAttribute(HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE);
            String bestMatchingPattern = (String) request.getAttribute(HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE);
            String filePath = new AntPathMatcher().extractPathWithinPattern(bestMatchingPattern, path);
            
            System.out.println("File path to delete: " + filePath);
            
            boolean result = projectService.deleteFile(id, filePath, user);
            if (result) {
                return ResponseEntity.ok(Map.of("message", "Файл успешно удален", "filePath", filePath));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Не удалось удалить файл"));
            }
            
        } catch (RuntimeException e) {
            System.err.println("RuntimeException in deleteFile: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Exception in deleteFile: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Внутренняя ошибка сервера"));
        }
    }

    /**
     * Переименовать файл
     */
    @PostMapping("/{id}/files/rename/**")
    public ResponseEntity<?> renameFile(@PathVariable Long id,
                                      @RequestBody Map<String, String> renameData,
                                      @AuthenticationPrincipal User user,
                                      HttpServletRequest request) {
        try {
            System.out.println("=== RENAME FILE ===");
            System.out.println("Project ID: " + id);
            System.out.println("User: " + (user != null ? user.getUsername() : "NULL"));
            System.out.println("Rename data: " + renameData);
            
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Пользователь не аутентифицирован"));
            }
            
            // Извлечение пути файла из URL
            String path = (String) request.getAttribute(HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE);
            String bestMatchingPattern = (String) request.getAttribute(HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE);
            String filePath = new AntPathMatcher().extractPathWithinPattern(bestMatchingPattern, path);
            
            String newName = renameData.get("newName");
            
            System.out.println("File path to rename: " + filePath);
            System.out.println("New name: " + newName);
            
            if (newName == null || newName.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Новое имя файла обязательно"));
            }
            
            boolean result = projectService.renameFile(id, filePath, newName.trim(), user);
            if (result) {
                return ResponseEntity.ok(Map.of("message", "Файл успешно переименован", "oldPath", filePath, "newName", newName));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Не удалось переименовать файл"));
            }
            
        } catch (RuntimeException e) {
            System.err.println("RuntimeException in renameFile: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Exception in renameFile: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Внутренняя ошибка сервера"));
        }
    }

    /**
     * Создать папку
     */
    @PostMapping("/{id}/folders")
    public ResponseEntity<?> createFolder(@PathVariable Long id,
                                        @RequestBody Map<String, String> folderData,
                                        @AuthenticationPrincipal User user) {
        try {
            System.out.println("=== CREATE FOLDER ===");
            System.out.println("Project ID: " + id);
            System.out.println("User: " + (user != null ? user.getUsername() : "NULL"));
            System.out.println("Folder data: " + folderData);
            
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Пользователь не аутентифицирован"));
            }
            
            String folderPath = folderData.get("folderPath");
            
            if (folderPath == null || folderPath.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Путь к папке обязателен"));
            }
            
            boolean result = projectService.createFolder(id, folderPath.trim(), user);
            if (result) {
                return ResponseEntity.ok(Map.of("message", "Папка успешно создана", "folderPath", folderPath));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Не удалось создать папку"));
            }
            
        } catch (RuntimeException e) {
            System.err.println("RuntimeException in createFolder: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Exception in createFolder: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Внутренняя ошибка сервера"));
        }
    }

}