import React from "react";

const App = props => (
	<div
		fontSize={{
			someProps: props.someValue, // must not trigger any warnings
		}}
		css={{
			display: "flex",
			paddingTop: 6,
			padding: "8px 12px", // shorthand prop override
			":hover": {
				flexDirectionn: "row", // prop error
				color: props.color,
				backgroundColor: props.big ? "#fff" : "#000x",
			},
		}} />
);

export default {
	React,
	Div,
	App,
};
