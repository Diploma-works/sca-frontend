package com.sca.service;

import com.sca.model.Project;
import com.sca.model.ProjectFile;
import com.sca.model.User;
import com.sca.model.CodeProblem;
import com.sca.model.GitHubToken;
import com.sca.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
public class ProjectService {

    @Autowired
    private CodeAnalysisService codeAnalysisService;
    
    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private GitHubService gitHubService;
    
    @Value("${filesystem.workspace.base-path:/tmp/sca-workspaces}")
    private String workspaceBasePath;
    
    @Value("${filesystem.workspace.max-size:100MB}")
    private String maxWorkspaceSize;

    /**
     * Получить все проекты пользователя
     */
    public List<Project> getProjectsByUser(User user) {
        return projectRepository.findByOwnerOrderByCreatedAtDesc(user);
    }

    /**
     * Получить проект по ID
     */
    public Project getProjectById(Long id, User user) {
        Optional<Project> project = projectRepository.findByIdAndOwner(id, user);
        if (project.isPresent()) {
            Project foundProject = project.get();
            foundProject.setLastAccessed(LocalDateTime.now());
            return projectRepository.save(foundProject);
        }
        throw new RuntimeException("Проект не найден");
    }

    /**
     * Создать новый проект
     */
    public Project createProject(Project project) {
        // Проверяем, что проект с таким именем не существует
        if (projectRepository.existsByNameAndOwner(project.getName(), project.getOwner())) {
            throw new RuntimeException("Проект с таким именем уже существует");
        }
        
        // Создаем рабочую директорию
        String workspacePath = createWorkspaceDirectory(project.getOwner().getId(), project.getName());
        project.setWorkspacePath(workspacePath);
        project.setType(Project.ProjectType.LOCAL);
        project.setStatus(Project.ProjectStatus.ACTIVE);
        
        // Сохраняем проект в БД
        Project savedProject = projectRepository.save(project);
        
        // Создаем базовую структуру проекта
        createBasicProjectStructure(savedProject);
        
        return savedProject;
    }

    /**
     * Обновить проект
     */
    public Project updateProject(Long id, Project project, User user) {
        Optional<Project> existingProject = projectRepository.findByIdAndOwner(id, user);
        if (existingProject.isPresent()) {
            Project foundProject = existingProject.get();
            
            // Обновляем только разрешенные поля
            if (project.getName() != null && !project.getName().equals(foundProject.getName())) {
                if (projectRepository.existsByNameAndOwner(project.getName(), user)) {
                    throw new RuntimeException("Проект с таким именем уже существует");
                }
                foundProject.setName(project.getName());
            }
            
            if (project.getDescription() != null) {
                foundProject.setDescription(project.getDescription());
            }
            
            return projectRepository.save(foundProject);
        }
        throw new RuntimeException("Проект не найден");
    }

    /**
     * Удалить проект
     */
    public void deleteProject(Long id, User user) {
        Optional<Project> project = projectRepository.findByIdAndOwner(id, user);
        if (project.isPresent()) {
            Project foundProject = project.get();
            
            // Удаляем рабочую директорию
            deleteWorkspaceDirectory(foundProject.getWorkspacePath());
            
            // Удаляем из БД
            projectRepository.delete(foundProject);
        } else {
            throw new RuntimeException("Проект не найден");
        }
    }

    /**
     * Получить статистику проекта
     */
    public Map<String, Object> getProjectStatistics(Long id, User user) {
        Project project = getProjectById(id, user);
        Map<String, Object> statistics = new HashMap<>();
        
        // TODO: Реализовать подсчет статистики
        statistics.put("totalFiles", 0);
        statistics.put("totalLines", 0);
        statistics.put("problems", 0);
        statistics.put("lastAnalysis", null);
        
        return statistics;
    }

    /**
     * Сохранить проблемы в БД
     */
    public void saveProblems(Project project, List<CodeProblem> problems) {
        // TODO: Реализовать сохранение проблем
    }

    /**
     * Получить проблемы проекта
     */
    public List<CodeProblem> getProblemsByProject(Project project) {
        // TODO: Реализовать получение проблем
        return List.of();
    }

    /**
     * Обновить файл проекта
     */
    public void updateFile(Long projectId, String filePath, String content, User user) {
        Project project = getProjectById(projectId, user);
        Path fullPath = Paths.get(project.getWorkspacePath(), filePath);
        
        try {
            // Создаем директории, если они не существуют
            Files.createDirectories(fullPath.getParent());
            
            // Записываем содержимое файла
            Files.write(fullPath, content.getBytes());
        } catch (IOException e) {
            throw new RuntimeException("Ошибка при обновлении файла: " + e.getMessage());
        }
    }
    
    /**
     * Создать рабочую директорию для проекта
     */
    private String createWorkspaceDirectory(Long userId, String projectName) {
        String userDir = Paths.get(workspaceBasePath, "user-" + userId).toString();
        String projectDir = Paths.get(userDir, projectName).toString();
        
        try {
            Files.createDirectories(Paths.get(projectDir));
            return projectDir;
        } catch (IOException e) {
            throw new RuntimeException("Ошибка при создании рабочей директории: " + e.getMessage());
        }
    }
    
