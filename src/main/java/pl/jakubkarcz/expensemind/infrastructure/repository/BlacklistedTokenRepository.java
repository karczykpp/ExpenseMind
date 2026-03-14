package pl.jakubkarcz.expensemind.infrastructure.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.jakubkarcz.expensemind.domain.BlacklistedToken;

public interface BlacklistedTokenRepository extends JpaRepository<BlacklistedToken, Long> {
    boolean existsByToken(String token);
}