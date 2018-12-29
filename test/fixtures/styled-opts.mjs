import styled from "astroturf";
import Footer from "footer";

const Button = styled(Footer, { allowAs: true })`
	position: relative;
	display: flex;
`;

export default Button;
