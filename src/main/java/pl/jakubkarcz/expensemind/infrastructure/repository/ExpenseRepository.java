package pl.jakubkarcz.expensemind.infrastructure.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.jakubkarcz.expensemind.domain.Expense;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, UUID> {
    Optional<Expense> findByIdAndOwnerId(UUID expenseId, UUID ownerId);
}