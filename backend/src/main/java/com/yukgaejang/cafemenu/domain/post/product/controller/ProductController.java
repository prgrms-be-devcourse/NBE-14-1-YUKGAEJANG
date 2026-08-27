package com.yukgaejang.cafemenu.domain.post.product.controller;

import com.yukgaejang.cafemenu.domain.post.product.dto.ProductCreateRequest;
import com.yukgaejang.cafemenu.domain.post.product.dto.ProductListResponse;
import com.yukgaejang.cafemenu.domain.post.product.dto.ProductResponse;
import com.yukgaejang.cafemenu.domain.post.product.entity.Product;
import com.yukgaejang.cafemenu.domain.post.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;


    //상품 등록
    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(
            @Valid @RequestBody ProductCreateRequest request
    ) {
        ProductResponse response = productService.create(request);

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }


    //상품 수정(update)
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductCreateRequest request
    ) {
        ProductResponse response = productService.updateProduct(id, request);

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }


    //상품 목록 조회
    @GetMapping
    public ResponseEntity<ProductListResponse> getProducts(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "direction", required = false) String direction,
            @RequestParam(value = "productName", required = false) String productName
    ) {

        Page<Product> paging = productService.getProducts(page, direction, productName);

        List<ProductResponse> responses = paging.getContent()
                .stream()
                .map(ProductResponse::from)
                .toList();

        ProductListResponse response = new ProductListResponse(
                paging.getTotalPages(),
                responses
        );

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }


    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long productId
    ) {
        productService.deleteProduct(productId);

        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .build();
    }
     //상품 단건 조회 매서드
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProduct(
            @PathVariable Long id
    ) {
        ProductResponse response = productService.getProduct(id);

        return ResponseEntity.ok(response);
    }

}
