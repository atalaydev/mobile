import { cancelAppointment, getAppointmentDocumentUrl, joinAppointment, submitAppointmentReview } from "@/api/appointments";
import { useAppointments } from "@/hooks/queries/useAppointments";
import { usePayment } from "@/hooks/queries/usePayment";
import { useSessionOption } from "@/hooks/queries/useSessionOption";
import { useAuth } from "@/contexts/AuthContext";
import { Text } from "@/components/Text";
import { colors } from "@/constants/colors";
import { useCountdown } from "@/hooks/useCountdown";
import { Appointment } from "@/types/appointment";
import { Document } from "@/types/eventParticipation";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import i18n from "i18next";
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, Linking, Pressable, RefreshControl, ScrollView, StyleSheet, TextInput, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SessionDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id, paymentId } = useLocalSearchParams<{ id: string; paymentId: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [sessionTab, setSessionTab] = useState<"planned" | "past" | "unscheduled">("planned");
  const docsSheetRef = useRef<BottomSheet>(null);
  const [docLoading, setDocLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const actionsSheetRef = useRef<BottomSheet>(null);
  const cardActionsSheetRef = useRef<BottomSheet>(null);
  const [cardActionsShowHelp, setCardActionsShowHelp] = useState(false);
  const [cardActionsAppointmentId, setCardActionsAppointmentId] = useState<string | null>(null);
  const sessionDocsSheetRef = useRef<BottomSheet>(null);
  const [sessionDocsSheetData, setSessionDocsSheetData] = useState<{ appointmentId: string; docs: Document[] } | null>(null);
  const cancelSheetRef = useRef<BottomSheet>(null);
  const reviewSheetRef = useRef<BottomSheet>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelTargetIds, setCancelTargetIds] = useState<string[]>([]);
  const [cancelling, setCancelling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { data: sessionOption, isLoading, refetch: refetchSessionOption } = useSessionOption(id);
  const { data: appointments, refetch: refetchAppointments } = useAppointments({
    query: { filters: { payment: paymentId }, limit: 100, sort: "start_date" },
    enabled: !!paymentId,
  });
  const { data: payment } = usePayment(paymentId);

  const expert = sessionOption && typeof sessionOption.expert === "object" ? sessionOption.expert : null;
  const locale = i18n.language === "tr" ? "tr-TR" : "en-US";
  const isPhysical = sessionOption?.location === 2;

  const sessionLocationLabel = () => {
    if (isPhysical) {
      const parts = [sessionOption?.address, sessionOption?.district, sessionOption?.city].filter(Boolean);
      return parts.length > 0 ? parts.join(", ") : t("locationType.inPerson");
    }
    return t("locationType.remote");
  };

  const { next, past, planned, unscheduled, sessionNumbers } = useMemo(() => {
    if (!appointments) return { next: null, past: [], planned: [], unscheduled: [], sessionNumbers: new Map<string, number>() };
    const now = Date.now();

    const unscheduledSessions = appointments.filter((a) => !a.start_date);

    const sorted = [...appointments]
      .filter((a) => a.start_date && a.end_date)
      .sort((a, b) => new Date(a.start_date!).getTime() - new Date(b.start_date!).getTime());

    let nextSession: Appointment | null = null;
    const pastSessions: Appointment[] = [];
    const plannedSessions: Appointment[] = [];

    for (const a of sorted) {
      const end = new Date(a.end_date!).getTime();
      if (end < now) {
        pastSessions.push(a);
      } else if (!nextSession) {
        nextSession = a;
      } else {
        plannedSessions.push(a);
      }
    }

    const nums = new Map<string, number>();
    sorted.forEach((a, i) => nums.set(a.id, i + 1));

    return { next: nextSession, past: pastSessions.reverse(), planned: plannedSessions, unscheduled: unscheduledSessions, sessionNumbers: nums };
  }, [appointments]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchSessionOption(), refetchAppointments()]);
    setRefreshing(false);
  };

  const allDocs = useMemo(() => {
    const raw = appointments?.flatMap((a) => a.docs ?? []) ?? [];
    const seen = new Set<string>();
    return raw.filter((d) => {
      const k = `${d.type}-${d.key}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, [appointments]);

  const isAppointmentCancellable = (a: Appointment) => {
    if (a.status < 0) return false;
    if (!a.start_date) return true;
    return new Date(a.start_date).getTime() - Date.now() > 24 * 60 * 60 * 1000;
  };

  const cancellableIds = useMemo(() =>
    (appointments ?? []).filter(isAppointmentCancellable).map((a) => a.id),
  [appointments]);

  const canCancel = cancellableIds.length > 0;

  const nextStartDate = next?.start_date ? new Date(next.start_date) : new Date(0);
  const { long: countdownText, remainingMs } = useCountdown(nextStartDate, t);
  const canJoin = remainingMs <= 10 * 60 * 1000;

  const formatSessionDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const handleJoin = async (appointmentId: string) => {
    setJoining(true);
    try {
      const credentials = await joinAppointment(appointmentId);
      const userName = user?.user_metadata?.full_name ?? `*****${user?.phone?.slice(-4)}`;
      router.push({ pathname: "/zoom", params: { token: credentials.token, id: credentials.id, password: credentials.password, userName } });
    } catch (e) {
      console.error("join failed:", e);
    } finally {
      setJoining(false);
    }
  };

  const handleOpenDoc = async (doc: Document) => {
    const aid = sessionDocsSheetData?.appointmentId ?? appointments?.[0]?.id;
    if (!aid) return;
    setDocLoading(true);
    try {
      const url = await getAppointmentDocumentUrl(aid, doc.key, doc.type === "video");
      if (doc.type === "video") {
        router.push({ pathname: "/watch", params: { uri: url } });
      } else {
        WebBrowser.openBrowserAsync(url);
      }
    } catch (err) {
      console.error("[Document] error:", err);
    } finally {
      setDocLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim() || !cancelTargetIds.length) return;
    setCancelling(true);
    try {
      await cancelAppointment(cancelTargetIds, cancelReason.trim());
      cancelSheetRef.current?.close();
      setCancelReason("");
      await refetchAppointments();
      Alert.alert(t("library.cancelSuccess"));
    } catch (e) {
      Alert.alert(t("common.error"), t("library.cancelFailed"));
    } finally {
      setCancelling(false);
    }
  };

  const handleSubmitReview = async () => {
    const appointmentId = appointments?.[0]?.id;
    if (!appointmentId) return;
    setSubmittingReview(true);
    try {
      await submitAppointmentReview(appointmentId, rating, reviewText);
      await refetchAppointments();
      reviewSheetRef.current?.close();
    } catch {
      Alert.alert(t("common.error"), t("library.cancelFailed"));
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderDocs = (docs: Document[]) => (
    <View>
      {docs.map((doc, i) => (
        <View key={`${doc.type}-${doc.key}`}>
          {i > 0 && <View style={styles.actionDivider} />}
          <Pressable style={styles.actionItem} onPress={() => handleOpenDoc(doc)}>
            <SymbolView name={doc.type === "video" ? "play.circle" : "doc.text"} size={20} tintColor="#183228" />
            <Text style={styles.actionItemText} numberOfLines={1}>{doc.name}</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {docLoading && (
        <View style={styles.docLoadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={{ paddingRight: 4 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>
          {sessionOption?.banner && (
            <View style={styles.bannerContainer}>
              <Image source={{ uri: sessionOption.banner }} style={styles.banner} contentFit="cover" />
              <Pressable style={styles.backButton} onPress={() => router.back()}>
                <SymbolView name="chevron.left" size={18} tintColor="#fff" />
              </Pressable>
            </View>
          )}

          <View style={styles.topSection}>
            <Text style={styles.title}>{sessionOption?.title}</Text>

            <Pressable style={styles.detailsToggle} onPress={() => setDetailsExpanded((v) => !v)}>
              <Text style={styles.detailsToggleText}>{t("library.details")}</Text>
              <SymbolView name={detailsExpanded ? "chevron.up" : "chevron.down"} size={14} tintColor={colors.primary} />
            </Pressable>

            {detailsExpanded && (
              <View style={styles.accordionContent}>
                {sessionOption?.description && (
                  <Text style={styles.description}>{sessionOption.description}</Text>
                )}
              </View>
            )}

            {expert && (
              <View style={styles.expertCard}>
                <View style={styles.expertRow}>
                  <View>
                    <Text style={styles.expertSubtitle}>{expert.subtitle || t("agenda.expert")}</Text>
                    <Text style={styles.expertName}>{expert.title}</Text>
                  </View>
                  <Image source={{ uri: expert.photo }} style={styles.expertAvatar} />
                </View>
              </View>
            )}

            {appointments?.some((a) => a.end_date && new Date(a.end_date).getTime() < Date.now()) && (
            <View style={styles.reviewCard}>
              <View style={styles.reviewRow}>
                <View>
                  <Text style={styles.reviewLabel}>{t("library.rate")}</Text>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Pressable key={star} onPress={() => setRating(star)} disabled={appointments?.some((a) => a.is_reviewed)}>
                        <Star filled={star <= rating} size={24} />
                      </Pressable>
                    ))}
                  </View>
                </View>
                <Pressable style={[styles.reviewProceedButton, rating === 0 && { opacity: 0.5 }]} onPress={() => reviewSheetRef.current?.expand()} disabled={rating === 0 || appointments?.some((a) => a.is_reviewed)}>
                  <Text style={styles.reviewProceedText}>{t("library.proceed")}</Text>
                </Pressable>
              </View>
              {appointments?.some((a) => a.is_reviewed) && (
                <View style={styles.reviewOverlay}>
                  <BlurView intensity={15} tint="light" style={StyleSheet.absoluteFill} />
                  <View style={styles.reviewThanksRow}>
                    <SymbolView name="checkmark.circle.fill" size={20} tintColor={colors.primary} />
                    <Text style={styles.reviewThanksText}>{t("library.reviewThanks")}</Text>
                  </View>
                </View>
              )}
            </View>
            )}

            <View style={styles.docsRow}>
              <Pressable style={styles.docsButton} onPress={() => docsSheetRef.current?.expand()}>
                <Text style={styles.docsButtonText}>{t("library.documents")}</Text>
              </Pressable>
              <Pressable style={styles.moreButton} onPress={() => actionsSheetRef.current?.expand()}>
                <SymbolView name="ellipsis" size={20} tintColor="#336B57" />
              </Pressable>
            </View>
          </View>

          <View style={styles.bottomSection}>
            {next && (
              <View style={styles.sessionGroup}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionBar} />
                  <Text style={styles.sectionTitle}>{t("session.next")}</Text>
                </View>
                <View style={styles.sessionCard}>
                  <View style={styles.sessionBadge}>
                    <Text style={styles.sessionBadgeText}>{t("session.current", { current: sessionNumbers.get(next.id) })}</Text>
                  </View>
                  <Text style={styles.sessionDate}>{formatSessionDate(next.start_date!)}</Text>
                  <Text style={styles.sessionTitle}>{sessionOption?.title}</Text>
                  <View style={styles.sessionLocationRow}>
                    <SymbolView name="mappin.and.ellipse" size={14} tintColor={colors.primary} />
                    <Text style={styles.sessionLocation}>{sessionLocationLabel()}</Text>
                  </View>
                  <View style={styles.docsRow}>
                    {!isPhysical && (
                      <Pressable
                        style={[styles.sessionButton, { flex: 1 }, !canJoin && styles.sessionButtonDisabled]}
                        disabled={!canJoin || joining}
                        onPress={() => handleJoin(next.id)}
                      >
                        {joining ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text style={styles.sessionButtonText}>
                            {canJoin ? t("session.join") : countdownText ? t("agenda.startsIn", { time: countdownText }) : t("session.join")}
                          </Text>
                        )}
                      </Pressable>
                    )}
                    <Pressable style={styles.moreButton} onPress={() => { setCardActionsAppointmentId(next.id); setCardActionsShowHelp(true); cardActionsSheetRef.current?.expand(); }}>
                      <SymbolView name="ellipsis" size={20} tintColor="#336B57" />
                    </Pressable>
                  </View>
                </View>
              </View>
            )}

            <Text style={styles.sectionTitle}>{t("session.title")}</Text>

            <View style={styles.sessionTabs}>
              {unscheduled.length > 0 && (
                <Pressable
                  style={[styles.sessionTabButton, sessionTab === "unscheduled" && styles.sessionTabButtonActive]}
                  onPress={() => setSessionTab("unscheduled")}
                >
                  <Text style={[styles.sessionTabText, sessionTab === "unscheduled" && styles.sessionTabTextActive]}>
                    {t("session.unscheduled")}
                  </Text>
                </Pressable>
              )}
              <Pressable
                style={[styles.sessionTabButton, sessionTab === "planned" && styles.sessionTabButtonActive]}
                onPress={() => setSessionTab("planned")}
              >
                <Text style={[styles.sessionTabText, sessionTab === "planned" && styles.sessionTabTextActive]}>
                  {t("session.planned")}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.sessionTabButton, sessionTab === "past" && styles.sessionTabButtonActive]}
                onPress={() => setSessionTab("past")}
              >
                <Text style={[styles.sessionTabText, sessionTab === "past" && styles.sessionTabTextActive]}>
                  {t("session.past")}
                </Text>
              </Pressable>
            </View>

            {sessionTab === "unscheduled" && unscheduled.map((a) => (
              <View key={a.id} style={styles.sessionCard}>
                <Text style={styles.sessionTitle}>{sessionOption?.title}</Text>
                <View style={styles.sessionLocationRow}>
                  <SymbolView name="mappin.and.ellipse" size={14} tintColor={colors.primary} />
                  <Text style={styles.sessionLocation}>{sessionLocationLabel()}</Text>
                </View>
                {sessionOption?.duration != null && (
                  <View style={styles.sessionLocationRow}>
                    <SymbolView name="clock" size={14} tintColor={colors.primary} />
                    <Text style={styles.sessionLocation}>{t("session.duration", { count: sessionOption.duration })}</Text>
                  </View>
                )}
                <View style={styles.docsRow}>
                  <Pressable style={[styles.sessionButton, { flex: 1 }]} onPress={() => router.push(`/schedule/${id}/${a.id}`)}>
                    <Text style={styles.sessionButtonText}>{t("session.scheduleDate")}</Text>
                  </Pressable>
                  <Pressable style={styles.moreButton} onPress={() => { setCardActionsAppointmentId(a.id); setCardActionsShowHelp(true); cardActionsSheetRef.current?.expand(); }}>
                    <SymbolView name="ellipsis" size={20} tintColor="#336B57" />
                  </Pressable>
                </View>
              </View>
            ))}

            {sessionTab === "planned" && planned.length === 0 && (
              <View style={styles.emptyContainer}>
                <SymbolView name="calendar.badge.clock" size={36} tintColor="#C1D5CE" />
                <Text style={styles.emptyText}>{t("session.emptyPlanned")}</Text>
              </View>
            )}

            {sessionTab === "planned" && planned.map((a) => (
              <View key={a.id} style={styles.sessionCard}>
                <View style={styles.sessionBadge}>
                  <Text style={styles.sessionBadgeText}>{t("session.current", { current: sessionNumbers.get(a.id) })}</Text>
                </View>
                <Text style={styles.sessionDate}>{formatSessionDate(a.start_date!)}</Text>
                <Text style={styles.sessionTitle}>{sessionOption?.title}</Text>
                <View style={styles.sessionLocationRow}>
                  <SymbolView name="mappin.and.ellipse" size={14} tintColor={colors.primary} />
                  <Text style={styles.sessionLocation}>{sessionLocationLabel()}</Text>
                </View>
                {sessionOption?.duration != null && (
                  <View style={styles.sessionLocationRow}>
                    <SymbolView name="clock" size={14} tintColor={colors.primary} />
                    <Text style={styles.sessionLocation}>{t("session.duration", { count: sessionOption.duration })}</Text>
                  </View>
                )}
                <View style={styles.docsRow}>
                  <Pressable style={[styles.sessionButton, { flex: 1 }]} onPress={() => { cardActionsSheetRef.current?.close(); Linking.openURL("https://wa.me/905317245599"); }}>
                    <Text style={styles.sessionButtonText}>{t("library.getHelp")}</Text>
                  </Pressable>
                  <Pressable style={styles.moreButton} onPress={() => { setCardActionsAppointmentId(a.id); setCardActionsShowHelp(false); cardActionsSheetRef.current?.expand(); }}>
                    <SymbolView name="ellipsis" size={20} tintColor="#336B57" />
                  </Pressable>
                </View>
              </View>
            ))}

            {sessionTab === "past" && past.length === 0 && (
              <View style={styles.emptyContainer}>
                <SymbolView name="clock.arrow.circlepath" size={36} tintColor="#C1D5CE" />
                <Text style={styles.emptyText}>{t("session.emptyPast")}</Text>
              </View>
            )}

            {sessionTab === "past" && past.map((a) => (
              <View key={a.id} style={styles.sessionCard}>
                <View style={styles.sessionBadge}>
                  <Text style={styles.sessionBadgeText}>{t("session.current", { current: sessionNumbers.get(a.id) })}</Text>
                </View>
                <Text style={styles.sessionDate}>{formatSessionDate(a.start_date!)}</Text>
                <Text style={styles.sessionTitle}>{sessionOption?.title}</Text>
                <View style={styles.sessionLocationRow}>
                  <SymbolView name="mappin.and.ellipse" size={14} tintColor={colors.primary} />
                  <Text style={styles.sessionLocation}>{sessionLocationLabel()}</Text>
                </View>
                {sessionOption?.duration != null && (
                  <View style={styles.sessionLocationRow}>
                    <SymbolView name="clock" size={14} tintColor={colors.primary} />
                    <Text style={styles.sessionLocation}>{t("session.duration", { count: sessionOption.duration })}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      <BottomSheet ref={sessionDocsSheetRef} index={-1} enableDynamicSizing enablePanDownToClose backdropComponent={(props) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />} backgroundStyle={styles.actionSheetBackground} handleIndicatorStyle={styles.actionHandleBar}>
        <BottomSheetView style={(sessionDocsSheetData?.docs.length ?? 0) === 0 ? styles.actionSheetContentEmpty : styles.actionSheetContent}>
          {(sessionDocsSheetData?.docs.length ?? 0) === 0 ? (
            <Text style={styles.emptyText}>{t("library.emptyDocuments")}</Text>
          ) : (
            renderDocs(sessionDocsSheetData?.docs ?? [])
          )}
        </BottomSheetView>
      </BottomSheet>

      <BottomSheet ref={docsSheetRef} index={-1} enableDynamicSizing enablePanDownToClose backdropComponent={(props) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />} backgroundStyle={styles.actionSheetBackground} handleIndicatorStyle={styles.actionHandleBar}>
        <BottomSheetView style={allDocs.length === 0 ? styles.actionSheetContentEmpty : styles.actionSheetContent}>
          {allDocs.length === 0 ? (
            <Text style={styles.emptyText}>{t("library.emptyDocuments")}</Text>
          ) : (
            renderDocs(allDocs)
          )}
        </BottomSheetView>
      </BottomSheet>

      <BottomSheet ref={reviewSheetRef} index={-1} enableDynamicSizing enablePanDownToClose backdropComponent={(props) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />} backgroundStyle={styles.actionSheetBackground} handleIndicatorStyle={styles.actionHandleBar}>
        <BottomSheetView style={styles.reviewSheetContent}>
          <Text style={styles.cancelSheetTitle}>{t("library.rate")}</Text>
          <Text style={styles.reviewModalLabel}>{t("library.score")}</Text>
          <View style={styles.starsRowLarge}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable key={star} onPress={() => setRating(star)}>
                <Star filled={star <= rating} size={40} />
              </Pressable>
            ))}
          </View>
          <Text style={styles.reviewModalLabel}>{t("library.addComment")}</Text>
          <TextInput style={styles.reviewInput} placeholder={t("library.commentPlaceholder")} placeholderTextColor="#999" multiline value={reviewText} onChangeText={setReviewText} />
          <View style={styles.reviewModalFooter}>
            <Pressable style={styles.reviewSubmitButton} onPress={handleSubmitReview} disabled={submittingReview}>
              {submittingReview ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.reviewSubmitText}>{t("library.submit")}</Text>}
            </Pressable>
          </View>
        </BottomSheetView>
      </BottomSheet>

      <BottomSheet ref={cardActionsSheetRef} index={-1} enableDynamicSizing enablePanDownToClose backdropComponent={(props) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />} backgroundStyle={styles.actionSheetBackground} handleIndicatorStyle={styles.actionHandleBar}>
        <BottomSheetView style={styles.actionSheetContent}>
          {cardActionsShowHelp && (
            <>
              <Pressable style={styles.actionItem} onPress={() => { cardActionsSheetRef.current?.close(); Linking.openURL("https://wa.me/905317245599"); }}>
                <SymbolView name="plus" size={20} tintColor="#183228" />
                <Text style={styles.actionItemText}>{t("library.getHelp")}</Text>
              </Pressable>
              <View style={styles.actionDivider} />
            </>
          )}
          <Pressable
            style={[styles.actionItem, !(appointments?.find((a) => a.id === cardActionsAppointmentId) && isAppointmentCancellable(appointments.find((a) => a.id === cardActionsAppointmentId)!)) && { opacity: 0.4 }]}
            onPress={() => {
              const a = appointments?.find((x) => x.id === cardActionsAppointmentId);
              if (!a || !isAppointmentCancellable(a)) return;
              setCancelTargetIds([a.id]);
              cardActionsSheetRef.current?.close();
              setTimeout(() => cancelSheetRef.current?.expand(), 300);
            }}
          >
            <SymbolView name="xmark.circle" size={20} tintColor="#183228" />
            <Text style={styles.actionItemText}>{t("library.cancel")}</Text>
          </Pressable>
        </BottomSheetView>
      </BottomSheet>

      <BottomSheet ref={cancelSheetRef} index={-1} enableDynamicSizing enablePanDownToClose backdropComponent={(props) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />} backgroundStyle={styles.actionSheetBackground} handleIndicatorStyle={styles.actionHandleBar}>
        <BottomSheetView style={styles.cancelSheetContent}>
          <Text style={styles.cancelSheetTitle}>{t("library.cancelConfirmTitle")}</Text>
          <Text style={styles.cancelSheetMessage}>{t("library.cancelConfirmMessage")}</Text>
          <TextInput style={styles.reviewInput} value={cancelReason} onChangeText={setCancelReason} placeholder={t("library.cancelReasonPlaceholder")} placeholderTextColor="#9DA8A3" multiline numberOfLines={4} />
          <View style={styles.cancelModalFooter}>
            <Pressable style={[styles.reviewSubmitButton, styles.cancelDismissButton]} onPress={() => cancelSheetRef.current?.close()}>
              <Text style={styles.cancelDismissText}>{t("library.cancelDismiss")}</Text>
            </Pressable>
            <Pressable style={[styles.reviewSubmitButton, styles.cancelConfirmButton, (!cancelReason.trim() || cancelling) && styles.reviewSubmitDisabled]} onPress={handleCancel} disabled={!cancelReason.trim() || cancelling}>
              <Text style={styles.cancelConfirmText}>{cancelling ? t("library.cancelling") : t("library.cancel")}</Text>
            </Pressable>
          </View>
        </BottomSheetView>
      </BottomSheet>

      <BottomSheet ref={actionsSheetRef} index={-1} enableDynamicSizing enablePanDownToClose backdropComponent={(props) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />} backgroundStyle={styles.actionSheetBackground} handleIndicatorStyle={styles.actionHandleBar}>
        <BottomSheetView style={styles.actionSheetContent}>
          <Pressable style={styles.actionItem} onPress={() => { actionsSheetRef.current?.close(); Linking.openURL("https://wa.me/905317245599"); }}>
            <SymbolView name="plus" size={20} tintColor="#183228" />
            <Text style={styles.actionItemText}>{t("library.getHelp")}</Text>
          </Pressable>
          <View style={styles.actionDivider} />
          <Pressable style={[styles.actionItem, !canCancel && { opacity: 0.4 }]} onPress={() => { if (!canCancel) return; setCancelTargetIds(cancellableIds); actionsSheetRef.current?.close(); setTimeout(() => cancelSheetRef.current?.expand(), 300); }}>
            <SymbolView name="xmark.circle" size={20} tintColor="#183228" />
            <Text style={styles.actionItemText}>{t("library.cancel")}</Text>
          </Pressable>
          <View style={styles.actionDivider} />
          <Pressable style={[styles.actionItem, !payment?.invoice_url && { opacity: 0.4 }]} onPress={() => { if (!payment?.invoice_url) return; actionsSheetRef.current?.close(); Linking.openURL(payment.invoice_url); }}>
            <SymbolView name="doc.text" size={20} tintColor="#183228" />
            <Text style={styles.actionItemText}>{t("library.viewInvoice")}</Text>
          </Pressable>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

function Star({ filled, size }: { filled: boolean; size: number }) {
  return (
    <View style={{ width: size, height: size }}>
      <SymbolView name="star.fill" size={size} tintColor={filled ? "#7AA394" : "#FCFCFC"} style={StyleSheet.absoluteFill} />
      <SymbolView name="star" size={size} tintColor={filled ? "#336B57" : "#CCCDCB"} style={StyleSheet.absoluteFill} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F4EC" },
  docLoadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(241,244,236,0.8)", alignItems: "center", justifyContent: "center", zIndex: 20 },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { flex: 1 },
  bannerContainer: { marginHorizontal: 20, marginBottom: 12 },
  banner: { height: 180, borderRadius: 16 },
  backButton: { position: "absolute", top: 12, left: 12, width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" },
  topSection: { backgroundColor: "#F1F4EC", padding: 20, paddingTop: 0, gap: 16 },
  bottomSection: { backgroundColor: "#FBFCF4", borderRadius: 24, padding: 20, paddingBottom: 40, gap: 16, flexGrow: 1 },
  sessionGroup: { gap: 12 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionBar: { width: 4, height: 24, borderRadius: 2, backgroundColor: colors.primary },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 20, color: "#183228" },
  sessionCard: { backgroundColor: "#fff", borderRadius: 16, borderWidth: 2, borderColor: "#E8EBEA", padding: 16, gap: 8 },
  sessionBadge: { position: "absolute", top: 12, right: 12, backgroundColor: "#F78F08", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  sessionBadgeText: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: "#fff" },
  sessionDate: { fontFamily: "Inter_400Regular", fontSize: 14, color: "#5E5F5E" },
  sessionTitle: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#183228" },
  sessionLocationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 },
  sessionLocation: { fontFamily: "Inter_400Regular", fontSize: 13, color: "#5E5F5E" },
  sessionTabs: { flexDirection: "row", backgroundColor: "#F1F4EC", borderWidth: 2, borderColor: "#E8EBEA", borderRadius: 28, padding: 4 },
  sessionTabButton: { flex: 1, borderRadius: 24, paddingVertical: 10, alignItems: "center" },
  sessionTabButtonActive: { backgroundColor: colors.primary },
  sessionTabText: { fontFamily: "Inter_500Medium", fontSize: 14, color: "#5E5F5E" },
  sessionTabTextActive: { fontFamily: "Inter_600SemiBold", color: "#fff" },
  sessionButton: { backgroundColor: "#336B57", borderRadius: 12, height: 40, alignItems: "center", justifyContent: "center", marginTop: 4 },
  sessionButtonDisabled: { opacity: 0.4 },
  sessionButtonText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#fff" },
  docsRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  docsButton: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary, borderRadius: 12, height: 40 },
  docsButtonText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#fff" },
  moreButton: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  infoRows: { gap: 12 },
  infoRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  infoIcon: { width: 20, height: 20 },
  infoContent: { flex: 1 },
  infoTitle: { fontFamily: "Inter_700Bold", fontSize: 14, color: "#336B57" },
  infoValue: { fontFamily: "Inter_400Regular", fontSize: 14, color: "#183228", lineHeight: 20, marginTop: 2 },
  emptyContainer: { alignItems: "center", gap: 12, paddingVertical: 32, backgroundColor: "#fff", borderRadius: 16, borderWidth: 2, borderColor: "#E8EBEA", borderStyle: "dashed" },
  emptyText: { fontFamily: "Inter_500Medium", fontSize: 14, color: "#5E5F5E" },
  title: { fontFamily: "Inter_700Bold", fontSize: 22, color: "#183228", lineHeight: 30 },
  expertRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  expertSubtitle: { fontFamily: "Inter_400Regular", fontSize: 13, color: "#5E5F5E" },
  expertName: { fontFamily: "Inter_600SemiBold", fontSize: 17, color: "#183228", marginTop: 2 },
  expertAvatar: { width: 88, height: 88, borderRadius: 44, borderWidth: 3, borderColor: "#D3E194" },
  expertCard: { backgroundColor: "#FBFCF4", borderRadius: 20, borderWidth: 1, borderColor: "#E8EBEA", padding: 20 },
  rateCard: { backgroundColor: "#FBFCF4", borderRadius: 20, borderWidth: 1, borderColor: "#E8EBEA", padding: 20 },
  detailsToggle: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 4 },
  detailsToggleText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: colors.primary },
  accordionContent: { gap: 16, marginTop: -8 },
  description: { fontFamily: "Inter_400Regular", fontSize: 14, color: "#183228", lineHeight: 21 },
  reviewCard: { backgroundColor: "#FBFCF4", borderRadius: 20, borderWidth: 1, borderColor: "#E8EBEA", padding: 20, gap: 16, overflow: "hidden" },
  reviewOverlay: { ...StyleSheet.absoluteFillObject, borderRadius: 20, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  reviewThanksRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  reviewThanksText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.primary },
  reviewRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  reviewLabel: { fontFamily: "Inter_500Medium", fontSize: 14, color: "#285444", marginBottom: 8 },
  starsRow: { flexDirection: "row", gap: 6 },
  reviewProceedButton: { backgroundColor: "#F1F6DE", borderRadius: 20, borderWidth: 1, borderColor: "#336B57", paddingHorizontal: 24, paddingVertical: 12 },
  reviewProceedText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.primary },
  reviewModalLabel: { fontFamily: "Inter_500Medium", fontSize: 15, color: "#183228" },
  starsRowLarge: { flexDirection: "row", gap: 10, marginBottom: 8 },
  reviewInput: { fontFamily: "Inter_400Regular", fontSize: 14, color: "#183228", backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#E8EBEA", padding: 14, minHeight: 120, textAlignVertical: "top" },
  reviewModalFooter: { paddingTop: 12 },
  reviewSheetContent: { paddingHorizontal: 20, paddingBottom: 32, gap: 8 },
  cancelSheetContent: { paddingHorizontal: 20, paddingBottom: 32, gap: 12 },
  cancelSheetTitle: { fontFamily: "Inter_600SemiBold", fontSize: 17, color: "#183228" },
  cancelSheetMessage: { fontFamily: "Inter_400Regular", fontSize: 14, color: "#4A5E57" },
  cancelModalFooter: { flexDirection: "row", gap: 10 },
  reviewSubmitButton: { flex: 1, backgroundColor: colors.primary, borderRadius: 12, height: 40, alignItems: "center", justifyContent: "center" },
  cancelDismissButton: { backgroundColor: "#336B57" },
  cancelDismissText: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: "#fff" },
  cancelConfirmButton: { backgroundColor: "#F1F6DE", borderWidth: 1, borderColor: "#336B57" },
  cancelConfirmText: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: "#336B57" },
  reviewSubmitDisabled: { opacity: 0.4 },
  reviewSubmitText: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: "#fff" },
  actionSheetBackground: { backgroundColor: "#F1F4EC" },
  actionSheetContent: { paddingLeft: 20, paddingRight: 50, paddingBottom: 32 },
  actionSheetContentEmpty: { paddingHorizontal: 20, paddingBottom: 32, alignItems: "center" },
  actionHandleBar: { backgroundColor: "#C4C4C4" },
  actionItem: { flexDirection: "row", alignItems: "center", gap: 16, paddingVertical: 14 },
  actionItemText: { fontFamily: "Inter_400Regular", fontSize: 17, color: "#183228" },
  actionDivider: { height: 1, backgroundColor: "#E8EBEA" },
});
