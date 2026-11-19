import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Platform, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
	getAuth,
	onAuthStateChanged,
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	sendPasswordResetEmail,
} from '@react-native-firebase/auth';
import { useTranslation } from 'react-i18next';
import { Checkbox } from 'react-native-paper';
import { showMessage } from 'react-native-flash-message';
import {
	appleAuth,
	appleAuthAndroid,
	AppleButton,
} from '@invertase/react-native-apple-authentication';

import { captureException } from '@services/exceptionsHandler';

import {
	signInWithApple,
	signInWithAppleAndroid,
} from '@utils/auth/login/apple';
import {
	getAuthErrorMessageKey,
	isEmailValid,
	normalizeEmail,
	setAuthLanguage,
} from '@utils/auth/emailPassword';
import { signInWithGoogle } from '@utils/auth/login/google';
import { registerLogin } from '@utils/auth/login/register';

import Screen from '@components/screen';

import {
	Container,
	PageContent,
	TextTitle,
	TextDescription,
	ModeSelector,
	ModeButton,
	ModeButtonText,
	FormCard,
	FieldLabel,
	Input,
	PrimaryButton,
	PrimaryButtonText,
	SecondaryActionButton,
	SecondaryActionText,
	LoginContainer,
	LoginButton,
	LoginButtonText,
	Loading,
	AgeGateRow,
	AgeGateText,
	LegalText,
	LegalLink,
} from './styles';

const TERMS_URL = 'https://douglasndm.dev/terms';
const PRIVACY_URL = 'https://douglasndm.dev/privacy';

// Minimum age required to create an account (kept at 16 to cover GDPR-K).
const MINIMUM_AGE = 16;

type AuthMode = 'signIn' | 'signUp';

