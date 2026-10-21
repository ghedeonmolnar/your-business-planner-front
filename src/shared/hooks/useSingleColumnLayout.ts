import { useWindowDimensions } from 'react-native';

const SINGLE_COLUMN_WIDTH = 360;
const SINGLE_COLUMN_FONT_SCALE = 1.2;

export function useSingleColumnLayout() {
  const { width, fontScale } = useWindowDimensions();
  return width < SINGLE_COLUMN_WIDTH || fontScale > SINGLE_COLUMN_FONT_SCALE;
}
