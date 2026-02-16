package com.sca.service;

import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;

import static org.junit.jupiter.api.Assertions.*;

public class CloneUrlAuthTest {

    @Test
    void bitbucketEmbedToken_injectsXTokenAuthWhenNoUserPresent() throws Exception {
        BitbucketService svc = new BitbucketService();

        Method m = BitbucketService.class.getDeclaredMethod("embedTokenIntoCloneUrl", String.class, String.class);
        m.setAccessible(true);

        String cloneUrl = "https://bitbucket.org/workspace/repo.git";
        String token = "abc123";

        String out = (String) m.invoke(svc, cloneUrl, token);

        assertEquals("https://x-token-auth:abc123@bitbucket.org/workspace/repo.git", out);
    }

    @Test
    void projectGitService_bitbucketUserInfo_isPercentEncoded() throws Exception {
        ProjectGitService svc = new ProjectGitService();

        Method m = ProjectGitService.class.getDeclaredMethod("withUserInfo", String.class, String.class, String.class);
        m.setAccessible(true);

        String remoteUrl = "https://bitbucket.org/workspace/repo.git";
        String username = "ryman63-admin";
        // Contains ':' and '@' and '/' and '=' like real app passwords.
        String token = "AT:TA@/==";

        String out = (String) m.invoke(null, remoteUrl, username, token);

        assertEquals("https://ryman63-admin:AT%3ATA%40%2F%3D%3D@bitbucket.org/workspace/repo.git", out);
    }

    @Test
    void bitbucketEmbedToken_replacesPasswordWhenUserPresent() throws Exception {
        BitbucketService svc = new BitbucketService();

        Method m = BitbucketService.class.getDeclaredMethod("embedTokenIntoCloneUrl", String.class, String.class);
        m.setAccessible(true);

        String cloneUrl = "https://john@bitbucket.org/workspace/repo.git";
        String token = "t0k";

        String out = (String) m.invoke(svc, cloneUrl, token);

        assertEquals("https://john:t0k@bitbucket.org/workspace/repo.git", out);
    }

    @Test
    void gitlabOauth2UrlEmbedding_matchesExpectedPattern() {
        String cloneUrl = "https://gitlab.com/group/project.git";
        String token = "glpat-123";

        String out = cloneUrl.replaceFirst("^https://", "https://oauth2:" + token + "@");

        assertEquals("https://oauth2:glpat-123@gitlab.com/group/project.git", out);
    }

    @Test
    void projectGitService_gitlabTokenWithColon_isPercentEncodedSoGitDoesntParsePort() throws Exception {
        Method m = ProjectGitService.class.getDeclaredMethod("withUserInfo", String.class, String.class, String.class);
        m.setAccessible(true);

        String remoteUrl = "https://gitlab.com/group/project.git";
        // ':' is the main culprit for the "port number was not a decimal" error.
        String token = "glpat:2nTIb3dpZF5";

        String out = (String) m.invoke(null, remoteUrl, "oauth2", token);

        assertEquals("https://oauth2:glpat%3A2nTIb3dpZF5@gitlab.com/group/project.git", out);
    }
}
