package pl.jakubkarcz.expensemind; // Upewnij się, że masz tu poprawną ścieżkę do folderu testowego

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import pl.jakubkarcz.expensemind.domain.User;
import pl.jakubkarcz.expensemind.infrastructure.repository.UserRepository;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldSaveAndFindUserByEmail() {
        User user = new User();
        user.setEmail("testowy.jakub@gmail.com");
        user.setPassword("tajnehaslo123");

        userRepository.save(user);
        Optional<User> foundUser = userRepository.findByEmail("testowy.jakub@gmail.com");

        assertThat(foundUser).isPresent();
        assertThat(foundUser.get().getEmail()).isEqualTo("testowy.jakub@gmail.com");
        assertThat(foundUser.get().getId()).isNotNull();
    }
}