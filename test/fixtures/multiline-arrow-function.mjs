import styled from "styled-components";

export const StatusText = styled.div`
color: ${(props) =>
		(props.status === "signed" && "red") ||
		"blue"};
`;
