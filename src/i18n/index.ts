import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import kk from './locales/kk.json';
import ru from './locales/ru.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ru: { translation: ru },
      kk: { translation: kk }
    },
    lng: 'ru', // Default language
    fallbackLng: 'ru',
    interpolation: {
      escapeValue: false // React already escapes by default
    }
  });

export default i18n;
