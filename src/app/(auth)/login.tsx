import { Checkbox } from "@/components/Checkbox";
import { PhoneInput } from "@/components/PhoneInput";
import { Text } from "@/components/Text";
import { Turnstile } from "@/components/Turnstile";
import { colors } from "@/constants/colors";
import { TURNSTILE_SITE_KEY } from "@/constants/config";
import { useAuth } from "@/contexts/AuthContext";
import * as Burnt from "burnt";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { isValidPhoneNumber } from "libphonenumber-js";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const { sendOtp } = useAuth();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [fullPhone, setFullPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | undefined>();

  const [isNewUser, setIsNewUser] = useState(false);
  const [termsConsent, setTermsConsent] = useState(false);
  const [termsError, setTermsError] = useState(false);

  const handleSubmit = async () => {
    if (!isValidPhoneNumber(fullPhone)) {
      setPhoneError("Geçerli bir telefon numarası girin.");
      return;
    }
    if (isNewUser && !termsConsent) {
      setTermsError(true);
      return;
    }
    setPhoneError(undefined);
    setTermsError(false);
    setLoading(true);
    try {
      await sendOtp(fullPhone, { shouldCreateUser: isNewUser });
      router.push({ pathname: "/otp", params: { phone: fullPhone } });
    } catch (error) {
      const message = (error as Error).message;
      if (!isNewUser && (message.toLowerCase().includes("user not found") || message.toLowerCase().includes("signups not allowed"))) {
        setIsNewUser(true);
        Burnt.toast({
          title: "Hesap bulunamadı!",
          message: "Kayıt için koşulları kabul et.",
          preset: "custom",
          icon: { ios: { name: "exclamationmark.triangle.fill", color: "#FF9500" } },
          haptic: "warning",
        });
      } else {
        Alert.alert("Hata", message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <Image
        source={require("@/assets/images/clover.svg")}
        style={styles.clover}
        contentFit="contain"
      />
      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.inner}>
            <View style={styles.card}>
              <Image
                source={require("@/assets/images/logo-icon.svg")}
                style={styles.logo}
                contentFit="contain"
              />

              <Text style={styles.title}>Miboso Dünyasına{"\n"}Hoş Geldin!</Text>

              <Text style={styles.description}>
                Etkinliklerini takip etmek, faydalı içerikleri tüketmek ve
                keşfetmek için uygulamaya giriş yapabilirsiniz. Telefon
                numaranız ile hızlıca giriş yapabilirsiniz.
              </Text>

              <PhoneInput
                value={phone}
                onChangeText={(t) => { setPhone(t); setPhoneError(undefined); }}
                onChangeFullNumber={setFullPhone}
                error={phoneError}
              />

              {isNewUser && (
                <Checkbox
                  checked={termsConsent}
                  onToggle={() => { setTermsConsent(!termsConsent); setTermsError(false); }}
                  error={termsError}
                >
                  <Text style={styles.consentText}>
                    <Text
                      style={styles.consentLink}
                      onPress={() => Linking.openURL("https://mibosowellbeing.com/tr/gizlilik/sozlesme")}
                    >
                      Kullanım Koşulları
                    </Text>
                    {" ve "}
                    <Text
                      style={styles.consentLink}
                      onPress={() => Linking.openURL("https://mibosowellbeing.com/tr/gizlilik/aydinlatma-metni")}
                    >
                      Aydınlatma Metni
                    </Text>
                    'ni kabul ediyorum.
                  </Text>
                </Checkbox>
              )}

              <Turnstile
                siteKey={TURNSTILE_SITE_KEY}
                onVerify={setTurnstileToken}
                onError={(err) => Alert.alert("Turnstile Hata", err)}
              />

              <TouchableOpacity
                style={[styles.button, !turnstileToken && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={loading || !turnstileToken}
              >
                {loading || !turnstileToken ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>{isNewUser ? "Kayıt Ol" : "Giriş Yap"}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: "hidden",
  },
  clover: {
    position: "absolute",
    width: 250,
    height: 250,
    opacity: 0.05,
    right: -20,
    top: "60%",
  },
  flex: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: "10%",
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 20,
    gap: 16,
  },
  logo: {
    width: 64,
    height: 64,
    alignSelf: "center",
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_500Medium",
    color: colors.text,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "justify",
    lineHeight: 20,
  },
  consentText: {
    fontSize: 11,
    lineHeight: 16,
    color: colors.textSecondary,
    textAlign: "justify",
  },
  consentLink: {
    color: colors.link,
    fontFamily: "Inter_500Medium",
    textDecorationLine: "underline",
  },
  button: {
    height: 50,
    backgroundColor: colors.primary,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.textLight,
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
