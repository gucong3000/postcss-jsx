import { css } from "lit-css";
const customPropStyle = "customPropStyle";
const tableStyle = "tableStyle";
const fancyTableStyle = "fancyTableStyle";
export default css`
	/* @define --table-border-color */
	:host {
		--table-border-color: green;
	}
	${customPropStyle} ${tableStyle} ${fancyTableStyle}
`;
