package pl.jakubkarcz.expensemind.application.dto;

public record UserLoginRequest(
        String email,
        String password
) {
}
