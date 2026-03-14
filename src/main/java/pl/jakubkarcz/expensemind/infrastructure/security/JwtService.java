package pl.jakubkarcz.expensemind.infrastructure.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;
import pl.jakubkarcz.expensemind.domain.User;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {
    private static final String SECRET_KEY_STRING = "MojeBardzoTajneHasloKtoreMusiMiecPrzynajmniej256BitowZebyByloBezpieczne123!";
    private final SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY_STRING.getBytes());

    public String generateToken(User user) {
        return Jwts.builder()
                .setSubject(user.getEmail())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) // Token ważny przez 24 godziny
                .signWith(key)
                .compact();
    }
}
