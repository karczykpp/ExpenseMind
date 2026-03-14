package pl.jakubkarcz.expensemind.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
public class Expense {
    @Id
    @GeneratedValue
    private UUID id;

    private BigDecimal totalAmount;
    private String currency;
    private String category;
    private String description;
    private LocalDate date;

    @ManyToOne
    private User owner;
}
