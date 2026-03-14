package pl.jakubkarcz.expensemind.api.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.jakubkarcz.expensemind.application.dto.UserLoginRequest;
import pl.jakubkarcz.expensemind.application.dto.UserLoginResponse;
import pl.jakubkarcz.expensemind.application.dto.UserRegistraionResponse;
import pl.jakubkarcz.expensemind.application.dto.UserRegistrationRequest;
import pl.jakubkarcz.expensemind.application.service.UserService;

@RestController
@RequestMapping("api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserRegistraionResponse> register(@RequestBody UserRegistrationRequest request) {
        UserRegistraionResponse createdUser = userService.registerUser(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    @PostMapping("/login")
    public ResponseEntity<UserLoginResponse> login(@RequestBody UserLoginRequest request) {
        UserLoginResponse response = userService.loginUser(request);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader("Authorization") String token) {
        userService.logoutUser(token);
        return ResponseEntity.noContent().build();
    }
}
