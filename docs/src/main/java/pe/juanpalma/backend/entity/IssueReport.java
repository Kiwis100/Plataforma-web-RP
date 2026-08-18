package pe.juanpalma.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "issue_reports")
public class IssueReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reporter_first_name", nullable = false, length = 100)
    private String reporterFirstName;

    @Column(name = "reporter_last_name", nullable = false, length = 100)
    private String reporterLastName;

    // Nunca se guarda el DNI en texto plano ni se expone por la API.
    @JsonIgnore
    @Column(name = "reporter_dni_hash", nullable = false, length = 64)
    private String reporterDniHash;

    @Column(name = "reporter_dni_masked", nullable = false, length = 20)
    private String reporterDniMasked;

    @Column(nullable = false, length = 180)
    private String title;

    @Column(nullable = false, length = 40)
    private String sector;

    @Column(nullable = false, length = 200)
    private String location;

    @Column(nullable = false, length = 3000)
    private String description;

    // Ruta relativa servida por el backend, ej: "uploads/issues/uuid.jpg"
    @Column(name = "attachment_path", length = 300)
    private String attachmentPath;

    // "IMAGE" o "VIDEO"
    @Column(name = "attachment_type", length = 10)
    private String attachmentType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private IssueStatus status = IssueStatus.PENDING;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public Long getId() {
        return id;
    }

    public String getReporterFirstName() {
        return reporterFirstName;
    }

    public void setReporterFirstName(String v) {
        reporterFirstName = v;
    }

    public String getReporterLastName() {
        return reporterLastName;
    }

    public void setReporterLastName(String v) {
        reporterLastName = v;
    }

    public String getReporterDniHash() {
        return reporterDniHash;
    }

    public void setReporterDniHash(String v) {
        reporterDniHash = v;
    }

    public String getReporterDniMasked() {
        return reporterDniMasked;
    }

    public void setReporterDniMasked(String v) {
        reporterDniMasked = v;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String v) {
        title = v;
    }

    public String getSector() {
        return sector;
    }

    public void setSector(String v) {
        sector = v;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String v) {
        location = v;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String v) {
        description = v;
    }

    public String getAttachmentPath() {
        return attachmentPath;
    }

    public void setAttachmentPath(String v) {
        attachmentPath = v;
    }

    public String getAttachmentType() {
        return attachmentType;
    }

    public void setAttachmentType(String v) {
        attachmentType = v;
    }

    public IssueStatus getStatus() {
        return status;
    }

    public void setStatus(IssueStatus v) {
        status = v;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
