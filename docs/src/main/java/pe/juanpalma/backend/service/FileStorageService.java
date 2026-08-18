package pe.juanpalma.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Guarda los archivos adjuntos (foto o video) de los reportes de
 * incidencias. Solo acepta imagenes (jpg, jpeg, png, webp) o videos
 * (mp4, mov, webm) verificando tanto la extension como el content-type
 * declarado por el navegador.
 */
@Service
public class FileStorageService {

    private static final Map<String, String> ALLOWED_IMAGE_TYPES = Map.of(
            "image/jpeg", "jpg",
            "image/jpg", "jpg",
            "image/png", "png",
            "image/webp", "webp"
    );

    private static final Map<String, String> ALLOWED_VIDEO_TYPES = Map.of(
            "video/mp4", "mp4",
            "video/quicktime", "mov",
            "video/webm", "webm"
    );

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "jpg", "jpeg", "png", "webp", "mp4", "mov", "webm"
    );

    @Value("${app.uploads.dir:./uploads}")
    private String uploadsDir;

    public record StoredFile(String relativePath, String type) {}

    public StoredFile store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        String originalExtension = extensionOf(file.getOriginalFilename());

        String tipo;
        String extension;

        if (ALLOWED_IMAGE_TYPES.containsKey(contentType)) {
            tipo = "IMAGE";
            extension = ALLOWED_IMAGE_TYPES.get(contentType);
        } else if (ALLOWED_VIDEO_TYPES.containsKey(contentType)) {
            tipo = "VIDEO";
            extension = ALLOWED_VIDEO_TYPES.get(contentType);
        } else {
            throw new IllegalArgumentException(
                    "Solo se permiten imágenes (jpg, png, webp) o videos (mp4, mov, webm)."
            );
        }

        // Defensa adicional: la extension del archivo original debe ser
        // coherente con una extension permitida (evita renombrar un .exe a
        // .jpg con un content-type falsificado en casos simples).
        if (!ALLOWED_EXTENSIONS.contains(originalExtension)) {
            throw new IllegalArgumentException(
                    "La extensión del archivo no es válida para el tipo indicado."
            );
        }

        try {
            Path baseDir = Path.of(uploadsDir, "issues");
            Files.createDirectories(baseDir);

            String fileName = UUID.randomUUID() + "." + extension;
            Path destination = baseDir.resolve(fileName).normalize();

            // Evita path traversal: el destino final debe seguir dentro de baseDir.
            if (!destination.startsWith(baseDir.normalize())) {
                throw new IllegalArgumentException("Nombre de archivo inválido.");
            }

            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

            return new StoredFile("uploads/issues/" + fileName, tipo);
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo guardar el archivo adjunto.", e);
        }
    }

    private String extensionOf(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
    }
}
