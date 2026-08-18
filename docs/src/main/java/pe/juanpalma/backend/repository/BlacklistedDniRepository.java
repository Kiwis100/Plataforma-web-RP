package pe.juanpalma.backend.repository;
import pe.juanpalma.backend.entity.BlacklistedDni;
import org.springframework.data.jpa.repository.JpaRepository;
public interface BlacklistedDniRepository extends JpaRepository<BlacklistedDni, Long> {
    boolean existsByDniHash(String dniHash);
}
