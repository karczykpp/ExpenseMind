package pl.jakubkarcz.expensemind.domain;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
public class Document {
    @Id
    @GeneratedValue
    private UUID id;

    private String fileName;
    private String status;
    private LocalDateTime createdAt;

    @ManyToOne
    private User owner;
}
