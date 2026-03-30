import { OtpInput } from "@/components/OtpInput";
import { Text } from "@/components/Text";
import { colors } from "@/constants/colors";
import { RESEND_COOLDOWN_SECONDS } from "@/constants/config";
import { useAuth } from "@/contexts/AuthContext";
import * as Burnt from "burnt";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { parsePhoneNumber } from "libphonenumber-js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OtpScreen() {
  const { t } = useTranslation();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { sendOtp, verifyOtp } = useAuth();
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

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
    } catch {
      Burnt.toast({
        title: t("otp.verifyFailed"),
        message: t("otp.verifyFailedMessage"),
        preset: "error",
        haptic: "error",
        from: "bottom",
      });
    } finally {
      setLoading(false);
    }
  }, [otp, phone, verifyOtp, t]);

  const handleResend = useCallback(async () => {
    setResending(true);
    try {
      await sendOtp(phone!);
      setOtp("");
      setCooldown(RESEND_COOLDOWN_SECONDS);
      Burnt.toast({
        title: t("otp.resendSuccess"),
        preset: "done",
        haptic: "success",
        from: "bottom",
      });
    } catch {
      Burnt.toast({
        title: t("otp.resendFailed"),
        preset: "error",
        haptic: "error",
        from: "bottom",
      });
    } finally {
      setResending(false);
    }
  }, [phone, sendOtp, t]);

  const resendDisabled = cooldown > 0 || resending;

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

              <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
                {t("otp.title")}
              </Text>

              <Text style={styles.description}>
                {t("otp.description", { phone: formattedPhone })}
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
                  <Text style={styles.buttonText}>{t("otp.verify")}</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResend}
                disabled={resendDisabled}
              >
                <Text style={[styles.resendText, resendDisabled && styles.resendTextDisabled]}>
                  {resending
                    ? t("otp.resending")
                    : cooldown > 0
                      ? t("otp.resendCooldown", { seconds: cooldown })
                      : <>{t("otp.resend")}<Text style={styles.resendBold}>{t("otp.resendAction")}</Text></>}
                </Text>
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
    top: "45%",
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
    textAlign: "center",
    lineHeight: 24,
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
  resendButton: {
    alignItems: "center",
  },
  resendText: {
    color: colors.link,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  resendTextDisabled: {
    opacity: 0.5,
  },
  resendBold: {
    fontFamily: "Inter_700Bold",
  },
});
