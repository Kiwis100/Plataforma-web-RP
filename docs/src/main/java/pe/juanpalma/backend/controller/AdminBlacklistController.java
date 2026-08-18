package pe.juanpalma.backend.controller;

import jakarta.validation.Valid;
import pe.juanpalma.backend.dto.*;
import pe.juanpalma.backend.entity.*;
import pe.juanpalma.backend.repository.*;
import pe.juanpalma.backend.service.TextSecurityService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/blacklist")
public class AdminBlacklistController {

    private final BlacklistedDniRepository dniRepo;
    private final BadWordRepository wordRepo;
    private final TextSecurityService security;

    @Value("${app.admin.api-key}")
    private String adminKey;

    public AdminBlacklistController(BlacklistedDniRepository dniRepo,
                                     BadWordRepository wordRepo,
                                     TextSecurityService security) {
        this.dniRepo = dniRepo;
        this.wordRepo = wordRepo;
        this.security = security;
    }

    private void authorize(String key) {
        if (key == null || !java.security.MessageDigest.isEqual(
                key.getBytes(java.nio.charset.StandardCharsets.UTF_8),
                adminKey.getBytes(java.nio.charset.StandardCharsets.UTF_8))) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Clave administrativa inválida.");
        }
    }

    @PostMapping("/dni")
    public Map<String,Object> addDni(@RequestHeader("X-Admin-Key") String key,
                                     @Valid @RequestBody BlacklistDniRequest r) {
        authorize(key);
        BlacklistedDni d = new BlacklistedDni();
        d.setDniHash(security.hashDni(r.dni()));
        d.setReason(r.reason());
        try {
            dniRepo.saveAndFlush(d);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.CONFLICT, "El DNI ya está en la lista negra.");
        }
        return Map.of("success", true, "message", "DNI agregado a la lista negra.");
    }

    @PostMapping("/word")
    public Map<String,Object> addWord(@RequestHeader("X-Admin-Key") String key,
                                      @Valid @RequestBody BadWordRequest r) {
        authorize(key);
        BadWord w = new BadWord();
        w.setNormalizedWord(security.normalizeText(r.word()));
        try {
            wordRepo.saveAndFlush(w);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.CONFLICT, "La palabra ya está registrada.");
        }
        return Map.of("success", true, "message", "Palabra agregada al filtro.");
    }
}
