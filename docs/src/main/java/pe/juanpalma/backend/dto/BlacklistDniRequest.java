package pe.juanpalma.backend.dto;
import jakarta.validation.constraints.*;

public record BlacklistDniRequest(
        @NotBlank @Pattern(regexp="\\d{8}") String dni,
        @Size(max=250) String reason
) {}
