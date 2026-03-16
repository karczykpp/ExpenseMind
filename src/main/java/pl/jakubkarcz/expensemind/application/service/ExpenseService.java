package pl.jakubkarcz.expensemind.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pl.jakubkarcz.expensemind.application.dto.ExpenseRequest;
import pl.jakubkarcz.expensemind.application.dto.ExpenseResponse;
import pl.jakubkarcz.expensemind.domain.Expense;
import pl.jakubkarcz.expensemind.infrastructure.repository.ExpenseRepository;
import pl.jakubkarcz.expensemind.infrastructure.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class ExpenseService {
    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    public ExpenseResponse createExpense(ExpenseRequest request, String userEmail) {
        var user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("Nie znaleziono użytkownika o email: " + userEmail));

        Expense expense = new Expense();

        expense.setMerchant(request.merchant());
        expense.setCategory(request.category());
        expense.setCurrency(request.currency());
        expense.setTotalAmount(request.totalAmount());
        expense.setDate(request.date());

        expense.setOwner(user);

        Expense savedExpense = expenseRepository.save(expense);

        return new ExpenseResponse(
                savedExpense.getId(),
                savedExpense.getMerchant(),
                savedExpense.getCategory(),
                savedExpense.getCurrency(),
                savedExpense.getTotalAmount(),
                savedExpense.getDate()
        );
    }
}
