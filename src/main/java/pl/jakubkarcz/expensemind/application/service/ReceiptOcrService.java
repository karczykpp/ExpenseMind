package pl.jakubkarcz.expensemind.application.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;
import org.springframework.util.MimeTypeUtils;
import org.springframework.web.multipart.MultipartFile;
import pl.jakubkarcz.expensemind.application.dto.ExpenseRequest;

import org.springframework.ai.model.Media;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReceiptOcrService {
    private final ChatModel chatModel;
    private final ObjectMapper objectMapper;

    public ExpenseRequest analyzeReceipt(MultipartFile file) throws Exception {
        Media media = new Media(MimeTypeUtils.parseMimeType(file.getContentType()), file.getResource());

        String promptText = """
                Jesteś ekspertem księgowym. Przeanalizuj to zdjęcie paragonu, screena z banku lub faktury.
                Zwróć TYLKO I WYŁĄCZNIE czysty obiekt JSON. Nie dodawaj żadnego wstępu, 
                zakończenia ani znaczników formatowania (np. ```json).
                
                Struktura JSONa ma wyglądać dokładnie tak:
                {
                  "merchant": "Nazwa sklepu (np. Biedronka, Orlen)",
                  "totalAmount": 150.50,
                  "currency": "PLN",
                  "category": "Wybierz jedną z: ZAKUPY, PALIWO, RESTAURACJA, ROZRYWKA, AUTO, INNE",
                  "date": "2023-10-25"
                }
                Jeśli nie widzisz daty, użyj dzisiejszej.
                """;

        UserMessage userMessage = new UserMessage(promptText, List.of(media));
        Prompt prompt = new Prompt(List.of(userMessage));

        System.out.println("Wysyłam paragon do OpenAI...");
        ChatResponse response = chatModel.call(prompt);
        String jsonContent = response.getResult().getOutput().getContent();
        System.out.println("Otrzymałem odpowiedź: " + jsonContent);

        return objectMapper.readValue(jsonContent, ExpenseRequest.class);
    }
}
