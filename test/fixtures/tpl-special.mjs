import styled from "styled-components";

const img = "/images/logo.png";

export const Row = styled.div`
img[${img}] {
  background-image: url(${img});
}
img[att="${img}"] {
  background-image: url("${img}");
}
`;
