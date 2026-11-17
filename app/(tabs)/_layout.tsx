import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import {
	getAuth,
	onAuthStateChanged,
	FirebaseAuthTypes,
} from '@react-native-firebase/auth';
import { useTranslation } from 'react-i18next';

const TabsLayout: React.FC = () => {
	const { t } = useTranslation();
	const router = useRouter();
	const [user, setUser] = useState<FirebaseAuthTypes.User | null>(
		getAuth().currentUser
	);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(getAuth(), currentUser => {
			setUser(currentUser);
		});

		return unsubscribe;
	}, []);

	return (
		<NativeTabs
			screenListeners={{
				tabPress: e => {
					// Only the pets tab is ever disabled (when signed out)
					if (e.data?.isPrevented) {
						router.push({
							pathname: '/login',
							params: { redirectTo: 'pets' },
						});
					}
				},
			}}
		>
			<NativeTabs.Trigger name="dogs">
				<NativeTabs.Trigger.Icon sf="dog.fill" md="pets" />
				<NativeTabs.Trigger.Label>
					{t('tabs.dogs')}
				</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>

			<NativeTabs.Trigger name="cats">
				<NativeTabs.Trigger.Icon sf="cat.fill" md="cruelty_free" />
				<NativeTabs.Trigger.Label>
					{t('tabs.cats')}
				</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>

			<NativeTabs.Trigger name="places">
				<NativeTabs.Trigger.Icon sf="pawprint.fill" md="location_on" />
				<NativeTabs.Trigger.Label>
					{t('tabs.places')}
				</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>

			<NativeTabs.Trigger name="pets" disabled={!user}>
				<NativeTabs.Trigger.Icon
					sf={user ? 'heart.text.clipboard.fill' : 'lock.fill'}
					md={user ? 'favorite' : 'lock'}
				/>
				<NativeTabs.Trigger.Label>
					{t('tabs.pets')}
				</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>

			<NativeTabs.Trigger name="settings">
				<NativeTabs.Trigger.Icon sf="gearshape.fill" md="settings" />
				<NativeTabs.Trigger.Label>
					{t('tabs.settings')}
				</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
		</NativeTabs>
	);
};

export default TabsLayout;
