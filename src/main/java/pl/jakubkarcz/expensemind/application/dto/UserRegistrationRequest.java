package pl.jakubkarcz.expensemind.application.dto;

public record UserRegistrationRequest(
        String email,
        String password
) {
}