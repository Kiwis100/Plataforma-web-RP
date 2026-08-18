package pe.juanpalma.backend.repository;

import pe.juanpalma.backend.entity.IssueReport;
import pe.juanpalma.backend.entity.IssueStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IssueReportRepository extends JpaRepository<IssueReport, Long> {

    List<IssueReport> findByStatusOrderByCreatedAtDesc(IssueStatus status);

    List<IssueReport> findByReporterFirstNameContainingIgnoreCaseOrReporterLastNameContainingIgnoreCase(
            String firstName, String lastName);
}
