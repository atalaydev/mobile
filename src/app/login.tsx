import { Text } from "@/components/Text";
import { Turnstile } from "@/components/Turnstile";
import { useAuth } from "@/contexts/AuthContext";
import { Image } from "expo-image";
import { PhoneInput } from "@/components/PhoneInput";
import { isValidPhoneNumber } from "libphonenumber-js";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TURNSTILE_SITE_KEY = process.env.EXPO_PUBLIC_TURNSTILE_SITE_KEY!;

export default function LoginScreen() {
  const { sendOtp, verifyOtp } = useAuth();
  const [phone, setPhone] = useState("");
  const [fullPhone, setFullPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | undefined>(undefined);

  const handleSendOtp = async () => {
    if (!turnstileToken) {
      Alert.alert("Hata", "Doğrulama bekleniyor, lütfen bekleyin.");
      return;
    }
    if (!isValidPhoneNumber(fullPhone)) {
      setPhoneError("Geçerli bir telefon numarası girin.");
      return;
    }
    setPhoneError(undefined);
    setLoading(true);
    try {
      await sendOtp(fullPhone);
      setOtpSent(true);
    } catch (error) {
      Alert.alert("Hata", (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      await verifyOtp(fullPhone, otp);
    } catch (error) {
      Alert.alert("Hata", (error as Error).message);
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
            <View style={styles.mainCard}>
              <Image
                source={require("@/assets/images/logo-icon.svg")}
                style={styles.logo}
                contentFit="contain"
              />

              <Text style={styles.title}>
                Miboso Dünyasına{"\n"}Hoş Geldin!
              </Text>

              <Text style={styles.description}>
                Etkinliklerini takip etmek, faydalı içerikleri tüketmek ve
                keşfetmek için uygulamaya giriş yapabilirsiniz. Telefon
                numaranız ile hızlıca giriş yapabilirsiniz.
              </Text>

              <PhoneInput
                value={phone}
                onChangeText={(t) => { setPhone(t); setPhoneError(undefined); }}
                onChangeFullNumber={setFullPhone}
                disabled={otpSent}
                error={phoneError}
              />

              {otpSent && (
                <TextInput
                  style={styles.otpInput}
                  placeholder="Doğrulama kodu"
                  placeholderTextColor="#999"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              )}

              {!otpSent && (
                <Turnstile
                  siteKey={TURNSTILE_SITE_KEY}
                  onVerify={setTurnstileToken}
                  onError={(error) => Alert.alert("Turnstile Hata", error)}
                />
              )}

              <TouchableOpacity
                style={[
                  styles.button,
                  !otpSent && !turnstileToken && styles.buttonDisabled,
                ]}
                onPress={otpSent ? handleVerifyOtp : handleSendOtp}
                disabled={loading || (!otpSent && !turnstileToken)}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>
                    {otpSent ? "Doğrula" : "Giriş Yap"}
                  </Text>
                )}
              </TouchableOpacity>

              {otpSent && (
                <TouchableOpacity
                  style={styles.resendButton}
                  onPress={() => {
                    setOtpSent(false);
                    setOtp("");
                    setTurnstileToken(null);
                  }}
                >
                  <Text style={styles.resendText}>Numarayı değiştir</Text>
                </TouchableOpacity>
              )}
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
    backgroundColor: "#E2EBB7",
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
  mainCard: {
    backgroundColor: "#FBFCF4",
    borderRadius: 24,
    padding: 28,
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
    color: "#183228",
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#5E5F5E",
    textAlign: "center",
    lineHeight: 20,
  },
  otpInput: {
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#333",
    borderWidth: 1,
    borderColor: "#E8EBEA",
  },
  button: {
    height: 50,
    backgroundColor: "#336B57",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#FCFCFC",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  resendButton: {
    alignItems: "center",
  },
  resendText: {
    color: "#336B57",
    fontSize: 14,
  },
});
