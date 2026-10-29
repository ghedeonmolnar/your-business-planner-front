import React, { useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { theme } from '@/shared/theme/theme';

type CalendarYearPickerProps = {
  maximumYear: number;
  minimumYear: number;
  onSelect: (year: number) => void;
  selectedYear: number;
};

const YEAR_LIST_MAX_HEIGHT = 320;

export function CalendarYearPicker({
  maximumYear,
  minimumYear,
  onSelect,
  selectedYear,
}: CalendarYearPickerProps) {
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const years = Array.from(
    { length: maximumYear - minimumYear + 1 },
    (_, index) => maximumYear - index,
  );

  return (
    <ScrollView
      nestedScrollEnabled
      contentContainerStyle={styles.grid}
      ref={scrollRef}
      style={styles.list}
    >
      {years.map(year => {
        const selected = year === selectedYear;

        return (
          <View
            key={year}
            onLayout={
              selected
                ? event =>
                    scrollRef.current?.scrollTo({
                      y: event.nativeEvent.layout.y,
                      animated: false,
                    })
                : undefined
            }
            style={styles.cell}
          >
            <Pressable
              accessibilityLabel={`Anul ${year}`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onSelect(year)}
              style={[styles.year, selected && styles.selectedYear]}
            >
              <Text style={[styles.yearText, selected && styles.selectedText]}>
                {year}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: { flexGrow: 0, maxHeight: YEAR_LIST_MAX_HEIGHT },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { padding: theme.spacing.xs, width: '25%' },
  year: {
    alignItems: 'center',
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
  selectedYear: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  yearText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.body,
  },
  selectedText: { color: theme.colors.surface },
});
