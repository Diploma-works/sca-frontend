package com.sca.service.vcs;

import com.sca.model.Project;
import com.sca.model.User;
import org.springframework.stereotype.Service;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
public class UnifiedVcsService {

    private final Map<Project.ProjectType, VersionControlService> providers;

    public UnifiedVcsService(List<VersionControlService> providerServices) {
        this.providers = new EnumMap<>(Project.ProjectType.class);
        for (VersionControlService service : providerServices) {
            providers.put(service.getProviderType(), service);
        }
    }

    public Project cloneRepository(Project.ProjectType type, String gitUrl, String branch, String projectName, User user) {
        return getProvider(type).cloneRepository(gitUrl, branch, projectName, user);
    }

    public String buildAuthenticatedRemote(Project project, User user, String remoteUrl) {
        if (project == null || project.getType() == null) {
            return remoteUrl;
        }
        if (project.getType() == Project.ProjectType.LOCAL) {
            return remoteUrl;
        }
        return getProvider(project.getType()).buildAuthenticatedRemoteUrl(user, remoteUrl);
    }

    private VersionControlService getProvider(Project.ProjectType type) {
        VersionControlService service = providers.get(type);
        if (service == null) {
            throw new RuntimeException("VCS провайдер не поддерживается: " + type);
        }
        return service;
    }
}
