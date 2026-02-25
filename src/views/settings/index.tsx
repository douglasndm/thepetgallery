import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { getAuth, FirebaseAuthTypes } from '@react-native-firebase/auth';

import Header from '@components/header';
import Button from '@components/button';
import Padding from '@components/padding';

import { Container, Content, Title, Description } from './styles';

const SettingsView: React.FC = () => {
	const router = useRouter();
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
				<Title>Configurações</Title>
				<Description>
					Gerencie sua conta e acesse informações do app.
				</Description>

				<Button
					title={user ? 'Ver informações da conta' : 'Fazer login'}
					onPress={handleAuth}
				/>

				<Button
					title="Sobre o aplicativo"
					onPress={navigateToAbout}
					style={{ marginTop: 10 }}
				/>
			</Content>
			<Padding />
		</Container>
	);
};

export default SettingsView;
