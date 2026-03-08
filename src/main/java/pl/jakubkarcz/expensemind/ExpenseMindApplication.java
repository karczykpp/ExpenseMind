package pl.jakubkarcz.expensemind;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ExpenseMindApplication {

    public static void main(String[] args) {
        SpringApplication.run(ExpenseMindApplication.class, args);
    }
}

