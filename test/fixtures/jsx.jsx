import React from "react";
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

const App = props => (
	<div
		fontSize={{
			someProps: props.someValue // must not trigger any warnings
		}}
		css={{
			display: "flex",
			paddingTop: 6,
			padding: "8px 12px", // shorthand prop override
			":hover": {
				flexDirectionn: "row", // prop error
				color: props.color,
				backgroundColor: props.big ? "#fff" : "#000x"
			}
		}}
	/>
);

function ObjectShorthandComponent({color}) {
	return <div style={{color}}/>
}

export default {
	HelloWorldComponent,
	React,
	App,
	ObjectShorthandComponent
};
