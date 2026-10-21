import dayjs from 'dayjs';
import 'dayjs/locale/ro';
import { formatLongDate } from '@/shared/utils/formatDate';

export const formatReportMonth = (month: string) => {
  const label = dayjs(`${month}-01`).locale('ro').format('MMMM YYYY');
  return label.charAt(0).toUpperCase() + label.slice(1);
};

export const formatAnnualPeriod = (year: number, today = dayjs()) => {
  if (year < today.year()) {
    return 'Tot anul';
  }

  if (year > today.year()) {
    return 'Doar evenimentele programate';
  }

  return `Situația până la ${formatLongDate(today.format('YYYY-MM-DD'))}`;
};

export const formatPercent = (value: number | null) =>
  value === null
    ? 'Fără bază de comparație'
    : `${value > 0 ? '+' : ''}${value.toLocaleString('ro-RO')}%`;

export const formatChartValue = (value: number) => {
  const absolute = Math.abs(value);
  if (absolute >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString('ro-RO', { maximumFractionDigits: 1 })}m`;
  }
  if (absolute >= 1_000) {
    return `${(value / 1_000).toLocaleString('ro-RO', { maximumFractionDigits: 1 })}k`;
  }
  return value.toLocaleString('ro-RO', { maximumFractionDigits: 0 });
};
