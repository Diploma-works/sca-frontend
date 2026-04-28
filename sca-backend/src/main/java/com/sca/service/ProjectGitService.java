package com.sca.service;

import com.sca.model.Project;
import com.sca.model.User;
import com.sca.repository.ProjectRepository;
import com.sca.service.vcs.UnifiedVcsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.attribute.PosixFilePermission;
import java.nio.file.attribute.PosixFilePermissions;
import java.nio.file.Paths;
import java.util.*;

@Service
public class ProjectGitService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UnifiedVcsService unifiedVcsService;
    
    @Value("${filesystem.workspace.base-path:/tmp/sca-workspaces}")
    private String workspaceBasePath;

    private Path getUserSshDir(User user) {
        return Paths.get(workspaceBasePath, "user-" + user.getId(), ".ssh");
    }

    private Path getBitbucketPrivateKeyPath(User user) {
        return getUserSshDir(user).resolve("bitbucket_id_ed25519");
    }

    public Map<String, Object> getBitbucketSshKeyStatus(User user) {
        try {
            Path keyPath = getBitbucketPrivateKeyPath(user);
            boolean exists = Files.exists(keyPath);
            Map<String, Object> res = new HashMap<>();
            res.put("configured", exists);
            res.put("path", keyPath.toString());
            return res;
        } catch (Exception e) {
            throw new RuntimeException("Failed to get Bitbucket SSH key status: " + e.getMessage());
        }
    }

    public Map<String, Object> saveBitbucketSshPrivateKey(User user, String privateKeyPem) {
        if (privateKeyPem == null || privateKeyPem.trim().isEmpty()) {
            throw new RuntimeException("SSH private key cannot be empty");
        }

        try {
            Path sshDir = getUserSshDir(user);
            Files.createDirectories(sshDir);

            Path keyPath = getBitbucketPrivateKeyPath(user);
            Files.writeString(keyPath, privateKeyPem.replace("\r\n", "\n").trim() + "\n", StandardCharsets.UTF_8);

            try {
                Set<PosixFilePermission> perms = PosixFilePermissions.fromString("rw-------");
                Files.setPosixFilePermissions(keyPath, perms);
            } catch (UnsupportedOperationException ignored) {
            }

            Map<String, Object> res = new HashMap<>();
            res.put("success", true);
            res.put("message", "Bitbucket SSH key saved");
            res.put("path", keyPath.toString());
            return res;
        } catch (Exception e) {
            throw new RuntimeException("Failed to save Bitbucket SSH key: " + e.getMessage(), e);
        }
    }

    public Map<String, Object> removeBitbucketSshPrivateKey(User user) {
        try {
            Path keyPath = getBitbucketPrivateKeyPath(user);
            Files.deleteIfExists(keyPath);
            Map<String, Object> res = new HashMap<>();
            res.put("success", true);
            res.put("message", "Bitbucket SSH key removed");
            return res;
        } catch (Exception e) {
            throw new RuntimeException("Failed to remove Bitbucket SSH key: " + e.getMessage(), e);
        }
    }

    public Map<String, Object> testBitbucketSsh(User user) {
        try {
            Path keyPath = getBitbucketPrivateKeyPath(user);
            if (!Files.exists(keyPath)) {
                throw new RuntimeException("Bitbucket SSH key is not configured");
            }

            String out = executeCommandWithEnv(null,
                    Map.of("GIT_SSH_COMMAND", buildGitSshCommand(keyPath)),
                    "ssh", "-T", "git@bitbucket.org");

            Map<String, Object> resTest = new HashMap<>();
            resTest.put("success", true);
            resTest.put("output", out);
            return resTest;
        } catch (Exception e) {

            Map<String, Object> res = new HashMap<>();
            res.put("success", false);
            res.put("error", e.getMessage());
            return res;
        }
    }

    private String buildGitSshCommand(Path privateKeyPath) {
        return "ssh -i \"" + privateKeyPath.toString() + "\" -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new";
    }

    private String toBitbucketSshRemote(String currentRemote) {
        if (currentRemote == null) return null;
        String cleaned = currentRemote.trim().replaceAll("\\s+", "").replaceAll("/+$", "");
        if (cleaned.startsWith("git@bitbucket.org:")) return cleaned;
        if (cleaned.startsWith("ssh://")) return cleaned; // already ssh
        if (cleaned.startsWith("https://bitbucket.org/")) {
            String path = cleaned.substring("https://bitbucket.org/".length());
            return "git@bitbucket.org:" + path;
        }
        return cleaned;
    }

    private String runWithBitbucketSsh(User user, String projectPath, String... gitCommand) throws Exception {
        String originalRemoteUrl = null;
        try {
            Path keyPath = getBitbucketPrivateKeyPath(user);
            if (!Files.exists(keyPath)) {
                throw new RuntimeException("Bitbucket SSH key not configured. Configure SSH key to use git push/pull without app passwords.");
            }

            originalRemoteUrl = executeGitCommand(projectPath, "git", "config", "--get", "remote.origin.url").trim();
            String sshRemote = toBitbucketSshRemote(originalRemoteUrl);
            if (sshRemote != null && !sshRemote.equals(originalRemoteUrl)) {
                executeGitCommand(projectPath, "git", "remote", "set-url", "origin", sshRemote);
            }

            Map<String, String> env = new HashMap<>();
            env.put("GIT_TERMINAL_PROMPT", "0");
            env.put("GIT_SSH_COMMAND", buildGitSshCommand(keyPath));
            return executeCommandWithEnv(projectPath, env, gitCommand);
        } finally {
            try {
                if (originalRemoteUrl != null && !originalRemoteUrl.isBlank()) {
                    executeGitCommand(projectPath, "git", "remote", "set-url", "origin", originalRemoteUrl);
                }
            } catch (Exception ignored) {
            }
        }
    }

    private String executeCommandWithEnv(String workingDirectory, Map<String, String> env, String... command) throws Exception {
        ProcessBuilder processBuilder = new ProcessBuilder(command);
        if (workingDirectory != null) {
            processBuilder.directory(new File(workingDirectory));
        }
        if (env != null) {
            processBuilder.environment().putAll(env);
        }
        Process process = processBuilder.start();

        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        StringBuilder output = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            output.append(line).append("\n");
        }

        BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getErrorStream()));
        StringBuilder errorOutput = new StringBuilder();
        while ((line = errorReader.readLine()) != null) {
            errorOutput.append(line).append("\n");
        }

        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new RuntimeException("Command failed: " + errorOutput);
        }
        return output.toString();
    }

    private String runWithAuthenticatedOrigin(Project project, User user, String projectPath, String... gitCommand) throws Exception {
        if (project.getType() == Project.ProjectType.BITBUCKET) {
            return runWithBitbucketSsh(user, projectPath, gitCommand);
        }
        String originalRemoteUrl = null;
        try {
            originalRemoteUrl = executeGitCommand(projectPath, "git", "config", "--get", "remote.origin.url").trim();
            String authenticated = unifiedVcsService.buildAuthenticatedRemote(project, user, originalRemoteUrl);
            if (authenticated != null && !authenticated.equals(originalRemoteUrl)) {
                executeGitCommand(projectPath, "git", "remote", "set-url", "origin", authenticated);
            }
            return executeGitCommand(projectPath, gitCommand);
        } finally {
            try {
                if (originalRemoteUrl != null && !originalRemoteUrl.isBlank()) {
                    executeGitCommand(projectPath, "git", "remote", "set-url", "origin", originalRemoteUrl);
                }
            } catch (Exception ignored) {
            }
        }
    }

    public Map<String, Object> getRepositoryInfo(Long projectId, User user) {
        Project project = projectRepository.findByIdAndOwner(projectId, user)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        String projectPath = workspaceBasePath + "/user-" + user.getId() + "/" + project.getName();
        File projectDir = new File(projectPath);

        if (!projectDir.exists() || !new File(projectDir, ".git").exists()) {
            throw new RuntimeException("Project is not a Git repository");
        }

        try {
            Map<String, Object> repoInfo = new HashMap<>();
            
            String remoteUrl = executeGitCommand(projectPath, "git", "config", "--get", "remote.origin.url");
            repoInfo.put("url", remoteUrl.trim());
            
            String currentBranch = executeGitCommand(projectPath, "git", "branch", "--show-current");
            repoInfo.put("currentBranch", currentBranch.trim());
            
            String lastCommitInfo = executeGitCommand(projectPath, "git", "log", "-1", "--pretty=format:%H|%s|%an|%ad", "--date=iso");
            if (!lastCommitInfo.trim().isEmpty()) {
                String[] parts = lastCommitInfo.split("\\|");
                Map<String, Object> lastCommit = new HashMap<>();
                lastCommit.put("hash", parts[0]);
                lastCommit.put("message", parts.length > 1 ? parts[1] : "");
                lastCommit.put("author", parts.length > 2 ? parts[2] : "");
                lastCommit.put("date", parts.length > 3 ? parts[3] : "");
                repoInfo.put("lastCommit", lastCommit);
            }
            
            String repoName = project.getName();
            if (remoteUrl.contains("/")) {
                String[] urlParts = remoteUrl.split("/");
                repoName = urlParts[urlParts.length - 1].replace(".git", "");
            }
            repoInfo.put("name", repoName);
            
            return repoInfo;
        } catch (Exception e) {
            System.err.println("Error getting repository info: " + e.getMessage());
            throw new RuntimeException("Failed to get repository info: " + e.getMessage());
        }
    }

    public Map<String, Object> hasStash(Long projectId, User user) {
        Project project = projectRepository.findByIdAndOwner(projectId, user)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        String projectPath = workspaceBasePath + "/user-" + user.getId() + "/" + project.getName();
        
        File projectDir = new File(projectPath);
        if (!projectDir.exists() || !new File(projectDir, ".git").exists()) {
            throw new RuntimeException("Project is not a Git repository");
        }

        try {
            String stashList = executeGitCommand(projectPath, "git", "stash", "list");
            boolean hasStash = !stashList.trim().isEmpty();
            
            Map<String, Object> response = new HashMap<>();
            response.put("hasStash", hasStash);
            response.put("stashCount", hasStash ? stashList.split("\n").length : 0);
            
            return response;
        } catch (Exception e) {
            System.err.println("Error checking stash: " + e.getMessage());
            throw new RuntimeException("Failed to check stash: " + e.getMessage());
        }
    }

    public Map<String, Object> createTag(Long projectId, String name, String message, User user) {
        Project project = projectRepository.findByIdAndOwner(projectId, user)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        String projectPath = workspaceBasePath + "/user-" + user.getId() + "/" + project.getName();
        File projectDir = new File(projectPath);

        if (!projectDir.exists() || !new File(projectDir, ".git").exists()) {
            throw new RuntimeException("Project is not a Git repository");
        }

        try {
            Map<String, Object> repoInfo = new HashMap<>();
            
            String remoteUrl = executeGitCommand(projectPath, "git", "config", "--get", "remote.origin.url");
            repoInfo.put("url", remoteUrl.trim());
            
            String currentBranch = executeGitCommand(projectPath, "git", "branch", "--show-current");
            repoInfo.put("currentBranch", currentBranch.trim());
            
            String lastCommitInfo = executeGitCommand(projectPath, "git", "log", "-1", "--pretty=format:%H|%s|%an|%ad", "--date=iso");
            if (!lastCommitInfo.trim().isEmpty()) {
                String[] parts = lastCommitInfo.split("\\|");
                Map<String, Object> lastCommit = new HashMap<>();
                lastCommit.put("hash", parts[0]);
                lastCommit.put("message", parts.length > 1 ? parts[1] : "");
                lastCommit.put("author", parts.length > 2 ? parts[2] : "");
                lastCommit.put("date", parts.length > 3 ? parts[3] : "");
                repoInfo.put("lastCommit", lastCommit);
            }
            
            String repoName = project.getName();
            if (remoteUrl.contains("/")) {
                String[] urlParts = remoteUrl.split("/");
                repoName = urlParts[urlParts.length - 1].replace(".git", "");
            }
            repoInfo.put("name", repoName);
            
            return repoInfo;
        } catch (Exception e) {
            System.err.println("Error getting repository info: " + e.getMessage());
            throw new RuntimeException("Failed to get repository info: " + e.getMessage());
        }
    }

    public Map<String, Object> getGitStatus(Long projectId, User user) {
        Project project = projectRepository.findByIdAndOwner(projectId, user)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        String projectPath = workspaceBasePath + "/user-" + user.getId() + "/" + project.getName();
        File projectDir = new File(projectPath);

        if (!projectDir.exists() || !new File(projectDir, ".git").exists()) {
            throw new RuntimeException("Project is not a Git repository");
        }

        try {
            String statusOutput = executeGitCommand(projectPath, "git", "status", "--porcelain");
            
            List<Map<String, Object>> files = new ArrayList<>();
            if (!statusOutput.trim().isEmpty()) {
                String[] lines = statusOutput.split("\n");
                for (String line : lines) {
                    if (line.trim().isEmpty()) continue;
                    
                    Map<String, Object> fileStatus = new HashMap<>();
                    String statusCode = line.substring(0, 2);
                    String fileName = line.substring(3);
                    
                    fileStatus.put("file", fileName);
                    fileStatus.put("status", getStatusFromCode(statusCode));
                    files.add(fileStatus);
                }
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("files", files);
            result.put("clean", files.isEmpty());
            
            return result;
        } catch (Exception e) {
            System.err.println("Error getting git status: " + e.getMessage());
            throw new RuntimeException("Failed to get git status: " + e.getMessage());
        }
    }

    public Map<String, Object> createCommit(Long projectId, String message, List<String> files, User user) {
        Project project = projectRepository.findByIdAndOwner(projectId, user)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        String projectPath = workspaceBasePath + "/user-" + user.getId() + "/" + project.getName();
        File projectDir = new File(projectPath);

        if (!projectDir.exists() || !new File(projectDir, ".git").exists()) {
            throw new RuntimeException("Project is not a Git repository");
        }

        try {
            configureGitUser(projectPath, user);
            
            if (files.isEmpty()) {
                executeGitCommand(projectPath, "git", "add", ".");
            } else {
                for (String file : files) {
                    executeGitCommand(projectPath, "git", "add", file);
                }
            }
            
            String commitResult = executeGitCommand(projectPath, "git", "commit", "-m", message);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Commit created successfully");
            result.put("commitOutput", commitResult);
            
            return result;
        } catch (Exception e) {
            System.err.println("Error creating commit: " + e.getMessage());
            throw new RuntimeException("Failed to create commit: " + e.getMessage());
        }
    }

    public Map<String, Object> pushChanges(Long projectId, String branch, User user) {
        Project project = projectRepository.findByIdAndOwner(projectId, user)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        String projectPath = workspaceBasePath + "/user-" + user.getId() + "/" + project.getName();
        File projectDir = new File(projectPath);

        if (!projectDir.exists() || !new File(projectDir, ".git").exists()) {
            throw new RuntimeException("Project is not a Git repository");
        }

        try {
            String pushResult = runWithAuthenticatedOrigin(project, user, projectPath, "git", "push", "origin", branch);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Changes pushed successfully");
            result.put("pushOutput", pushResult);
            
            return result;
        } catch (Exception e) {
            System.err.println("Error pushing changes: " + e.getMessage());
            throw new RuntimeException("Failed to push changes: " + e.getMessage());
        }
    }

    public Map<String, Object> pullChanges(Long projectId, String branch, User user) {
        Project project = projectRepository.findByIdAndOwner(projectId, user)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        String projectPath = workspaceBasePath + "/user-" + user.getId() + "/" + project.getName();
        File projectDir = new File(projectPath);

        if (!projectDir.exists() || !new File(projectDir, ".git").exists()) {
            throw new RuntimeException("Project is not a Git repository");
        }

        try {
            String pullResult = runWithAuthenticatedOrigin(project, user, projectPath, "git", "pull", "origin", branch);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Changes pulled successfully");
            result.put("pullOutput", pullResult);
            
            return result;
        } catch (Exception e) {
            System.err.println("Error pulling changes: " + e.getMessage());
            throw new RuntimeException("Failed to pull changes: " + e.getMessage());
        }
    }

    public Map<String, Object> getBranches(Long projectId, User user) {
        Project project = projectRepository.findByIdAndOwner(projectId, user)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        String projectPath = workspaceBasePath + "/user-" + user.getId() + "/" + project.getName();
        File projectDir = new File(projectPath);

        if (!projectDir.exists() || !new File(projectDir, ".git").exists()) {
            throw new RuntimeException("Project is not a Git repository");
        }

        try {
            String localBranches = executeGitCommand(projectPath, "git", "branch", "-v");
            List<Map<String, Object>> localBranchList = new ArrayList<>();
            String currentBranch = "";
            
            if (!localBranches.trim().isEmpty()) {
                String[] lines = localBranches.split("\n");
                for (String line : lines) {
                    String branch = line.trim();
                    if (branch.startsWith("* ")) {
                        // Current branch
                        String[] parts = branch.substring(2).split("\\s+", 3);
                        if (parts.length >= 2) {
                            currentBranch = parts[0];
                            Map<String, Object> branchInfo = new HashMap<>();
                            branchInfo.put("name", parts[0]);
                            branchInfo.put("commit", parts[1]);
                            branchInfo.put("message", parts.length > 2 ? parts[2] : "");
                            branchInfo.put("current", true);
                            localBranchList.add(branchInfo);
                        }
                    } else if (!branch.isEmpty()) {
                        String[] parts = branch.split("\\s+", 3);
                        if (parts.length >= 2) {
                            Map<String, Object> branchInfo = new HashMap<>();
                            branchInfo.put("name", parts[0]);
                            branchInfo.put("commit", parts[1]);
                            branchInfo.put("message", parts.length > 2 ? parts[2] : "");
                            branchInfo.put("current", false);
                            localBranchList.add(branchInfo);
                        }
                    }
                }
            }
            
            List<Map<String, Object>> remoteBranchList = new ArrayList<>();
            try {
                String remoteBranches = executeGitCommand(projectPath, "git", "branch", "-r", "-v");
                if (!remoteBranches.trim().isEmpty()) {
                    String[] lines = remoteBranches.split("\n");
                    for (String line : lines) {
                        String branch = line.trim();
                        if (!branch.isEmpty() && !branch.contains("->")) {
                            String[] parts = branch.split("\\s+", 3);
                            if (parts.length >= 2) {
                                Map<String, Object> branchInfo = new HashMap<>();
                                branchInfo.put("name", parts[0]);
                                branchInfo.put("commit", parts[1]);
                                branchInfo.put("message", parts.length > 2 ? parts[2] : "");
                                remoteBranchList.add(branchInfo);
                            }
                        }
                    }
                }
                
                try {
                    String allRemoteBranches = executeGitCommand(projectPath, "git", "ls-remote", "--heads", "origin");
                    if (!allRemoteBranches.trim().isEmpty()) {
                        String[] lines = allRemoteBranches.split("\n");
                        Set<String> existingBranches = remoteBranchList.stream()
                            .map(b -> (String) b.get("name"))
                            .collect(java.util.stream.Collectors.toSet());
                        
                        for (String line : lines) {
                            String[] parts = line.trim().split("\\s+");
                            if (parts.length >= 2) {
                                String commit = parts[0];
                                String ref = parts[1];
                                if (ref.startsWith("refs/heads/")) {
                                    String branchName = "origin/" + ref.substring("refs/heads/".length());
                                    
                                    if (!existingBranches.contains(branchName)) {
                                        Map<String, Object> branchInfo = new HashMap<>();
                                        branchInfo.put("name", branchName);
                                        branchInfo.put("commit", commit.substring(0, Math.min(7, commit.length())));
                                        branchInfo.put("message", "Remote branch from origin");
                                        remoteBranchList.add(branchInfo);
                                    }
                                }
                            }
                        }
                    }
                } catch (Exception lsRemoteEx) {
                    System.err.println("Warning: Could not fetch remote branches via ls-remote: " + lsRemoteEx.getMessage());
                }
            } catch (Exception e) {
                System.err.println("Warning: Could not fetch remote branches: " + e.getMessage());
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("local", localBranchList);
            result.put("remote", remoteBranchList);
            result.put("current", currentBranch);
            
            return result;
        } catch (Exception e) {
            System.err.println("Error getting branches: " + e.getMessage());
            throw new RuntimeException("Failed to get branches: " + e.getMessage());
        }
    }

    public Map<String, Object> getBranchGraph(Long projectId, User user, Integer limit) {
        Project project = projectRepository.findByIdAndOwner(projectId, user)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        String projectPath = workspaceBasePath + "/user-" + user.getId() + "/" + project.getName();
        File projectDir = new File(projectPath);

        if (!projectDir.exists() || !new File(projectDir, ".git").exists()) {
            throw new RuntimeException("Project is not a Git repository");
        }

        try {
            List<String> gitLogCmd = new ArrayList<>();
            gitLogCmd.add("git");
            gitLogCmd.add("log");
            gitLogCmd.add("--oneline");
            gitLogCmd.add("--graph");
            gitLogCmd.add("--all");
            gitLogCmd.add("--decorate");
            gitLogCmd.add("--format=%H|%h|%an|%ae|%ad|%s|%D");
            gitLogCmd.add("--date=iso");
            if (limit != null && limit > 0) {
                gitLogCmd.add("-" + limit);
            } else {
                gitLogCmd.add("-50");
            }
            
            String gitLog = executeGitCommand(projectPath, gitLogCmd.toArray(new String[0]));
            List<Map<String, Object>> commits = new ArrayList<>();
            
            if (!gitLog.trim().isEmpty()) {
                String[] lines = gitLog.split("\n");
                for (String line : lines) {
                    if (line.contains("|")) {
                        String commitData = "";
                        for (int i = 0; i < line.length(); i++) {
                            char c = line.charAt(i);
                            if (Character.isLetterOrDigit(c)) {
                                commitData = line.substring(i);
                                break;
                            }
                        }
                        
                        if (!commitData.isEmpty()) {
                            String[] parts = commitData.split("\\|");
                            if (parts.length >= 6) {
                                Map<String, Object> commit = new HashMap<>();
                                commit.put("hash", parts[0]);
                                commit.put("shortHash", parts[1]);
                                commit.put("author", parts[2]);
                                commit.put("email", parts[3]);
                                commit.put("date", parts[4]);
                                commit.put("message", parts[5]);
                                commit.put("refs", parts.length > 6 ? parts[6] : "");
                                
                                String graphPart = line.substring(0, line.indexOf(commitData));
                                commit.put("graph", graphPart);
                                
                                commits.add(commit);
                            }
                        }
                    }
                }
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("commits", commits);
            result.put("total", commits.size());
            
            return result;
        } catch (Exception e) {
            System.err.println("Error getting branch graph: " + e.getMessage());
            throw new RuntimeException("Failed to get branch graph: " + e.getMessage());
        }
    }

    public Map<String, Object> createBranch(Long projectId, String name, String from, User user) {
        Project project = projectRepository.findByIdAndOwner(projectId, user)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        String projectPath = workspaceBasePath + "/user-" + user.getId() + "/" + project.getName();
        File projectDir = new File(projectPath);

        if (!projectDir.exists() || !new File(projectDir, ".git").exists()) {
            throw new RuntimeException("Project is not a Git repository");
        }

        try {
            String createResult = executeGitCommand(projectPath, "git", "checkout", "-b", name, from);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Branch created and switched successfully");
            result.put("branchName", name);
            result.put("createOutput", createResult);
            
            return result;
        } catch (Exception e) {
            System.err.println("Error creating branch: " + e.getMessage());
            throw new RuntimeException("Failed to create branch: " + e.getMessage());
        }
    }

    public Map<String, Object> switchBranch(Long projectId, String branchName, User user) {
        Project project = projectRepository.findByIdAndOwner(projectId, user)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        String projectPath = workspaceBasePath + "/user-" + user.getId() + "/" + project.getName();
        File projectDir = new File(projectPath);

        if (!projectDir.exists() || !new File(projectDir, ".git").exists()) {
            throw new RuntimeException("Project is not a Git repository");
        }

        try {
            String checkoutResult = executeGitCommand(projectPath, "git", "checkout", branchName);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Switched to branch successfully");
            result.put("branchName", branchName);
            result.put("checkoutOutput", checkoutResult);
            
            return result;
        } catch (Exception e) {
            System.err.println("Error switching branch: " + e.getMessage());
            throw new RuntimeException("Failed to switch branch: " + e.getMessage());
        }
    }

    public Map<String, Object> syncProject(Long projectId, User user) {
        Project project = projectRepository.findByIdAndOwner(projectId, user)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        String projectPath = workspaceBasePath + "/user-" + user.getId() + "/" + project.getName();
        File projectDir = new File(projectPath);

        if (!projectDir.exists() || !new File(projectDir, ".git").exists()) {
            throw new RuntimeException("Project is not a Git repository");
        }

        try {
            String fetchResult = runWithAuthenticatedOrigin(project, user, projectPath, "git", "fetch", "origin");
            
            Map<String, Object> status = getGitStatus(projectId, user);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Project synced successfully");
            result.put("fetchOutput", fetchResult);
            result.put("status", status);
            
            return result;
        } catch (Exception e) {
            System.err.println("Error syncing project: " + e.getMessage());
            throw new RuntimeException("Failed to sync project: " + e.getMessage());
        }
    }

    private void configureGitUser(String projectPath, User user) throws Exception {
        try {
            String currentUserName = null;
            currentUserName = executeGitCommand(projectPath, "git", "config", "user.name").trim();

            String currentUserEmail = null;
            try {
                currentUserEmail = executeGitCommand(projectPath, "git", "config", "user.email").trim();
            } catch (Exception e) {
            }
            
            if (currentUserName == null || currentUserName.isEmpty()) {
                String userName = user.getUsername() != null ? user.getUsername() : "SCA User";
                executeGitCommand(projectPath, "git", "config", "user.name", userName);
            }
            
            if (currentUserEmail == null || currentUserEmail.isEmpty()) {
                String userEmail = user.getEmail() != null ? user.getEmail() : user.getUsername() + "@sca.local";
                executeGitCommand(projectPath, "git", "config", "user.email", userEmail);
            }
            
        } catch (Exception e) {
            System.err.println("Error configuring Git user: " + e.getMessage());
            
            String userName = user.getUsername() != null ? user.getUsername() : "SCA User";
            String userEmail = user.getEmail() != null ? user.getEmail() : user.getUsername() + "@sca.local";
            
            executeGitCommand(projectPath, "git", "config", "user.name", userName);
            executeGitCommand(projectPath, "git", "config", "user.email", userEmail);
        }
    }

    private String executeGitCommand(String workingDirectory, String... command) throws Exception {
        ProcessBuilder processBuilder = new ProcessBuilder(command);
        processBuilder.directory(new File(workingDirectory));
        processBuilder.environment().put("GIT_TERMINAL_PROMPT", "0");
        
        Process process = processBuilder.start();
        
        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        StringBuilder output = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            output.append(line).append("\n");
        }
        
        BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getErrorStream()));
        StringBuilder errorOutput = new StringBuilder();
        while ((line = errorReader.readLine()) != null) {
            errorOutput.append(line).append("\n");
        }
        
        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new RuntimeException("Git command failed: " + errorOutput.toString());
        }
        
        return output.toString();
    }

    public Map<String, Object> stashChanges(Long projectId, String message, User user) {
        Project project = projectRepository.findByIdAndOwner(projectId, user)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        String projectPath = workspaceBasePath + "/user-" + user.getId() + "/" + project.getName();
        
        File projectDir = new File(projectPath);
        if (!projectDir.exists() || !new File(projectDir, ".git").exists()) {
            throw new RuntimeException("Project is not a Git repository");
        }

        try {
            configureGitUser(projectPath, user);
            
            String status = executeGitCommand(projectPath, "git", "status", "--porcelain");
            if (status.trim().isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "No changes to stash");
                response.put("details", "Working directory is clean");
                return response;
            }
            
            String result;
            if (message != null && !message.trim().isEmpty()) {
                result = executeGitCommand(projectPath, "git", "stash", "push", "-a", "-m", message);
            } else {
                result = executeGitCommand(projectPath, "git", "stash", "push", "-a");
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Changes stashed successfully");
            response.put("details", result.trim());
            
            return response;
        } catch (Exception e) {
            System.err.println("Error stashing changes: " + e.getMessage());
            throw new RuntimeException("Failed to stash changes: " + e.getMessage());
        }
    }

    public Map<String, Object> stashPop(Long projectId, User user) {
        Project project = projectRepository.findByIdAndOwner(projectId, user)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        String projectPath = workspaceBasePath + "/user-" + user.getId() + "/" + project.getName();
        
        File projectDir = new File(projectPath);
        if (!projectDir.exists() || !new File(projectDir, ".git").exists()) {
            throw new RuntimeException("Project is not a Git repository");
        }

        try {
            configureGitUser(projectPath, user);
            
            String stashList = executeGitCommand(projectPath, "git", "stash", "list");
            if (stashList.trim().isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "No stash found");
                response.put("details", "There are no stashed changes to apply");
                return response;
            }
            
            String result = executeGitCommand(projectPath, "git", "stash", "pop");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Stash applied successfully");
            response.put("details", result.trim());
            
            return response;
        } catch (Exception e) {
            System.err.println("Error applying stash: " + e.getMessage());
            throw new RuntimeException("Failed to apply stash: " + e.getMessage());
        }
    }

    public Map<String, Object> resetChanges(Long projectId, boolean hard, User user) {
        Project project = projectRepository.findByIdAndOwner(projectId, user)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        String projectPath = workspaceBasePath + "/user-" + user.getId() + "/" + project.getName();
        
        File projectDir = new File(projectPath);
        if (!projectDir.exists() || !new File(projectDir, ".git").exists()) {
            throw new RuntimeException("Project is not a Git repository");
        }

        try {
            configureGitUser(projectPath, user);
            
            String result;
            if (hard) {
                executeGitCommand(projectPath, "git", "reset", "--hard", "HEAD");
                result = executeGitCommand(projectPath, "git", "clean", "-fd");
            } else {
                result = executeGitCommand(projectPath, "git", "reset", "HEAD");
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", hard ? "Hard reset completed successfully" : "Soft reset completed successfully");
            response.put("details", result.trim());
            
            return response;
        } catch (Exception e) {
            System.err.println("Error resetting changes: " + e.getMessage());
            throw new RuntimeException("Failed to reset changes: " + e.getMessage());
        }
    }

    public Map<String, Object> mergeBranch(Long projectId, String sourceBranch, String targetBranch, User user) {
        Project project = projectRepository.findByIdAndOwner(projectId, user)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        String projectPath = workspaceBasePath + "/user-" + user.getId() + "/" + project.getName();
        
        File projectDir = new File(projectPath);
        if (!projectDir.exists() || !new File(projectDir, ".git").exists()) {
            throw new RuntimeException("Project is not a Git repository");
        }

        try {
            configureGitUser(projectPath, user);
            
            executeGitCommand(projectPath, "git", "checkout", targetBranch);
            
            String result = executeGitCommand(projectPath, "git", "merge", sourceBranch);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Branch merged successfully");
            response.put("details", result.trim());
            response.put("sourceBranch", sourceBranch);
            response.put("targetBranch", targetBranch);
            
            return response;
        } catch (Exception e) {
            System.err.println("Error merging branch: " + e.getMessage());
            throw new RuntimeException("Failed to merge branch: " + e.getMessage());
        }
    }



    private String getStatusFromCode(String code) {
        if (code.startsWith("M")) return "modified";
        if (code.startsWith("A")) return "added";
        if (code.startsWith("D")) return "deleted";
        if (code.startsWith("R")) return "renamed";
        if (code.startsWith("C")) return "copied";
        if (code.startsWith("U")) return "unmerged";
        if (code.startsWith("?")) return "untracked";
        return "unknown";
    }
}
