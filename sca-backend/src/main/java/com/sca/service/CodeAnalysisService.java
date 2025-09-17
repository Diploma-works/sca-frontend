package com.sca.service;

import com.sca.model.CodeProblem;
import com.sca.model.Project;
import com.sca.model.ProjectFile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
public class CodeAnalysisService {

    @Autowired
    private DockerService dockerService;

    /**
     * Запускает полный анализ проекта
     */
    public CompletableFuture<List<CodeProblem>> analyzeProject(Project project) {
        return CompletableFuture.supplyAsync(() -> {
            List<CodeProblem> problems = new ArrayList<>();
            
            try {
                // Анализ с помощью SonarQube
                problems.addAll(analyzeWithSonarQube(project));
                
                // Анализ с помощью PMD
                problems.addAll(analyzeWithPMD(project));
                
                // Анализ с помощью Checkstyle
                problems.addAll(analyzeWithCheckstyle(project));
                
                // Анализ с помощью SpotBugs
                problems.addAll(analyzeWithSpotBugs(project));
                
            } catch (Exception e) {
                throw new RuntimeException("Failed to analyze project", e);
            }
            
            return problems;
        });
    }

    /**
     * Анализ с помощью SonarQube
     */
    private List<CodeProblem> analyzeWithSonarQube(Project project) {
        List<CodeProblem> problems = new ArrayList<>();
        
        try {
            // Создаем временный контейнер для анализа
            String containerId = dockerService.createWorkspaceContainer(
                    project.getOwner().getId().toString(), 
                    project.getId().toString()
            );
            
            // Копируем проект в контейнер
            dockerService.copyToContainer(containerId, project.getWorkspacePath(), "/workspace");
            
            // Устанавливаем SonarQube Scanner
            dockerService.executeCommand(containerId, 
                    "wget", "-q", "https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-4.7.0.2747-linux.zip"
            );
            dockerService.executeCommand(containerId, 
                    "unzip", "sonar-scanner-cli-4.7.0.2747-linux.zip"
            );
            
            // Запускаем анализ
            String output = dockerService.executeCommand(containerId,
                    "./sonar-scanner-4.7.0.2747-linux/bin/sonar-scanner",
                    "-Dsonar.projectKey=" + project.getName(),
                    "-Dsonar.sources=/workspace",
                    "-Dsonar.host.url=http://localhost:9000"
            );
            
            // Парсим результаты
            problems.addAll(parseSonarQubeResults(output, project));
            
            // Очищаем контейнер
            dockerService.stopAndRemoveContainer(containerId);
            
        } catch (Exception e) {
            // Логируем ошибку, но продолжаем анализ
            System.err.println("SonarQube analysis failed: " + e.getMessage());
        }
        
        return problems;
    }

    /**
     * Анализ с помощью PMD
     */
    private List<CodeProblem> analyzeWithPMD(Project project) {
        List<CodeProblem> problems = new ArrayList<>();
        
        try {
            String containerId = dockerService.createWorkspaceContainer(
                    project.getOwner().getId().toString(), 
                    project.getId().toString()
            );
            
            // Копируем проект
            dockerService.copyToContainer(containerId, project.getWorkspacePath(), "/workspace");
            
            // Устанавливаем PMD
            dockerService.executeCommand(containerId, 
                    "apt-get", "update"
            );
            dockerService.executeCommand(containerId, 
                    "apt-get", "install", "-y", "pmd"
            );
            
            // Запускаем анализ
            String output = dockerService.executeCommand(containerId,
                    "pmd", "check", "/workspace", 
                    "--format", "xml",
                    "--rulesets", "java-basic,java-braces,java-clone,java-codesize"
            );
            
            // Парсим результаты
            problems.addAll(parsePMDResults(output, project));
            
            dockerService.stopAndRemoveContainer(containerId);
            
        } catch (Exception e) {
            System.err.println("PMD analysis failed: " + e.getMessage());
        }
        
        return problems;
    }

    /**
     * Анализ с помощью Checkstyle
     */
    private List<CodeProblem> analyzeWithCheckstyle(Project project) {
        List<CodeProblem> problems = new ArrayList<>();
        
        try {
            String containerId = dockerService.createWorkspaceContainer(
                    project.getOwner().getId().toString(), 
                    project.getId().toString()
            );
            
            dockerService.copyToContainer(containerId, project.getWorkspacePath(), "/workspace");
            
            // Устанавливаем Checkstyle
            dockerService.executeCommand(containerId, 
                    "apt-get", "update"
            );
            dockerService.executeCommand(containerId, 
                    "apt-get", "install", "-y", "checkstyle"
            );
            
            // Запускаем анализ
            String output = dockerService.executeCommand(containerId,
                    "checkstyle", "-c", "google_checks.xml", "/workspace"
            );
            
            problems.addAll(parseCheckstyleResults(output, project));
            
            dockerService.stopAndRemoveContainer(containerId);
            
        } catch (Exception e) {
            System.err.println("Checkstyle analysis failed: " + e.getMessage());
        }
        
        return problems;
    }

