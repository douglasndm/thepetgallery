import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import {
	getAuth,
	onAuthStateChanged,
	FirebaseAuthTypes,
} from '@react-native-firebase/auth';
import { useTranslation } from 'react-i18next';

import { captureException } from '@services/exceptionsHandler';

import Header from '@components/header';
import Loading from '@components/loading';

import DeleteAccount from './Delete';

import {
	Container,
	Hero,
	HeroTag,
	HeroTitle,
	HeroDescription,
	ProfileCard,
	Avatar,
	AvatarIcon,
	Name,
	Email,
	SectionCard,
	SectionTitle,
	ActionButton,
	ActionLeft,
	ActionIconWrap,
	ActionIcon,
	ActionTexts,
	ActionTitle,
	ActionSubtitle,
	Chevron,
	LoadingOverlay,
} from './styles';

const Profile: React.FC = () => {
	const router = useRouter();
	const { t } = useTranslation();

	const [user, setUser] = useState<FirebaseAuthTypes.User | null>();
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	const handleLogout = useCallback(async () => {
		try {
			setIsLoggingOut(true);

			await getAuth().signOut();

			router.replace('/login');
		} catch (error) {
			captureException({ error, showAlert: true });
		} finally {
			setIsLoggingOut(false);
		}
	}, [router]);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(getAuth(), currentUser => {
			setUser(currentUser);
		});

		return unsubscribe;
	}, []);

	const switchShowDeleteModal = useCallback(() => {
		setShowDeleteModal(prevValue => !prevValue);
	}, []);

	return (
		<Container>
			<Header />

			<Hero>
				<HeroTag>{t('settings.viewAccount')}</HeroTag>
				<HeroTitle>{t('settings.viewAccount')}</HeroTitle>
				<HeroDescription>
					Veja seu acesso atual e gerencie a conta com clareza.
				</HeroDescription>
			</Hero>

			<ProfileCard>
				<Avatar>
					<AvatarIcon />
				</Avatar>
				<Name>{user?.displayName || 'The Pet Gallery'}</Name>
				<Email>{user?.email}</Email>
			</ProfileCard>

			<SectionCard>
				<SectionTitle>{t('settings.title')}</SectionTitle>

				<ActionButton onPress={handleLogout}>
					<ActionLeft>
						<ActionIconWrap>
							<ActionIcon name="log-out-outline" />
						</ActionIconWrap>
						<ActionTexts>
							<ActionTitle>{t('profile.logout')}</ActionTitle>
							<ActionSubtitle>
								Encerre a sessao atual neste dispositivo.
							</ActionSubtitle>
						</ActionTexts>
					</ActionLeft>
					<Chevron />
				</ActionButton>

				<ActionButton
					onPress={switchShowDeleteModal}
					style={{ borderBottomWidth: 0 }}
				>
					<ActionLeft>
						<ActionIconWrap danger>
							<ActionIcon name="trash-outline" danger />
						</ActionIconWrap>
						<ActionTexts>
							<ActionTitle danger>
								{t('profile.deleteAccount')}
							</ActionTitle>
							<ActionSubtitle>
								Remove permanentemente sua conta e os dados
								salvos.
							</ActionSubtitle>
						</ActionTexts>
					</ActionLeft>
					<Chevron />
				</ActionButton>
			</SectionCard>

			{isLoggingOut && (
				<LoadingOverlay>
					<Loading />
				</LoadingOverlay>
			)}

			<DeleteAccount
				visible={showDeleteModal}
				setVisible={setShowDeleteModal}
			/>
		</Container>
	);
};

export default Profile;
