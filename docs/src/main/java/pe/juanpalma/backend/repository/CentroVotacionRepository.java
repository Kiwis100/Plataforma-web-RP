package pe.juanpalma.backend.repository;

import pe.juanpalma.backend.entity.CentroVotacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CentroVotacionRepository extends JpaRepository<CentroVotacion, Long> {

    List<CentroVotacion> findAllByOrderByCategoriaAscNombreAsc();

    Optional<CentroVotacion> findByNombre(String nombre);
}
