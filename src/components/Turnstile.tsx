import { useCallback, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

type TurnstileProps = {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: (error: string) => void;
};

const getHtml = (siteKey: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onLoad" async defer></script>
  <script>
    function onLoad() {
      turnstile.render('#container', {
        sitekey: '${siteKey}',
        size: 'invisible',
        callback: function(token) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'success', token: token }));
        },
        'error-callback': function(error) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', error: error }));
        },
      });

      new ResizeObserver(function() {
        var h = document.body.scrollHeight;
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'resize', height: h }));
      }).observe(document.body);
    }
  </script>
  <style>
    body { margin: 0; display: flex; justify-content: center; align-items: center; background: transparent; }
  </style>
</head>
<body>
  <div id="container"></div>
</body>
</html>
`;

export function Turnstile({ siteKey, onVerify, onError }: TurnstileProps) {
  const webViewRef = useRef<WebView>(null);
  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "success") {
        onVerify(data.token);
      } else if (data.type === "error" && onError) {
        onError(data.error);
      }
    },
    [onVerify, onError]
  );

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: getHtml(siteKey) }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        onMessage={handleMessage}
        scrollEnabled={false}
        originWhitelist={["*"]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 0,
    overflow: "hidden",
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
