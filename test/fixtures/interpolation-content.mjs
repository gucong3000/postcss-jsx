import styled, { css } from "styled-components";

export const buttonStyles = css`
	display: inline-block;
`;

export const ButtonStyled1 = styled.button`
	${buttonStyles}
	color: red;
`;

export const ButtonStyled2 = styled.button`
	${buttonStyles};
	color: red;
`;

export const ButtonStyled3 = styled.button`
;
	color: red;
	${buttonStyles}
`;

export const ButtonStyled4 = styled.button`
;
	color: red;
	${buttonStyles};
`;
