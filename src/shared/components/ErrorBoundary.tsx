import React, { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { AppButton } from '@/shared/components/AppButton';
import { reportError } from '@/shared/monitoring/reportError';
import { theme } from '@/shared/theme/theme';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    reportError(error, {
      source: 'error-boundary',
      componentStack: errorInfo.componentStack ?? '',
    });
  }

  private reset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Ceva nu a mers bine</Text>
        <Text style={styles.message}>
          Aplicația a întâmpinat o problemă neașteptată. Încearcă din nou, iar
          dacă se repetă, repornește aplicația.
        </Text>
        <AppButton label="Încearcă din nou" onPress={this.reset} size="large" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.title,
    fontWeight: '800',
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  message: {
    color: theme.colors.muted,
    fontSize: theme.typography.body,
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
});
