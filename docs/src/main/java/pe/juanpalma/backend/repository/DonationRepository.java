package pe.juanpalma.backend.repository;
import pe.juanpalma.backend.entity.Donation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface DonationRepository extends JpaRepository<Donation, Long> {
    Optional<Donation> findByIdempotencyKey(String key);
    boolean existsByDniHash(String dniHash);
}
