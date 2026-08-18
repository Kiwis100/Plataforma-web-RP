package pe.juanpalma.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import pe.juanpalma.backend.entity.BadWord;
import pe.juanpalma.backend.repository.BadWordRepository;

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
}
