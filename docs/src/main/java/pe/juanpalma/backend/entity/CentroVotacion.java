package pe.juanpalma.backend.entity;

import jakarta.persistence.*;

/**
 * Catálogo de locales de votación en Santiago de Surco. Se usa como
 * referencia temporal basada en los locales de la elección presidencial,
 * ya que el JNE/ONPE todavía no publica los locales oficiales para la
 * elección municipal 2026 de Surco. Si hay variaciones cuando salgan los
 * locales oficiales, esta tabla se actualiza (ver DataSeeder).
 */
@Entity
@Table(name = "centros_votacion")
public class CentroVotacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150, unique = true)
    private String nombre;

    @Column(nullable = false, length = 60)
    private String categoria;

    @Column(nullable = false, length = 200)
    private String direccion;

    protected CentroVotacion() {
        // Requerido por JPA
    }

    public CentroVotacion(String nombre, String categoria, String direccion) {
        this.nombre = nombre;
        this.categoria = categoria;
        this.direccion = direccion;
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }
}
