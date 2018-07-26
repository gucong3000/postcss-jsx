/* eslint comma-dangle: ["error", "never"] */
/* global notExist */
const imgUrl = "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png";
const baseStyle = {
	color: "blue"
};
let divStyle;
require();

function HelloWorldComponent () {
	divStyle = {
		backgroundImage: `url(${imgUrl})`,
		...baseStyle
	};
	return <div css="true" style={divStyle}>
		<a href="url" style={divStyle}>Hello World!</a>
		<a href="url" style={notExist}>Hello World!</a>
	</div>;
}

divStyle = {
	backgroundImage: `url(${imgUrl})`
};

module.exports = HelloWorldComponent;
