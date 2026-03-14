package pl.jakubkarcz.expensemind.application.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserDto(
        UUID id,
        String email,
        LocalDateTime createdAt
) {
}