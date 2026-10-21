import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { MonthlyBusinessReport } from '@/features/analytics/types';
import {
  formatChartValue,
  formatReportMonth,
} from '@/features/analytics/utils/reportFormat';
import { Card } from '@/shared/components/Card';
import { theme } from '@/shared/theme/theme';

type Props = {
  months: MonthlyBusinessReport[];
  selectedMonth: string;
  onSelect: (month: string) => void;
};

const CHART_WIDTH = 620;
const CHART_HEIGHT = 246;
const TOP = 18;
const BOTTOM = 202;
const LEFT = 43;
const RIGHT = 18;

export function AnnualLineChart({ months, selectedMonth, onSelect }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const reportedMonths = months.flatMap((item, index) =>
    item.profit_amount === null
      ? []
      : [
          {
            index,
            month: item.month,
            profit: item.profit_amount,
            revenue: item.revenue_amount,
          },
        ],
  );
  const values = reportedMonths.flatMap(item => [item.revenue, item.profit]);
  const minimum = Math.min(0, ...values);
  const maximum = Math.max(1, ...values);
  const range = maximum - minimum;
  const step = (CHART_WIDTH - LEFT - RIGHT) / Math.max(months.length - 1, 1);
  const x = (index: number) => LEFT + index * step;
  const y = (value: number) =>
    BOTTOM - ((value - minimum) / range) * (BOTTOM - TOP);
  const revenuePoints = reportedMonths.map(item => ({
    x: x(item.index),
    y: y(item.revenue),
  }));
  const profitPoints = reportedMonths.map(item => ({
    x: x(item.index),
    y: y(item.profit),
  }));
  const toPath = (points: { x: number; y: number }[]) =>
    points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ');
  const selectedIndex = months.findIndex(item => item.month === selectedMonth);

  useEffect(() => {
    if (viewportWidth > 0 && selectedIndex >= 0) {
      scrollRef.current?.scrollTo({
        x: Math.max(0, LEFT + selectedIndex * step - viewportWidth / 2),
        animated: false,
      });
    }
  }, [selectedIndex, step, viewportWidth]);

  return (
    <Card style={styles.card}>
      <Text style={styles.heading}>Evoluție lunară</Text>
      <View style={styles.legend}>
        <View style={[styles.legendDot, styles.revenueDot]} />
        <Text style={styles.legendText}>Încasat</Text>
        <View style={[styles.legendDot, styles.profitDot]} />
        <Text style={styles.legendText}>Profit</Text>
      </View>
      <ScrollView
        horizontal
        ref={scrollRef}
        onLayout={event => setViewportWidth(event.nativeEvent.layout.width)}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.chartBody}>
          <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
            {[0, 1, 2, 3, 4].map(tick => {
              const value = minimum + (range * tick) / 4;
              const ordinate = y(value);
              return (
                <React.Fragment key={tick}>
                  <Line
                    x1={LEFT}
                    x2={CHART_WIDTH - RIGHT}
                    y1={ordinate}
                    y2={ordinate}
                    stroke={theme.colors.border}
                    strokeWidth={1}
                  />
                  <SvgText
                    x={LEFT - 6}
                    y={ordinate + 4}
                    textAnchor="end"
                    fontSize={10}
                    fill={theme.colors.muted}
                  >
                    {formatChartValue(value)}
                  </SvgText>
                </React.Fragment>
              );
            })}
            {minimum < 0 ? (
              <Line
                x1={LEFT}
                x2={CHART_WIDTH - RIGHT}
                y1={y(0)}
                y2={y(0)}
                stroke={theme.colors.muted}
                strokeWidth={1.5}
              />
            ) : null}
            {selectedIndex >= 0 ? (
              <Line
                x1={x(selectedIndex)}
                x2={x(selectedIndex)}
                y1={TOP}
                y2={BOTTOM}
                stroke={theme.colors.primary}
                strokeDasharray="4 4"
                strokeWidth={1}
              />
            ) : null}
            {reportedMonths.length > 0 ? (
              <>
                <Path
                  d={toPath(revenuePoints)}
                  fill="none"
                  stroke={theme.colors.primary}
                  strokeWidth={2.5}
                />
                <Path
                  d={toPath(profitPoints)}
                  fill="none"
                  stroke={theme.colors.success}
                  strokeWidth={2.5}
                />
              </>
            ) : null}
            {reportedMonths.map(item => (
              <React.Fragment key={item.month}>
                <Circle
                  cx={x(item.index)}
                  cy={y(item.revenue)}
                  r={item.month === selectedMonth ? 5 : 3}
                  fill={theme.colors.primary}
                />
                <Circle
                  cx={x(item.index)}
                  cy={y(item.profit)}
                  r={item.month === selectedMonth ? 5 : 3}
                  fill={theme.colors.success}
                />
              </React.Fragment>
            ))}
            {months.map((item, index) => (
              <React.Fragment key={item.month}>
                <SvgText
                  x={x(index)}
                  y={CHART_HEIGHT - 9}
                  textAnchor="middle"
                  fontSize={11}
                  fill={theme.colors.muted}
                >
                  {formatReportMonth(item.month).slice(0, 3)}
                </SvgText>
              </React.Fragment>
            ))}
          </Svg>
          {months.map((item, index) => (
            <Pressable
              key={item.month}
              accessibilityLabel={
                item.profit_amount === null
                  ? `${formatReportMonth(item.month)}, de încasat ${item.outstanding_amount} lei`
                  : `${formatReportMonth(item.month)}, încasat ${item.revenue_amount} lei, profit ${item.profit_amount} lei`
              }
              accessibilityRole="button"
              accessibilityState={{ selected: item.month === selectedMonth }}
              onPress={() => onSelect(item.month)}
              style={[
                styles.monthTarget,
                { left: x(index) - step / 2, width: step },
              ]}
              testID={`chart-month-${item.month}`}
            />
          ))}
        </View>
      </ScrollView>
      <Text style={styles.hint}>Atinge o lună pentru detalii</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: theme.spacing.lg, paddingHorizontal: theme.spacing.sm },
  heading: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.typography.subtitle,
    marginHorizontal: theme.spacing.sm,
  },
  legend: {
    alignItems: 'center',
    flexDirection: 'row',
    marginHorizontal: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  legendDot: { borderRadius: theme.radius.pill, height: 9, width: 9 },
  revenueDot: { backgroundColor: theme.colors.primary },
  profitDot: {
    backgroundColor: theme.colors.success,
    marginLeft: theme.spacing.lg,
  },
  legendText: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.meta,
    marginLeft: theme.spacing.xs,
  },
  chartBody: { height: CHART_HEIGHT, width: CHART_WIDTH },
  monthTarget: { bottom: 0, minWidth: 44, position: 'absolute', top: 0 },
  hint: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.caption,
    marginHorizontal: theme.spacing.sm,
  },
});
