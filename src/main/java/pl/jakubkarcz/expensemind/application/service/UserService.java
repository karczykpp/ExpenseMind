package pl.jakubkarcz.expensemind.application.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import pl.jakubkarcz.expensemind.application.dto.UserLoginRequest;
import pl.jakubkarcz.expensemind.application.dto.UserLoginResponse;
import pl.jakubkarcz.expensemind.application.dto.UserRegistraionResponse;
import pl.jakubkarcz.expensemind.application.dto.UserRegistrationRequest;
import pl.jakubkarcz.expensemind.domain.BlacklistedToken;
import pl.jakubkarcz.expensemind.domain.User;
import pl.jakubkarcz.expensemind.infrastructure.repository.BlacklistedTokenRepository;
import pl.jakubkarcz.expensemind.infrastructure.repository.UserRepository;
import pl.jakubkarcz.expensemind.infrastructure.security.JwtService;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final BlacklistedTokenRepository blacklistedTokenRepository;
    private final JwtService jwtService;

    @Transactional
    public UserRegistraionResponse registerUser(UserRegistrationRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new IllegalArgumentException("Użytkownik z adresem email " + request.email() + " już istnieje.");
        }

        User user = new User();
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));

        User savedUser = userRepository.save(user);

        return new UserRegistraionResponse(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getCreatedAt()
        );
    }

    public UserLoginResponse loginUser(UserLoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("Nieprawidłowy email."));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new IllegalArgumentException("Nieprawidłowe hasło.");
        }

        String token = jwtService.generateToken(user);
        return new UserLoginResponse(token);
    }

    public void logoutUser(String token) {
        String cleanToken = token.startsWith("Bearer ") ? token.substring(7) : token;

        BlacklistedToken blacklistedToken = new BlacklistedToken();
        blacklistedToken.setToken(cleanToken);
        blacklistedToken.setExpiryDate(LocalDateTime.now().plusDays(1));

        blacklistedTokenRepository.save(blacklistedToken);

    }
}
