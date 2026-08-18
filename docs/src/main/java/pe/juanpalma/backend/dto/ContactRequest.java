package pe.juanpalma.backend.dto;
import jakarta.validation.constraints.*;

public record ContactRequest(
        @NotBlank @Size(max=120) String name,
        @NotBlank @Pattern(regexp="\\d{8}") String dni,
        @NotBlank @Size(max=30) String phone,
        @NotBlank @Size(max=40) String sector,
        @NotBlank @Size(max=100) String subject,
        @NotBlank @Size(max=2000) String message
) {}
