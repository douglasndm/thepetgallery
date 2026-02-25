import React, { useCallback } from 'react';
import { Platform, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { getAuth } from '@react-native-firebase/auth';
import LottieView from 'lottie-react-native';
import { useTranslation } from 'react-i18next';

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
	const { t } = useTranslation();

	const navigateToAccount = useCallback(() => {
		router.push('/profile');
	}, [router]);

	return (
		<Container>
			<Header />
			<Title>{t('about.title')}</Title>
			<Content>
				<AppName>The Pet Gallery</AppName>
				<Info>{t('about.tagline')}</Info>

				<Info>{t('about.developedBy')}</Info>

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
						{t('about.moreAppsPrefix')}
						<AttibutionLink
							onPress={() =>
								Linking.openURL('https://douglasndm.dev')
							}
						>
							{t('about.moreAppsLink')}
						</AttibutionLink>
					</Attibution>
				</AttibuitionContainer>

				<AttibuitionContainer>
					<Attibution>
						{t('about.sendPlaceText')}
						<AttibutionLink
							onPress={() =>
								Linking.openURL(
									'https://www.linkedin.com/in/douglasndm/'
								)
							}
						>
							{t('about.attribution.linkedin')}
						</AttibutionLink>{' '}
						{t('about.sendPlaceOr')}
						<AttibutionLink
							onPress={() =>
								Linking.openURL(
									'https://bsky.app/profile/douglasndm.dev'
								)
							}
						>
							{t('about.attribution.bluesky')}
						</AttibutionLink>
					</Attibution>
				</AttibuitionContainer>

				<AttibuitionContainer>
					<Attibution>
						{t('about.attribution.logoPrefix')}
						<AttibutionLink
							onPress={() =>
								Linking.openURL(
									'https://br.freepik.com/vetores-gratis/pessoas-de-ilustracao-plana-com-animais-de-estimacao_15292679.htm'
								)
							}
						>
							{t('about.attribution.freepik')}
						</AttibutionLink>
					</Attibution>
				</AttibuitionContainer>

				<AttibuitionContainer>
					<Attibution>
						{t('about.attribution.dogLoadingPrefix')}
						<AttibutionLink
							onPress={() =>
								Linking.openURL(
									'https://lottiefiles.com/free-animation/dog-walking-7K4JCxjvHm'
								)
							}
						>
							{t('about.attribution.lottieFiles')}
						</AttibutionLink>
					</Attibution>
				</AttibuitionContainer>

				<AttibuitionContainer>
					<Attibution>
						{t('about.attribution.catLoadingPrefix')}
						<AttibutionLink
							onPress={() =>
								Linking.openURL(
									'https://lottiefiles.com/free-animation/cat-loader-F4ZybShCAh'
								)
							}
						>
							{t('about.attribution.lottieFiles')}
						</AttibutionLink>
					</Attibution>
				</AttibuitionContainer>

				<AttibuitionContainer>
					<Attibution>
						{t('about.attribution.headerPrefix')}
						<AttibutionLink
							onPress={() =>
								Linking.openURL(
									'https://lottiefiles.com/free-animation/loader-cat-dWUie0iIVk'
								)
							}
						>
							{t('about.attribution.lottieFiles')}
						</AttibutionLink>
					</Attibution>
				</AttibuitionContainer>

				<AttibuitionContainer>
					<Attibution>
						{t('about.attribution.aboutPrefix')}
						<AttibutionLink
							onPress={() =>
								Linking.openURL(
									'https://lottiefiles.com/free-animation/dancing-dog-2x20-cSm026rhBF'
								)
							}
						>
							{t('about.attribution.lottieFiles')}
						</AttibutionLink>
					</Attibution>
				</AttibuitionContainer>

				<AttibuitionContainer>
					<Attibution>
						{t('about.attribution.offlinePrefix')}{' '}
						<AttibutionLink
							onPress={() =>
								Linking.openURL(
									'https://lottiefiles.com/free-animation/no-connection-zD7pwxybpR'
								)
							}
						>
							{t('about.attribution.lottieFiles')}
						</AttibutionLink>
					</Attibution>
				</AttibuitionContainer>
			</Content>

			{getAuth().currentUser && (
				<Button
					title={t('about.viewAccount')}
					style={{ marginTop: 20 }}
					onPress={navigateToAccount}
				/>
			)}

			<Padding />
		</Container>
	);
};

export default Menu;
