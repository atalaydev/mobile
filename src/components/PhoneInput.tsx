import { Text } from "@/components/Text";
import countryNamesTr from "@/data/countries.tr.json";
import { Image } from "expo-image";
import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  getExampleNumber,
  type CountryCode,
} from "libphonenumber-js";
import examples from "libphonenumber-js/mobile/examples";
import { memo, useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Types ───────────────────────────────────────────────

type PhoneInputProps = {
  value: string;
  onChangeText: (formatted: string) => void;
  onChangeFullNumber: (e164: string) => void;
  disabled?: boolean;
  error?: string;
};

type CountryItem = {
  code: CountryCode;
  callingCode: string;
  name: string;
};

// ─── Data ────────────────────────────────────────────────

const countryNames = countryNamesTr as Record<string, string>;

const countries: CountryItem[] = getCountries()
  .map((code) => ({
    code,
    callingCode: `+${getCountryCallingCode(code)}`,
    name: countryNames[code] ?? code,
  }))
  .sort((a, b) => a.name.localeCompare(b.name, "tr"));

const DEFAULT_COUNTRY: CountryItem = countries.find((c) => c.code === "TR")!;

// ─── Helpers ─────────────────────────────────────────────

function getFlagUri(code: string) {
  return `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
}

function formatPhone(digits: string, countryCode: CountryCode, callingCode: string) {
  const formatter = new AsYouType(countryCode);
  const formatted = formatter.input(digits);
  const e164 = formatter.getNumber()?.number ?? `${callingCode}${digits}`;
  return { formatted, e164 };
}

function getPlaceholder(countryCode: CountryCode) {
  const example = getExampleNumber(countryCode, examples);
  if (!example) return "";
  const formatter = new AsYouType(countryCode);
  return formatter.input(example.nationalNumber);
}

// ─── Country Row (memoized for FlatList) ─────────────────

const CountryRow = memo(function CountryRow({
  item,
  onSelect,
}: {
  item: CountryItem;
  onSelect: (item: CountryItem) => void;
}) {
  return (
    <Pressable style={styles.countryRow} onPress={() => onSelect(item)}>
      <Image
        source={{ uri: getFlagUri(item.code) }}
        style={styles.flagList}
        contentFit="cover"
      />
      <Text style={styles.countryName}>{item.name}</Text>
      <Text style={styles.countryCallingCode}>{item.callingCode}</Text>
    </Pressable>
  );
});

// ─── Component ───────────────────────────────────────────

export function PhoneInput({
  value,
  onChangeText,
  onChangeFullNumber,
  disabled,
  error,
}: PhoneInputProps) {
  const [country, setCountry] = useState<CountryItem>(DEFAULT_COUNTRY);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [search, setSearch] = useState("");

  const placeholder = useMemo(() => getPlaceholder(country.code), [country.code]);

  const filtered = useMemo(() => {
    if (!search) return countries;
    const q = search.toLowerCase();
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.callingCode.includes(search)
    );
  }, [search]);

  const updatePhone = useCallback(
    (digits: string, target: CountryItem) => {
      const { formatted, e164 } = formatPhone(digits, target.code, target.callingCode);
      onChangeText(formatted);
      onChangeFullNumber(e164);
    },
    [onChangeText, onChangeFullNumber]
  );

  const handlePhoneChange = useCallback(
    (text: string) => {
      const digits = text.replace(/\D/g, "");
      updatePhone(digits, country);
    },
    [country, updatePhone]
  );

  const handleSelectCountry = useCallback(
    (item: CountryItem) => {
      setCountry(item);
      setPickerVisible(false);
      setSearch("");
      const digits = value.replace(/\D/g, "");
      updatePhone(digits, item);
    },
    [value, updatePhone]
  );

  const closePicker = useCallback(() => {
    setPickerVisible(false);
    setSearch("");
  }, []);

  const openPicker = useCallback(() => {
    if (!disabled) setPickerVisible(true);
  }, [disabled]);

  const renderCountryRow = useCallback(
    ({ item }: { item: CountryItem }) => (
      <CountryRow item={item} onSelect={handleSelectCountry} />
    ),
    [handleSelectCountry]
  );

  return (
    <View>
      <View style={[styles.container, error != null && styles.containerError]}>
        <Pressable style={styles.countryButton} onPress={openPicker}>
          <Image
            source={{ uri: getFlagUri(country.code) }}
            style={styles.flag}
            contentFit="cover"
          />
          <Text style={styles.callingCode}>{country.callingCode}</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={value}
          onChangeText={handlePhoneChange}
          keyboardType="phone-pad"
          editable={!disabled}
        />
      </View>

      {error != null && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={pickerVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modal} edges={["top", "bottom"]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ülke Seçin</Text>
            <Pressable onPress={closePicker}>
              <Text style={styles.modalClose}>Kapat</Text>
            </Pressable>
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Ara..."
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
            autoFocus
          />
          <FlatList
            data={filtered}
            keyExtractor={keyExtractor}
            renderItem={renderCountryRow}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const keyExtractor = (item: CountryItem) => item.code;

// ─── Styles ──────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E8EBEA",
  },
  containerError: {
    borderColor: "#DC3545",
  },
  errorText: {
    fontSize: 13,
    color: "#DC3545",
    marginTop: 6,
    fontFamily: "Inter_400Regular",
  },
  countryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: "#E8EBEA",
    marginRight: 12,
  },
  flag: {
    width: 24,
    height: 16,
    borderRadius: 2,
  },
  callingCode: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: "#333",
  },
  chevron: {
    fontSize: 18,
    color: "#999",
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#333",
  },
  modal: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: "#183228",
  },
  modalClose: {
    fontSize: 16,
    color: "#336B57",
    fontFamily: "Inter_500Medium",
  },
  searchInput: {
    height: 44,
    marginHorizontal: 20,
    marginBottom: 8,
    paddingHorizontal: 16,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  countryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  flagList: {
    width: 30,
    height: 20,
    borderRadius: 3,
  },
  countryName: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#333",
  },
  countryCallingCode: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: "#666",
  },
});
