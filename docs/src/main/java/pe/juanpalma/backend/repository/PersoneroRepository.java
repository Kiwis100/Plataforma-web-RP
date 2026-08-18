package pe.juanpalma.backend.repository;

import pe.juanpalma.backend.entity.Personero;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PersoneroRepository extends JpaRepository<Personero, Long> {

    List<Personero> findAllByOrderByIdDesc();

    List<Personero> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
            String firstName, String lastName);
}
