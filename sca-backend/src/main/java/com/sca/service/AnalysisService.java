package com.sca.service;

import com.sca.util.FsUtils;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.ollama.api.OllamaChatOptions;
import org.springframework.stereotype.Service;

import java.io.BufferedWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Stream;

@Slf4j
@Service
public class AnalysisService {
    private static final Set<String> DOC_EXTENSIONS = Set.of("pdf", "doc", "docx", "md", "txt");
    private static final int OLLAMA_NUM_THREAD = Runtime.getRuntime().availableProcessors();
    private static final int MAX_FILE_SIZE = 64_000 * 4;

    private static final String CODE_PROMPT = """
            <task>
            Analyze a source code file and extract structured data.
            </task>
            
            <file>
            name: %s
            </file>
            
            <definitions>
            summary: short description of what the file does (max 30 words)
            entities: names of classes, functions, components defined in the file
            imports: dependencies explicitly imported (import/include/require)
            </definitions>
            
            <rules>
            - Return ONLY valid JSON
            - Use exact names from code
            - Do not invent anything
            - If not found, use empty arrays []
            </rules>
            
            <output>
            {
              "summary": "",
              "entities": [],
              "imports": []
            }
            </output>
            
            <content>
            %s
            </content>
            """;

    private static final String DOC_PROMPT = """
            <task>
            Analyze a document and extract structured data.
            </task>
            
            <file>
            name: %s
            </file>
            
            <definitions>
            summary: short description of the document (max 30 words)
            entities: named elements mentioned (classes, services, modules, APIs)
            topics: main themes (1-5 words each)
            </definitions>
            
            <rules>
            - Return ONLY valid JSON
            - Extract only explicitly mentioned entities
            - Do not invent anything
            - If not found, use empty arrays []
            </rules>
            
            <output>
            {
              "summary": "",
              "entities": [],
              "topics": []
            }
            </output>
            
            <content>
            %s
            </content>
            """;

    private final ChatClient chatClient;

    public AnalysisService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    @PostConstruct
    private void init() {
        analyze(Path.of("C:\\Users\\asty\\IdeaProjects\\cloud-ide\\user-data\\projects\\user-3\\123456"));
    }

    // TODO: accept project as argument, not path
    public void analyze(Path root) {
        String outputFileName = "analysis_" +
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy_HH-mm-ss")) + ".csv";
        Path output = Path.of(outputFileName);
        ExecutorService executor = Executors.newFixedThreadPool(Math.max(4, Runtime.getRuntime().availableProcessors()));

        try (
                Stream<Path> stream = Files.walk(root);
                BufferedWriter writer = Files.newBufferedWriter(
                        output,
                        StandardOpenOption.CREATE,
                        StandardOpenOption.APPEND
                )
        ) {
            log.info("Analyzing project \"{}\"...", root);

            writer.write("timestamp;path;type;response\n");
            writer.flush();

            stream
                    .filter(Files::isRegularFile)
                    .filter(path -> !path.toString().contains(".git"))
                    .forEach(file -> {
                        log.info("Checking file \"{}\"...", file.getFileName());
                        executor.submit(() -> analysisSupplier(file, writer));
                    });

            executor.shutdown();
            if (!executor.awaitTermination(2, java.util.concurrent.TimeUnit.HOURS)) {
                log.warn("Analysis for project \"{}\" exceeded timeout", root);
            }

            log.info("Completed analysis for project \"{}\"! Results written to \"{}\"", root, output);
        } catch (IOException e) {
            log.error("Failed to analyze project \"{}\": {}", root, e.getMessage());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private void analysisSupplier(Path file, BufferedWriter writer) {
        try {
            String ext = FsUtils.getExtension(file);
            if (DOC_EXTENSIONS.contains(ext)) {
                analyzeDocument(file, writer, ext);
            } else {
                analyzeCode(file, writer);
            }
        } catch (Exception e) {
            log.error("Failed to analyze file \"{}\": {}", file, e.getMessage());
        }
    }

    private void analyzeCode(Path file, BufferedWriter writer) throws IOException {
        String content = Files.readString(file);

        if (content.isBlank()) return;
        if (content.length() > MAX_FILE_SIZE) {
            content = content.substring(0, MAX_FILE_SIZE); // TODO: split
        }

        log.info("Starting code analysis for file \"{}\"...", file);
        String response = chatClient
                .prompt(CODE_PROMPT.formatted(file.getFileName(), content))
                .options(OllamaChatOptions.builder()
                        .disableThinking()
                        .numThread(OLLAMA_NUM_THREAD)
                        .build())
                .call()
                .content();
        log.info("Code analysis for \"{}\" is ready: {}", file, response);

        if (response != null) {
            writeCsvLine(writer, file, "code", response);
        }
    }

    private void analyzeDocument(Path file, BufferedWriter writer, String ext) throws IOException {
        String content;
        if (ext.equals("pdf")) {
            content = extractPdf(file);
        } else {
            content = Files.readString(file);
        }

        if (content == null || content.isBlank()) return;
        if (content.length() > MAX_FILE_SIZE) {
            content = content.substring(0, MAX_FILE_SIZE);
        }

        log.info("Starting document analysis for file \"{}\"...", file);
        String response = chatClient
                .prompt(DOC_PROMPT.formatted(file.getFileName(), content))
                .options(OllamaChatOptions.builder()
                        .disableThinking()
                        .numThread(OLLAMA_NUM_THREAD)
                        .build())
                .call()
                .content();
        log.info("Document analysis for \"{}\" is ready: {}", file, response);

        if (response != null) {
            writeCsvLine(writer, file, "doc", response);
        }
    }

    private void writeCsvLine(BufferedWriter writer, Path file, String type, String response) throws IOException {
        synchronized (writer) {
            String safeResponse = response
                    .replace("\"", "\"\"") // экранируем кавычки
                    .replace("\n", " ")
                    .replace("\r", " ");
            String line = LocalDateTime.now() + ";" + file + ";" + type + ";\"" + safeResponse + "\"\n";

            writer.write(line);
            writer.flush();
        }
    }

    private String extractPdf(Path file) throws IOException {
        try (PDDocument document = Loader.loadPDF((file.toFile()))) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }
}
