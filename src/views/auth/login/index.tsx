import React, { useState, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getAuth } from '@react-native-firebase/auth';
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

import GoogleButtonSVG from '@assets/images/buttons/signin/google_ptbr.svg';

import Header from '@components/header';

import {
	Container,
	PageContent,
	TextTitle,
	TextDescription,
	LoginContainer,
	LoginButton,
	Loading,
} from './styles';

const Login: React.FC = () => {
	const { replace } = useNavigation<NativeStackNavigationProp<AppRoutes>>();

	const [isSigning, setIsSigning] = useState(false);

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
		getAuth().onAuthStateChanged(user => {
			if (user) {
				replace('Profile', {});
			}
		});
	}, [replace]);

	return (
		<Container>
			<Header />
			<PageContent>
				<TextTitle>
					Faça login para ativar as notificações de lembretes!
				</TextTitle>
				<TextDescription>
					Ao entrar na sua conta, você habilita as funções de
					notificações personalizadas, como lembretes de vacinas,
					medicamentos e cuidados importantes para o seu pet. Nunca
					mais perca uma data crucial e mantenha a saúde do seu animal
					de estimação em dia.
				</TextDescription>

				<TextDescription>
					Se ainda não tem uma conta, cadastre-se agora e comece a
					usufruir de todos os benefícios!
				</TextDescription>

				{isSigning ? (
					<Loading />
				) : (
					<LoginContainer>
						{(appleAuthAndroid.isSupported ||
							appleAuth.isSupported) && (
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
							<GoogleButtonSVG width={160} height={45} />
						</LoginButton>
					</LoginContainer>
				)}
			</PageContent>
		</Container>
	);
};

export default Login;
