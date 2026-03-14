package pl.jakubkarcz.expensemind.domain;

public enum DocumentStatus {
    UPLOADED,
    OCR_PROCESSING,
    AI_PROCESSING,
    COMPLETED,
    FAILED
}