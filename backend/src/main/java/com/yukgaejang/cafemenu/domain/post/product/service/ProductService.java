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
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    //상품 등록용(create)
    public ProductResponse create(ProductCreateRequest request) {

        //같은 상품이 존재하면 에러 던지게
        if (productRepository.existsByName(request.name())) {
            throw new ApiException(ErrorCode.PRODUCT_ALREADY_EXISTS);
        }

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
                .orElseThrow(() -> new ApiException(ErrorCode.PRODUCT_NOT_FOUND));

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
    public Page<Product> getProducts(int page, String direction, String productName) {

        Sort sort = Sort.by(Sort.Direction.ASC, "id"); //기본 조회

        if ("asc".equalsIgnoreCase(direction)) {
            sort = Sort.by(Sort.Direction.ASC, "price"); // 가격 낮은 순
        } else if ("desc".equalsIgnoreCase(direction)) {
            sort = Sort.by(Sort.Direction.DESC, "price"); // 가격 높은 순
        }

        Pageable pageable = PageRequest.of(page, 8, sort);
        Specification<Product> spec = search(productName);

        return productRepository.findAll(spec, pageable);
    }

    public void deleteProduct(Long productId) {
        boolean isExistedProduct = productRepository.existsById(productId);

        if (!isExistedProduct) {
            throw new ApiException(ErrorCode.PRODUCT_NOT_FOUND);
        }

        productRepository.deleteById(productId);
    }
     //상품 단건 조회
    public ProductResponse getProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.PRODUCT_NOT_FOUND));

        return ProductResponse.from(product);
    }

    private Specification<Product> search(String kw) {
        return (root, query, criteriaBuilder) -> {

            if (kw == null || kw.trim().isEmpty()) {
                return null;
            }

            return criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("name")),
                    "%" + kw.toLowerCase() + "%"
            );
        };
    }
}




