package com.sca.service;

import com.sca.util.FsUtils;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Stream;

@Slf4j
@Service
public class AnalysisService {
    private static final Set<String> DOC_EXTENSIONS = Set.of("pdf", "doc", "docx", "md", "txt");
    private static final int MAX_FILE_SIZE = 20_000;
    private static final String CODE_PROMPT = """
            You are a code analysis system.
            Analyze the following file and return ONLY valid JSON with a summary (20-30 words) of what is in the file.
            Do not add markdown.
            
            JSON schema:
            { "summary": "" }
            
            If file is not code, return:
            { "type": "unknown" }
            
            FILE CONTENT:
            """;

    private final ChatClient chatClient;
    private final ExecutorService analysisExecutor;

    public AnalysisService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
        this.analysisExecutor = Executors.newFixedThreadPool(Math.max(4, Runtime.getRuntime().availableProcessors()));
    }

    @PostConstruct
    private void init() {
        analyze(Path.of("C:\\Users\\asty\\IdeaProjects\\cloud-ide\\user-data\\projects\\user-3\\rjp-backend"))
                .forEach(task -> task.exceptionally(ex -> null));
    }

    @PreDestroy
    private void shutdownExecutor() {
        analysisExecutor.shutdown();
    }

    // TODO: accept project as argument, not path
    public List<CompletableFuture<Void>> analyze(Path root) {
        try (Stream<Path> stream = Files.walk(root)) {
            return stream
                    .parallel()
                    .filter(Files::isRegularFile)
                    .filter(path -> !path.toString().contains(".git"))
                    .map(file -> CompletableFuture
                            .supplyAsync(() -> analysisSupplier(file), analysisExecutor)
                            .thenAccept(result -> {
                                if (result != null && !result.isBlank()) {
                                    System.out.println(result);
                                }
                            }))
                    .toList();
        } catch (IOException e) {
            log.error("Failed to scan \"{}\": {}", root, e.getMessage());
            return List.of();
        }
    }

    private String analysisSupplier(Path file) {
        try {
            String ext = FsUtils.getExtension(file);
            if (DOC_EXTENSIONS.contains(ext)) {
                log.info("Skipping file \"{}\" because it's a document", file);
                return null;
            }

            log.info("Starting code analysis for file \"{}\"", file);
            return analyzeCode(file);
        } catch (Exception e) {
            log.error("Failed to analyze file \"{}\": {}", file, e.getMessage());
            return null;
        }
    }

    private String analyzeCode(Path file) throws IOException {
        String content = Files.readString(file);
        if (content.length() > MAX_FILE_SIZE) {
            return "Skipping huge file: " + file; // TODO: split
        }

        String response = chatClient.prompt(CODE_PROMPT + content).call().content();
        return "Analysis for " + file + ":\n" + response;
    }
}
