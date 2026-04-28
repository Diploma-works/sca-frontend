package com.sca.service.vcs;

import com.sca.model.Project;
import com.sca.model.User;
import com.sca.service.GitHubService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class GitHubVersionControlService extends AbstractVersionControlService {

    @Autowired
    private GitHubService gitHubService;

    @Override
    public Project.ProjectType getProviderType() {
        return Project.ProjectType.GITHUB;
    }

    @Override
    public Project cloneRepository(String gitUrl, String branch, String projectName, User user) {
        String accessToken = gitHubService.getUserToken(user)
                .map(token -> token.getAccessToken())
                .orElseThrow(() -> new RuntimeException("GitHub токен не найден. Пожалуйста, подключите ваш GitHub аккаунт."));

        String authenticatedUrl = gitUrl;
        if (gitUrl.startsWith("https://github.com/")) {
            authenticatedUrl = gitUrl.replace("https://github.com/", "https://oauth2:" + accessToken + "@github.com/");
        }

        return cloneWithAuth(Project.ProjectType.GITHUB, gitUrl, authenticatedUrl, branch, projectName, user);
    }

    @Override
    public String buildAuthenticatedRemoteUrl(User user, String remoteUrl) {
        if (remoteUrl == null || !remoteUrl.contains("github.com")) {
            return remoteUrl;
        }
        return gitHubService.getUserToken(user)
                .map(token -> withUserInfo(remoteUrl.trim().replaceAll("\\s+", "").replaceAll("/+$", ""), "oauth2", token.getAccessToken()))
                .orElse(remoteUrl);
    }
}
