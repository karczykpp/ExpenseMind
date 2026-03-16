package pl.jakubkarcz.expensemind.api.expense;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import pl.jakubkarcz.expensemind.application.dto.ExpenseRequest;
import pl.jakubkarcz.expensemind.application.dto.ExpenseResponse;
import pl.jakubkarcz.expensemind.application.service.ExpenseService;
import pl.jakubkarcz.expensemind.application.service.ReceiptOcrService;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {
    private final ExpenseService expenseService;
    private final ReceiptOcrService receiptOcrService;

    @PostMapping("/addExpense")
    public ResponseEntity<ExpenseResponse> addExpense(@RequestBody ExpenseRequest request, Principal principal) {
        String username = principal.getName();
        ExpenseResponse response = expenseService.createExpense(request, username);
        return ResponseEntity.status(201).body(response);
    }

    @GetMapping("/myExpenses")
    public ResponseEntity<List<ExpenseResponse>> getMyExpenses(Principal principal) {
        String username = principal.getName();
        var expenses = expenseService.getUserExpenses(username);
        return ResponseEntity.ok(expenses);
    }

    @PostMapping(value = "/analyzeReceipt", consumes = "multipart/form-data")
    public ResponseEntity<ExpenseRequest> analyzeReceipt(@RequestParam("file") MultipartFile file) {
        try {
            ExpenseRequest expenseRequest = receiptOcrService.analyzeReceipt(file);
            return ResponseEntity.ok(expenseRequest);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }


}