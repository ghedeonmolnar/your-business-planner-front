import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { theme } from '@/shared/theme/theme';

type Props = {
  year: number;
  availableYears: number[];
  onChange: (year: number) => void;
};

export function ReportYearSelector({ year, availableYears, onChange }: Props) {
  const years = [...new Set([...availableYears, year])].sort((a, b) => a - b);
  const currentIndex = years.indexOf(year);

  return (
    <View style={styles.wrap}>
      <View style={styles.heading}>
        <Text style={styles.label}>Anul</Text>
        <View style={styles.arrows}>
          <Pressable
            accessibilityLabel="Anul anterior"
            accessibilityRole="button"
            disabled={currentIndex === 0}
            onPress={() => {
              if (currentIndex > 0) {
                onChange(years[currentIndex - 1]);
              }
            }}
            style={styles.arrow}
          >
            <Text style={styles.arrowText}>‹</Text>
          </Pressable>
          <Text style={styles.year}>{year}</Text>
          <Pressable
            accessibilityLabel="Anul următor"
            accessibilityRole="button"
            disabled={currentIndex === years.length - 1}
            onPress={() => {
              if (currentIndex < years.length - 1) {
                onChange(years[currentIndex + 1]);
              }
            }}
            style={styles.arrow}
          >
            <Text style={styles.arrowText}>›</Text>
          </Pressable>
        </View>
      </View>
      {years.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {years.map(option => (
            <Pressable
              key={option}
              accessibilityLabel={`Raport ${option}`}
              accessibilityRole="button"
              accessibilityState={{ selected: option === year }}
              onPress={() => onChange(option)}
              style={[styles.yearChip, option === year && styles.selectedChip]}
            >
              <Text
                style={[
                  styles.chipText,
                  option === year && styles.selectedText,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: theme.spacing.md },
  heading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.typography.subtitle,
  },
  arrows: { alignItems: 'center', flexDirection: 'row' },
  arrow: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
  },
  arrowText: { color: theme.colors.primary, fontSize: theme.typography.title },
  year: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.typography.bodyLarge,
  },
  yearChip: {
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    marginRight: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  selectedChip: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: { color: theme.colors.text, fontFamily: theme.fonts.bodySemibold },
  selectedText: { color: theme.colors.surface },
});
