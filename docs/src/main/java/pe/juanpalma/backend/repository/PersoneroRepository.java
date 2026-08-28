package pe.juanpalma.backend.repository;

import pe.juanpalma.backend.entity.Personero;
import pe.juanpalma.backend.entity.PersoneroStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PersoneroRepository extends JpaRepository<Personero, String> {

    List<Personero> findAllByOrderByCreatedAtDesc();

    List<Personero> findByStatusOrderByCreatedAtDesc(PersoneroStatus status);

    List<Personero> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
            String firstName, String lastName);
}
