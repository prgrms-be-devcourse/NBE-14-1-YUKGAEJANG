const ORDER_DATE_TIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2}))?/;

/**
 * 백엔드 LocalDateTime 응답을 시간대 변환 없이 주문 화면용으로 표시한다.
 */
export default function formatOrderDateTime(value: string) {
  const match = ORDER_DATE_TIME_PATTERN.exec(value);

  if (!match) {
    return value;
  }

  const [, year, month, day, hour, minute] = match;
  const date = `${year}. ${month}. ${day}.`;

  return hour && minute ? `${date} ${hour}:${minute}` : date;
}
