import { StyleSheet, View, type ViewStyle } from "react-native";

export function UpcomingActivityCardSkeleton() {
  return (
    <View style={styles.upcomingCard}>
      <View style={[styles.staticBox, { width: "100%", height: 180, borderRadius: 0 }]} />
      <View style={styles.upcomingBody}>
        <View style={[styles.staticBox, { width: "85%", height: 18 }]} />
        <View style={[styles.staticBox, { width: "60%", height: 14 }]} />
        <View style={[styles.staticBox, { width: "50%", height: 14 }]} />
        <View style={styles.hostRow}>
          <View style={[styles.staticBox, { width: 56, height: 56, borderRadius: 28 }]} />
          <View style={{ gap: 6 }}>
            <View style={[styles.staticBox, { width: 60, height: 12 }]} />
            <View style={[styles.staticBox, { width: 100, height: 14 }]} />
          </View>
        </View>
        <View style={[styles.staticBox, { width: "100%", height: 48, borderRadius: 24 }]} />
      </View>
    </View>
  );
}

export function ActivityCardSkeleton() {
  return (
    <View style={styles.activityCard}>
      <View style={styles.activityTop}>
        <View style={[styles.staticBox, { width: "90%", height: 14 }]} />
        <View style={[styles.staticBox, { width: "60%", height: 14, marginTop: 6 }]} />
      </View>
      <View style={styles.activityBottom}>
        <View style={[styles.staticBox, { width: 100, height: 14, borderRadius: 4 }]} />
        <View style={[styles.staticBox, { width: 110, height: 36, borderRadius: 20 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  upcomingCard: {
    backgroundColor: "#F1F4EC",
    borderRadius: 20,
    overflow: "hidden",
  },
  upcomingBody: {
    padding: 16,
    gap: 10,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#1832281A",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  hostRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
  },
  activityCard: {
    backgroundColor: "#E2EBB7",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1832281A",
    overflow: "hidden",
  },
  activityTop: {
    backgroundColor: "#FCFCFC",
    padding: 16,
    borderRadius: 20,
  },
  activityBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  staticBox: {
    backgroundColor: "#D1D5DB",
    opacity: 0.4,
    borderRadius: 8,
  },
});
