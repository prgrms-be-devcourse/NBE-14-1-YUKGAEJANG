package com.yukgaejang.cafemenu.domain.post.product.service;

import com.yukgaejang.cafemenu.domain.post.product.dto.ProductCreateRequest;
import com.yukgaejang.cafemenu.domain.post.product.dto.ProductResponse;
import com.yukgaejang.cafemenu.domain.post.product.entity.Product;
import com.yukgaejang.cafemenu.domain.post.product.repository.ProductRepository;
import com.yukgaejang.cafemenu.global.exceptionHandler.ApiException;
import com.yukgaejang.cafemenu.global.exceptionHandler.ErrorCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class ProductServiceTest {

    @Test
    @DisplayName("상품을 등록하면 Repository에 저장하고 응답을 반환한다")
    void productServiceShouldCreateProduct() {
        ProductRepository productRepository =
                mock(ProductRepository.class);

        ProductService productService =
                new ProductService(productRepository);

        ProductCreateRequest request = new ProductCreateRequest(
                "아메리카노",
                3000,
                "americano.jpg"
        );

        when(productRepository.save(any(Product.class)))
                .thenAnswer(invocation ->
                        (Product) invocation.getArgument(0)
                );

        ProductResponse response = productService.create(request);

        ArgumentCaptor<Product> captor =
                ArgumentCaptor.forClass(Product.class);

        verify(productRepository).save(captor.capture());

        Product savedProduct = captor.getValue();

        assertAll(
                () -> assertEquals("아메리카노", savedProduct.getName()),
                () -> assertEquals(3000, savedProduct.getPrice()),
                () -> assertEquals(
                        "americano.jpg",
                        savedProduct.getImageUrl()
                ),
                () -> assertEquals("아메리카노", response.name()),
                () -> assertEquals(3000, response.price()),
                () -> assertEquals(
                        "americano.jpg",
                        response.imageUrl()
                )
        );
    }

    @Test
    @DisplayName("존재하는 상품의 정보를 수정할 수 있다")
    void productServiceShouldUpdateExistingProduct() {
        ProductRepository productRepository =
                mock(ProductRepository.class);

        ProductService productService =
                new ProductService(productRepository);

        Product product = new Product(
                "아메리카노",
                3000,
                "americano.jpg"
        );

        ProductCreateRequest request = new ProductCreateRequest(
                "카페라떼",
                4500,
                "cafe-latte.jpg"
        );

        when(productRepository.findById(1L))
                .thenReturn(Optional.of(product));

        when(productRepository.save(product))
                .thenReturn(product);

        ProductResponse response =
                productService.updateProduct(1L, request);

        assertAll(
                () -> assertEquals("카페라떼", product.getName()),
                () -> assertEquals(4500, product.getPrice()),
                () -> assertEquals(
                        "cafe-latte.jpg",
                        product.getImageUrl()
                ),
                () -> assertEquals("카페라떼", response.name()),
                () -> assertEquals(4500, response.price())
        );

        verify(productRepository).findById(1L);
        verify(productRepository).save(product);
    }

    @Test
    @DisplayName("존재하지 않는 상품을 수정하면 PRODUCT_NOT_FOUND 예외가 발생한다")
    void productServiceShouldRejectUpdateForMissingProduct() {
        ProductRepository productRepository =
                mock(ProductRepository.class);

        ProductService productService =
                new ProductService(productRepository);

        ProductCreateRequest request = new ProductCreateRequest(
                "카페라떼",
                4500,
                "cafe-latte.jpg"
        );

        when(productRepository.findById(999L))
                .thenReturn(Optional.empty());

        ApiException exception = assertThrows(
                ApiException.class,
                () -> productService.updateProduct(999L, request)
        );

        assertEquals(
                ErrorCode.PRODUCT_NOT_FOUND,
                exception.getErrorCode()
        );

        verify(productRepository).findById(999L);
        verify(productRepository, never())
                .save(any(Product.class));
    }

    @Test
    @DisplayName("상품 목록은 기본적으로 ID 오름차순으로 조회한다")
    void productListShouldUseDefaultIdAscendingSort() {
        ProductRepository productRepository =
                mock(ProductRepository.class);

        ProductService productService =
                new ProductService(productRepository);

        Page<Product> emptyPage = Page.empty();

        when(productRepository.findAll(any(Pageable.class)))
                .thenReturn(emptyPage);

        Page<Product> result =
                productService.getProducts(0, null,null);

        ArgumentCaptor<Pageable> captor =
                ArgumentCaptor.forClass(Pageable.class);

        verify(productRepository).findAll(captor.capture());

        Pageable pageable = captor.getValue();
        Sort.Order idOrder = pageable.getSort().getOrderFor("id");

        assertSame(emptyPage, result);
        assertEquals(0, pageable.getPageNumber());
        assertEquals(10, pageable.getPageSize());
        assertNotNull(idOrder);
        assertEquals(Sort.Direction.ASC, idOrder.getDirection());
    }

    @Test
    @DisplayName("가격 오름차순 요청 시 상품을 낮은 가격순으로 조회한다")
    void productListShouldUsePriceAscendingSort() {
        ProductRepository productRepository =
                mock(ProductRepository.class);

        ProductService productService =
                new ProductService(productRepository);

        when(productRepository.findAll(any(Pageable.class)))
                .thenReturn(Page.empty());

        productService.getProducts(0, "asc",null);

        ArgumentCaptor<Pageable> captor =
                ArgumentCaptor.forClass(Pageable.class);

        verify(productRepository).findAll(captor.capture());

        Pageable pageable = captor.getValue();
        Sort.Order priceOrder =
                pageable.getSort().getOrderFor("price");

        assertNotNull(priceOrder);
        assertEquals(
                Sort.Direction.ASC,
                priceOrder.getDirection()
        );
    }

    @Test
    @DisplayName("가격 내림차순 요청 시 상품을 높은 가격순으로 조회한다")
    void productListShouldUsePriceDescendingSort() {
        ProductRepository productRepository =
                mock(ProductRepository.class);

        ProductService productService =
                new ProductService(productRepository);

        when(productRepository.findAll(any(Pageable.class)))
                .thenReturn(Page.empty());

        productService.getProducts(0, "desc",null);

        ArgumentCaptor<Pageable> captor =
                ArgumentCaptor.forClass(Pageable.class);

        verify(productRepository).findAll(captor.capture());

        Pageable pageable = captor.getValue();
        Sort.Order priceOrder =
                pageable.getSort().getOrderFor("price");

        assertNotNull(priceOrder);
        assertEquals(
                Sort.Direction.DESC,
                priceOrder.getDirection()
        );
    }

    @Test
    @DisplayName("가격 정렬 적용 후 정렬 방향을 전달하지 않으면 기본 정렬로 돌아간다")
    void productListShouldReturnToDefaultSortAfterPriceSort() {
        // given
        ProductRepository productRepository =
                mock(ProductRepository.class);

        ProductService productService =
                new ProductService(productRepository);

        Page<Product> emptyPage = Page.empty();

        when(productRepository.findAll(any(Pageable.class)))
                .thenReturn(emptyPage);

        // when
        productService.getProducts(0, "asc",null);
        productService.getProducts(0, "desc",null);
        productService.getProducts(0, null,null);

        // then
        ArgumentCaptor<Pageable> captor =
                ArgumentCaptor.forClass(Pageable.class);

        verify(productRepository, times(3))
                .findAll(captor.capture());

        List<Pageable> pageables = captor.getAllValues();

        Pageable ascendingPageable = pageables.get(0);
        Pageable descendingPageable = pageables.get(1);
        Pageable defaultPageable = pageables.get(2);

        Sort.Order ascendingPriceOrder =
                ascendingPageable.getSort().getOrderFor("price");

        Sort.Order descendingPriceOrder =
                descendingPageable.getSort().getOrderFor("price");

        Sort.Order defaultIdOrder =
                defaultPageable.getSort().getOrderFor("id");

        Sort.Order defaultPriceOrder =
                defaultPageable.getSort().getOrderFor("price");

        assertAll(
                () -> assertNotNull(ascendingPriceOrder),
                () -> assertEquals(
                        Sort.Direction.ASC,
                        ascendingPriceOrder.getDirection()
                ),
                () -> assertNotNull(descendingPriceOrder),
                () -> assertEquals(
                        Sort.Direction.DESC,
                        descendingPriceOrder.getDirection()
                ),
                () -> assertNotNull(defaultIdOrder),
                () -> assertEquals(
                        Sort.Direction.ASC,
                        defaultIdOrder.getDirection()
                ),
                () -> assertNull(defaultPriceOrder)
        );
    }

    @Test
    @DisplayName("상품 목록은 요청한 페이지 번호와 페이지 크기 10을 사용한다")
    void productListShouldUseRequestedPage() {
        ProductRepository productRepository =
                mock(ProductRepository.class);

        ProductService productService =
                new ProductService(productRepository);

        when(productRepository.findAll(any(Pageable.class)))
                .thenReturn(Page.empty());

        productService.getProducts(2, null,null);

        ArgumentCaptor<Pageable> captor =
                ArgumentCaptor.forClass(Pageable.class);

        verify(productRepository).findAll(captor.capture());

        Pageable pageable = captor.getValue();

        assertEquals(2, pageable.getPageNumber());
        assertEquals(10, pageable.getPageSize());
    }

    @Test
    @DisplayName("상품 목록 조회 시 음수 페이지 번호를 요청하면 예외가 발생한다")
    void productListShouldRejectNegativePage() {
        ProductRepository productRepository =
                mock(ProductRepository.class);

        ProductService productService =
                new ProductService(productRepository);

        assertThrows(
                IllegalArgumentException.class,
                () -> productService.getProducts(-1, null,null)
        );

        verifyNoInteractions(productRepository);
    }

    @Test
    @DisplayName("존재하는 상품을 삭제할 수 있다")
    void productServiceShouldDeleteExistingProduct() {
        ProductRepository productRepository =
                mock(ProductRepository.class);

        ProductService productService =
                new ProductService(productRepository);

        when(productRepository.existsById(1L))
                .thenReturn(true);

        assertDoesNotThrow(
                () -> productService.deleteProduct(1L)
        );

        verify(productRepository).existsById(1L);
        verify(productRepository).deleteById(1L);
    }

    @Test
    @DisplayName("존재하지 않는 상품을 삭제하면 PRODUCT_NOT_FOUND 예외가 발생한다")
    void productServiceShouldRejectDeleteForMissingProduct() {
        ProductRepository productRepository =
                mock(ProductRepository.class);

        ProductService productService =
                new ProductService(productRepository);

        when(productRepository.existsById(999L))
                .thenReturn(false);

        ApiException exception = assertThrows(
                ApiException.class,
                () -> productService.deleteProduct(999L)
        );

        assertEquals(
                ErrorCode.PRODUCT_NOT_FOUND,
                exception.getErrorCode()
        );

        verify(productRepository).existsById(999L);
        verify(productRepository, never()).deleteById(999L);
    }
}
