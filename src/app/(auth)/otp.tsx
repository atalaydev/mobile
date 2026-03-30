import { Text } from "@/components/Text";
import { OtpInput } from "@/components/OtpInput";
import { useAuth } from "@/contexts/AuthContext";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { parsePhoneNumber } from "libphonenumber-js";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const RESEND_COOLDOWN = 60;

export default function OtpScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { sendOtp, verifyOtp } = useAuth();
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);

  const formattedPhone = useMemo(() => {
    try {
      return parsePhoneNumber(phone!).formatInternational();
    } catch {
      return phone;
    }
  }, [phone]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleVerify = useCallback(async () => {
    if (otp.length < 6) return;
    setLoading(true);
    try {
      await verifyOtp(phone!, otp);
    } catch (error) {
      Alert.alert("Hata", (error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [otp, phone, verifyOtp]);

  const handleResend = useCallback(async () => {
    setResending(true);
    try {
      await sendOtp(phone!);
      setOtp("");
      setCooldown(RESEND_COOLDOWN);
      Alert.alert("Başarılı", "Doğrulama kodu tekrar gönderildi.");
    } catch (error) {
      Alert.alert("Hata", (error as Error).message);
    } finally {
      setResending(false);
    }
  }, [phone, sendOtp]);

  const resendDisabled = cooldown > 0 || resending;

  return (
    <View style={styles.root}>
        <Image
          source={require("@/assets/images/clover.svg")}
          style={styles.clover}
          contentFit="contain"
        />
        <SafeAreaView style={styles.flex}>
          <View style={styles.inner}>
            <View style={styles.mainCard}>
              <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
                Telefon Numaranı Doğrula
              </Text>

              <Text style={styles.description}>
                Lütfen{" "}
                <Text style={styles.phoneLink} onPress={() => router.back()}>{formattedPhone}</Text>
                {" "}numarasına gönderilen 6 haneli doğrulama kodunu giriniz.
              </Text>

              <OtpInput value={otp} onChangeText={setOtp} />

              <TouchableOpacity
                style={[styles.button, otp.length < 6 && styles.buttonDisabled]}
                onPress={handleVerify}
                disabled={loading || otp.length < 6}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Doğrula</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResend}
                disabled={resendDisabled}
              >
                <Text style={[styles.linkText, resendDisabled && styles.linkTextDisabled]}>
                  {resending
                    ? "Gönderiliyor..."
                    : cooldown > 0
                      ? `Kod ulaşmadı mı? ${cooldown} saniye sonra gönderilebilir.`
                      : "Kod ulaşmadı mı? Tekrar Gönder"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
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
    top: "45%",
  },
  flex: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: "10%",
  },
  mainCard: {
    backgroundColor: "#FBFCF4",
    borderRadius: 24,
    padding: 28,
    gap: 20,
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
    lineHeight: 24,
  },
  phoneLink: {
    fontFamily: "Inter_600SemiBold",
    color: "#336B57",
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
  linkText: {
    color: "#336B57",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  linkTextDisabled: {
    opacity: 0.5,
  },
});
