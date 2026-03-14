package pl.jakubkarcz.expensemind.api.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.jakubkarcz.expensemind.application.dto.UserDto;
import pl.jakubkarcz.expensemind.application.dto.UserRegistrationRequest;
import pl.jakubkarcz.expensemind.application.service.UserService;

@RestController
@RequestMapping("api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserDto> register(@RequestBody UserRegistrationRequest request) {
        UserDto createdUser = userService.registerUser(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }
}
