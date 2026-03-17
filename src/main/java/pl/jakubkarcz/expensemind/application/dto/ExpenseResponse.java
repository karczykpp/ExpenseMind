package pl.jakubkarcz.expensemind.application.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ExpenseResponse (
        UUID id,
        String merchant,
        String category,
        String currency,
        BigDecimal totalAmount,
        LocalDate date,
        String type
) {
}