    /**
     * Удалить рабочую директорию проекта
     */
    private void deleteWorkspaceDirectory(String workspacePath) {
        try {
            Path path = Paths.get(workspacePath);
            if (Files.exists(path)) {
                Files.walk(path)
                    .sorted((a, b) -> b.compareTo(a))
                    .forEach(p -> {
                        try {
                            Files.delete(p);
                        } catch (IOException e) {
                            // Логируем ошибку, но продолжаем удаление
                            System.err.println("Ошибка при удалении файла: " + p);
                        }
                    });
            }
        } catch (IOException e) {
            throw new RuntimeException("Ошибка при удалении рабочей директории: " + e.getMessage());
        }
    }
    
    /**
     * Создать базовую структуру проекта
     */
    private void createBasicProjectStructure(Project project) {
        try {
            Path projectPath = Paths.get(project.getWorkspacePath());
            
            // Создаем README.md
            String readmeContent = "# " + project.getName() + "\n\n" +
                (project.getDescription() != null ? project.getDescription() : "Описание проекта") + "\n\n" +
                "Создан: " + LocalDateTime.now().toString();
            
            Files.write(projectPath.resolve("README.md"), readmeContent.getBytes());
            
        } catch (IOException e) {
            throw new RuntimeException("Ошибка при создании структуры проекта: " + e.getMessage());
        }
    }
    
    /**
     * Клонировать Git репозиторий
     */
    private void cloneGitRepository(String gitUrl, String branch, String workspacePath) {
        try {
            ProcessBuilder processBuilder = new ProcessBuilder(
                "git", "clone", "-b", branch, gitUrl, workspacePath
            );
            processBuilder.directory(new File(workspaceBasePath));

            Process process = processBuilder.start();
            int exitCode = process.waitFor();

            if (exitCode != 0) {
                throw new RuntimeException("Ошибка при клонировании репозитория: " + Integer.toString(exitCode));
            }
        } catch (IOException | InterruptedException e) {
            throw new RuntimeException("Ошибка при клонировании репозитория: " + e.getMessage());
        }
    }

    public Object getProjectStructure(Long id, User user) {
        Project project = getProjectById(id, user);
        Path rootPath = Paths.get(project.getWorkspacePath());
        if (!Files.exists(rootPath)) {
            throw new RuntimeException("Workspace directory not found");
        }
        return listDirectory(rootPath, rootPath);
    }

    private Object listDirectory(Path dir, Path rootPath) {
        try {
            List<Map<String, Object>> items = new ArrayList<>();
            Files.list(dir).forEach(path -> {
                Map<String, Object> item = new HashMap<>();
                item.put("name", path.getFileName().toString());
                item.put("path", rootPath.relativize(path).toString().replace("\\", "/"));
                item.put("isDirectory", Files.isDirectory(path));
                if (Files.isDirectory(path)) {
                    item.put("children", listDirectory(path, rootPath));
                }
                items.add(item);
            });
            return items;
        } catch (IOException e) {
            throw new RuntimeException("Ошибка при чтении структуры проекта: " + e.getMessage());
        }
    }

    /**
     * Клонировать проект из GitHub репозитория
     */
    public Project cloneFromGitHub(String gitUrl, String branch, String projectName, User user) {
        try {
            System.out.println("=== CLONING FROM GITHUB ===");
            System.out.println("Git URL: " + gitUrl);
            System.out.println("Branch: " + branch);
            System.out.println("Project Name: " + projectName);
            System.out.println("User: " + user.getUsername());
            
            // Проверяем, что проект с таким именем не существует
            if (projectRepository.existsByNameAndOwner(projectName, user)) {
                throw new RuntimeException("Проект с таким именем уже существует");
            }
            
            // Получаем GitHub токен пользователя
            Optional<GitHubToken> tokenOpt = gitHubService.getUserToken(user);
            if (tokenOpt.isEmpty()) {
                throw new RuntimeException("GitHub токен не найден. Пожалуйста, подключите ваш GitHub аккаунт.");
            }
            
            String accessToken = tokenOpt.get().getAccessToken();
            System.out.println("Found GitHub token for user: " + user.getUsername());
            
            // Создаем рабочую директорию
            String workspacePath = createWorkspaceDirectory(user.getId(), projectName);
            Path projectPath = Paths.get(workspacePath);
            
            System.out.println("Workspace path: " + workspacePath);
            
            // Модифицируем URL для использования токена
            String authenticatedUrl = gitUrl;
            if (gitUrl.startsWith("https://github.com/")) {
                // Заменяем https://github.com/ на https://oauth2:TOKEN@github.com/
                authenticatedUrl = gitUrl.replace("https://github.com/", "https://oauth2:" + accessToken + "@github.com/");
                System.out.println("Using authenticated URL for private repository");
            }
            
            // Выполняем git clone
            ProcessBuilder processBuilder = new ProcessBuilder();
            processBuilder.directory(projectPath.getParent().toFile());
            
            List<String> command = new ArrayList<>();
            command.add("git");
            command.add("clone");
            command.add("--branch");
            command.add(branch);
            command.add("--single-branch");
            command.add(authenticatedUrl);
            command.add(projectPath.getFileName().toString());
            
            processBuilder.command(command);
            
            System.out.println("Executing git clone command");
            // Не логируем полную команду чтобы не показать токен в логах
            
            Process process = processBuilder.start();
            int exitCode = process.waitFor();
            
            if (exitCode != 0) {
                // Читаем ошибку
                String error = new String(process.getErrorStream().readAllBytes());
                System.err.println("Git clone failed with exit code: " + exitCode);
                System.err.println("Error output: " + error);
                throw new RuntimeException("Ошибка клонирования репозитория: " + error);
            }
            
            System.out.println("Git clone completed successfully");
            
            // Создаем проект в БД
            Project project = new Project();
            project.setName(projectName);
            project.setDescription("Клонированный проект из " + gitUrl);
            project.setOwner(user);
            project.setWorkspacePath(workspacePath);
            project.setType(Project.ProjectType.GITHUB);
            project.setStatus(Project.ProjectStatus.ACTIVE);
            project.setGitUrl(gitUrl);
            project.setGitBranch(branch);
            
            Project savedProject = projectRepository.save(project);
            System.out.println("Project saved to database with ID: " + savedProject.getId());
            
            return savedProject;
            
        } catch (Exception e) {
            System.err.println("Error in cloneFromGitHub: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Ошибка при клонировании проекта: " + e.getMessage());
        }
    }

