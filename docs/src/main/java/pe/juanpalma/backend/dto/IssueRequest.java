package pe.juanpalma.backend.dto;

import jakarta.validation.constraints.*;

public record IssueRequest(
        @NotBlank
        @Size(max = 100)
        @Pattern(regexp = "^[A-Za-zÁÉÍÓÚáéíóúÑñÜü' -]+$", message = "El nombre solo puede contener letras")
        String reporterFirstName,

        @NotBlank
        @Size(max = 100)
        @Pattern(regexp = "^[A-Za-zÁÉÍÓÚáéíóúÑñÜü' -]+$", message = "El apellido solo puede contener letras")
        String reporterLastName,

        @NotBlank
        @Size(min = 8, max = 8)
        String reporterDni,

        @NotBlank
        @Size(max = 180)
        String title,

        @NotBlank
        @Size(max = 40)
        String sector,

        @NotBlank
        @Size(max = 200)
        @Pattern(regexp = "^[A-Za-zÁÉÍÓÚáéíóúÑñÜü0-9°#./,\\- ]+$", message = "La ubicación contiene caracteres no permitidos")
        String location,

        @NotBlank
        @Size(max = 3000)
        String description
) {}
