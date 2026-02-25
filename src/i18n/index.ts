import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enUS from './locales/en-US.json';
import ptBR from './locales/pt-BR.json';

type AppLanguage = 'pt-BR' | 'en-US';

function normalizeLanguage(locale: string | undefined): AppLanguage {
	if (!locale) return 'pt-BR';

	const localLower = locale.toLowerCase();

	if (localLower.startsWith('en')) {
		return 'en-US';
	}

	return 'pt-BR';
}

export function getCurrentLanguage(): AppLanguage {
	return normalizeLanguage(i18n.resolvedLanguage || i18n.language);
}

export function setAppLanguage(language: AppLanguage): Promise<any> {
	return i18n.changeLanguage(language);
}

const deviceLocale = Intl.DateTimeFormat().resolvedOptions().locale;

i18n.use(initReactI18next).init({
	resources: {
		'pt-BR': {
			translation: ptBR,
		},
		'en-US': {
			translation: enUS,
		},
	},
	lng: normalizeLanguage(deviceLocale),
	fallbackLng: 'pt-BR',
	supportedLngs: ['pt-BR', 'en-US'],
	interpolation: {
		escapeValue: false,
	},
	compatibilityJSON: 'v4',
});

export default i18n;