    /**
     * Удалить файл из проекта
     */
    public boolean deleteFile(Long projectId, String filePath, User user) {
        try {
            System.out.println("ProjectService.deleteFile called with projectId: " + projectId + ", filePath: " + filePath);
            
            Project project = getProjectById(projectId, user);
            String fullPath = project.getWorkspacePath() + "/" + filePath;
            
            File file = new File(fullPath);
            System.out.println("Full file path: " + fullPath);
            System.out.println("File exists: " + file.exists());
            
            if (!file.exists()) {
                throw new RuntimeException("Файл не найден: " + filePath);
            }
            
            boolean deleted;
            if (file.isDirectory()) {
                // Удаляем папку рекурсивно
                deleted = deleteDirectory(file);
            } else {
                // Удаляем файл
                deleted = file.delete();
            }
            
            System.out.println("File deletion result: " + deleted);
            return deleted;
            
        } catch (Exception e) {
            System.err.println("Error deleting file: " + e.getMessage());
            throw new RuntimeException("Ошибка удаления файла: " + e.getMessage());
        }
    }

    /**
     * Переименовать файл в проекте
     */
    public boolean renameFile(Long projectId, String filePath, String newName, User user) {
        try {
            System.out.println("ProjectService.renameFile called with projectId: " + projectId + ", filePath: " + filePath + ", newName: " + newName);
            
            Project project = getProjectById(projectId, user);
            String fullPath = project.getWorkspacePath() + "/" + filePath;
            
            File oldFile = new File(fullPath);
            System.out.println("Old file path: " + fullPath);
            System.out.println("File exists: " + oldFile.exists());
            
            if (!oldFile.exists()) {
                throw new RuntimeException("Файл не найден: " + filePath);
            }
            
            // Создаем новый путь
            String parentDir = oldFile.getParent();
            File newFile = new File(parentDir, newName);
            String newFilePath = newFile.getAbsolutePath();
            
            System.out.println("New file path: " + newFilePath);
            
            if (newFile.exists()) {
                throw new RuntimeException("Файл с именем '" + newName + "' уже существует");
            }
            
            boolean renamed = oldFile.renameTo(newFile);
            System.out.println("File rename result: " + renamed);
            return renamed;
            
        } catch (Exception e) {
            System.err.println("Error renaming file: " + e.getMessage());
            throw new RuntimeException("Ошибка переименования файла: " + e.getMessage());
        }
    }

    /**
     * Создать папку в проекте
     */
    public boolean createFolder(Long projectId, String folderPath, User user) {
        try {
            System.out.println("ProjectService.createFolder called with projectId: " + projectId + ", folderPath: " + folderPath);
            
            Project project = getProjectById(projectId, user);
            String fullPath = project.getWorkspacePath() + "/" + folderPath;
            
            File folder = new File(fullPath);
            System.out.println("Full folder path: " + fullPath);
            System.out.println("Folder exists: " + folder.exists());
            
            if (folder.exists()) {
                throw new RuntimeException("Папка уже существует: " + folderPath);
            }
            
            boolean created = folder.mkdirs();
            System.out.println("Folder creation result: " + created);
            return created;
            
        } catch (Exception e) {
            System.err.println("Error creating folder: " + e.getMessage());
            throw new RuntimeException("Ошибка создания папки: " + e.getMessage());
        }
    }

    /**
     * Рекурсивное удаление директории
     */
    private boolean deleteDirectory(File directory) {
        File[] files = directory.listFiles();
        if (files != null) {
            for (File file : files) {
                if (file.isDirectory()) {
                    deleteDirectory(file);
                } else {
                    file.delete();
                }
            }
        }
        return directory.delete();
    }
}