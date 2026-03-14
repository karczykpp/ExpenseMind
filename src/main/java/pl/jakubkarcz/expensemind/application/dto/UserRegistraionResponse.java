package pl.jakubkarcz.expensemind.application.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserRegistraionResponse(
        UUID id,
        String email,
        LocalDateTime createdAt

) {

}