import React from 'react';
import { TouchableOpacityProps } from 'react-native';

import { Container, Text } from './styles';

interface ButtonProps extends TouchableOpacityProps {
	title: string;
}

const Button: React.FC<ButtonProps> = (props: ButtonProps) => {
	const { title, ...touchableProps } = props;

	return (
		<Container {...touchableProps}>
			<Text>{title}</Text>
		</Container>
	);
};

export default Button;
