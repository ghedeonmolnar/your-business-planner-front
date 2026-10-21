import dayjs from 'dayjs';

const ISO_DATE_FORMAT = 'YYYY-MM-DD';

export const monthDateRange = (month: string) => {
  const firstDay = dayjs(`${month}-01`);

  return {
    dateFrom: firstDay.startOf('month').format(ISO_DATE_FORMAT),
    dateTo: firstDay.endOf('month').format(ISO_DATE_FORMAT),
  };
};
