package com.sca.service.vcs;

import com.sca.model.Project;
import com.sca.model.User;
import com.sca.repository.GitLabTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class GitLabVersionControlService extends AbstractVersionControlService {

    @Autowired
    private GitLabTokenRepository gitLabTokenRepository;

    @Override
    public Project.ProjectType getProviderType() {
        return Project.ProjectType.GITLAB;
    }

    @Override
    public Project cloneRepository(String gitUrl, String branch, String projectName, User user) {
        String accessToken = gitLabTokenRepository.findByUser(user)
                .map(token -> token.getAccessToken())
                .orElseThrow(() -> new RuntimeException("GitLab токен не найден. Пожалуйста, подключите ваш GitLab аккаунт."));

        String authenticatedUrl = gitUrl;
        if (gitUrl.startsWith("https://") && !gitUrl.contains("@")) {
            authenticatedUrl = gitUrl.replaceFirst("^https://", "https://oauth2:" + accessToken + "@");
        }

        return cloneWithAuth(Project.ProjectType.GITLAB, gitUrl, authenticatedUrl, branch, projectName, user);
    }

    @Override
    public String buildAuthenticatedRemoteUrl(User user, String remoteUrl) {
        if (remoteUrl == null || !remoteUrl.contains("gitlab.com")) {
            return remoteUrl;
        }

        return gitLabTokenRepository.findByUser(user)
                .map(token -> withUserInfo(remoteUrl.trim().replaceAll("\\s+", "").replaceAll("/+$", ""), "oauth2", token.getAccessToken()))
                .orElse(remoteUrl);
    }
}
