import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export const useFormatters = () => {
  const formatDate = (date: string | Date, format = 'DD MMM YYYY') => {
    return dayjs(date).format(format);
  };

  const formatDateTime = (date: string | Date) => {
    return dayjs(date).format('DD MMM YYYY HH:mm');
  };

  const formatRelative = (date: string | Date) => {
    return dayjs(date).fromNow();
  };

  const formatCurrency = (amount: number, currency = 'USD', locale = 'en-US') => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatNumber = (n: number, locale = 'en-US') => {
    return new Intl.NumberFormat(locale).format(n);
  };

  const formatPercent = (value: number, locale = 'en-US') =>
    `${new Intl.NumberFormat(locale).format(value)}%`;

  return {
    formatDate,
    formatDateTime,
    formatRelative,
    formatCurrency,
    formatNumber,
    formatPercent,
  };
};
