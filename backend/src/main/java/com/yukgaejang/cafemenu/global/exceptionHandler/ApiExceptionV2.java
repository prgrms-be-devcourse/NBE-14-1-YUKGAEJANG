package com.yukgaejang.cafemenu.global.exceptionHandler;

import lombok.Getter;

@Getter
public class ApiExceptionV2 extends RuntimeException {
    private final ErrorCodeV2 errorCode;

    public ApiExceptionV2 (ErrorCodeV2 errorCode) {
        super(errorCode.getDefaultMessage());
        this.errorCode = errorCode;
    }

    public ApiExceptionV2 (ErrorCodeV2 errorCode, String customMessage) {
        super(customMessage);
        this.errorCode = errorCode;
    }
}