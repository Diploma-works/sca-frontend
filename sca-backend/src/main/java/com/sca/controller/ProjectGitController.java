package com.sca.controller;

import com.sca.model.User;
import com.sca.service.ProjectGitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/projects/{projectId}/git")
@CrossOrigin(origins = "http://localhost:3000")
public class ProjectGitController {

    @Autowired
    private ProjectGitService projectGitService;

    @GetMapping("/info")
    public ResponseEntity<?> getRepositoryInfo(@PathVariable Long projectId, 
                                               @AuthenticationPrincipal User user) {
        try {
            System.out.println("=== GET PROJECT REPOSITORY INFO ===");
            System.out.println("Project ID: " + projectId);
            System.out.println("User: " + (user != null ? user.getUsername() : "NULL"));
            
            if (user == null) {
                System.err.println("User is null in controller!");
                return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
            }
            
            Map<String, Object> repoInfo = projectGitService.getRepositoryInfo(projectId, user);
            return ResponseEntity.ok(repoInfo);
        } catch (Exception e) {
            System.err.println("Exception in getRepositoryInfo controller: " + e.getClass().getSimpleName() + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/status")
    public ResponseEntity<?> getGitStatus(@PathVariable Long projectId, 
                                          @AuthenticationPrincipal User user) {
        try {
            System.out.println("=== GET PROJECT GIT STATUS ===");
            System.out.println("Project ID: " + projectId);
            System.out.println("User: " + (user != null ? user.getUsername() : "NULL"));
            
            if (user == null) {
                System.err.println("User is null in controller!");
                return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
            }
            
            Map<String, Object> gitStatus = projectGitService.getGitStatus(projectId, user);
            return ResponseEntity.ok(gitStatus);
        } catch (Exception e) {
            System.err.println("Exception in getGitStatus controller: " + e.getClass().getSimpleName() + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/commit")
    public ResponseEntity<?> createCommit(@PathVariable Long projectId,
                                          @RequestBody Map<String, Object> commitData,
                                          @AuthenticationPrincipal User user) {
        System.out.println("=== CREATE PROJECT COMMIT ===");
        System.out.println("Project ID: " + projectId);
        System.out.println("User: " + user.getUsername());
        System.out.println("Commit data: " + commitData);
        
        try {
            String message = (String) commitData.get("message");
            @SuppressWarnings("unchecked")
            java.util.List<String> files = (java.util.List<String>) commitData.getOrDefault("files", new java.util.ArrayList<>());
            
            Map<String, Object> result = projectGitService.createCommit(projectId, message, files, user);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Error creating commit: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/push")
    public ResponseEntity<?> pushChanges(@PathVariable Long projectId,
                                         @RequestBody Map<String, String> pushData,
                                         @AuthenticationPrincipal User user) {
        System.out.println("=== PUSH PROJECT CHANGES ===");
        System.out.println("Project ID: " + projectId);
        System.out.println("User: " + user.getUsername());
        System.out.println("Push data: " + pushData);
        
        try {
            String branch = pushData.getOrDefault("branch", "main");
            Map<String, Object> result = projectGitService.pushChanges(projectId, branch, user);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Error pushing changes: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/pull")
    public ResponseEntity<?> pullChanges(@PathVariable Long projectId,
                                         @RequestBody Map<String, String> pullData,
                                         @AuthenticationPrincipal User user) {
        System.out.println("=== PULL PROJECT CHANGES ===");
        System.out.println("Project ID: " + projectId);
        System.out.println("User: " + user.getUsername());
        System.out.println("Pull data: " + pullData);
        
        try {
            String branch = pullData.getOrDefault("branch", "main");
            Map<String, Object> result = projectGitService.pullChanges(projectId, branch, user);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Error pulling changes: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/branches")
    public ResponseEntity<?> getBranches(@PathVariable Long projectId,
                                         @AuthenticationPrincipal User user) {
        System.out.println("=== GET PROJECT BRANCHES ===");
        System.out.println("Project ID: " + projectId);
        System.out.println("User: " + user.getUsername());
        
        try {
            Map<String, Object> branches = projectGitService.getBranches(projectId, user);
            return ResponseEntity.ok(branches);
        } catch (Exception e) {
            System.err.println("Error getting branches: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/graph")
    public ResponseEntity<?> getBranchGraph(@PathVariable Long projectId,
                                           @RequestParam(value = "limit", defaultValue = "50") Integer limit,
                                           @AuthenticationPrincipal User user) {
        System.out.println("=== GET PROJECT BRANCH GRAPH ===");
        System.out.println("Project ID: " + projectId);
        System.out.println("Limit: " + limit);
        System.out.println("User: " + user.getUsername());
        
        try {
            Map<String, Object> graph = projectGitService.getBranchGraph(projectId, user, limit);
            return ResponseEntity.ok(graph);
        } catch (Exception e) {
            System.err.println("Error getting branch graph: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/branches")
    public ResponseEntity<?> createBranch(@PathVariable Long projectId,
                                          @RequestBody Map<String, String> branchData,
                                          @AuthenticationPrincipal User user) {
        System.out.println("=== CREATE PROJECT BRANCH ===");
        System.out.println("Project ID: " + projectId);
        System.out.println("User: " + user.getUsername());
        System.out.println("Branch data: " + branchData);
        
        try {
            String name = branchData.get("name");
            String from = branchData.getOrDefault("from", "main");
            
            Map<String, Object> result = projectGitService.createBranch(projectId, name, from, user);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Error creating branch: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/branches/{branchName}/checkout")
    public ResponseEntity<?> switchBranch(@PathVariable Long projectId,
                                          @PathVariable String branchName,
                                          @AuthenticationPrincipal User user) {
        System.out.println("=== SWITCH PROJECT BRANCH ===");
        System.out.println("Project ID: " + projectId);
        System.out.println("Branch: " + branchName);
        System.out.println("User: " + user.getUsername());
        
        try {
            Map<String, Object> result = projectGitService.switchBranch(projectId, branchName, user);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Error switching branch: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/sync")
    public ResponseEntity<?> syncProject(@PathVariable Long projectId,
                                         @AuthenticationPrincipal User user) {
        System.out.println("=== SYNC PROJECT ===");
        System.out.println("Project ID: " + projectId);
        System.out.println("User: " + user.getUsername());
        
        try {
            Map<String, Object> result = projectGitService.syncProject(projectId, user);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Error syncing project: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/stash")
    public ResponseEntity<?> stashChanges(@PathVariable Long projectId,
                                          @RequestBody Map<String, String> stashData,
                                          @AuthenticationPrincipal User user) {
        System.out.println("=== STASH PROJECT CHANGES ===");
        System.out.println("Project ID: " + projectId);
        System.out.println("User: " + user.getUsername());
        System.out.println("Stash data: " + stashData);
        
        try {
            String message = stashData.getOrDefault("message", "WIP");
            Map<String, Object> result = projectGitService.stashChanges(projectId, message, user);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Error stashing changes: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/stash/pop")
    public ResponseEntity<?> stashPop(@PathVariable Long projectId,
                                      @AuthenticationPrincipal User user) {
        System.out.println("=== STASH POP PROJECT ===");
        System.out.println("Project ID: " + projectId);
        System.out.println("User: " + user.getUsername());
        
        try {
            Map<String, Object> result = projectGitService.stashPop(projectId, user);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Error applying stash: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/reset")
    public ResponseEntity<?> resetChanges(@PathVariable Long projectId,
                                          @RequestBody Map<String, Boolean> resetData,
                                          @AuthenticationPrincipal User user) {
        System.out.println("=== RESET PROJECT CHANGES ===");
        System.out.println("Project ID: " + projectId);
        System.out.println("User: " + user.getUsername());
        System.out.println("Reset data: " + resetData);
        
        try {
            boolean hard = resetData.getOrDefault("hard", false);
            Map<String, Object> result = projectGitService.resetChanges(projectId, hard, user);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Error resetting changes: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/merge")
    public ResponseEntity<?> mergeBranch(@PathVariable Long projectId,
                                         @RequestBody Map<String, String> mergeData,
                                         @AuthenticationPrincipal User user) {
        System.out.println("=== MERGE PROJECT BRANCH ===");
        System.out.println("Project ID: " + projectId);
        System.out.println("User: " + user.getUsername());
        System.out.println("Merge data: " + mergeData);
        
        try {
            String source = mergeData.get("source");
            String target = mergeData.getOrDefault("target", "main");
            Map<String, Object> result = projectGitService.mergeBranch(projectId, source, target, user);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Error merging branch: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/stash/status")
    public ResponseEntity<?> getStashStatus(@PathVariable Long projectId,
                                            @AuthenticationPrincipal User user) {
        System.out.println("=== GET STASH STATUS ===");
        System.out.println("Project ID: " + projectId);
        System.out.println("User: " + user.getUsername());
        
        try {
            Map<String, Object> result = projectGitService.hasStash(projectId, user);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Error checking stash status: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/tags")
    public ResponseEntity<?> createTag(@PathVariable Long projectId,
                                       @RequestBody Map<String, String> tagData,
                                       @AuthenticationPrincipal User user) {
        System.out.println("=== CREATE PROJECT TAG ===");
        System.out.println("Project ID: " + projectId);
        System.out.println("User: " + user.getUsername());
        System.out.println("Tag data: " + tagData);
        
        try {
            String name = tagData.get("name");
            String message = tagData.getOrDefault("message", "");
            Map<String, Object> result = projectGitService.createTag(projectId, name, message, user);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Error creating tag: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