const Login: React.FC = () => {
	const router = useRouter();
	const { redirectTo } = useLocalSearchParams<{ redirectTo?: string }>();
	const { t } = useTranslation();

	const [isSigning, setIsSigning] = useState(false);
	const [mode, setMode] = useState<AuthMode>('signIn');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [ageConfirmed, setAgeConfirmed] = useState(false);

	const isAppleSignInSupported =
		Platform.OS === 'android'
			? !!appleAuthAndroid?.isSupported
			: !!appleAuth?.isSupported;

	const normalizedEmail = useMemo(() => normalizeEmail(email), [email]);

	const showAuthMessage = useCallback(
		(message: string, type: 'success' | 'danger' = 'danger') => {
			showMessage({
				message,
				type,
			});
		},
		[]
	);

	const validateCredentials = useCallback((): boolean => {
		if (!normalizedEmail) {
			showAuthMessage(t('login.errors.missingEmail'));
			return false;
		}

		if (!isEmailValid(normalizedEmail)) {
			showAuthMessage(t('login.errors.invalidEmail'));
			return false;
		}

		if (!password.trim()) {
			showAuthMessage(t('login.errors.missingPassword'));
			return false;
		}

		if (mode === 'signUp' && !ageConfirmed) {
			showAuthMessage(
				t('login.errors.ageRequired', { age: MINIMUM_AGE })
			);
			return false;
		}

		if (mode === 'signUp' && password.trim().length < 6) {
			showAuthMessage(t('login.errors.weakPassword'));
			return false;
		}

		return true;
	}, [ageConfirmed, mode, normalizedEmail, password, showAuthMessage, t]);

	const signInGoogle = useCallback(async () => {
		if (!ageConfirmed) {
			showAuthMessage(
				t('login.errors.ageRequired', { age: MINIMUM_AGE })
			);
			return;
		}

		try {
			setIsSigning(true);

			await signInWithGoogle();
			await registerLogin();
		} catch (error) {
			showAuthMessage(t('login.errors.socialSignIn'));
			captureException({
				error,
			});
		} finally {
			setIsSigning(false);
		}
	}, [ageConfirmed, showAuthMessage, t]);

	const signInApple = useCallback(async () => {
		if (!ageConfirmed) {
			showAuthMessage(
				t('login.errors.ageRequired', { age: MINIMUM_AGE })
			);
			return;
		}

		try {
			setIsSigning(true);

			if (Platform.OS === 'android') {
				await signInWithAppleAndroid();
			} else {
				await signInWithApple();
			}

			await registerLogin();
		} catch (error) {
			showAuthMessage(t('login.errors.socialSignIn'));
			captureException({
				error,
			});
		} finally {
			setIsSigning(false);
		}
	}, [ageConfirmed, showAuthMessage, t]);

	const handleEmailAuth = useCallback(async () => {
		if (!validateCredentials()) return;

		try {
			setIsSigning(true);

			const auth = getAuth();

			if (mode === 'signUp') {
				await createUserWithEmailAndPassword(
					auth,
					normalizedEmail,
					password.trim()
				);

				showAuthMessage(t('login.success.accountCreated'), 'success');
			} else {
				await signInWithEmailAndPassword(
					getAuth(),
					normalizedEmail,
					password.trim()
				);

				showAuthMessage(t('login.success.signedIn'), 'success');
			}

			await registerLogin();
		} catch (error) {
			showAuthMessage(t(getAuthErrorMessageKey(error, mode)), 'danger');
			captureException({ error });
		} finally {
			setIsSigning(false);
		}
	}, [
		mode,
		normalizedEmail,
		password,
		showAuthMessage,
		t,
		validateCredentials,
	]);

	const handleResetPassword = useCallback(async () => {
		if (!normalizedEmail) {
			showAuthMessage(t('login.errors.resetPasswordNeedsEmail'));
			return;
		}

		if (!isEmailValid(normalizedEmail)) {
			showAuthMessage(t('login.errors.invalidEmail'));
			return;
		}

		try {
			setIsSigning(true);

			await setAuthLanguage();
			await sendPasswordResetEmail(getAuth(), normalizedEmail);

			showAuthMessage(t('login.success.resetPasswordSent'), 'success');
		} catch (error) {
			showAuthMessage(
				t(getAuthErrorMessageKey(error, 'resetPassword')),
				'danger'
			);
			captureException({ error });
		} finally {
			setIsSigning(false);
		}
	}, [normalizedEmail, showAuthMessage, t]);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(getAuth(), user => {
			if (user) {
				if (redirectTo === 'pets') {
					router.dismissTo('/pets');
					return;
				}

				router.replace('/profile');
			}
		});

		return unsubscribe;
	}, [router, redirectTo]);

	const ageGate = (
		<AgeGateRow
			onPress={() => setAgeConfirmed(value => !value)}
			accessibilityRole="checkbox"
			accessibilityState={{ checked: ageConfirmed }}
		>
			<Checkbox status={ageConfirmed ? 'checked' : 'unchecked'} />
			<AgeGateText>
				{t('login.ageConfirmation', { age: MINIMUM_AGE })}
			</AgeGateText>
		</AgeGateRow>
	);

	const legalLinks = (
		<LegalText>
			{t('login.legalPrefix')}
			<LegalLink onPress={() => Linking.openURL(TERMS_URL)}>
				{t('login.terms')}
			</LegalLink>
			{t('login.legalAnd')}
			<LegalLink onPress={() => Linking.openURL(PRIVACY_URL)}>
				{t('login.privacy')}
			</LegalLink>
			.
		</LegalText>
	);

	return (
		<Screen showBack>
			<Container>
				<PageContent>
					<TextTitle>{t('login.title')}</TextTitle>
					<TextDescription>{t('login.description1')}</TextDescription>

					<TextDescription>{t('login.description2')}</TextDescription>

					<FormCard>
						<ModeSelector>
							<ModeButton
								active={mode === 'signIn'}
								onPress={() => setMode('signIn')}
							>
								<ModeButtonText active={mode === 'signIn'}>
									{t('login.mode.signIn')}
								</ModeButtonText>
							</ModeButton>

							<ModeButton
								active={mode === 'signUp'}
								onPress={() => setMode('signUp')}
							>
								<ModeButtonText active={mode === 'signUp'}>
									{t('login.mode.signUp')}
								</ModeButtonText>
							</ModeButton>
						</ModeSelector>

						<FieldLabel>{t('login.emailLabel')}</FieldLabel>
						<Input
							autoCapitalize="none"
							autoCorrect={false}
							keyboardType="email-address"
							placeholder={t('login.emailPlaceholder')}
							placeholderTextColor="#7c7c80"
							textContentType="emailAddress"
							value={email}
							onChangeText={setEmail}
						/>

						<FieldLabel>{t('login.passwordLabel')}</FieldLabel>
						<Input
							autoCapitalize="none"
							autoCorrect={false}
							placeholder={t('login.passwordPlaceholder')}
							placeholderTextColor="#7c7c80"
							secureTextEntry
							textContentType={
								mode === 'signUp' ? 'newPassword' : 'password'
							}
							value={password}
							onChangeText={setPassword}
						/>

						{mode === 'signUp' && ageGate}
						{mode === 'signUp' && legalLinks}

						<PrimaryButton
							onPress={handleEmailAuth}
							disabled={isSigning}
						>
							<PrimaryButtonText>
								{mode === 'signUp'
									? t('login.actions.createAccount')
									: t('login.actions.signIn')}
							</PrimaryButtonText>
						</PrimaryButton>

						{mode === 'signIn' && (
							<SecondaryActionButton
								onPress={handleResetPassword}
								disabled={isSigning}
							>
								<SecondaryActionText>
									{t('login.actions.resetPassword')}
								</SecondaryActionText>
							</SecondaryActionButton>
						)}
					</FormCard>

					{isSigning ? (
						<Loading />
					) : (
						<LoginContainer>
							{mode === 'signIn' && ageGate}
							{mode === 'signIn' && legalLinks}

							{isAppleSignInSupported && (
								<AppleButton
									buttonStyle={AppleButton.Style.BLACK}
									buttonType={AppleButton.Type.CONTINUE}
									cornerRadius={8}
									style={{
										width: '100%',
										height: 50,
									}}
									onPress={signInApple}
								/>
							)}

							<LoginButton onPress={signInGoogle}>
								<LoginButtonText>
									{t('login.signInGoogle')}
								</LoginButtonText>
							</LoginButton>
						</LoginContainer>
					)}
				</PageContent>
			</Container>
		</Screen>
	);
};

export default Login;
