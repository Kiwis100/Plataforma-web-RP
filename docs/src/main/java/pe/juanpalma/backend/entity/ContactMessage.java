package pe.juanpalma.backend.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name="contact_messages")
public class ContactMessage {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    @Column(nullable=false, length=120) private String name;
    @Column(name="dni_hash", nullable=false, length=64) private String dniHash;
    @Column(name="dni_masked", nullable=false, length=12) private String dniMasked;
    @Column(nullable=false, length=30) private String phone;
    @Column(nullable=false, length=40) private String sector;
    @Column(nullable=false, length=100) private String subject;
    @Column(nullable=false, length=2000) private String message;
    @Column(name="created_at", nullable=false) private OffsetDateTime createdAt=OffsetDateTime.now();

    public Long getId(){return id;}
    public String getName(){return name;} public void setName(String v){name=v;}
    public String getDniHash(){return dniHash;} public void setDniHash(String v){dniHash=v;}
    public String getDniMasked(){return dniMasked;} public void setDniMasked(String v){dniMasked=v;}
    public String getPhone(){return phone;} public void setPhone(String v){phone=v;}
    public String getSector(){return sector;} public void setSector(String v){sector=v;}
    public String getSubject(){return subject;} public void setSubject(String v){subject=v;}
    public String getMessage(){return message;} public void setMessage(String v){message=v;}
    public OffsetDateTime getCreatedAt(){return createdAt;}
}
