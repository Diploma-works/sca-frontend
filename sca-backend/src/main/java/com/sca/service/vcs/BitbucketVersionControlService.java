package com.sca.service.vcs;

import com.sca.model.Project;
import com.sca.model.User;
import com.sca.repository.BitbucketTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BitbucketVersionControlService extends AbstractVersionControlService {

    @Autowired
    private BitbucketTokenRepository bitbucketTokenRepository;

    @Override
    public Project.ProjectType getProviderType() {
        return Project.ProjectType.BITBUCKET;
    }

    @Override
    public Project cloneRepository(String gitUrl, String branch, String projectName, User user) {
        String accessToken = bitbucketTokenRepository.findByUser(user)
                .map(token -> token.getAccessToken())
                .orElseThrow(() -> new RuntimeException("Bitbucket токен не найден. Пожалуйста, подключите ваш Bitbucket аккаунт."));

        String authenticatedUrl = gitUrl;
        if (gitUrl.startsWith("https://") && !gitUrl.contains("@")) {
            authenticatedUrl = gitUrl.replaceFirst("^https://", "https://x-token-auth:" + accessToken + "@");
        }

        return cloneWithAuth(Project.ProjectType.BITBUCKET, gitUrl, authenticatedUrl, branch, projectName, user);
    }

    @Override
    public String buildAuthenticatedRemoteUrl(User user, String remoteUrl) {
        if (remoteUrl == null || !remoteUrl.contains("bitbucket.org")) {
            return remoteUrl;
        }

        return bitbucketTokenRepository.findByUser(user)
                .map(token -> {
                    String username = token.getBitbucketUsername();
                    if (username == null || username.isBlank()) {
                        throw new RuntimeException("Bitbucket username не сохранён. Для push/pull по HTTPS Bitbucket требуется username + app password.");
                    }
                    return withUserInfo(remoteUrl.trim().replaceAll("\\s+", "").replaceAll("/+$", ""), username, token.getAccessToken());
                })
                .orElse(remoteUrl);
    }
}
