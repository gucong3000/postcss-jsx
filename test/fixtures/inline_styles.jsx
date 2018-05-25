const divStyle = {
	color: "blue",
	backgroundImage: "url(" + imgUrl + ")",
};

require();

function HelloWorldComponent () {
	return <div css="true" style={divStyle}>
		<a href="url">Hello World!</a>
	</div>;
}
