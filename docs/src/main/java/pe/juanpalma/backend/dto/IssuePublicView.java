package pe.juanpalma.backend.dto;

import pe.juanpalma.backend.entity.IssueReport;
import pe.juanpalma.backend.entity.IssueStatus;

import java.time.OffsetDateTime;

/**
 * Vista pública de un reporte: NO incluye el nombre ni el DNI del vecino
 * que lo registró. Esos datos solo se ven en el panel de administración.
 */
public record IssuePublicView(
        Long id,
        String title,
        String sector,
        String location,
        String description,
        String attachmentPath,
        String attachmentType,
        IssueStatus status,
        OffsetDateTime createdAt
) {
    public static IssuePublicView from(IssueReport i) {
        return new IssuePublicView(
                i.getId(), i.getTitle(), i.getSector(), i.getLocation(),
                i.getDescription(), i.getAttachmentPath(), i.getAttachmentType(),
                i.getStatus(), i.getCreatedAt()
        );
    }
}
