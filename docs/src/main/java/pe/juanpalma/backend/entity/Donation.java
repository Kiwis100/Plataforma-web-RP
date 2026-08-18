package pe.juanpalma.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "donations",
       uniqueConstraints = {
           @UniqueConstraint(name = "uk_donation_idempotency", columnNames = "idempotency_key"),
           @UniqueConstraint(name = "uk_donation_dni_hash", columnNames = "dni_hash")
       })
public class Donation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="idempotency_key", nullable=false, length=80)
    private String idempotencyKey;

    @Column(name="donor_name", nullable=false, length=120)
    private String donorName;

    @Column(name="dni_hash", nullable=false, length=64)
    private String dniHash;

    @Column(name="dni_masked", nullable=false, length=12)
    private String dniMasked;

    @Column(nullable=false, precision=12, scale=2)
    private BigDecimal amount;

    @Column(name="created_at", nullable=false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public Long getId() { return id; }
    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String v) { this.idempotencyKey = v; }
    public String getDonorName() { return donorName; }
    public void setDonorName(String v) { this.donorName = v; }
    public String getDniHash() { return dniHash; }
    public void setDniHash(String v) { this.dniHash = v; }
    public String getDniMasked() { return dniMasked; }
    public void setDniMasked(String v) { this.dniMasked = v; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal v) { this.amount = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
