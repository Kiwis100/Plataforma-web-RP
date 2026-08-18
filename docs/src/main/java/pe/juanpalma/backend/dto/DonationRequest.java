package pe.juanpalma.backend.dto;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record DonationRequest(
        @NotBlank @Size(max=120) String name,
        @NotBlank @Pattern(regexp="\\d{8}") String dni,
        @NotNull @DecimalMin(value="5.00") @Digits(integer=10, fraction=2) BigDecimal amount
) {}
