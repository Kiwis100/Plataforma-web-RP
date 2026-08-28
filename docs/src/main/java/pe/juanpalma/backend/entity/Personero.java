package pe.juanpalma.backend.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "personeros")
public class Personero {

    // El DNI es la llave primaria: garantiza a nivel de base de datos que
    // un mismo DNI no pueda registrarse dos veces como personero, y sirve
    // como identificador natural del registro (no se usa un id autogenerado).
    @Id
    @Column(name = "dni", nullable = false, length = 8, updatable = false)
    private String dni;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(nullable = false, length = 9)
    private String phone;

    @Column(nullable = false, length = 150)
    private String email;

    @ManyToOne(optional = false)
    @JoinColumn(name = "centro_votacion_id", nullable = false, foreignKey = @ForeignKey(name = "fk_personero_centro_votacion"))
    private CentroVotacion centroVotacion;

    @Column(nullable = false, length = 100)
    private String role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PersoneroStatus status = PersoneroStatus.PENDING;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public String getDni() {
        return dni;
    }

    public void setDni(String dni) {
        this.dni = dni;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String v) {
        firstName = v;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String v) {
        lastName = v;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public CentroVotacion getCentroVotacion() {
        return centroVotacion;
    }

    public void setCentroVotacion(CentroVotacion centroVotacion) {
        this.centroVotacion = centroVotacion;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public PersoneroStatus getStatus() {
        return status;
    }

    public void setStatus(PersoneroStatus status) {
        this.status = status;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
