import React, { useState, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { getAuth } from '@react-native-firebase/auth';
import { useTranslation } from 'react-i18next';
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
import { signInWithGoogle } from '@utils/auth/login/google';
import { registerLogin } from '@utils/auth/login/register';

import Header from '@components/header';

import {
	Container,
	PageContent,
	TextTitle,
	TextDescription,
	LoginContainer,
	LoginButton,
	LoginButtonText,
	Loading,
} from './styles';

const Login: React.FC = () => {
	const router = useRouter();
	const { t } = useTranslation();

	const [isSigning, setIsSigning] = useState(false);
	const isAppleSignInSupported =
		Platform.OS === 'android'
			? !!appleAuthAndroid?.isSupported
			: !!appleAuth?.isSupported;

	const signInGoogle = useCallback(async () => {
		try {
			setIsSigning(true);

			await signInWithGoogle();
			await registerLogin();
		} catch (error) {
			captureException({
				error,
				showAlert: true,
			});
		} finally {
			setIsSigning(false);
		}
	}, []);

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
			captureException({
				error,
				showAlert: true,
			});
		} finally {
			setIsSigning(false);
		}
	}, []);

	useEffect(() => {
		const unsubscribe = getAuth().onAuthStateChanged(user => {
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
