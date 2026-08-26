package com.yukgaejang.cafemenu.domain.post.product.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class ProductListResponse {

    private int totalPages;
    private List<ProductResponse> products;
}
