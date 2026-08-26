package com.yukgaejang.cafemenu.domain.post.product.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class ProductTest {

    @Test
    @DisplayName("상품을 생성하면 입력한 정보가 저장된다")
    void productShouldBeCreatedWithGivenValues() {
        String name = "아메리카노";
        Integer price = 3000;
        String imageUrl = "americano.jpg";

        Product product = new Product(name, price, imageUrl);

        assertAll(
                () -> assertEquals(name, product.getName()),
                () -> assertEquals(price, product.getPrice()),
                () -> assertEquals(imageUrl, product.getImageUrl())
        );
    }

    @Test
    @DisplayName("상품 정보를 수정할 수 있다")
    void productInformationShouldBeUpdated() {
        // given
        Product product = new Product(
                "아메리카노",
                3000,
                "americano.jpg"
        );

        product.update(
                "카페라떼",
                4500,
                "cafe-latte.jpg"
        );

        assertAll(
                () -> assertEquals("카페라떼", product.getName()),
                () -> assertEquals(4500, product.getPrice()),
                () -> assertEquals(
                        "cafe-latte.jpg",
                        product.getImageUrl()
                )
        );
    }
}
