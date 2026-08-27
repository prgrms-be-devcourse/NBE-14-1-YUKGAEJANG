package com.yukgaejang.cafemenu.domain.post.product.repository;

import com.yukgaejang.cafemenu.domain.post.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;


public interface ProductRepository extends JpaRepository<Product, Long> {
    boolean existsByName(String name); //이름 검사용

    Page<Product> findAll(Specification<Product> spc, Pageable pageable);

}
