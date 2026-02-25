import { getCurrentLanguage } from '@app/i18n';

function formatDate(date: Date): string {
	const options: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	} as const;

	const formattedDate = new Intl.DateTimeFormat(
		getCurrentLanguage(),
		options
	).format(date);

	return formattedDate;
}

export { formatDate };
