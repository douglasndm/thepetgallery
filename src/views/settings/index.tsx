import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import {
	getAuth,
	onAuthStateChanged,
	FirebaseAuthTypes,
} from '@react-native-firebase/auth';
import { useTranslation } from 'react-i18next';

import { getCurrentLanguage, setAppLanguage } from '@app/i18n';
import Header from '@components/header';
import Padding from '@components/padding';

import {
	Container,
	Hero,
	HeroTag,
	Title,
	Description,
	SectionCard,
	SectionTitle,
	ActionItem,
	ActionLeft,
	ActionIconWrap,
	ActionIcon,
	ActionTexts,
	ActionTitle,
	ActionSubtitle,
	Chevron,
	LanguageButton,
	LanguageTitle,
	LanguageSubtitle,
} from './styles';

const SettingsView: React.FC = () => {
	const router = useRouter();
	const { t } = useTranslation();
	const currentLanguage = getCurrentLanguage();
	const [user, setUser] = useState<FirebaseAuthTypes.User | null>(
		getAuth().currentUser
	);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(getAuth(), currentUser => {
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
			<Hero>
				<HeroTag>{t('settings.title')}</HeroTag>
				<Title>{t('settings.title')}</Title>
				<Description>{t('settings.description')}</Description>
			</Hero>

			<SectionCard>
				<SectionTitle>{t('settings.title')}</SectionTitle>

				<ActionItem onPress={handleAuth}>
					<ActionLeft>
						<ActionIconWrap>
							<ActionIcon
								name={
									user
										? 'person-circle-outline'
										: 'log-in-outline'
								}
							/>
						</ActionIconWrap>
						<ActionTexts>
							<ActionTitle>
								{user
									? t('settings.viewAccount')
									: t('settings.login')}
							</ActionTitle>
							<ActionSubtitle>
								{user
									? 'Veja os dados da sua conta e gerencie o acesso.'
									: 'Entre para desbloquear recursos ligados a sua conta.'}
							</ActionSubtitle>
						</ActionTexts>
					</ActionLeft>
					<Chevron />
				</ActionItem>

				<ActionItem
					onPress={navigateToAbout}
					style={{ borderBottomWidth: 0 }}
				>
					<ActionLeft>
						<ActionIconWrap>
							<ActionIcon name="information-circle-outline" />
						</ActionIconWrap>
						<ActionTexts>
							<ActionTitle>{t('settings.aboutApp')}</ActionTitle>
							<ActionSubtitle>
								Conheca mais sobre o aplicativo, creditos e
								contato.
							</ActionSubtitle>
						</ActionTexts>
					</ActionLeft>
					<Chevron />
				</ActionItem>
			</SectionCard>

			<SectionCard>
				<SectionTitle>{t('settings.language')}</SectionTitle>

				<LanguageButton
					active={currentLanguage === 'pt-BR'}
					onPress={() => setAppLanguage('pt-BR')}
				>
					<LanguageTitle active={currentLanguage === 'pt-BR'}>
						{t('settings.portugueseBrazil')}
					</LanguageTitle>
					<LanguageSubtitle active={currentLanguage === 'pt-BR'}>
						Ideal para quem usa o app em portugues do Brasil.
					</LanguageSubtitle>
				</LanguageButton>

				<LanguageButton
					active={currentLanguage === 'en-US'}
					onPress={() => setAppLanguage('en-US')}
				>
					<LanguageTitle active={currentLanguage === 'en-US'}>
						{t('settings.englishUS')}
					</LanguageTitle>
					<LanguageSubtitle active={currentLanguage === 'en-US'}>
						Switch the interface and texts to English.
					</LanguageSubtitle>
				</LanguageButton>
			</SectionCard>
			<Padding />
		</Container>
	);
};

export default SettingsView;
