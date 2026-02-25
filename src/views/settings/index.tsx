import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { getAuth, FirebaseAuthTypes } from '@react-native-firebase/auth';
import { useTranslation } from 'react-i18next';

import { setAppLanguage } from '@app/i18n';
import Header from '@components/header';
import Button from '@components/button';
import Padding from '@components/padding';

import { Container, Content, Title, Description } from './styles';

const BUTTON_STYLE = {
	width: 240,
	minWidth: 240,
	maxWidth: 240,
	alignSelf: 'center' as const,
};

const SettingsView: React.FC = () => {
	const router = useRouter();
	const { t } = useTranslation();
	const [user, setUser] = useState<FirebaseAuthTypes.User | null>(
		getAuth().currentUser
	);

	useEffect(() => {
		const unsubscribe = getAuth().onAuthStateChanged(currentUser => {
			setUser(currentUser);
		});

		return unsubscribe;
	}, []);

	const handleAuth = useCallback(() => {
		if (user) {
			router.push('/profile');
			return;
		}

		router.push('/login');
	}, [router, user]);

	const navigateToAbout = useCallback(() => {
		router.push('/settings/about');
	}, [router]);

	return (
		<Container>
			<Header />
			<Content>
				<Title>{t('settings.title')}</Title>
				<Description>{t('settings.description')}</Description>

				<Button
					title={
						user ? t('settings.viewAccount') : t('settings.login')
					}
					onPress={handleAuth}
					style={BUTTON_STYLE}
				/>

				<Button
					title={t('settings.aboutApp')}
					onPress={navigateToAbout}
					style={[BUTTON_STYLE, { marginTop: 10 }]}
				/>

				<Description style={{ marginTop: 30, marginBottom: 10 }}>
					{t('settings.language')}
				</Description>

				<Button
					title={t('settings.portugueseBrazil')}
					onPress={() => setAppLanguage('pt-BR')}
					style={BUTTON_STYLE}
				/>
				<Button
					title={t('settings.englishUS')}
					onPress={() => setAppLanguage('en-US')}
					style={[BUTTON_STYLE, { marginTop: 10 }]}
				/>
			</Content>
			<Padding />
		</Container>
	);
};

export default SettingsView;
