package com.yukgaejang.cafemenu.domain.post.product.controller;

import com.yukgaejang.cafemenu.domain.post.product.dto.ProductCreateRequest;
import com.yukgaejang.cafemenu.domain.post.product.dto.ProductResponse;
import com.yukgaejang.cafemenu.domain.post.product.entity.Product;
import com.yukgaejang.cafemenu.domain.post.product.service.ProductService;
import com.yukgaejang.cafemenu.global.configure.WebConfig;
import com.yukgaejang.cafemenu.global.exceptionHandler.ApiException;
import com.yukgaejang.cafemenu.global.exceptionHandler.ErrorCode;
import com.yukgaejang.cafemenu.global.exceptionHandler.GlobalExceptionHandler;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;


@WebMvcTest(ProductController.class)
@Import({
        WebConfig.class,
        GlobalExceptionHandler.class
})

public class ProductControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProductService productService;

    @Test
    @DisplayName("상품 등록 요청에 성공하면 200 OK와 상품 정보를 반환한다")
    void productControllerShouldCreateProduct() throws Exception {
        ProductResponse response = new ProductResponse(
                1L,
                "아메리카노",
                3000,
                "americano.jpg"
        );

        when(productService.create(any(ProductCreateRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "아메리카노",
                                  "price": 3000,
                                  "imageUrl": "americano.jpg"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("아메리카노"))
                .andExpect(jsonPath("$.price").value(3000))
                .andExpect(jsonPath("$.imageUrl")
                        .value("americano.jpg"));

        verify(productService)
                .create(any(ProductCreateRequest.class));
    }

    @Test
    @DisplayName("상품명이 비어 있으면 상품 등록 요청은 400 Bad Request를 반환한다")
    void productControllerShouldRejectBlankProductName() throws Exception {
        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "",
                                  "price": 3000,
                                  "imageUrl": "americano.jpg"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code")
                        .value("INVALID_INPUT"));

        verifyNoInteractions(productService);
    }

    @Test
    @DisplayName("상품 수정 요청에 성공하면 수정된 상품 정보를 반환한다")
    void productControllerShouldUpdateProduct() throws Exception {
        ProductResponse response = new ProductResponse(
                1L,
                "카페라떼",
                4500,
                "cafe-latte.jpg"
        );

        when(productService.updateProduct(
                eq(1L),
                any(ProductCreateRequest.class)
        )).thenReturn(response);
        
        mockMvc.perform(put("/api/v1/products/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "카페라떼",
                                  "price": 4500,
                                  "imageUrl": "cafe-latte.jpg"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("카페라떼"))
                .andExpect(jsonPath("$.price").value(4500))
                .andExpect(jsonPath("$.imageUrl")
                        .value("cafe-latte.jpg"));

        verify(productService).updateProduct(
                eq(1L),
                any(ProductCreateRequest.class)
        );
    }

    @Test
    @DisplayName("상품 목록을 조회하면 전체 페이지 수와 상품 목록을 반환한다")
    void productControllerShouldReturnProductList() throws Exception {
        Product product = new Product(
                "아메리카노",
                3000,
                "americano.jpg"
        );

        Page<Product> productPage =
                new PageImpl<>(List.of(product));

        when(productService.getProducts(0, null,null))
                .thenReturn(productPage);

        mockMvc.perform(get("/api/v1/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalPages").value(1))
                .andExpect(jsonPath("$.products").isArray())
                .andExpect(jsonPath("$.products.length()").value(1))
                .andExpect(jsonPath("$.products[0].name")
                        .value("아메리카노"))
                .andExpect(jsonPath("$.products[0].price")
                        .value(3000))
                .andExpect(jsonPath("$.products[0].imageUrl")
                        .value("americano.jpg"));

        verify(productService).getProducts(0, null,null);
    }

    @Test
    @DisplayName("상품 목록 조회 시 페이지와 가격 오름차순 조건을 Service에 전달한다")
    void productControllerShouldPassAscendingSortParameters()
            throws Exception {
        Page<Product> emptyPage = Page.empty(PageRequest.of(2, 10));

        when(productService.getProducts(2, "asc",null))
                .thenReturn(emptyPage);

        mockMvc.perform(get("/api/v1/products")
                        .param("page", "2")
                        .param("direction", "asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalPages").value(0))
                .andExpect(jsonPath("$.products").isArray())
                .andExpect(jsonPath("$.products.length()").value(0));

        verify(productService).getProducts(2, "asc",null);
    }

    @Test
    @DisplayName("상품 목록 조회 시 가격 내림차순 조건을 Service에 전달한다")
    void productControllerShouldPassDescendingSortParameter()
            throws Exception {
        Page<Product> emptyPage = Page.empty(PageRequest.of(0, 10));

        when(productService.getProducts(0, "desc",null))
                .thenReturn(emptyPage);

        mockMvc.perform(get("/api/v1/products")
                        .param("direction", "desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalPages").value(0))
                .andExpect(jsonPath("$.products").isArray())
                .andExpect(jsonPath("$.products.length()").value(0));

        verify(productService).getProducts(0, "desc",null);
    }

    @Test
    @DisplayName("상품을 삭제하면 204 No Content를 반환한다")
    void productControllerShouldDeleteProduct() throws Exception {
        mockMvc.perform(delete(
                        "/api/v1/products/{productId}",
                        1L
                ))
                .andExpect(status().isNoContent())
                .andExpect(content().string(""));

        verify(productService).deleteProduct(1L);
    }

    @Test
    @DisplayName("존재하지 않는 상품을 삭제하면 404 Not Found를 반환한다")
    void productControllerShouldReturnNotFoundForMissingProduct()
            throws Exception {
        doThrow(new ApiException(ErrorCode.PRODUCT_NOT_FOUND))
                .when(productService)
                .deleteProduct(999L);

        mockMvc.perform(delete(
                        "/api/v1/products/{productId}",
                        999L
                ))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code")
                        .value("PRODUCT_NOT_FOUND"))
                .andExpect(jsonPath("$.message")
                        .value("존재하지 않는 상품입니다."));

        verify(productService).deleteProduct(999L);
    }
}
