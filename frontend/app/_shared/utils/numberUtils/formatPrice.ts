/**
 * 숫자 가격을 `"__원"` 문자열로 변환합니다.
 * 
 * @param price 가격
 * @returns "__원" 문자열
 */
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("ko-KR").format(price) + "원";
};

export default formatPrice;
