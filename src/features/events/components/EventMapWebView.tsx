import React, { useRef } from 'react';
import { Linking, Platform, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { MapCoordinates, MapSelection } from '@/shared/types/mapLocation';
import {
  isTrustedMapSelectorUrl,
  mapPickerMessageSchema,
} from '@/features/events/schemas/eventMapSchemas';
import { showError } from '@/shared/feedback/showError';
import {
  isMapSelectorDocumentUrl,
  isMapSelectorMessageSource,
} from '@/features/events/utils/eventMapWebViewUrls';
import { theme } from '@/shared/theme/theme';

type Props = {
  url: string;
  onReady: () => void;
  onSelection: (selection: MapSelection) => void;
  onFailure: () => void;
  previewRef: React.RefObject<((point: MapCoordinates | null) => void) | null>;
};

const openGoogleInformation = (value: string) => {
  try {
    const url = new URL(value);
    if (
      url.protocol === 'https:' &&
      (url.hostname === 'google.com' || url.hostname.endsWith('.google.com'))
    ) {
      Linking.openURL(value).catch(error =>
        showError(error, 'Nu am putut deschide pagina Google.'),
      );
    }
  } catch {
    return;
  }
};

export function EventMapWebView({
  url,
  onReady,
  onSelection,
  onFailure,
  previewRef,
}: Props) {
  const webView = useRef<WebView<object>>(null);
  const post = (command: Record<string, unknown>) =>
    webView.current?.injectJavaScript(
      `window.eventMapPickerReceive(${JSON.stringify(command)}); true;`,
    );
  const preview = (point: MapCoordinates | null) =>
    post(point ? { type: 'show_point', ...point } : { type: 'clear_point' });
  return (
    <WebView<object>
      accessibilityLabel="Selectorul locației evenimentului în Bihor"
      allowFileAccess={false}
      allowFileAccessFromFileURLs={false}
      allowUniversalAccessFromFileURLs={false}
      geolocationEnabled={false}
      mixedContentMode="never"
      onError={onFailure}
      onHttpError={event => {
        if (isMapSelectorDocumentUrl(event.nativeEvent.url, url)) onFailure();
      }}
      onContentProcessDidTerminate={onFailure}
      onRenderProcessGone={() => {
        onFailure();
        return true;
      }}
      onMessage={event => {
        if (
          !isMapSelectorMessageSource(event.nativeEvent.url, url, Platform.OS)
        )
          return;
        let parsed: unknown;
        try {
          parsed = JSON.parse(event.nativeEvent.data);
        } catch {
          return;
        }
        const result = mapPickerMessageSchema.safeParse(parsed);
        if (!result.success) return;
        const message = result.data;
        if (message.type === 'ready') {
          previewRef.current = preview;
          post({
            type: 'theme',
            text: theme.colors.text,
            background: theme.colors.background,
            spacing: theme.spacing.md,
          });
          onReady();
        } else if (message.type === 'load_error') onFailure();
        else
          onSelection(
            message.type === 'place_selected'
              ? { place_id: message.place_id }
              : { latitude: message.latitude, longitude: message.longitude },
          );
      }}
      onOpenWindow={event => openGoogleInformation(event.nativeEvent.targetUrl)}
      onShouldStartLoadWithRequest={request => {
        if (request.url === url && isTrustedMapSelectorUrl(request.url))
          return true;
        if (request.isTopFrame === false && request.url.startsWith('https://'))
          return true;
        openGoogleInformation(request.url);
        return false;
      }}
      originWhitelist={
        isTrustedMapSelectorUrl(url)
          ? ['https://*', new URL(url).origin]
          : ['https://*']
      }
      ref={webView}
      source={{ uri: url }}
      style={styles.map}
      thirdPartyCookiesEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  map: { flex: 1, backgroundColor: theme.colors.background },
});
