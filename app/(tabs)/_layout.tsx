import React, { useEffect, useState } from 'react';
import {
	NativeTabs,
	Icon,
	Label,
} from 'expo-router/unstable-native-tabs';
import { getAuth, FirebaseAuthTypes } from '@react-native-firebase/auth';

const TabsLayout: React.FC = () => {
	const [user, setUser] = useState<FirebaseAuthTypes.User | null>(
		getAuth().currentUser
	);

	useEffect(() => {
		const unsubscribe = getAuth().onAuthStateChanged(currentUser => {
			setUser(currentUser);
		});

		return unsubscribe;
	}, []);

	return (
		<NativeTabs>
			<NativeTabs.Trigger name="dogs">
				<Icon sf="dog.fill" />
				<Label>Dogs</Label>
			</NativeTabs.Trigger>

			<NativeTabs.Trigger name="cats">
				<Icon sf="cat.fill" />
				<Label>Cats</Label>
			</NativeTabs.Trigger>

			<NativeTabs.Trigger name="places">
				<Icon sf="pawprint.fill" />
				<Label>Places</Label>
			</NativeTabs.Trigger>

			{user && (
				<NativeTabs.Trigger name="pets/index">
					<Icon sf="heart.text.clipboard.fill" />
					<Label>Pets</Label>
				</NativeTabs.Trigger>
			)}

			<NativeTabs.Trigger name="settings/index">
				<Icon sf="gearshape.fill" />
				<Label>Config</Label>
			</NativeTabs.Trigger>
		</NativeTabs>
	);
};

export default TabsLayout;
