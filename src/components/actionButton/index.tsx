import React from 'react';
import { ViewStyle } from 'react-native';

import {
	ActionButtonContainer,
	ActionButtonIcon,
	ActionButtonText,
} from './styles';

interface Props {
	onPress: () => void;
	iconName: React.ComponentProps<typeof ActionButtonIcon>['name'];
	title: string;
	style?: ViewStyle;
}

const ActionButton: React.FC<Props> = (props: Props) => {
	const { onPress, iconName, title, style } = props;

	return (
		<ActionButtonContainer onPress={onPress} style={style}>
			<ActionButtonIcon name={iconName} />
			<ActionButtonText>{title}</ActionButtonText>
		</ActionButtonContainer>
	);
};

export default ActionButton;
