import React from "react";
import { Div } from "glamorous";

const App = props => (
	<div>
		<Div
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
			}}
		/>
	</div>
);

export default {
	React,
	Div,
	App,
};
