import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "expo-localization";
import tr from "./locales/tr.json";
import en from "./locales/en.json";

const langCode = getLocales()[0]?.languageCode ?? "tr";

i18n.use(initReactI18next).init({
  resources: {
    tr: { translation: tr },
    en: { translation: en },
  },
  lng: langCode === "tr" ? "tr" : "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export default i18n;
