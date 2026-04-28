package com.sca.service;

import com.sca.model.Project;
import com.sca.model.User;
import com.sca.model.CodeProblem;
import com.sca.repository.ProjectRepository;
import com.sca.service.vcs.UnifiedVcsService;
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
    private ProjectRepository projectRepository;
    
    @Autowired
    private UnifiedVcsService unifiedVcsService;
    
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
        if (projectRepository.existsByNameAndOwner(project.getName(), project.getOwner())) {
            throw new RuntimeException("Проект с таким именем уже существует");
        }

        String workspacePath = createWorkspaceDirectory(project.getOwner().getId(), project.getName());
        project.setWorkspacePath(workspacePath);
        project.setType(Project.ProjectType.LOCAL);
        project.setStatus(Project.ProjectStatus.ACTIVE);
        
        Project savedProject = projectRepository.save(project);
        
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
            
            deleteWorkspaceDirectory(foundProject.getWorkspacePath());
            
            projectRepository.delete(foundProject);
        } else {
            throw new RuntimeException("Проект не найден");
        }
    }

    /**
     * Получить статистику проекта
     */
    public Map<String, Object> getProjectStatistics(Long id, User user) {
        getProjectById(id, user);
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
    

    public void cloneGitRepository(String gitUrl, String branch, String workspacePath) {
        try {
            String normalized = workspacePath == null ? "" : workspacePath;
            if (normalized.startsWith("/")) normalized = normalized.substring(1);
            if (normalized.startsWith("\\")) normalized = normalized.substring(1);

            ProcessBuilder processBuilder = new ProcessBuilder(
                    "git", "clone", "--branch", branch, "--single-branch", gitUrl, normalized
            );
            processBuilder.directory(new File(workspaceBasePath));
            processBuilder.environment().put("GIT_TERMINAL_PROMPT", "0");

            Process process = processBuilder.start();
            int exitCode = process.waitFor();

            String stdout = new String(process.getInputStream().readAllBytes());
            String stderr = new String(process.getErrorStream().readAllBytes());

            if (exitCode != 0) {
                throw new RuntimeException("git clone failed (exit code=" + exitCode + "): " + (stderr.isBlank() ? stdout : stderr));
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
        return unifiedVcsService.cloneRepository(Project.ProjectType.GITHUB, gitUrl, branch, projectName, user);
    }

    /**
     * Клонировать проект из GitLab репозитория (путь и поведение как у GitHub).
     */
    public Project cloneFromGitLab(String gitUrl, String branch, String projectName, User user) {
        return unifiedVcsService.cloneRepository(Project.ProjectType.GITLAB, gitUrl, branch, projectName, user);
    }

    /**
     * Клонировать проект из Bitbucket репозитория (путь и поведение как у GitHub).
     */
    public Project cloneFromBitbucket(String gitUrl, String branch, String projectName, User user) {
        return unifiedVcsService.cloneRepository(Project.ProjectType.BITBUCKET, gitUrl, branch, projectName, user);
    }

    /**
     * Удалить файл из проекта
     */
    public boolean deleteFile(Long projectId, String filePath, User user) {
        try {
            Project project = getProjectById(projectId, user);
            String fullPath = project.getWorkspacePath() + "/" + filePath;
            
            File file = new File(fullPath);
            
            if (!file.exists()) {
                throw new RuntimeException("Файл не найден: " + filePath);
            }
            
            boolean deleted;
            if (file.isDirectory()) {
                deleted = deleteDirectory(file);
            } else {
                deleted = file.delete();
            }
            
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
            Project project = getProjectById(projectId, user);
            String fullPath = project.getWorkspacePath() + "/" + filePath;
            
            File oldFile = new File(fullPath);
            
            if (!oldFile.exists()) {
                throw new RuntimeException("Файл не найден: " + filePath);
            }
            
            String parentDir = oldFile.getParent();
            File newFile = new File(parentDir, newName);
            
            if (newFile.exists()) {
                throw new RuntimeException("Файл с именем '" + newName + "' уже существует");
            }
            
            return oldFile.renameTo(newFile);
            
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
            Project project = getProjectById(projectId, user);
            String fullPath = project.getWorkspacePath() + "/" + folderPath;
            
            File folder = new File(fullPath);
            
            if (folder.exists()) {
                throw new RuntimeException("Папка уже существует: " + folderPath);
            }
            
            return folder.mkdirs();
            
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