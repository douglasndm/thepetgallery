import React from 'react';
import { Stack } from 'expo-router';

const SettingsLayout: React.FC = () => {
	return <Stack screenOptions={{ headerShown: false }} />;
};

export default SettingsLayout;
