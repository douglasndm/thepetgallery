import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { getAuth, FirebaseAuthTypes } from '@react-native-firebase/auth';
import { useTranslation } from 'react-i18next';

import Header from '@components/header';
import Button from '@components/button';

import DeleteAccount from './Delete';

import { Container, Content, Name, Email } from './styles';

const Profile: React.FC = () => {
	const router = useRouter();
	const { t } = useTranslation();

	const [user, setUser] = useState<FirebaseAuthTypes.User | null>();
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	const handleLogout = useCallback(async () => {
		await getAuth().signOut();

		router.replace('/login');
	}, [router]);

	useEffect(() => {
		const unsubscribe = getAuth().onAuthStateChanged(currentUser => {
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

			<Content>
				<Name>{user?.displayName}</Name>
				<Email>{user?.email}</Email>

				<Button title={t('profile.logout')} onPress={handleLogout} />

				<Button
					title={t('profile.deleteAccount')}
					onPress={switchShowDeleteModal}
					style={{ marginTop: 10 }}
				/>
			</Content>

			<DeleteAccount
				visible={showDeleteModal}
				setVisible={setShowDeleteModal}
			/>
		</Container>
	);
};

export default Profile;
