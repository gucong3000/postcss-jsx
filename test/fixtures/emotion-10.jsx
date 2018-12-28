/* global render */
/** @jsx jsx */

import { jsx, css } from '@emotion/core';
import styled from '@emotion/styled';

const SomeComponent = styled.div`
	display: flex;
	background-color: ${props => props.color};
`;

const AnotherComponent = styled.h1(
	{
		color: "hotpink",
	},
	props => ({ flex: props.flex })
);

render(
	<SomeComponent color="#DA70D6">
		<AnotherComponent flex={1}>
			<span css={css`
				color: sarahgreen;
			`}>
				Some text.
			</span>
			<span css={{
				color: 'sarahgreen'
			}}>
				Some other text.
			</span>
		</AnotherComponent>
	</SomeComponent>
);
const app = document.getElementById("root");
const myStyle = css`
	color: rebeccapurple;
`;
app.classList.add(myStyle);

export default {
	SomeComponent,
	AnotherComponent,
};
