package pl.jakubkarcz.expensemind.application.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ExpenseRequest(
        String merchant,
        BigDecimal totalAmount,
        String currency,
        String category,
        LocalDate date,
        String type
) {
}
