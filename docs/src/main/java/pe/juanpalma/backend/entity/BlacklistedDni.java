package pe.juanpalma.backend.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name="blacklisted_dnis",
       uniqueConstraints=@UniqueConstraint(name="uk_blacklisted_dni", columnNames="dni_hash"))
public class BlacklistedDni {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    @Column(name="dni_hash", nullable=false, length=64) private String dniHash;
    @Column(length=250) private String reason;
    @Column(name="created_at", nullable=false) private OffsetDateTime createdAt=OffsetDateTime.now();

    public Long getId(){return id;}
    public String getDniHash(){return dniHash;} public void setDniHash(String v){dniHash=v;}
    public String getReason(){return reason;} public void setReason(String v){reason=v;}
    public OffsetDateTime getCreatedAt(){return createdAt;}
}