    /**
     * Анализ с помощью SpotBugs
     */
    private List<CodeProblem> analyzeWithSpotBugs(Project project) {
        List<CodeProblem> problems = new ArrayList<>();
        
        try {
            String containerId = dockerService.createWorkspaceContainer(
                    project.getOwner().getId().toString(), 
                    project.getId().toString()
            );
            
            dockerService.copyToContainer(containerId, project.getWorkspacePath(), "/workspace");
            
            // Устанавливаем SpotBugs
            dockerService.executeCommand(containerId, 
                    "apt-get", "update"
            );
            dockerService.executeCommand(containerId, 
                    "apt-get", "install", "-y", "spotbugs"
            );
            
            // Компилируем Java файлы
            dockerService.executeCommand(containerId,
                    "find", "/workspace", "-name", "*.java", "-exec", "javac", "{}", "\\;"
            );
            
            // Запускаем анализ
            String output = dockerService.executeCommand(containerId,
                    "spotbugs", "-textui", "/workspace"
            );
            
            problems.addAll(parseSpotBugsResults(output, project));
            
            dockerService.stopAndRemoveContainer(containerId);
            
        } catch (Exception e) {
            System.err.println("SpotBugs analysis failed: " + e.getMessage());
        }
        
        return problems;
    }

    /**
     * Парсинг результатов SonarQube
     */
    private List<CodeProblem> parseSonarQubeResults(String output, Project project) {
        List<CodeProblem> problems = new ArrayList<>();
        
        // Простой парсинг XML результатов
        // В реальном проекте нужно использовать XML парсер
        String[] lines = output.split("\n");
        for (String line : lines) {
            if (line.contains("issue")) {
                CodeProblem problem = new CodeProblem();
                problem.setProject(project);
                problem.setDescription("SonarQube issue: " + line);
                problem.setSeverity(CodeProblem.ProblemSeverity.WARNING);
                problem.setType(CodeProblem.ProblemType.CODE_SMELL);
                problems.add(problem);
            }
        }
        
        return problems;
    }

    /**
     * Парсинг результатов PMD
     */
    private List<CodeProblem> parsePMDResults(String output, Project project) {
        List<CodeProblem> problems = new ArrayList<>();
        
        String[] lines = output.split("\n");
        for (String line : lines) {
            if (line.contains("violation")) {
                CodeProblem problem = new CodeProblem();
                problem.setProject(project);
                problem.setDescription("PMD violation: " + line);
                problem.setSeverity(CodeProblem.ProblemSeverity.WARNING);
                problem.setType(CodeProblem.ProblemType.CODE_SMELL);
                problems.add(problem);
            }
        }
        
        return problems;
    }

    /**
     * Парсинг результатов Checkstyle
     */
    private List<CodeProblem> parseCheckstyleResults(String output, Project project) {
        List<CodeProblem> problems = new ArrayList<>();
        
        String[] lines = output.split("\n");
        for (String line : lines) {
            if (line.contains("error") || line.contains("warning")) {
                CodeProblem problem = new CodeProblem();
                problem.setProject(project);
                problem.setDescription("Checkstyle issue: " + line);
                problem.setSeverity(CodeProblem.ProblemSeverity.WARNING);
                problem.setType(CodeProblem.ProblemType.CODE_SMELL);
                problems.add(problem);
            }
        }
        
        return problems;
    }

    /**
     * Парсинг результатов SpotBugs
     */
    private List<CodeProblem> parseSpotBugsResults(String output, Project project) {
        List<CodeProblem> problems = new ArrayList<>();
        
        String[] lines = output.split("\n");
        for (String line : lines) {
            if (line.contains("Bug")) {
                CodeProblem problem = new CodeProblem();
                problem.setProject(project);
                problem.setDescription("SpotBugs issue: " + line);
                problem.setSeverity(CodeProblem.ProblemSeverity.ERROR);
                problem.setType(CodeProblem.ProblemType.BUG);
                problems.add(problem);
            }
        }
        
        return problems;
    }
} 