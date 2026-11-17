import React from 'react';

import Header from '@components/header';

import { Root, Body } from './styles';

interface Props {
	children: React.ReactNode;
	title?: string;
	showBack?: boolean;
}

/**
 * Standard page layout: header pinned to the top (outside of any scroll
 * view) and the page content filling the remaining space.
 */
const Screen: React.FC<Props> = ({ children, title, showBack }: Props) => {
	return (
		<Root>
			<Header title={title} showBack={showBack} />
			<Body>{children}</Body>
		</Root>
	);
};

export default Screen;
