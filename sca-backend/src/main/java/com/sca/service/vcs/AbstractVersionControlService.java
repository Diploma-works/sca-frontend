package com.sca.service.vcs;

import com.sca.model.Project;
import com.sca.model.User;
import com.sca.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public abstract class AbstractVersionControlService implements VersionControlService {

    @Autowired
    protected ProjectRepository projectRepository;

    @Value("${filesystem.workspace.base-path:/tmp/sca-workspaces}")
    private String workspaceBasePath;

    protected Project cloneWithAuth(Project.ProjectType type,
                                    String originalUrl,
                                    String authenticatedUrl,
                                    String branch,
                                    String projectName,
                                    User user) {
        try {
            if (projectRepository.existsByNameAndOwner(projectName, user)) {
                throw new RuntimeException("Проект с таким именем уже существует");
            }

            String workspacePath = createWorkspaceDirectory(user.getId(), projectName);
            Path projectPath = Paths.get(workspacePath);

            ProcessBuilder processBuilder = new ProcessBuilder();
            processBuilder.directory(projectPath.getParent().toFile());
            processBuilder.environment().put("GIT_TERMINAL_PROMPT", "0");

            List<String> command = new ArrayList<>();
            command.add("git");
            command.add("clone");
            command.add("--branch");
            command.add(branch);
            command.add("--single-branch");
            command.add(authenticatedUrl);
            command.add(projectPath.getFileName().toString());
            processBuilder.command(command);

            Process process = processBuilder.start();
            int exitCode = process.waitFor();

            if (exitCode != 0) {
                String error = new String(process.getErrorStream().readAllBytes(), StandardCharsets.UTF_8);
                throw new RuntimeException("Ошибка клонирования репозитория: " + error);
            }

            Project project = new Project();
            project.setName(projectName);
            project.setDescription("Клонированный проект из " + sanitizeGitUrlForStorage(originalUrl));
            project.setOwner(user);
            project.setWorkspacePath(workspacePath);
            project.setType(type);
            project.setStatus(Project.ProjectStatus.ACTIVE);
            project.setGitUrl(sanitizeGitUrlForStorage(originalUrl));
            project.setGitBranch(branch);

            return projectRepository.save(project);
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при клонировании проекта: " + e.getMessage(), e);
        }
    }

    protected String sanitizeGitUrlForStorage(String gitUrl) {
        if (gitUrl == null) {
            return null;
        }
        return gitUrl.replaceFirst("^https://[^/@]+@", "https://");
    }

    protected static String withUserInfo(String remoteUrl, String username, String passwordOrToken) {
        if (remoteUrl == null) {
            return null;
        }
        URI uri = URI.create(remoteUrl);
        if (uri.getScheme() == null || uri.getHost() == null) {
            return remoteUrl;
        }

        String user = encodeUserInfoComponent(username);
        String pass = encodeUserInfoComponent(passwordOrToken);
        String userInfo = passwordOrToken == null ? user : user + ":" + pass;

        try {
            URI rebuilt = new URI(
                    uri.getScheme(),
                    userInfo,
                    uri.getHost(),
                    uri.getPort(),
                    uri.getRawPath(),
                    uri.getRawQuery(),
                    uri.getRawFragment()
            );
            return rebuilt.toString();
        } catch (URISyntaxException e) {
            return remoteUrl;
        }
    }

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

    private static String encodeUserInfoComponent(String value) {
        if (value == null) {
            return "";
        }

        StringBuilder sb = new StringBuilder(value.length());
        for (int i = 0; i < value.length(); i++) {
            char c = value.charAt(i);
            if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9')
                    || c == '-' || c == '.' || c == '_' || c == '~') {
                sb.append(c);
            } else {
                byte[] bytes = String.valueOf(c).getBytes(StandardCharsets.UTF_8);
                for (byte b : bytes) {
                    sb.append('%');
                    String hex = Integer.toHexString(b & 0xFF).toUpperCase(Locale.ROOT);
                    if (hex.length() == 1) {
                        sb.append('0');
                    }
                    sb.append(hex);
                }
            }
        }
        return sb.toString();
    }
}
