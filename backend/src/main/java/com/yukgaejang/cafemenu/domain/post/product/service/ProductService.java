package com.yukgaejang.cafemenu.domain.post.product.service;

import com.yukgaejang.cafemenu.domain.post.product.dto.ProductCreateRequest;
import com.yukgaejang.cafemenu.domain.post.product.dto.ProductResponse;
import com.yukgaejang.cafemenu.domain.post.product.entity.Product;
import com.yukgaejang.cafemenu.domain.post.product.repository.ProductRepository;
import com.yukgaejang.cafemenu.global.exceptionHandler.ApiException;
import com.yukgaejang.cafemenu.global.exceptionHandler.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;


    //상품 등록용(create)
    public ProductResponse create(ProductCreateRequest request) {
        Product product = new Product(
                request.name(),
                request.price(),
                request.imageUrl()
        );

        Product savedProduct = productRepository.save(product);

        return ProductResponse.from(savedProduct);

    }


    //상품 수정(update)
    public ProductResponse updateProduct(Long id, ProductCreateRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.PRODUCT_NOT_FOUND, "상품이 존재하지 않습니다."));

        product.update(
                request.name(),
                request.price(),
                request.imageUrl()
        );

        Product savedProduct = productRepository.save(product);

        return ProductResponse.from(savedProduct);

    }

    //상품 목록 조회
    @Transactional(readOnly = true)
    public Page<Product> getProducts(int page) {
        Pageable pageable = PageRequest.of(page, 10);

        return productRepository.findAll(pageable);
    }

    public void deleteProduct(Long productId) {
        boolean isExistedProduct = productRepository.existsById(productId);

        if (!isExistedProduct) {
            throw new ApiException(
                    HttpStatus.NOT_FOUND,
                    "PRODUCT_NOT_FOUND",
                    "product not found"
            );
        }

        productRepository.deleteById(productId);
    }
}




