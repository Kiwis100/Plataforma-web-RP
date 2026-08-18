package pe.juanpalma.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name="bad_words",
       uniqueConstraints=@UniqueConstraint(name="uk_bad_word", columnNames="normalized_word"))
public class BadWord {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    @Column(name="normalized_word", nullable=false, length=120) private String normalizedWord;

    public Long getId(){return id;}
    public String getNormalizedWord(){return normalizedWord;} public void setNormalizedWord(String v){normalizedWord=v;}
}
