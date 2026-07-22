package com.blog.main.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class MediaStorageService {

    private static final Map<String, String> SUPPORTED_TYPES = Map.of(
            "image/jpeg", "jpg",
            "image/png", "png",
            "image/gif", "gif",
            "image/webp", "webp",
            "video/mp4", "mp4",
            "video/quicktime", "mov",
            "video/webm", "webm"
    );

    private final Tika tika = new Tika();

    @Value("${app.media.path:uploads}")
    private String uploadsDir;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    public String store(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            return null;
        }

        String detectedType = tika.detect(file.getInputStream());
        String extension = SUPPORTED_TYPES.get(detectedType);
        if (extension == null) {
            throw new IllegalArgumentException("Unsupported media type: " + detectedType);
        }

        Files.createDirectories(Paths.get(uploadsDir));

        String filename = UUID.randomUUID() + "." + extension;
        Path target = Paths.get(uploadsDir).resolve(filename);
        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
        }

        return baseUrl + "/media/" + filename;
    }

    public List<String> storeMany(List<MultipartFile> files) throws IOException {
        if (files == null || files.isEmpty()) {
            return List.of();
        }
        return files.stream()
                .filter(file -> file != null && !file.isEmpty())
                .map(file -> {
                    try {
                        return store(file);
                    } catch (IOException exception) {
                        throw new IllegalStateException("Failed to store media", exception);
                    }
                })
                .toList();
    }
}
