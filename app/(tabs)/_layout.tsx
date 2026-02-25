import React, { useEffect, useState } from 'react';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { getAuth, FirebaseAuthTypes } from '@react-native-firebase/auth';
import { useTranslation } from 'react-i18next';

const TabsLayout: React.FC = () => {
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

	return (
		<NativeTabs>
			<NativeTabs.Trigger name="dogs">
				<Icon sf="dog.fill" />
				<Label>{t('tabs.dogs')}</Label>
			</NativeTabs.Trigger>

			<NativeTabs.Trigger name="cats">
				<Icon sf="cat.fill" />
				<Label>{t('tabs.cats')}</Label>
			</NativeTabs.Trigger>

			<NativeTabs.Trigger name="places">
				<Icon sf="pawprint.fill" />
				<Label>{t('tabs.places')}</Label>
			</NativeTabs.Trigger>

			{user && (
				<NativeTabs.Trigger name="pets/index">
					<Icon sf="heart.text.clipboard.fill" />
					<Label>{t('tabs.pets')}</Label>
				</NativeTabs.Trigger>
			)}

			<NativeTabs.Trigger name="settings/index">
				<Icon sf="gearshape.fill" />
				<Label>{t('tabs.settings')}</Label>
			</NativeTabs.Trigger>
		</NativeTabs>
	);
};

export default TabsLayout;
