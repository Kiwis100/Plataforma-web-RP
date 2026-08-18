package pe.juanpalma.backend.service;

import pe.juanpalma.backend.entity.BadWord;
import pe.juanpalma.backend.repository.BadWordRepository;
import pe.juanpalma.backend.repository.BlacklistedDniRepository;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
public class TextSecurityService {

    private final BlacklistedDniRepository dniRepository;
    private final BadWordRepository badWordRepository;

    public TextSecurityService(BlacklistedDniRepository dniRepository,
                               BadWordRepository badWordRepository) {
        this.dniRepository = dniRepository;
        this.badWordRepository = badWordRepository;
    }

    public String normalizeDni(String dni) {
        return dni == null ? "" : dni.replaceAll("\\D", "");
    }

    public String hashDni(String dni) {
        return sha256(normalizeDni(dni));
    }

    public String maskDni(String dni) {
        String n = normalizeDni(dni);
        if (n.length() != 8) return "********";
        return n.substring(0, 2) + "****" + n.substring(6);
    }

    public boolean isBlacklistedDni(String dni) {
        return dniRepository.existsByDniHash(hashDni(dni));
    }

    public void validateDni(String dni) {
        if (!normalizeDni(dni).matches("\\d{8}")) {
            throw new IllegalArgumentException("El DNI debe contener exactamente 8 dígitos.");
        }
        if (isBlacklistedDni(dni)) {
            throw new IllegalArgumentException("El DNI indicado no puede registrar este formulario.");
        }
    }

    public void validateText(String... values) {
        for (String value : values) {
            if (containsBadWord(value)) {
                throw new IllegalArgumentException("El contenido contiene lenguaje no permitido.");
            }
        }
    }

    public boolean containsBadWord(String text) {
        if (text == null || text.isBlank()) return false;
        String normalized = normalizeText(text);

        for (BadWord word : badWordRepository.findAll()) {
            String w = normalizeText(word.getNormalizedWord());
            if (!w.isBlank() && Pattern.compile("(^|\\s)" + Pattern.quote(w) + "($|\\s)",
                    Pattern.CASE_INSENSITIVE).matcher(normalized).find()) {
                return true;
            }
        }
        return false;
    }

    public String normalizeText(String value) {
        String s = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^\\p{L}\\p{N}]+", " ")
                .replaceAll("\\s+", " ")
                .trim();
        return s;
    }

    private String sha256(String value) {
        try {
            var digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] bytes = digest.digest(value.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder out = new StringBuilder();
            for (byte b : bytes) out.append(String.format("%02x", b));
            return out.toString();
        } catch (Exception e) {
            throw new IllegalStateException("No se pudo procesar el DNI.", e);
        }
    }
}
