package com.sca.service;

import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.api.command.CreateContainerResponse;
import com.github.dockerjava.api.model.*;
import com.github.dockerjava.core.DefaultDockerClientConfig;
import com.github.dockerjava.core.DockerClientConfig;
import com.github.dockerjava.core.DockerClientImpl;
import com.github.dockerjava.transport.DockerHttpClient;
import com.github.dockerjava.api.command.ExecCreateCmdResponse;
import com.github.dockerjava.api.command.InspectContainerResponse;
import com.github.dockerjava.core.command.ExecStartResultCallback;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.io.ByteArrayOutputStream;

@Service
public class DockerService {

    private final DockerClient dockerClient;
    
    @Value("${docker.containers.memory-limit:512m}")
    private String memoryLimit;
    
    @Value("${docker.containers.cpu-limit:0.5}")
    private String cpuLimit;
    
    @Value("${docker.containers.timeout:300}")
    private int timeout;

    public DockerService(@Value("${docker.host:tcp://localhost:2375}") String dockerHost) {
        DockerClientConfig config = DefaultDockerClientConfig.createDefaultConfigBuilder()
                .withDockerHost(dockerHost)
                .build();
        this.dockerClient = DockerClientImpl.getInstance(config);
    }

    /**
     * Создает контейнер для пользовательского workspace
     */
    public String createWorkspaceContainer(String userId, String projectId) {
        try {
            // Создаем volume для workspace
            String volumeName = "workspace-" + userId + "-" + projectId;
            dockerClient.createVolumeCmd()
                    .withName(volumeName)
                    .exec();

            // Создаем контейнер с IDE
            CreateContainerResponse container = dockerClient.createContainerCmd("codercom/code-server:latest")
                    .withName("ide-" + userId + "-" + projectId)
                    .withEnv(
                            "PASSWORD=password",
                            "WORKSPACE=/workspace",
                            "USER=developer"
                    )
                    .withBinds(new Bind(volumeName, new Volume("/workspace")))
                    .withExposedPorts(ExposedPort.tcp(8080))
                    .withHostConfig(HostConfig.newHostConfig()
                            .withMemory(Long.parseLong(memoryLimit.replace("m", "")) * 1024 * 1024L)
                            .withCpuQuota((long) (Double.parseDouble(cpuLimit) * 100000))
                            .withCpuPeriod(100000L)
                            .withRestartPolicy(RestartPolicy.noRestart())
                    )
                    .exec();

            // Запускаем контейнер
            dockerClient.startContainerCmd(container.getId()).exec();

            return container.getId();
        } catch (Exception e) {
            throw new RuntimeException("Failed to create workspace container", e);
        }
    }

    /**
     * Останавливает и удаляет контейнер
     */
    public void stopAndRemoveContainer(String containerId) {
        try {
            dockerClient.stopContainerCmd(containerId)
                    .withTimeout(timeout)
                    .exec();
            
            dockerClient.removeContainerCmd(containerId)
                    .withForce(true)
                    .exec();
        } catch (Exception e) {
            throw new RuntimeException("Failed to stop and remove container", e);
        }
    }

    /**
     * Получает информацию о контейнере
     */
    public InspectContainerResponse getContainerInfo(String containerId) {
        try {
            return dockerClient.inspectContainerCmd(containerId).exec();
        } catch (Exception e) {
            throw new RuntimeException("Failed to get container info", e);
        }
    }

    /**
     * Получает логи контейнера
     */
    public String getContainerLogs(String containerId) {
        try {
            StringBuilder logBuilder = new StringBuilder();
            dockerClient.logContainerCmd(containerId)
                    .withStdOut(true)
                    .withStdErr(true)
                    .exec(new com.github.dockerjava.api.async.ResultCallback.Adapter<Frame>() {
                        @Override
                        public void onNext(Frame frame) {
                            logBuilder.append(new String(frame.getPayload()));
                        }
                    }).awaitCompletion();
            return logBuilder.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to get container logs", e);
        }
    }

    /**
     * Выполняет команду в контейнере
     */
    public String executeCommand(String containerId, String... command) {
        try {
            ExecCreateCmdResponse execCreateCmdResponse = dockerClient.execCreateCmd(containerId)
                    .withCmd(command)
                    .withAttachStdout(true)
                    .withAttachStderr(true)
                    .exec();

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            dockerClient.execStartCmd(execCreateCmdResponse.getId())
                    .exec(new ExecStartResultCallback(outputStream, System.err))
                    .awaitCompletion();

            return outputStream.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to execute command in container", e);
        }
    }

    /**
     * Копирует файлы в контейнер
     */
    public void copyToContainer(String containerId, String hostPath, String containerPath) {
        try {
            dockerClient.copyArchiveToContainerCmd(containerId)
                    .withHostResource(hostPath)
                    .withRemotePath(containerPath)
                    .exec();
        } catch (Exception e) {
            throw new RuntimeException("Failed to copy files to container", e);
        }
    }

    /**
     * Копирует файлы из контейнера
     */
    public void copyFromContainer(String containerId, String containerPath, String hostPath) {
        try {
            dockerClient.copyArchiveFromContainerCmd(containerId, containerPath)
                    .exec()
                    .transferTo(new java.io.FileOutputStream(hostPath));
        } catch (Exception e) {
            throw new RuntimeException("Failed to copy files from container", e);
        }
    }
} 