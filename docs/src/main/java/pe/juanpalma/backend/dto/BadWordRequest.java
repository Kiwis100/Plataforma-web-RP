package pe.juanpalma.backend.dto;
import jakarta.validation.constraints.*;

public record BadWordRequest(@NotBlank @Size(max=120) String word) {}
