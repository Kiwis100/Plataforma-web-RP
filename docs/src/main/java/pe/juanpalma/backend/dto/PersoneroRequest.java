package pe.juanpalma.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record PersoneroRequest(

        @NotBlank
        @Size(max = 100)
        @Pattern(regexp = "^[A-Za-zÁÉÍÓÚáéíóúÑñÜü' -]+$", message = "El nombre solo puede contener letras")
        String firstName,

        @NotBlank
        @Size(max = 100)
        @Pattern(regexp = "^[A-Za-zÁÉÍÓÚáéíóúÑñÜü' -]+$", message = "El apellido solo puede contener letras")
        String lastName,

        @NotBlank
        @Size(min = 8, max = 8)
        String dni,

        @NotBlank
        @Pattern(regexp = "^\\d{9}$", message = "El teléfono debe tener exactamente 9 dígitos numéricos")
        String phone,

        @NotBlank
        @Email
        @Size(max = 150)
        String email,

        @NotBlank
        @Size(max = 40)
        String sector,

        @NotBlank
        @Size(max = 100)
        String role
) {
}
