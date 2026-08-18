package pe.juanpalma.backend.controller;

import jakarta.validation.Valid;
import pe.juanpalma.backend.dto.DonationRequest;
import pe.juanpalma.backend.entity.Donation;
import pe.juanpalma.backend.service.DonationService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/donations")
public class DonationController {

    private final DonationService service;

    public DonationController(DonationService service) { this.service = service; }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody DonationRequest request,
                                    @RequestHeader(value="Idempotency-Key", required=false) String key) {
        Donation d = service.create(request, key);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Aporte registrado correctamente.",
                "donationId", d.getId(),
                "name", d.getDonorName(),
                "dni", d.getDniMasked(),
                "amount", d.getAmount(),
                "createdAt", d.getCreatedAt()
        ));
    }
}
