import dayjs from 'dayjs';

type MenuRule = {
  starts_on: string;
  ends_on: string;
  weekdays: number[];
  menu_price: string;
  child_menu_price: string;
};
export type HallPricing = {
  menu_pricing_mode?: 'simple' | 'advanced';
  menu_price_rules?: MenuRule[];
  menu_price?: string | null;
  child_menu_price?: string | null;
};

export const hallMenuRulesOverlap = (first: MenuRule, second: MenuRule) => {
  const start =
    first.starts_on > second.starts_on ? first.starts_on : second.starts_on;
  const end = first.ends_on < second.ends_on ? first.ends_on : second.ends_on;
  if (start > end) return false;
  const date = dayjs(start);
  const weekday = (date.day() + 6) % 7;
  return first.weekdays.some(
    day =>
      second.weekdays.includes(day) &&
      date.add((day - weekday + 7) % 7, 'day').format('YYYY-MM-DD') <= end,
  );
};

export const hallMenuPricesForDate = (
  hall: HallPricing | undefined,
  date: string,
) => {
  const weekday = (dayjs(date).day() + 6) % 7;
  const rule =
    hall?.menu_pricing_mode === 'advanced' && date
      ? hall.menu_price_rules?.find(
          item =>
            item.starts_on <= date &&
            item.ends_on >= date &&
            item.weekdays.includes(weekday),
        )
      : undefined;
  return {
    menu_price: rule ? rule.menu_price : hall?.menu_price,
    child_menu_price: rule ? rule.child_menu_price : hall?.child_menu_price,
  };
};
