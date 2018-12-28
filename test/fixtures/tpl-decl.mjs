import styled from "styled-components";

const prop = "prop";
const value = "value";

export const Row = styled.div`
prop {
  ${prop}: value
}
prop prefix {
  prefix-${prop}: value
}
prop suffix {
  ${prop}-suffix: value
}
value {
  prop: ${value}
}
value prefix {
  prop: prefix-${value}
}
value suffix {
  prop: ${value}-suffix
}
value semicolon {
  prop: ${value};
}
value prefix semicolon {
  prop: prefix-${value};
}
value suffix semicolon {
  prop: ${value}-suffix;
}
`;
