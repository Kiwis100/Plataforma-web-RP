package pe.juanpalma.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import pe.juanpalma.backend.entity.BadWord;
import pe.juanpalma.backend.entity.CentroVotacion;
import pe.juanpalma.backend.repository.BadWordRepository;
import pe.juanpalma.backend.repository.CentroVotacionRepository;

import java.util.List;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedBadWords(BadWordRepository repository) {
        return args -> {
            // Lista inicial mínima. Amplíala con la lista institucional que decidan utilizar.
            List<String> defaults = List.of(
                    "idiota",
                    "estupido",
                    "estupida",
                    "imbecil",
                    "imbecila",
                    "mierda",
                    "puta",
                    "puto",
                    "cabron",
                    "cabrona"
            );

            for (String word : defaults) {
                if (repository.findAll().stream().noneMatch(w -> w.getNormalizedWord().equals(word))) {
                    BadWord entity = new BadWord();
                    entity.setNormalizedWord(word);
                    repository.save(entity);
                }
            }
        };
    }

    /**
     * Locales de votación de Santiago de Surco. IMPORTANTE: como el
     * JNE/ONPE todavía no publica los locales oficiales para la elección
     * municipal 2026, se usa como referencia la lista de locales de la
     * elección presidencial. Si el JNE publica variaciones para la elección
     * municipal, esta lista se actualiza aquí (agregar/editar/eliminar
     * entradas) y se reinicia la aplicación.
     */
    @Bean
    CommandLineRunner seedCentrosVotacion(CentroVotacionRepository repository) {
        return args -> {
            record Centro(String nombre, String categoria, String direccion) {}

            List<Centro> defaults = List.of(
                    // Universidades e Institutos
                    new Centro("Universidad Ricardo Palma", "Universidad / Instituto", "Av. Benavides 5440"),
                    new Centro("Universidad de Lima", "Universidad / Instituto", "Av. Javier Prado Este 4600"),

                    // Complejos Deportivos Municipales
                    new Centro("Polideportivo Loma Amarilla", "Complejo Deportivo Municipal", "Calle Monte de los Olivos"),
                    new Centro("Complejo Deportivo de Surco", "Complejo Deportivo Municipal", "Vía de Evitamiento"),
                    new Centro("Complejo Deportivo Sagitario", "Complejo Deportivo Municipal", "Calle Las Gaviotas"),
                    new Centro("Complejo Deportivo Telmo Carbajo", "Complejo Deportivo Municipal", "Santiago de Surco"),

                    // Instituciones Educativas (Colegios Públicos y Privados)
                    new Centro("Colegio Saco Oliveros de Monterrico (Sede Santiago de Surco)", "Institución Educativa", "Monterrico, Santiago de Surco"),
                    new Centro("Colegio Champagnat", "Institución Educativa", "Av. Mariscal Ramón Castilla 611"),
                    new Centro("I.E. 7087 Santiago de Surco", "Institución Educativa", "Calle Loma Real S/N, al lado del Parque Alhelíes"),
                    new Centro("I.E. 6082 Los Próceres", "Institución Educativa", "Alameda Coronel Andrés Rázuri S/N"),
                    new Centro("Colegio de la Inmaculada", "Institución Educativa", "Av. Santiago de Surco"),
                    new Centro("Colegio Cristo Rey", "Institución Educativa", "Av. Velasco Astete"),
                    new Centro("I.E. 6044 Jorge Chávez", "Institución Educativa", "Av. Jorge Chávez"),
                    new Centro("Colegio Pío XII", "Institución Educativa", "Urb. Monterrico"),
                    new Centro("Colegio Santa María Marianistas", "Institución Educativa", "Av. La Floresta, Chacarilla"),
                    new Centro("I.E. 6086 Santa Isabel", "Institución Educativa", "Santiago de Surco"),
                    new Centro("Colegio Augusto Weberbauer", "Institución Educativa", "Av. Pío XII"),
                    new Centro("Colegio Salcantay", "Institución Educativa", "Av. Pío XII"),
                    new Centro("Colegio Regina Pacis", "Institución Educativa", "Av. Las Palmeras")
            );

            for (Centro c : defaults) {
                if (repository.findByNombre(c.nombre()).isEmpty()) {
                    repository.save(new CentroVotacion(c.nombre(), c.categoria(), c.direccion()));
                }
            }
        };
    }
}
