import React, { useCallback } from 'react';
import { Platform, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { getAuth } from '@react-native-firebase/auth';
import LottieView from 'lottie-react-native';

import Header from '@components/header';
import Button from '@components/button';
import Padding from '@components/padding';

import {
	Container,
	Content,
	Title,
	AppName,
	Info,
	AttibuitionContainer,
	Attibution,
	AttibutionLink,
} from './styles';

const dogDancing = Platform.select({
	ios: require('@animations/dog_dancing.lottie'),
	android: require('@animations/android/dog_dancing.zip'),
});

const Menu: React.FC = () => {
	const router = useRouter();

	const navigateToAccount = useCallback(() => {
		router.push('/profile');
	}, [router]);

	return (
		<Container>
			<Header />
			<Title>Sobre</Title>
			<Content>
				<AppName>The Pet Gallery</AppName>
				<Info>Sua dose diária de lambeijo</Info>

				<Info>Desenvolvido por Douglas Nunes de Mattos</Info>

				<LottieView
					source={dogDancing}
					style={{
						width: 250,
						height: 250,
						marginTop: 30,
						alignSelf: 'center',
					}}
					onAnimationFailure={error => {
						console.log(error);
					}}
					autoPlay
					loop
				/>

				<AttibuitionContainer>
					<Attibution>
						Mais aplicativos{' '}
						<AttibutionLink
							onPress={() =>
								Linking.openURL('https://douglasndm.dev')
							}
						>
							aqui
						</AttibutionLink>
					</Attibution>
				</AttibuitionContainer>

				<AttibuitionContainer>
					<Attibution>
						Quer enviar um lugar de adocão ou abrigos que precisam
						de doação? Entre em contato comigo no{' '}
						<AttibutionLink
							onPress={() =>
								Linking.openURL(
									'https://www.linkedin.com/in/douglasndm/'
								)
							}
						>
							LinkedIn
						</AttibutionLink>{' '}
						ou no{' '}
						<AttibutionLink
							onPress={() =>
								Linking.openURL(
									'https://bsky.app/profile/douglasndm.dev'
								)
							}
						>
							Bluesky
						</AttibutionLink>
					</Attibution>
				</AttibuitionContainer>

				<AttibuitionContainer>
					<Attibution>
						Logo de pikisuperstar no{' '}
						<AttibutionLink
							onPress={() =>
								Linking.openURL(
									'https://br.freepik.com/vetores-gratis/pessoas-de-ilustracao-plana-com-animais-de-estimacao_15292679.htm'
								)
							}
						>
							Freepik
						</AttibutionLink>
					</Attibution>
				</AttibuitionContainer>

				<AttibuitionContainer>
					<Attibution>
						Animação de carregamento de doguinhos de Syed Asim Ali
						Shah no{' '}
						<AttibutionLink
							onPress={() =>
								Linking.openURL(
									'https://lottiefiles.com/free-animation/dog-walking-7K4JCxjvHm'
								)
							}
						>
							LottieFiles
						</AttibutionLink>
					</Attibution>
				</AttibuitionContainer>

				<AttibuitionContainer>
					<Attibution>
						Animação de carregamento de gatinhos de Evgeny Marinin
						no{' '}
						<AttibutionLink
							onPress={() =>
								Linking.openURL(
									'https://lottiefiles.com/free-animation/cat-loader-F4ZybShCAh'
								)
							}
						>
							LottieFiles
						</AttibutionLink>
					</Attibution>
				</AttibuitionContainer>

				<AttibuitionContainer>
					<Attibution>
						Animação do Header por Diane Picchiottino no{' '}
						<AttibutionLink
							onPress={() =>
								Linking.openURL(
									'https://lottiefiles.com/free-animation/loader-cat-dWUie0iIVk'
								)
							}
						>
							LottieFiles
						</AttibutionLink>
					</Attibution>
				</AttibuitionContainer>

				<AttibuitionContainer>
					<Attibution>
						Animação no sobre por Eugene Croquette no{' '}
						<AttibutionLink
							onPress={() =>
								Linking.openURL(
									'https://lottiefiles.com/free-animation/dancing-dog-2x20-cSm026rhBF'
								)
							}
						>
							LottieFiles
						</AttibutionLink>
					</Attibution>
				</AttibuitionContainer>

				<AttibuitionContainer>
					<Attibution>
						Animação de falta de conexão de Hishara Dilshan HishD no{' '}
						<AttibutionLink
							onPress={() =>
								Linking.openURL(
									'https://lottiefiles.com/free-animation/no-connection-zD7pwxybpR'
								)
							}
						>
							LottieFiles
						</AttibutionLink>
					</Attibution>
				</AttibuitionContainer>
			</Content>

			{getAuth().currentUser && (
				<Button
					title="Ver informações da conta"
					style={{ marginTop: 20 }}
					onPress={navigateToAccount}
				/>
			)}

			<Padding />
		</Container>
	);
};

export default Menu;
