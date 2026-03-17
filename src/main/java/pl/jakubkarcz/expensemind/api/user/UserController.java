package pl.jakubkarcz.expensemind.api.user;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.jakubkarcz.expensemind.domain.User;
import pl.jakubkarcz.expensemind.infrastructure.repository.UserRepository;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class UserController {
    private final UserRepository userRepository;

    @GetMapping("/settings")
    public ResponseEntity<?> getUserSettings(Principal principal) {
        User user = userRepository.findByEmail(principal.getName()).orElseThrow();
        return ResponseEntity.ok(Map.of("budget", user.getMonthlyBudget()));
    }

    @PutMapping("/budget")
    public ResponseEntity<?> updateBudget(@RequestBody Map<String, Double> request, Principal principal){
        User user = userRepository.findByEmail(principal.getName()).orElseThrow();
        user.setMonthlyBudget(request.get("budget"));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("budget", user.getMonthlyBudget()));
    }

}
