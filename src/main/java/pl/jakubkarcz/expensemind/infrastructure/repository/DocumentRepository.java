package pl.jakubkarcz.expensemind.infrastructure.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.jakubkarcz.expensemind.domain.Document;

import java.util.Optional;
import java.util.UUID;


@Repository
public interface DocumentRepository extends JpaRepository<Document, UUID> {
    Optional<Document> findByIdAndOwnerId(UUID documentId, UUID ownerId);
}
