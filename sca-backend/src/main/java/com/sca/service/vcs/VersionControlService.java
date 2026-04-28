package com.sca.service.vcs;

import com.sca.model.Project;
import com.sca.model.User;

import java.util.Map;

public interface VersionControlService {

    Project.ProjectType getProviderType();

    Project cloneRepository(String gitUrl, String branch, String projectName, User user);

    String buildAuthenticatedRemoteUrl(User user, String remoteUrl);

    default Map<String, Object> getBranches(Long projectId, User user) {
        throw new UnsupportedOperationException("Branch retrieval is handled by ProjectGitService");
    }

    default Map<String, Object> createCommit(Long projectId, String message, User user) {
        throw new UnsupportedOperationException("Commit creation is handled by ProjectGitService");
    }

    default Map<String, Object> push(Long projectId, String branch, User user) {
        throw new UnsupportedOperationException("Push is handled by ProjectGitService");
    }

    default Map<String, Object> pull(Long projectId, String branch, User user) {
        throw new UnsupportedOperationException("Pull is handled by ProjectGitService");
    }
}
