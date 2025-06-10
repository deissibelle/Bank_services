import { useTranslation } from 'react-i18next';
import { create } from 'zustand';

interface LanguageState {
  currentLanguage: string;
  setLanguage: (lang: string) => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  currentLanguage: localStorage.getItem('i18nextLng') || 'en',
  setLanguage: (lang: string) => set({ currentLanguage: lang }),
}));

export const useLanguage = () => {
  const { i18n } = useTranslation();
  const { currentLanguage, setLanguage } = useLanguageStore();

  const changeLanguage = async (lang: string) => {
    await i18n.changeLanguage(lang);
    setLanguage(lang);
    document.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  return {
    currentLanguage,
    changeLanguage,
    languages: [
      { code: 'en', name: 'English', dir: 'ltr' },
      { code: 'fr', name: 'Français', dir: 'ltr' },
      { code: 'pt', name: 'Português', dir: 'ltr' },
      { code: 'ar', name: 'العربية', dir: 'rtl' },
    ],
  };
};