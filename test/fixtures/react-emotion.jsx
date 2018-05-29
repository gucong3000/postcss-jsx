import styled, { css } from "react-emotion";
const SomeComponent = styled("div")`
  display: flex;
  background-color: ${props => props.color};
`;

const AnotherComponent = styled("h1")(
	{
		color: "hotpink",
	},
	props => ({ flex: props.flex })
);

render(
	<SomeComponent color="#DA70D6">
		<AnotherComponent flex={1}>
      Some text.
		</AnotherComponent>
	</SomeComponent>
);
const app = document.getElementById("root");
const myStyle = css`
  color: rebeccapurple;
`;
app.classList.add(myStyle);
