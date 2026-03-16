package pl.jakubkarcz.expensemind.api.expense;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.jakubkarcz.expensemind.application.dto.ExpenseRequest;
import pl.jakubkarcz.expensemind.application.dto.ExpenseResponse;

import java.security.Principal;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    @PostMapping("/addExpense")
    public ResponseEntity<ExpenseResponse> addExpense(@RequestBody ExpenseRequest request, Principal principal) {
        String username = principal.getName();
        return null;
    }

}
