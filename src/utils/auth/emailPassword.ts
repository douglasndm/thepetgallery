import { getAuth } from '@react-native-firebase/auth';

import { getCurrentLanguage } from '@app/i18n';

type AuthAction = 'signIn' | 'signUp' | 'resetPassword';

const GENERIC_AUTH_ERROR_BY_ACTION: Record<AuthAction, string> = {
	signIn: 'login.errors.genericSignIn',
	signUp: 'login.errors.genericSignUp',
	resetPassword: 'login.errors.genericResetPassword',
};

function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

function isEmailValid(email: string): boolean {
	return /\S+@\S+\.\S+/.test(normalizeEmail(email));
}

async function setAuthLanguage(): Promise<void> {
	const auth = getAuth();
	const language = getCurrentLanguage();

	await auth.setLanguageCode(language);
}

function getAuthErrorMessageKey(error: unknown, action: AuthAction): string {
	const fallback = GENERIC_AUTH_ERROR_BY_ACTION[action];

	if (
		typeof error !== 'object' ||
		error === null ||
		!('code' in error) ||
		typeof error.code !== 'string'
	) {
		return fallback;
	}

	switch (error.code) {
		case 'auth/invalid-email':
			return 'login.errors.invalidEmail';
		case 'auth/missing-email':
			return 'login.errors.missingEmail';
		case 'auth/email-already-in-use':
			return 'login.errors.emailAlreadyInUse';
		case 'auth/weak-password':
			return 'login.errors.weakPassword';
		case 'auth/user-not-found':
		case 'auth/wrong-password':
		case 'auth/invalid-credential':
		case 'auth/invalid-login-credentials':
			return 'login.errors.invalidCredentials';
		case 'auth/user-disabled':
			return 'login.errors.userDisabled';
		case 'auth/too-many-requests':
			return 'login.errors.tooManyRequests';
		case 'auth/network-request-failed':
			return 'login.errors.network';
		case 'auth/operation-not-allowed':
			return 'login.errors.operationNotAllowed';
		default:
			return fallback;
	}
}

export {
	getAuthErrorMessageKey,
	isEmailValid,
	normalizeEmail,
	setAuthLanguage,
};
