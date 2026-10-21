import { LocaleConfig } from 'react-native-calendars';

export const configureCalendarLocale = () => {
  LocaleConfig.locales.ro = {
    monthNames: [
      'Ianuarie',
      'Februarie',
      'Martie',
      'Aprilie',
      'Mai',
      'Iunie',
      'Iulie',
      'August',
      'Septembrie',
      'Octombrie',
      'Noiembrie',
      'Decembrie',
    ],
    monthNamesShort: [
      'Ian.',
      'Feb.',
      'Mar.',
      'Apr.',
      'Mai',
      'Iun.',
      'Iul.',
      'Aug.',
      'Sept.',
      'Oct.',
      'Nov.',
      'Dec.',
    ],
    dayNames: [
      'Duminică',
      'Luni',
      'Marți',
      'Miercuri',
      'Joi',
      'Vineri',
      'Sâmbătă',
    ],
    dayNamesShort: ['Du', 'Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sâ'],
    today: 'Astăzi',
  };
  LocaleConfig.defaultLocale = 'ro';
};
