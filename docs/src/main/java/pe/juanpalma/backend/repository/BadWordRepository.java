package pe.juanpalma.backend.repository;
import pe.juanpalma.backend.entity.BadWord;
import org.springframework.data.jpa.repository.JpaRepository;
public interface BadWordRepository extends JpaRepository<BadWord, Long> {}
