package pe.juanpalma.backend.service;

import pe.juanpalma.backend.dto.DonationRequest;
import pe.juanpalma.backend.entity.Donation;
import pe.juanpalma.backend.repository.DonationRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DonationService {

    private final DonationRepository repository;
    private final TextSecurityService security;

    @Value("${app.security.max-donation-amount:50000}")
    private java.math.BigDecimal maxAmount;

    public DonationService(DonationRepository repository, TextSecurityService security) {
        this.repository = repository;
        this.security = security;
    }

    @Transactional
    public Donation create(DonationRequest request, String idempotencyKey) {
        if (idempotencyKey == null || idempotencyKey.isBlank() || idempotencyKey.length() > 80) {
            throw new IllegalArgumentException("Falta un Idempotency-Key válido.");
        }

        var previous = repository.findByIdempotencyKey(idempotencyKey);
        if (previous.isPresent()) return previous.get();

        security.validateDni(request.dni());
        security.validateText(request.name());

        if (request.amount().compareTo(maxAmount) > 0) {
            throw new IllegalArgumentException("El monto supera el máximo configurado para este backend.");
        }

        String dniHash = security.hashDni(request.dni());

        if (repository.existsByDniHash(dniHash)) {
            throw new IllegalStateException("Este DNI ya registró un aporte.");
        }

        Donation d = new Donation();
        d.setIdempotencyKey(idempotencyKey);
        d.setDonorName(request.name().trim());
        d.setDniHash(dniHash);
        d.setDniMasked(security.maskDni(request.dni()));
        d.setAmount(request.amount());

        try {
            return repository.saveAndFlush(d);
        } catch (DataIntegrityViolationException e) {
            // Si dos clicks simultáneos llegan al servidor, la restricción UNIQUE
            // de la base de datos evita duplicados.
            throw new IllegalStateException("La solicitud ya fue procesada o el DNI ya registró un aporte.");
        }
    }
}
