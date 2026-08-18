package pe.juanpalma.backend.service;

import pe.juanpalma.backend.dto.ContactRequest;
import pe.juanpalma.backend.dto.IssueRequest;
import pe.juanpalma.backend.dto.PersoneroRequest;
import pe.juanpalma.backend.entity.ContactMessage;
import pe.juanpalma.backend.entity.IssueReport;
import pe.juanpalma.backend.entity.IssueStatus;
import pe.juanpalma.backend.entity.Personero;
import pe.juanpalma.backend.repository.ContactMessageRepository;
import pe.juanpalma.backend.repository.IssueReportRepository;
import pe.juanpalma.backend.repository.PersoneroRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
public class FormService {

    private final PersoneroRepository personeros;
    private final ContactMessageRepository contacts;
    private final IssueReportRepository issues;
    private final TextSecurityService security;
    private final FileStorageService fileStorage;

    public FormService(
            PersoneroRepository personeros,
            ContactMessageRepository contacts,
            IssueReportRepository issues,
            TextSecurityService security,
            FileStorageService fileStorage) {

        this.personeros = personeros;
        this.contacts = contacts;
        this.issues = issues;
        this.security = security;
        this.fileStorage = fileStorage;
    }

    @Transactional
    public Personero personero(PersoneroRequest r) {

        security.validateDni(r.dni());

        security.validateText(
                r.firstName(),
                r.lastName(),
                r.email(),
                r.role()
        );

        Personero v = new Personero();

        v.setFirstName(r.firstName().trim());
        v.setLastName(r.lastName().trim());
        v.setDniHash(security.hashDni(r.dni()));
        v.setDniMasked(security.maskDni(r.dni()));
        v.setPhone(r.phone().trim());
        v.setEmail(r.email().trim());
        v.setSector(r.sector());
        v.setRole(r.role());

        return personeros.save(v);
    }

    @Transactional
    public ContactMessage contact(ContactRequest r) {

        security.validateDni(r.dni());

        security.validateText(
                r.name(),
                r.phone(),
                r.subject(),
                r.message()
        );

        ContactMessage c = new ContactMessage();

        c.setName(r.name().trim());
        c.setDniHash(security.hashDni(r.dni()));
        c.setDniMasked(security.maskDni(r.dni()));
        c.setPhone(r.phone().trim());
        c.setSector(r.sector());
        c.setSubject(r.subject());
        c.setMessage(r.message().trim());

        return contacts.save(c);
    }

    @Transactional
    public IssueReport issue(IssueRequest r, MultipartFile attachment) {

        security.validateDni(r.reporterDni());

        security.validateText(
                r.reporterFirstName(),
                r.reporterLastName(),
                r.title(),
                r.location(),
                r.description()
        );

        IssueReport i = new IssueReport();

        i.setReporterFirstName(r.reporterFirstName().trim());
        i.setReporterLastName(r.reporterLastName().trim());
        i.setReporterDniHash(security.hashDni(r.reporterDni()));
        i.setReporterDniMasked(security.maskDni(r.reporterDni()));
        i.setTitle(r.title().trim());
        i.setSector(r.sector());
        i.setLocation(r.location().trim());
        i.setDescription(r.description().trim());

        // El adjunto es opcional; si viene, se valida que sea solo
        // imagen o video (ver FileStorageService).
        var stored = fileStorage.store(attachment);
        if (stored != null) {
            i.setAttachmentPath(stored.relativePath());
            i.setAttachmentType(stored.type());
        }

        // Todo reporte nuevo queda pendiente de revisión.
        i.setStatus(IssueStatus.PENDING);

        return issues.save(i);
    }

    @Transactional(readOnly = true)
    public List<IssueReport> getIssues() {
        return issues.findAll();
    }

    @Transactional(readOnly = true)
    public List<IssueReport> searchIssues(String q) {
        return issues.findByReporterFirstNameContainingIgnoreCaseOrReporterLastNameContainingIgnoreCase(q, q);
    }

    @Transactional(readOnly = true)
    public List<Personero> getPersoneros() {
        return personeros.findAllByOrderByIdDesc();
    }

    @Transactional(readOnly = true)
    public List<Personero> searchPersoneros(String q) {
        return personeros.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(q, q);
    }

    @Transactional(readOnly = true)
    public List<IssueReport> getApprovedIssues() {
        return issues.findByStatusOrderByCreatedAtDesc(
                IssueStatus.APPROVED
        );
    }

    @Transactional
    public IssueReport updateIssueStatus(Long id, IssueStatus status) {

        IssueReport issue = issues.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Reporte no encontrado"
                        )
                );

        issue.setStatus(status);

        return issues.save(issue);
    }
}
