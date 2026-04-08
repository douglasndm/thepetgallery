import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import { useTranslation } from 'react-i18next';
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

import Header from '@components/header';

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
} from './styles';

type AuthMode = 'signIn' | 'signUp';

const Login: React.FC = () => {
	const router = useRouter();
	const { t } = useTranslation();

	const [isSigning, setIsSigning] = useState(false);
	const [mode, setMode] = useState<AuthMode>('signIn');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

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

		if (mode === 'signUp' && password.trim().length < 6) {
			showAuthMessage(t('login.errors.weakPassword'));
			return false;
		}

		return true;
	}, [mode, normalizedEmail, password, showAuthMessage, t]);

	const signInGoogle = useCallback(async () => {
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
	}, [showAuthMessage, t]);

	const signInApple = useCallback(async () => {
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
	}, [showAuthMessage, t]);

	const handleEmailAuth = useCallback(async () => {
		if (!validateCredentials()) return;

		try {
			setIsSigning(true);

			const auth = getAuth();

			if (mode === 'signUp') {
				await auth.createUserWithEmailAndPassword(
					normalizedEmail,
					password.trim()
				);

				showAuthMessage(t('login.success.accountCreated'), 'success');
			} else {
				await auth.signInWithEmailAndPassword(
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
			await getAuth().sendPasswordResetEmail(normalizedEmail);

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
				router.replace('/profile');
			}
		});

		return unsubscribe;
	}, [router]);

	return (
		<Container>
			<Header />
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
						{isAppleSignInSupported && (
							<AppleButton
								buttonStyle={AppleButton.Style.BLACK}
								buttonType={AppleButton.Type.CONTINUE}
								style={{
									width: 160,
									height: 45,
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
	);
};

export default Login;
