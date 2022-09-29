import i18n from "i18next";
import { initReactI18next } from "react-i18next"
import LanguageDetector from 'i18next-browser-languagedetector'

const fallbackLng = ["id"]

const resources = {
  en: {
    default: require("./public/locales/en/default.json"),
  },
  id: {
    default: require("./public/locales/id/default.json"),
  },
}

const options = {
  caches: ['cookie'],
  cookieSameSite: 'strict',
  lookupQuerystring: 'lang', // default is lng
  lookupCookie: 'next-i18next',
  order: ['querystring', 'cookie', 'header'], // IMPORTANT
}

i18n
  
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    
    defaultNS: 'default',
    lng: 'id',
    fallbackLng,
    updateMissing: true,
    ns: ['default'],
    debug: false,
    detection: options,
    interpolation: {
      escapeValue: false,
    },
    resources: resources,
  })

export default i18n