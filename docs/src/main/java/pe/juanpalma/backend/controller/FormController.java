package pe.juanpalma.backend.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import pe.juanpalma.backend.dto.IssuePublicView;
import pe.juanpalma.backend.dto.IssueRequest;
import pe.juanpalma.backend.dto.PersoneroRequest;
import pe.juanpalma.backend.entity.IssueStatus;
import pe.juanpalma.backend.entity.PersoneroStatus;
import pe.juanpalma.backend.service.FormService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@Validated
public class FormController {

    private static final String NAME_REGEX = "^[A-Za-zÁÉÍÓÚáéíóúÑñÜü' -]+$";
    private static final String LOCATION_REGEX = "^[A-Za-zÁÉÍÓÚáéíóúÑñÜü0-9°#./,\\- ]+$";

    private final FormService service;

    @Value("${app.admin.api-key}")
    private String adminKey;

    public FormController(FormService service) {
        this.service = service;
    }

    private void authorize(String key) {
        if (key == null || !java.security.MessageDigest.isEqual(
                key.getBytes(java.nio.charset.StandardCharsets.UTF_8),
                adminKey.getBytes(java.nio.charset.StandardCharsets.UTF_8))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Clave administrativa inválida.");
        }
    }

    @PostMapping("/personeros")
    public ResponseEntity<?> personero(@Valid @RequestBody PersoneroRequest r) {

        var p = service.personero(r);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Personero registrado correctamente.",
                "dni", p.getDni()
        ));
    }

    // Público: el frontend lo usa para llenar el desplegable de "Lugar de
    // votación" en el formulario de personero. No requiere clave admin
    // porque es un catálogo de referencia, no datos personales.
    @GetMapping("/centros-votacion")
    public ResponseEntity<?> getCentrosVotacion() {
        return ResponseEntity.ok(service.getCentrosVotacion());
    }

    // Solo el panel de administración puede ver la lista de personeros.
    @GetMapping("/personeros")
    public ResponseEntity<?> getPersoneros(@RequestHeader("X-Admin-Key") String key) {
        authorize(key);
        return ResponseEntity.ok(service.getPersoneros());
    }

    @GetMapping("/personeros/search")
    public ResponseEntity<?> searchPersoneros(@RequestHeader("X-Admin-Key") String key,
                                               @RequestParam String q) {
        authorize(key);
        return ResponseEntity.ok(service.searchPersoneros(q));
    }

    @GetMapping("/personeros/pending")
    public ResponseEntity<?> getPendingPersoneros(@RequestHeader("X-Admin-Key") String key) {
        authorize(key);
        return ResponseEntity.ok(service.getPersonerosByStatus(PersoneroStatus.PENDING));
    }

    @GetMapping("/personeros/approved")
    public ResponseEntity<?> getApprovedPersoneros(@RequestHeader("X-Admin-Key") String key) {
        authorize(key);
        return ResponseEntity.ok(service.getPersonerosByStatus(PersoneroStatus.APPROVED));
    }

    @GetMapping("/personeros/rejected")
    public ResponseEntity<?> getRejectedPersoneros(@RequestHeader("X-Admin-Key") String key) {
        authorize(key);
        return ResponseEntity.ok(service.getPersonerosByStatus(PersoneroStatus.REJECTED));
    }

    @PutMapping("/personeros/{dni}/status")
    public ResponseEntity<?> updatePersoneroStatus(
            @RequestHeader("X-Admin-Key") String key,
            @PathVariable String dni,
            @RequestParam PersoneroStatus status) {

        authorize(key);
        var personero = service.updatePersoneroStatus(dni, status);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Estado del personero actualizado correctamente.",
                "dni", personero.getDni(),
                "status", personero.getStatus()
        ));
    }

    // Recibe multipart/form-data: los campos de texto + un adjunto opcional
    // (foto o video) validado en FileStorageService.
    @PostMapping(value = "/issues", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> issue(
            @RequestParam @NotBlank @Size(max = 100) @Pattern(regexp = NAME_REGEX, message = "El nombre solo puede contener letras") String reporterFirstName,
            @RequestParam @NotBlank @Size(max = 100) @Pattern(regexp = NAME_REGEX, message = "El apellido solo puede contener letras") String reporterLastName,
            @RequestParam @NotBlank @Size(min = 8, max = 8) String reporterDni,
            @RequestParam @NotBlank @Size(max = 180) String title,
            @RequestParam @NotBlank @Size(max = 40) String sector,
            @RequestParam @NotBlank @Size(max = 200) @Pattern(regexp = LOCATION_REGEX, message = "La ubicación contiene caracteres no permitidos") String location,
            @RequestParam @NotBlank @Size(max = 3000) String description,
            @RequestParam(value = "attachment", required = false) MultipartFile attachment) {

        var r = new IssueRequest(reporterFirstName, reporterLastName, reporterDni, title, sector, location, description);
        var i = service.issue(r, attachment);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Reporte registrado correctamente.",
                "id", i.getId()
        ));
    }

    // Uso interno del panel de administración: incluye TODOS los estados
    // (pendiente/aprobado/rechazado) y el nombre/DNI enmascarado del vecino.
    @GetMapping("/issues")
    public ResponseEntity<?> getIssues(@RequestHeader("X-Admin-Key") String key) {
        authorize(key);
        return ResponseEntity.ok(service.getIssues());
    }

    @GetMapping("/issues/search")
    public ResponseEntity<?> searchIssues(@RequestHeader("X-Admin-Key") String key,
                                           @RequestParam String q) {
        authorize(key);
        return ResponseEntity.ok(service.searchIssues(q));
    }

    // Uso público: lo consume el sitio web. Nunca incluye el nombre/DNI
    // del vecino que reportó la incidencia.
    @GetMapping("/issues/approved")
    public ResponseEntity<?> getApprovedIssues() {
        List<IssuePublicView> vista = service.getApprovedIssues()
                .stream()
                .map(IssuePublicView::from)
                .toList();
        return ResponseEntity.ok(vista);
    }

    @PutMapping("/issues/{id}/status")
    public ResponseEntity<?> updateIssueStatus(
            @RequestHeader("X-Admin-Key") String key,
            @PathVariable Long id,
            @RequestParam IssueStatus status) {

        authorize(key);
        var issue = service.updateIssueStatus(id, status);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Estado del reporte actualizado correctamente.",
                "id", issue.getId(),
                "status", issue.getStatus()
        ));
    }
}
